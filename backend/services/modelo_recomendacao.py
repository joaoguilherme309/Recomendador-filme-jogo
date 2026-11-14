import pandas as pd
import numpy as np

from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    from .franquias import (
        identificar_franquia,
        jogo_pertence_franquia,
        obter_nome_franquia
    )
except ImportError:
    from franquias import (
        identificar_franquia,
        jogo_pertence_franquia,
        obter_nome_franquia
    )


# ==========================================
# 1. CARREGAR DATASETS PADRONIZADOS
# ==========================================

BASE_DIR = Path(__file__).resolve().parent.parent.parent

filmes = pd.read_csv(
    BASE_DIR / "data" / "filmes_padronizados.csv",
    low_memory=False
)

jogos = pd.read_csv(
    BASE_DIR / "data" / "jogos_padronizados.csv",
    low_memory=False
)

# Garantir que os textos sejam strings
textos_filmes = filmes["texto_final"].fillna("")
textos_jogos = jogos["texto_final"].fillna("")

# Preparar nomes para comparação
filmes["title"] = filmes["title"].fillna("")
jogos["name"] = jogos["name"].fillna("")

print("=== DATASETS CARREGADOS ===")
print(f"Filmes: {len(filmes)}")
print(f"Jogos: {len(jogos)}")


# ==========================================
# 2. IMPLEMENTAR TF-IDF
# ==========================================

todos_textos = pd.concat(
    [textos_filmes, textos_jogos],
    ignore_index=True
)

vetorizador = TfidfVectorizer(
    stop_words="english",
    max_features=20000,
    min_df=2,
    ngram_range=(1, 2)
)

matriz_tfidf = vetorizador.fit_transform(
    todos_textos
)

quantidade_filmes = len(filmes)

matriz_filmes = matriz_tfidf[:quantidade_filmes]
matriz_jogos = matriz_tfidf[quantidade_filmes:]

print("\n=== TF-IDF IMPLEMENTADO ===")

print(f"Vocabulário: {len(vetorizador.vocabulary_)} termos")
print(f"Matriz de filmes: {matriz_filmes.shape}")
print(f"Matriz de jogos: {matriz_jogos.shape}")

print("\nVetorização concluída com sucesso!")


# ==========================================
# 3. LOCALIZAR FILME
# ==========================================

def localizar_filme(nome_filme):

    nome_normalizado = nome_filme.casefold().strip()

    # Buscar primeiro pelo nome exato
    encontrados = filmes[
        filmes["title"].str.casefold().str.strip()
        == nome_normalizado
    ]

    if not encontrados.empty:
        return encontrados.index[0]

    # Buscar por nome parcial
    encontrados = filmes[
        filmes["title"].str.contains(
            nome_filme,
            case=False,
            regex=False,
            na=False
        )
    ]

    if encontrados.empty:
        print(f"\nFilme não encontrado: {nome_filme}")
        return None

    if len(encontrados) > 1:
        print("\nMais de um filme encontrado:")
        for titulo in encontrados["title"].head(10):
            print(f"- {titulo}")

        print("Informe o título completo.")
        return None

    return encontrados.index[0]


# ==========================================
# 4. CALCULAR SIMILARIDADE
# ==========================================

def calcular_similaridades(indice_filme):

    vetor_filme = matriz_filmes[indice_filme]

    similaridades = cosine_similarity(
        vetor_filme,
        matriz_jogos
    ).flatten()

    return similaridades


# ==========================================
# 5. SEPARAR JOGOS DA FRANQUIA
# ==========================================

def separar_jogos_franquia(franquia):

    if franquia is None:
        return set()

    indices_franquia = set()

    for indice, jogo in jogos.iterrows():

        if jogo_pertence_franquia(
            jogo["name"],
            franquia
        ):
            indices_franquia.add(indice)

    return indices_franquia


# ==========================================
# 6. SELECIONAR JOGOS SEM REPETIÇÕES
# ==========================================

def selecionar_jogos(
    similaridades,
    quantidade=10,
    indices_permitidos=None,
    indices_excluidos=None
):

    indices_ordenados = np.argsort(
        similaridades
    )[::-1]

    selecionados = []
    nomes_utilizados = set()

    for indice in indices_ordenados:

        indice = int(indice)

        # Respeitar filtro de jogos permitidos
        if indices_permitidos is not None:
            if indice not in indices_permitidos:
                continue

        # Ignorar jogos excluídos
        if indices_excluidos is not None:
            if indice in indices_excluidos:
                continue

        nome_jogo = str(jogos.iloc[indice]["name"])
        nome_normalizado = nome_jogo.casefold().strip()

        # Ignorar nomes vazios ou repetidos
        if not nome_normalizado:
            continue

        if nome_normalizado in nomes_utilizados:
            continue

        nomes_utilizados.add(nome_normalizado)
        selecionados.append(indice)

        if len(selecionados) >= quantidade:
            break

    return selecionados


