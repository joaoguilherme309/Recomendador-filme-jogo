# Função no sistema: Limpar o catálogo bruto da Steam, corrigir colunas desalinhadas,
# filtrar jogos sem metadados ou avaliações e estruturar gêneros, tags e descrições.

from pathlib import Path
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent.parent.parent


def converter_lista(texto):
    if not isinstance(texto, str) or not texto.strip():
        return []
    return [termo.strip() for termo in texto.split(",") if termo.strip()]


def executar_preprocessamento_jogos():
    caminho_jogos = BASE_DIR / "data" / "games.csv"

    colunas = pd.read_csv(caminho_jogos, nrows=0).columns.tolist()
    if "DiscountDLC count" in colunas:
        indice = colunas.index("DiscountDLC count")
        colunas[indice : indice + 1] = ["Discount", "DLC count"]
        jogos = pd.read_csv(
            caminho_jogos, header=0, names=colunas, index_col=False, low_memory=False
        )
    else:
        jogos = pd.read_csv(caminho_jogos, low_memory=False)

    jogos = jogos[
        [
            "AppID",
            "Name",
            "Release date",
            "About the game",
            "Genres",
            "Tags",
            "Positive",
            "Negative",
            "Recommendations",
            "Header image",
        ]
    ].copy()

    jogos = jogos.rename(
        columns={
            "AppID": "game_id",
            "Name": "name",
            "Release date": "release_date",
            "About the game": "description",
            "Genres": "genres",
            "Tags": "tags",
            "Positive": "positive",
            "Negative": "negative",
            "Recommendations": "recommendations",
            "Header image": "header_image",
        }
    )

    jogos["name"] = jogos["name"].fillna("").str.strip()
    jogos["description"] = jogos["description"].fillna("").str.strip()
    jogos["genres"] = jogos["genres"].fillna("")
    jogos["tags"] = jogos["tags"].fillna("")
    jogos["positive"] = pd.to_numeric(jogos["positive"], errors="coerce").fillna(0).astype(int)
    jogos["negative"] = pd.to_numeric(jogos["negative"], errors="coerce").fillna(0).astype(int)
    jogos["recommendations"] = (
        pd.to_numeric(jogos["recommendations"], errors="coerce").fillna(0).astype(int)
    )

    # Remove entradas sem nome, sem texto ou sem nenhuma avaliação real na Steam
    jogos = jogos[jogos["name"] != ""]
    jogos = jogos[
        (jogos["description"] != "") | (jogos["genres"] != "") | (jogos["tags"] != "")
    ]
    jogos = jogos[(jogos["positive"] + jogos["negative"]) > 0]
    jogos = jogos.drop_duplicates(subset=["game_id"]).reset_index(drop=True)

    jogos["genres"] = jogos["genres"].apply(converter_lista)
    jogos["tags"] = jogos["tags"].apply(converter_lista)

    jogos["texto_combinado"] = jogos.apply(
        lambda j: f"{' '.join(j['genres'])} {' '.join(j['tags'])} {j['description']}".strip(),
        axis=1,
    )

    caminho_saida = BASE_DIR / "data" / "jogos_processados.csv"
    jogos.to_csv(caminho_saida, index=False, encoding="utf-8")
    print(f"Jogos processados: {len(jogos)} -> {caminho_saida}")


if __name__ == "__main__":
    executar_preprocessamento_jogos()