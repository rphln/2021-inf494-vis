# %%

import pickle

import nltk
from sklearn import metrics
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.pipeline import make_pipeline

# %% [markdown]
# We're using an alternative stop word list, as the default one seems to have ["several known issues"](https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html).

# %%

nltk.download("stopwords")
stop_words = nltk.corpus.stopwords.words("english")


# %%


subjects = {
    "comp.graphics": "technology",
    "comp.os.ms-windows.misc": "technology",
    "comp.sys.ibm.pc.hardware": "technology",
    "comp.sys.mac.hardware": "technology",
    "comp.windows.x": "technology",
    "misc.forsale": "commerce",
    "rec.autos": "vehicles",
    "rec.motorcycles": "vehicles",
    "rec.sport.baseball": "sports",
    "rec.sport.hockey": "sports",
    "sci.crypt": "science",
    "sci.electronics": "science",
    "sci.med": "science",
    "sci.space": "science",
    "talk.politics.guns": "politics",
    "talk.politics.mideast": "politics",
    "talk.politics.misc": "politics",
    "soc.religion.christian": "religion",
    "alt.atheism": "religion",
    "talk.religion.misc": "religion",
}

train = fetch_20newsgroups(
    subset="train", categories=subjects.keys(), remove=("headers", "footers", "quotes")
)
test = fetch_20newsgroups(
    subset="test", categories=subjects.keys(), remove=("headers", "footers", "quotes")
)

train.target = list(
    map(subjects.__getitem__, map(train.target_names.__getitem__, train.target))
)
test.target = list(
    map(subjects.__getitem__, map(test.target_names.__getitem__, test.target))
)

# %%


pipeline = make_pipeline(
    TfidfVectorizer(stop_words=stop_words), SGDClassifier(), verbose=True
)

pipeline.fit(train.data, train.target)


# %%

from sklearn import metrics

predicted = pipeline.predict(test.data)

print(metrics.classification_report(test.target, predicted))
print(metrics.confusion_matrix(test.target, predicted))

# %%

with open("var/subject-classifier.obj", "wb+") as checkpoint:
    pickle.dump(pipeline, checkpoint)
