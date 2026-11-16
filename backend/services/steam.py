
import json
from functools import lru_cache
from html.parser import HTMLParser
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


class _HTMLTextParser(HTMLParser):
    """Converte descrições HTML da Steam em texto simples."""

    def __init__(self):
        super().__init__()
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in {"br", "p", "div", "li", "h1", "h2", "h3"}:
            self.parts.append("\n")

    def handle_data(self, data):
        self.parts.append(data)

    def get_text(self):
        return " ".join(
            " ".join("".join(self.parts).split()).split()
        ).strip()


def limpar_html(conteudo: str | None) -> str:
    if not conteudo:
        return ""

    parser = _HTMLTextParser()
    parser.feed(conteudo)
    return parser.get_text()


@lru_cache(maxsize=128)
def buscar_detalhes_steam(game_id: int) -> dict:
    parametros = urlencode({
        "appids": game_id,
        "cc": "br",
        "l": "portuguese",
    })

    url = f"https://store.steampowered.com/api/appdetails?{parametros}"

    requisicao = Request(
        url,
        headers={"User-Agent": "CineGameRecommender/1.0"},
    )

    try:
        with urlopen(requisicao, timeout=12) as resposta:
            resultado = json.loads(resposta.read().decode("utf-8"))

    except HTTPError as erro:
        raise RuntimeError(
            f"A Steam respondeu com HTTP {erro.code}."
        ) from erro
    except (URLError, TimeoutError) as erro:
        raise RuntimeError(
            "Não foi possível conectar à Steam."
        ) from erro
    except (json.JSONDecodeError, UnicodeDecodeError) as erro:
        raise RuntimeError(
            "A Steam retornou uma resposta inválida."
        ) from erro

    aplicativo = resultado.get(str(game_id), {})

    if not aplicativo.get("success") or not aplicativo.get("data"):
        raise LookupError("Jogo não encontrado na Steam.")

    dados = aplicativo["data"]

    return {
        "game_id": game_id,
        "name": dados.get("name", ""),
        "type": dados.get("type", ""),
        "description": limpar_html(
            dados.get("about_the_game")
            or dados.get("detailed_description")
            or dados.get("short_description")
        ),
        "header_image": dados.get("header_image"),
        "developers": dados.get("developers", []),
        "publishers": dados.get("publishers", []),
        "release_date": dados.get("release_date", {}).get("date", ""),
        "genres": [
            genero.get("description", "")
            for genero in dados.get("genres", [])
        ],
        "screenshots": [
            imagem.get("path_full")
            for imagem in dados.get("screenshots", [])
            if imagem.get("path_full")
        ],
        "store_url": f"https://store.steampowered.com/app/{game_id}/",
    }
