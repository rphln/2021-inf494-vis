# %%

import pickle

import nltk
import pandas as pd
from sklearn import metrics
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.pipeline import make_pipeline

# %% [markdown]
# We're using an alternative stop word list, as the default one seems to have ["several known issues"](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html).

# %%

nltk.download("stopwords")
stop_words = nltk.corpus.stopwords.words("english")

# %%

train = pd.read_csv("var/tweet-sentiment-extraction-train.csv")
train.dropna(inplace=True)

test = pd.read_csv("var/tweet-sentiment-extraction-test.csv")
test.dropna(inplace=True)


# %%


pipeline = make_pipeline(
    TfidfVectorizer(stop_words=stop_words), SGDClassifier(), verbose=True
)

pipeline.fit(train.text, train.sentiment)

# %%

predicted = pipeline.predict(test.text)

print(metrics.classification_report(test.sentiment, predicted))
print(metrics.confusion_matrix(test.sentiment, predicted))


# %%

with open("var/sentiment-classifier.obj", "wb+") as checkpoint:
    pickle.dump(pipeline, checkpoint)
