
import ast
import pandas as pd
from pathlib import Path

# ==========================================
# 1. DICIONÁRIO DE GÊNEROS DO TMDB
# ==========================================

GENEROS_TMDB = {
    28: "Action",
    12: "Adventure",
    16: "Animation",
    35: "Comedy",
    80: "Crime",
    99: "Documentary",
    18: "Drama",
    10751: "Family",
    14: "Fantasy",
    36: "History",
    27: "Horror",
    10402: "Music",
    9648: "Mystery",
    10749: "Romance",
    878: "Science Fiction",
    10770: "TV Movie",
    53: "Thriller",
    10752: "War",
    37: "Western"
}


# ==========================================
# 2. FUNÇÃO PARA CONVERTER GÊNEROS
# ==========================================

def converter_generos_filmes(generos):
    # Converter texto em lista
    if isinstance(generos, str):
        generos = ast.literal_eval(generos)

    # Converter IDs em nomes
    nomes = [
        GENEROS_TMDB.get(genero, "Unknown")
        for genero in generos
    ]

    return nomes


# ==========================================
# 3. CARREGAMENTO DO DATASET
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

caminho_filmes = (
    BASE_DIR / "data" / "tmdb_top_10k_movies_2026.csv.csv"
)

filmes = pd.read_csv(caminho_filmes)


# ==========================================
# 4. CONVERSÃO DOS GÊNEROS
# ==========================================

filmes["genres"] = filmes["genre_ids"].apply(
    converter_generos_filmes
)

print("\n=== GÊNEROS CONVERTIDOS ===")

print(
    filmes[["title", "genre_ids", "genres"]]
    .head(10)
    .to_string(index=False)
)

print(f"\nTotal de filmes processados: {len(filmes)}")


# ==========================================
# 5. TRATAMENTO DAS SINOPSES
# ==========================================

# Substituir sinopses ausentes por texto vazio
filmes["overview"] = filmes["overview"].fillna("")

# Remover espaços extras nas extremidades
filmes["overview"] = filmes["overview"].str.strip()


# ==========================================
# 6. PREPARAÇÃO DOS TEXTOS PARA O TF-IDF
# ==========================================

# Combinar gêneros e sinopse em uma única coluna
filmes["texto_combinado"] = (
    filmes["genres"].apply(lambda generos: " ".join(generos))
    + " "
    + filmes["overview"]
).str.strip()


# ==========================================
# 7. EXIBIÇÃO DOS RESULTADOS
# ==========================================

print("\n=== TEXTOS PREPARADOS PARA O TF-IDF ===")

for _, filme in filmes.head(3).iterrows():
    print(f"\nFilme: {filme['title']}")
    print(f"Texto: {filme['texto_combinado'][:300]}")

print(f"\nTotal de filmes preparados: {len(filmes)}")


# ==========================================
# 8. TESTE DA FUNÇÃO DE CONVERSÃO
# ==========================================

if __name__ == "__main__":
    exemplo = "[18, 80]"

    resultado = converter_generos_filmes(exemplo)

    print("\n=== TESTE DA CONVERSÃO ===")
    print("IDs originais:", exemplo)
    print("Gêneros convertidos:", resultado)

# ==========================================
# 9. SALVAR DATASET DE FILMES PROCESSADO
# ==========================================

caminho_saida = BASE_DIR / "data" / "filmes_processados.csv"

filmes.to_csv(caminho_saida, index=False, encoding="utf-8")

print("\nDataset de filmes processado salvo com sucesso!")
print(f"Arquivo: {caminho_saida}")
