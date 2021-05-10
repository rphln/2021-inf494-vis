import json
import pickle
from functools import lru_cache
from pathlib import Path
from typing import Optional

import pandas as pd
from flask import Flask, render_template
from flask.json import jsonify
from sklearn.pipeline import Pipeline

from zreader.zreader import Zreader

ROWS = 2_000_000

REDDIT = Path("var/The Pushshift Reddit Dataset.zst")
TELEGRAM = Path("var/The Pushshift Telegram Dataset.zst")

CATEGORIES = ["toxic", "severe_toxic", "obscene", "threat", "insult", "identity_hate"]

ARCHETYPES = {
    "alt.atheism": "religion",
    "comp.graphics": "computers",
    "comp.os.ms-windows.misc": "computers",
    "comp.sys.ibm.pc.hardware": "computers",
    "comp.sys.mac.hardware": "computers",
    "comp.windows.x": "computers",
    "misc.forsale": "commerce",
    "rec.autos": "vehicles",
    "rec.motorcycles": "vehicles",
    "rec.sport.baseball": "sports",
    "rec.sport.hockey": "sports",
    "sci.crypt": "science",
    "sci.electronics": "science",
    "sci.med": "science",
    "sci.space": "science",
    "soc.religion.christian": "religion",
    "talk.politics.guns": "politics",
    "talk.politics.mideast": "politics",
    "talk.politics.misc": "politics",
    "talk.religion.misc": "religion",
}

app = Flask(__name__)


def load_dataset(key: str, source: Path, cache: Path):
    if cache.is_file():
        return pd.read_pickle(cache)
    else:
        reader = Zreader(source, chunk_size=2 ** 26)
        corpus = set()

        for entry in reader.readlines():
            try:
                entry = json.loads(entry)
            except:
                continue

            if not (message := entry.get(key)):
                continue

            corpus.add(message)

            if len(corpus) >= ROWS:
                break

        df = pd.DataFrame(corpus, columns=["body"])
        df.to_pickle(cache, compression=None)

        return df


def load_reddit_corpus():
    df = load_dataset("body", REDDIT, REDDIT.with_suffix(".obj"))
    df["dataset"] = "Reddit"

    return df


def load_telegram_corpus():
    df = load_dataset("message", TELEGRAM, TELEGRAM.with_suffix(".obj"))
    df["dataset"] = "Telegram"

    return df


@lru_cache
def load_corpus():
    return pd.concat([load_reddit_corpus(), load_telegram_corpus()])


@app.route("/")
def root():
    return render_template("index.html")


@app.route("/query/<query>")
@app.route("/query/")
@lru_cache
def data(query: Optional[str] = None):
    with open("var/subject-classifier.obj", "rb") as file:
        subject_classifier: Pipeline = pickle.load(file)

    with open("var/sentiment-classifier.obj", "rb") as file:
        sentiment_classifier: Pipeline = pickle.load(file)

    with open("var/toxicity-classifier.obj", "rb") as file:
        toxicity_classifier: Pipeline = pickle.load(file)

    corpus = load_corpus()

    corpus[CATEGORIES] = toxicity_classifier.predict(corpus.body)

    # Also group similar subjects into an `archetype`.
    corpus["subject"] = subject_classifier.predict(corpus.body)
    corpus["archetype"] = corpus["subject"].map(ARCHETYPES)

    sentiments = sentiment_classifier.predict(corpus.body)

    # Ensure that we get no errors if a category is missing.
    corpus["sentiment"] = pd.Categorical(
        sentiments, ["positive", "negative", "neutral"]
    )

    # Convert the categorical `sentiment` to one-hot.
    corpus = pd.get_dummies(corpus, columns=["sentiment"], prefix="", prefix_sep="")

    if query:
        try:
            corpus = corpus.query(query)
        except Exception as error:
            return jsonify({"error": str(error)}), 400

    stats = {
        "body": "count",
        # Toxicity classifier
        "toxic": "sum",
        "severe_toxic": "sum",
        "obscene": "sum",
        "threat": "sum",
        "insult": "sum",
        "identity_hate": "sum",
        # Polarity classifier
        "positive": "sum",
        "negative": "sum",
        "neutral": "sum",
    }

    grouped = corpus.groupby(["dataset", "subject"]).agg(stats)
    return grouped.to_json(orient="table", indent=2)


@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response
