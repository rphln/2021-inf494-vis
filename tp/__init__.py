import csv
import io
import pickle
from collections import Counter, defaultdict
from datetime import date, datetime
from functools import lru_cache
from pathlib import Path

import pandas as pd
import ujson as json
from flask import Flask, render_template
from sklearn.pipeline import Pipeline
from tqdm import tqdm

from zreader.zreader import Zreader

DATASET = "/media/rphln/Taihou/Datasets/Pushshift/The Pushshift Reddit Dataset.zst"
ROWS = 2_000_000

app = Flask(__name__)


@lru_cache(maxsize=None)
def load_reddit_corpus():
    reader = Zreader(DATASET, chunk_size=2 ** 26)
    corpus = set()

    with tqdm(total=ROWS) as progress:
        for entry in reader.readlines():
            entry = json.loads(entry)

            if not (message := entry.get("body")):
                continue

            corpus.add(message)
            progress.update(1)

            if len(corpus) >= ROWS:
                break

    return pd.DataFrame(corpus, columns=["body"])


@app.route("/")
def root():
    return render_template("index.html")


@app.route("/data/")
@lru_cache(maxsize=None)
def data():
    corpus = load_reddit_corpus()

    subject_classifier: Pipeline = pickle.load(
        open("var/subject-classifier.obj", "rb"),
    )
    sentiment_classifier: Pipeline = pickle.load(
        open("var/sentiment-classifier.obj", "rb"),
    )

    corpus["subject"] = subject_classifier.predict(
        tqdm(corpus.body, desc="Subject classification")
    )
    corpus["sentiment"] = sentiment_classifier.predict(
        tqdm(corpus.body, desc="Sentiment classification")
    )

    stats = corpus.groupby(["subject", "sentiment"]).size().to_frame("count")
    return stats.to_csv()
