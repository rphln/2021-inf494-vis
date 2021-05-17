# Como executar?

O primeiro passo é criar um ambiente virtual.

``` bash
python -m venv .venv
source .venv/bin/activate
```

Agora, podemos instalar as dependências necessárias para a ferramenta. Elas também estão listadas no arquivo `pyproject.toml`.

``` bash
pip install -r requirements.txt
```

Em seguida, é necessário especificar o caminho para os conjuntos de dados do Reddit e do Telegram no arquivo `moody/__init__.py`:

``` python
REDDIT = Path("var/The Pushshift Reddit Dataset.zst")
TELEGRAM = Path("var/The Pushshift Telegram Dataset.zst")
```

Agora é possível iniciar o servidor.

``` bash
uvicorn moody:app --reload --reload-dir moody --host 127.0.0.1 --port 8000
```

Para acessar a ferramenta, entre na [página especificada](http://127.0.0.1:8000/static/index.html).
