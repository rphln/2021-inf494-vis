import json
import pickle
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pandas import DataFrame
from sklearn.pipeline import Pipeline
from tqdm import tqdm

from zreader.zreader import Zreader

CACHE = Path("var/cache.pkl")

REDDIT = Path("var/The Pushshift Reddit Dataset.zst")
TELEGRAM = Path("var/The Pushshift Telegram Dataset.zst")

ROWS = 3_000_000

CATEGORIES = ["toxic", "severe_toxic", "obscene", "threat", "insult", "identity_hate"]

app = FastAPI(title=__name__)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"])


def load_dataset(key: str, source: Path):
    reader = Zreader(source, chunk_size=2 ** 26)
    corpus = set()

    for entry in tqdm(reader.readlines(), desc=f"Loading `{source.name}`"):
        try:
            entry = json.loads(entry)
        except:
            continue

        if not (message := entry.get(key)):
            continue

        corpus.add(message)

        if len(corpus) >= ROWS:
            break

    return DataFrame(corpus, columns=["body"])


def load_reddit_corpus():
    df = load_dataset(key="body", source=REDDIT)
    df["dataset"] = "Reddit"

    return df


def load_telegram_corpus():
    df = load_dataset(key="message", source=TELEGRAM)
    df["dataset"] = "Telegram"

    return df


def load_corpus():
    return pd.concat([load_reddit_corpus(), load_telegram_corpus()])


def classify_toxicity(corpus: DataFrame):
    with open("var/toxicity-classifier.obj", "rb") as file:
        toxicity_classifier: Pipeline = pickle.load(file)

    corpus[CATEGORIES] = toxicity_classifier.predict(
        tqdm(corpus.body, desc="Toxicity classification")
    )

    return corpus


def classify_subject(corpus: DataFrame):
    with open("var/subject-classifier.obj", "rb") as file:
        subject_classifier: Pipeline = pickle.load(file)

    corpus["subject"] = subject_classifier.predict(
        tqdm(corpus.body, desc="Subject classification")
    )

    return corpus


def classify_sentiment(corpus: DataFrame):
    with open("var/sentiment-classifier.obj", "rb") as file:
        sentiment_classifier: Pipeline = pickle.load(file)

    sentiments = sentiment_classifier.predict(
        tqdm(corpus.body, desc="Sentiment classification")
    )

    # Ensure that we get no errors if a category is missing.
    corpus["sentiment"] = pd.Categorical(
        sentiments, ["positive", "negative", "neutral"]
    )

    # Also convert the categorical `sentiment` to one-hot.
    corpus = pd.get_dummies(
        corpus, columns=["sentiment"], prefix="", prefix_sep="", dtype=bool
    )

    return corpus


def parse() -> DataFrame:
    if CACHE.exists():
        return pd.read_pickle(CACHE, compression=None)

    corpus = load_corpus()

    corpus = classify_sentiment(corpus)
    corpus = classify_toxicity(corpus)
    corpus = classify_subject(corpus)

    corpus.to_pickle(CACHE, compression=None)

    return corpus


@app.get("/")
async def index(query: Optional[str] = None):
    corpus = parse()

    if query:
        try:
            corpus = corpus.query(query)
        except Exception as error:
            raise HTTPException(status_code=400, detail=str(error)) from error

    stats = {
        "body": ["count", np.random.choice],
        # Toxicity classifier
        "toxic": "sum",
        "severe_toxic": "sum",
        "obscene": "sum",
        "threat": "sum",
        "insult": "sum",
        "identity_hate": "sum",
        # Sentiment classifier
        "positive": "sum",
        "negative": "sum",
        "neutral": "sum",
    }

    grouped = corpus.groupby(["dataset", "subject"]).agg(stats)
    grouped.columns = grouped.columns.map("_".join)

    content = grouped.to_json(orient="table", indent=2)
    return Response(content, media_type="application/json")
