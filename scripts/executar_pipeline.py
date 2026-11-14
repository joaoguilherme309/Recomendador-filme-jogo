# Função no sistema: Executar de ponta a ponta todo o pipeline offline (pré-processamento,
# padronização, treino TF-IDF, avaliação experimental e geração de gráficos) em um único comando.

import sys
import time
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from backend.avaliacao.avaliar_sistema import executar_avaliacao
from backend.avaliacao.gerar_graficos import gerar_todos_graficos
from backend.ml.padronizacao import executar_padronizacao
from backend.ml.preprocessamento import executar_preprocessamento_filmes
from backend.ml.preprocessamento_jogos import executar_preprocessamento_jogos
from backend.ml.treinar_modelo import treinar_e_salvar_modelo


def rodar_etapa(nome: str, funcao):
    print(f"\n{'=' * 60}")
    print(f"INICIANDO ETAPA: {nome}")
    print(f"{'=' * 60}")
    inicio = time.perf_counter()
    funcao()
    duracao = time.perf_counter() - inicio
    print(f"[OK] {nome} concluída em {duracao:.2f}s")


def main():
    inicio_total = time.perf_counter()

    rodar_etapa("1/6 - Pré-processamento de Filmes (TMDB)", executar_preprocessamento_filmes)
    rodar_etapa("2/6 - Pré-processamento de Jogos (Steam)", executar_preprocessamento_jogos)
    rodar_etapa("3/6 - Padronização e Ponte Temática (NLTK)", executar_padronizacao)
    rodar_etapa("4/6 - Treinamento e Persistência TF-IDF (Joblib)", treinar_e_salvar_modelo)
    rodar_etapa("5/6 - Avaliação Offline vs. Baselines", executar_avaliacao)
    rodar_etapa("6/6 - Geração de Gráficos (Matplotlib)", gerar_todos_graficos)

    tempo_total = time.perf_counter() - inicio_total
    print(f"\nPipeline completo finalizado com sucesso em {tempo_total:.2f}s!")


if __name__ == "__main__":
    main()