# Função no sistema: Aplicar pré-processamento linguístico com NLTK (stopwords e lematização),
# unificar vocabulário entre cinema e jogos (ponte temática) e gerar texto_final.

import ast
import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import pandas as pd

from backend.config import caminho_processado

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
    "souls-like": "soulslike",
}

# Regras que conectam palavras-chave de sinopses de filmes a subgêneros de jogos
PONTE_TEMATICA = {
    "hobbit": ({"fantasy"}, ["fantasy", "medieval", "rpg"]),
    "wizard":    ({"fantasy"}, ["fantasy", "magic", "rpg"]),
    "sorcerer":  ({"fantasy"}, ["fantasy", "magic", "rpg"]),
    "dragon":    ({"fantasy", "animation"}, ["fantasy", "rpg"]),
    "sword":     ({"fantasy", "action", "history"}, ["medieval", "action_rpg", "hack_and_slash"]),
    "knight":    ({"fantasy", "history"}, ["medieval", "dark_fantasy"]),
    "curse":     ({"fantasy", "horror"}, ["dark_fantasy"]),
    "gothic":    ({"horror", "fantasy"}, ["dark_fantasy", "horror"]),
    "space":     ({"science_fiction"}, ["space", "science_fiction", "exploration"]),
    "galaxy":    ({"science_fiction"}, ["space", "science_fiction"]),
    "alien":     ({"science_fiction", "horror"}, ["space", "science_fiction", "survival"]),
    "zombie":    ({"horror", "comedy", "action"}, ["zombie", "survival", "horror"]),
    "heist":     ({"crime", "thriller", "action"}, ["stealth", "crime"]),
    "assassin":  ({"action", "thriller", "crime"}, ["stealth", "action"]),
    "detective": ({"mystery", "crime", "thriller"}, ["detective", "mystery", "investigation"]),
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
    generos = set(generos_padronizados)
    palavras = set(texto_limpo.split())
    extras = []
    for palavra, (generos_exigidos, temas) in PONTE_TEMATICA.items():
        if palavra in palavras and generos & generos_exigidos:
            extras.extend(temas)
    return list(dict.fromkeys(generos_padronizados + extras))


def executar_padronizacao():
    filmes = pd.read_csv(caminho_processado("filmes_processados.csv"), low_memory=False)
    jogos = pd.read_csv(caminho_processado("jogos_processados.csv"), low_memory=False)

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

    filmes.to_csv(caminho_processado("filmes_padronizados.csv"), index=False, encoding="utf-8")
    jogos.to_csv(caminho_processado("jogos_padronizados.csv"), index=False, encoding="utf-8")
    print("Padronização concluída com sucesso!")


if __name__ == "__main__":
    executar_padronizacao()