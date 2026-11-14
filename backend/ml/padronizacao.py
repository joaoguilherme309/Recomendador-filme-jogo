# Função no sistema: Aplicar pré-processamento linguístico com NLTK (stopwords e lematização),
# unificar vocabulário entre cinema e jogos (ponte temática) e gerar texto_final.

import ast
import re
from pathlib import Path
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Garante recursos do NLTK disponíveis na máquina
for pacote in ("stopwords", "wordnet", "omw-1.4"):
    try:
        nltk.data.find(f"corpora/{pacote}")
    except LookupError:
        nltk.download(pacote, quiet=True)

STOPWORDS_EN = set(stopwords.words("english"))
LEMATIZADOR = WordNetLemmatizer()

SINONIMOS = {
    "science fiction": "science_fiction",
    "sci-fi": "science_fiction",
    "scifi": "science_fiction",
    "survival horror": "horror",
    "psychological thriller": "thriller",
    "dark fantasy": "dark_fantasy",
    "high fantasy": "fantasy",
    "sword & sorcery": "fantasy",
    "open world": "open_world",
    "post-apocalyptic": "post_apocalyptic",
    "dystopia": "post_apocalyptic",
    "cyberpunk": "cyberpunk",
    "samurai": "feudal_japan",
    "ninja": "feudal_japan",
    "martial arts": "martial_arts",
    "anime": "jrpg",
}

# Regras que conectam palavras-chave de sinopses de filmes a subgêneros de jogos
PONTE_TEMATICA = {
    "ring": ["fantasy", "medieval", "rpg", "open_world"],
    "hobbit": ["fantasy", "medieval", "rpg"],
    "wizard": ["fantasy", "magic", "rpg"],
    "sorcerer": ["fantasy", "magic", "rpg"],
    "dragon": ["fantasy", "medieval", "rpg", "dark_fantasy"],
    "sword": ["medieval", "action_rpg", "hack_and_slash"],
    "knight": ["medieval", "dark_fantasy", "soulslike"],
    "curse": ["dark_fantasy", "soulslike"],
    "gothic": ["dark_fantasy", "soulslike", "horror"],
    "space": ["space", "science_fiction", "exploration"],
    "galaxy": ["space", "science_fiction"],
    "alien": ["space", "science_fiction", "survival"],
    "zombie": ["zombie", "survival", "horror"],
    "heist": ["stealth", "crime"],
    "assassin": ["stealth", "action"],
    "detective": ["detective", "mystery", "investigation"],
}


def normalizar_termo(termo):
    if not isinstance(termo, str):
        return ""
    termo = termo.lower().strip()
    return SINONIMOS.get(termo, re.sub(r"\s+", "_", termo))


def converter_lista(valor):
    if isinstance(valor, list):
        return valor
    if not isinstance(valor, str) or not valor.strip():
        return []
    try:
        resultado = ast.literal_eval(valor)
        return resultado if isinstance(resultado, list) else []
    except (ValueError, SyntaxError):
        return []


def limpar_e_lematizar(texto):
    if not isinstance(texto, str):
        return ""
    # Remove marcações HTML comuns nas descrições da Steam
    texto = re.sub(r"<[^>]+>", " ", texto)
    texto = re.sub(r"[^a-zA-Z\s]", " ", texto.lower())
    tokens = [
        LEMATIZADOR.lemmatize(tok)
        for tok in texto.split()
        if len(tok) > 2 and tok not in STOPWORDS_EN
    ]
    return " ".join(tokens)


def expandir_temas_filme(generos_padronizados, texto_limpo):
    extras = []
    for palavra in texto_limpo.split():
        if palavra in PONTE_TEMATICA:
            extras.extend(PONTE_TEMATICA[palavra])
    return list(dict.fromkeys(generos_padronizados + extras))


def executar_padronizacao():
    filmes = pd.read_csv(BASE_DIR / "data" / "filmes_processados.csv", low_memory=False)
    jogos = pd.read_csv(BASE_DIR / "data" / "jogos_processados.csv", low_memory=False)

    filmes["genres"] = filmes["genres"].apply(converter_lista)
    filmes["generos_padronizados"] = filmes["genres"].apply(
        lambda gs: [normalizar_termo(g) for g in gs if normalizar_termo(g)]
    )
    filmes["overview_limpo"] = filmes["overview"].apply(limpar_e_lematizar)
    filmes["temas_expandidos"] = filmes.apply(
        lambda f: expandir_temas_filme(f["generos_padronizados"], f["overview_limpo"]),
        axis=1,
    )

    # Repete gêneros e temas 3x para evitar que sinopses longas diluam o peso temático
    filmes["texto_final"] = filmes.apply(
        lambda f: f"{' '.join(f['temas_expandidos'] * 3)} {f['overview_limpo']}".strip(),
        axis=1,
    )

    jogos["genres"] = jogos["genres"].apply(converter_lista)
    jogos["tags"] = jogos["tags"].apply(converter_lista)
    jogos["generos_padronizados"] = jogos["genres"].apply(
        lambda gs: [normalizar_termo(g) for g in gs if normalizar_termo(g)]
    )
    jogos["tags_padronizadas"] = jogos["tags"].apply(
        lambda ts: [normalizar_termo(t) for t in ts if normalizar_termo(t)]
    )
    jogos["description_limpa"] = jogos["description"].apply(limpar_e_lematizar)

    jogos["texto_final"] = jogos.apply(
        lambda j: (
            f"{' '.join((j['generos_padronizados'] + j['tags_padronizadas']) * 3)} "
            f"{j['description_limpa']}"
        ).strip(),
        axis=1,
    )

    filmes = filmes.reset_index(drop=True)
    jogos = jogos.reset_index(drop=True)

    filmes.to_csv(BASE_DIR / "data" / "filmes_padronizados.csv", index=False, encoding="utf-8")
    jogos.to_csv(BASE_DIR / "data" / "jogos_padronizados.csv", index=False, encoding="utf-8")
    print("Padronização concluída com sucesso!")


if __name__ == "__main__":
    executar_padronizacao()