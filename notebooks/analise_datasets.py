
import json
import pandas as pd
from pathlib import Path

# Diretório principal do projeto
BASE_DIR = Path(__file__).resolve().parent.parent

# ==========================================
# 1. ANÁLISE DO DATASET DE FILMES
# ==========================================

caminho_filmes = BASE_DIR / "data" / "tmdb_top_10k_movies_2026.csv.csv"

# Carregar dataset
filmes = pd.read_csv(caminho_filmes)

print("\n=== DATASET DE FILMES ===")

print(f"\nQuantidade de filmes: {len(filmes)}")

print("\nColunas disponíveis:")
print(filmes.columns.tolist())

print("\nPrimeiros 5 registros:")
print(filmes.head().to_string(index=False))

print("\nValores ausentes por coluna:")
print(filmes.isnull().sum())

# ==========================================
# 2. ANÁLISE DO DATASET DE JOGOS
# ==========================================

caminho_jogos = BASE_DIR / "data" / "games_sample10.json"

# Carregar dataset
with open(caminho_jogos, "r", encoding="utf-8") as arquivo:
    jogos = json.load(arquivo)

print("\n=== DATASET DE JOGOS ===")

print(f"\nTipo de estrutura: {type(jogos).__name__}")

if isinstance(jogos, dict):
    print(f"\nQuantidade de jogos: {len(jogos)}")

    print("\nPrimeiras chaves:")
    print(list(jogos.keys())[:5])

    if jogos:
        primeiro_jogo = next(iter(jogos.values()))

        print("\nExemplo de um jogo:")
        print(json.dumps(
            primeiro_jogo,
            indent=2,
            ensure_ascii=False
        )[:3000])

elif isinstance(jogos, list):
    print(f"\nQuantidade de jogos: {len(jogos)}")

    if jogos:
        print("\nExemplo de um jogo:")
        print(json.dumps(
            jogos[0],
            indent=2,
            ensure_ascii=False
        )[:3000])

else:
    print("\nFormato de JSON não esperado.")

# ==========================================
# 3. IDENTIFICAR OS CAMPOS DOS JOGOS
# ==========================================

print("\n=== CAMPOS DISPONÍVEIS NOS JOGOS ===")

primeiro_jogo = next(iter(jogos.values()))

for campo in primeiro_jogo.keys():
    print(campo)

    # ==========================================
# 4. ANALISAR GÊNEROS E TAGS DOS JOGOS
# ==========================================

print("\n=== GÊNEROS E TAGS DOS JOGOS ===")

for game_id, jogo in list(jogos.items())[:3]:
    print(f"\nJogo: {jogo.get('name')}")
    print(f"ID: {game_id}")
    print(f"Gêneros: {jogo.get('genres')}")
    print(f"Tags: {jogo.get('tags')}")
    print(f"Descrição curta: {str(jogo.get('short_description'))[:200]}")