# ==========================================
# 7. EXIBIR LISTA DE JOGOS
# ==========================================

def exibir_recomendacoes(indices, similaridades):

    if not indices:
        print("Nenhum jogo encontrado.")
        return

    for posicao, indice in enumerate(indices, start=1):

        jogo = jogos.iloc[indice]

        print(
            f"{posicao}. {jogo['name']} "
            f"| Similaridade: {similaridades[indice]:.4f}"
        )


# ==========================================
# 8. RECOMENDAR JOGOS PARA UM FILME
# ==========================================

def recomendar_jogos(nome_filme, quantidade=10):

    # Localizar filme
    indice_filme = localizar_filme(nome_filme)

    if indice_filme is None:
        return None

    titulo_filme = filmes.iloc[indice_filme]["title"]

    # Calcular similaridades
    similaridades = calcular_similaridades(
        indice_filme
    )

    # Identificar franquia
    franquia = identificar_franquia(
        titulo_filme
    )

    # Identificar os jogos relacionados
    indices_franquia = separar_jogos_franquia(
        franquia
    )

    # ======================================
    # LISTA PRINCIPAL
    # ======================================

    # Excluir jogos da franquia
    recomendados = selecionar_jogos(
        similaridades,
        quantidade=quantidade,
        indices_excluidos=indices_franquia
    )

    print("\n" + "=" * 55)
    print(f"FILME SELECIONADO: {titulo_filme}")
    print("=" * 55)

    print("\n=== JOGOS RECOMENDADOS ===")

    exibir_recomendacoes(
        recomendados,
        similaridades
    )

    # ======================================
    # LISTA SECUNDÁRIA
    # ======================================

    jogos_franquia = []

    if franquia and indices_franquia:

        jogos_franquia = selecionar_jogos(
            similaridades,
            quantidade=10,
            indices_permitidos=indices_franquia
        )

        nome_franquia = obter_nome_franquia(
            franquia
        )

        print(
            f"\n=== JOGOS DA FRANQUIA: "
            f"{nome_franquia} ==="
        )

        exibir_recomendacoes(
            jogos_franquia,
            similaridades
        )

    # ======================================
    # RETORNAR RESULTADOS
    # ======================================

    def preparar_resultados(indices):

        return [
            {
                "game_id": int(jogos.iloc[i]["game_id"]),
                "name": jogos.iloc[i]["name"],
                "similaridade": float(similaridades[i])
            }
            for i in indices
        ]

    return {
        "filme": titulo_filme,
        "franquia": obter_nome_franquia(franquia),
        "recomendacoes": preparar_resultados(recomendados),
        "jogos_franquia": preparar_resultados(jogos_franquia)
    }


# ==========================================
# 9. VERIFICAR JOGOS DUPLICADOS
# ==========================================

def verificar_duplicatas():

    print("\n=== VERIFICAÇÃO DE DUPLICATAS ===")

    duplicatas_id = jogos.duplicated(
        subset=["game_id"]
    ).sum()

    duplicatas_nome = jogos.duplicated(
        subset=["name"],
        keep=False
    ).sum()

    print(f"IDs duplicados: {duplicatas_id}")
    print(f"Registros com nomes repetidos: {duplicatas_nome}")


# ==========================================
# 10. VERIFICAR JOGOS CONHECIDOS
# ==========================================

def verificar_jogos_disponiveis():

    jogos_procurados = [
        "Batman",
        "Resident Evil",
        "The Forest",
        "The Last of Us",
        "Spider-Man",
        "Grand Theft Auto",
        "Cyberpunk",
        "Assassin's Creed"
    ]

    print("\n=== JOGOS DISPONÍVEIS ===")

    for nome in jogos_procurados:

        encontrados = jogos[
            jogos["name"].str.contains(
                nome,
                case=False,
                regex=False,
                na=False
            )
        ]

        print(
            f"{nome}: {len(encontrados)} encontrados"
        )


# ==========================================
# 11. EXECUTAR TESTES
# ==========================================

if __name__ == "__main__":

    # Teste 1: filme com franquia de jogos
    recomendar_jogos("The Dark Knight")

    # Teste 2: filme sem franquia de jogos mapeada
    recomendar_jogos("Interstellar")
