# %% [markdown]
# We're using an alternative stop word list, as the default one has ["several known issues"](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html).

# %%

import nltk

nltk.download("stopwords")
stop_words = set(nltk.corpus.stopwords.words("english"))

# %%

import pickle
from dataclasses import dataclass

import pandas as pd
from sklearn.datasets import fetch_20newsgroups
from sklearn.decomposition import NMF, LatentDirichletAllocation
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.linear_model import LogisticRegression, SGDClassifier
from sklearn.multiclass import OneVsRestClassifier
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import LabelBinarizer
from sklearn.svm import SVC, LinearSVC

from tp.adapters import SentimentClassificationAdapter

# %%

train = pd.read_csv("var/tweet-sentiment.csv")
train.dropna(inplace=True)

# %%
classifier = make_pipeline(
    TfidfVectorizer(strip_accents="unicode", stop_words=stop_words),
    OneVsRestClassifier(LinearSVC()),
    verbose=True,
)

binarizer = LabelBinarizer()

x = train.text
y = binarizer.fit_transform(train.sentiment)

classifier.fit(x, y)

# %%

with open("var/sentiment-classification.obj", "wb+") as checkpoint:
    pickle.dump(
        SentimentClassificationAdapter(binarizer=binarizer, classifier=classifier),
        checkpoint,
    )
