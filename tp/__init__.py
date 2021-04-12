import csv
import io
import pickle
from collections import Counter, defaultdict
from functools import lru_cache
from pathlib import Path

import pandas as pd
import ujson as json
from flask import Flask, render_template
from tqdm import tqdm

from zreader.zreader import Zreader

from .adapters import Adapter

DATASET = "var/The Pushshift Reddit Dataset.zst"

app = Flask(__name__)


@lru_cache(maxsize=None)
def corpus():
    corpus = []
    reader = Zreader(DATASET, chunk_size=2 ** 26)

    for entry in reader.readlines():
        entry = json.loads(entry)

        if not (message := entry.get("body")):
            continue

        corpus.append(message)

        if len(corpus) >= 2_000_000:
            break

    return corpus


@app.route("/")
def root():
    return render_template("index.html")


@app.route("/heatmap/<col>/<row>/")
@lru_cache(maxsize=None)
def heatmap(col: str, row: str):
    corpus_ = corpus()

    models = Path("var/")

    with (models / col).with_suffix(".obj").open("rb") as checkpoint:
        predict_col: Adapter = pickle.load(checkpoint)

    with (models / row).with_suffix(".obj").open("rb") as checkpoint:
        predict_row: Adapter = pickle.load(checkpoint)

    totals = Counter()
    counters = defaultdict(Counter)

    for message, col, row in zip(
        corpus_, predict_col.predict(corpus_), predict_row.predict(corpus_)
    ):
        for x in col:
            totals[x] += 1

            for y in row:
                counters[y][x] += 1

    print(totals)

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Subject", "Sentiment", "Value"])
    for row, counter in counters.items():
        for col, matches in counter.items():
            writer.writerow([row, col, matches / totals[col]])

    return output.getvalue()
