from dataclasses import dataclass

from tp.adapters.adapter import Adapter


@dataclass
class ToxicityClassificationAdapter(Adapter):
    def predict(self, corpus):
        result = self.binarizer.inverse_transform(self.classifier.predict(corpus))
        return [set(labels) or {'none'} for labels in result]
