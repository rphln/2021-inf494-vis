# %%

import pickle

from sklearn import metrics
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import SGDClassifier
from sklearn.pipeline import make_pipeline

# %%

train = fetch_20newsgroups(subset="train", remove=("headers", "footers", "quotes"))
test = fetch_20newsgroups(subset="test", remove=("headers", "footers", "quotes"))

x_train = train.data
x_test = test.data

y_train = list(map(lambda idx: train.target_names[idx], train.target))
y_test = list(map(lambda idx: test.target_names[idx], test.target))

# %%

pipeline = make_pipeline(TfidfVectorizer(), SGDClassifier())
pipeline.fit(x_train, y_train)

# %%

predicted = pipeline.predict(x_test)

print(metrics.classification_report(y_test, predicted))
print(metrics.confusion_matrix(y_test, predicted))

# %%

with open("var/subject-classifier.obj", "wb+") as checkpoint:
    pickle.dump(pipeline, checkpoint)
