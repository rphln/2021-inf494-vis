# %%

import pickle

import pandas as pd
from sklearn import metrics
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.multiclass import OneVsRestClassifier
from sklearn.pipeline import make_pipeline

# %%

train = pd.read_csv("var/tweet-sentiment-extraction-train.csv")
train.dropna(inplace=True)

test = pd.read_csv("var/tweet-sentiment-extraction-test.csv")
test.dropna(inplace=True)

x_train = train.text
x_test = test.text

y_train = train.sentiment
y_test = test.sentiment

# %%


pipeline = make_pipeline(TfidfVectorizer(), OneVsRestClassifier(SGDClassifier()))
pipeline.fit(x_train, y_train)

# %%

predicted = pipeline.predict(x_test)

print(metrics.classification_report(y_test, predicted))
print(metrics.confusion_matrix(y_test, predicted))

# %%

with open("var/sentiment-classifier.obj", "wb+") as checkpoint:
    pickle.dump(pipeline, checkpoint)
