from dataclasses import dataclass
from typing import Any, List, Set


@dataclass
class Adapter:
    """"""

    classifier: Any
    binarizer: Any

    def predict(self, corpus: List[str]) -> List[Set[str]]:
        raise NotImplementedError()
