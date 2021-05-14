# %%

import pickle

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.pipeline import make_pipeline

# %%

CATEGORIES = ["toxic", "severe_toxic", "obscene", "threat", "insult", "identity_hate"]
COLUMNS = {category: bool for category in CATEGORIES}

train = pd.read_csv(
    "var/jigsaw-toxic-comment-classification-challenge-train.csv", dtype=COLUMNS
)

x_train = train.comment_text
y_train = train.loc[:, CATEGORIES]

# %%

pipeline = make_pipeline(TfidfVectorizer(), MultiOutputClassifier(SGDClassifier()))
pipeline.fit(x_train, y_train)

# %%

with open("var/toxicity-classifier.obj", "wb+") as checkpoint:
    pickle.dump(pipeline, checkpoint)
