# Como executar?

O primeiro passo é instalar as dependências necessárias para o cliente e o servidor.

``` bash
poetry install
```

Em seguida, é necessário especificar o caminho para os conjuntos de dados do Reddit e do Telegram no arquivo `moody/__init__.py`:

``` python
REDDIT = Path("var/The Pushshift Reddit Dataset.zst")
TELEGRAM = Path("var/The Pushshift Telegram Dataset.zst")
```

Agora é possível iniciar o servidor Python.

``` bash
poetry run uvicorn moody:app --reload --reload-dir moody --host 127.0.0.1 --port 8000
```

Para acessar a ferramenta, entre na [página especificada](http://127.0.0.1:8000/static/index.html).
