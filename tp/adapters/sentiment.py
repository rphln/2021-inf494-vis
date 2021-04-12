from dataclasses import dataclass

from tp.adapters.adapter import Adapter


@dataclass
class SentimentClassificationAdapter(Adapter):
    def predict(self, corpus):
        result = self.binarizer.inverse_transform(self.classifier.predict(corpus))
        return [{label} for label in result]
