# **Sistema de Recomendação de Jogos Baseado em Filmes**

Projeto acadêmico desenvolvido para o **TP2 — Oficina de Desenvolvimento de Software**.

## **1. Visão geral**

O sistema recomenda **10 jogos** a partir de **um filme escolhido pelo usuário**, utilizando filtragem baseada em conteúdo. O objetivo é identificar jogos cujos gêneros, temas e descrições sejam semelhantes às características do filme selecionado.

Quando o filme pertence a uma franquia com jogos identificados no catálogo, o sistema pode apresentar **duas listas independentes**:

- **Jogos recomendados:** até 10 jogos ordenados pela similaridade de conteúdo, excluindo os jogos reconhecidos como pertencentes à franquia do filme.
- **Jogos da franquia:** até 10 jogos identificados como pertencentes à mesma franquia, apresentados separadamente.

Se o filme não tiver uma franquia de jogos reconhecida, apenas a lista principal é exibida.

## **2. Objetivos**

- Permitir a seleção de um filme para obter recomendações de jogos.
- Aplicar **TF-IDF** aos textos de filmes e jogos em um vocabulário compartilhado.
- Calcular a **similaridade do cosseno** entre o filme e os jogos.
- Evitar nomes repetidos nas listas retornadas.
- Separar adaptações e jogos reconhecidos da mesma franquia em uma lista própria.
- Filtrar, na apresentação das recomendações, títulos predominantemente escritos em alfabetos não latinos.
- Avaliar posteriormente a relevância e a diversidade dos resultados.

## **3. Tecnologias**

### **Utilizadas no protótipo**

- **Python:** processamento dos dados e implementação do recomendador.
- **Pandas e NumPy:** leitura, manipulação e análise dos dados.
- **scikit-learn:** vetorização TF-IDF e similaridade do cosseno.
- **CSV:** armazenamento dos datasets de trabalho.

### **Planejadas para a aplicação**

- **FastAPI:** API HTTP do recomendador.
- **SQLite + SQLAlchemy:** persistência de dados da aplicação.
- **React + TypeScript + Vite:** interface web.
- **Material UI (MUI):** componentes visuais.

As tecnologias planejadas não devem ser confundidas com funcionalidades já entregues.

## **4. Bases de dados**

Os dois datasets são baixados do Hugging Face numa **revisão fixa** (commit do repositório, definido em `backend/config.py`), para que todo o grupo trabalhe exatamente com os mesmos dados.

### **Filmes — Global Movie Trends (2026) / TMDB Top 10K Movies**

- **Fonte:** [jason1966/algozee_global-movie-trends-2026](https://huggingface.co/datasets/jason1966/algozee_global-movie-trends-2026), arquivo `tmdb_top_10k_movies_2026.csv.csv`. É um espelho do dataset do Kaggle `algozee/global-movie-trends-2026`, cujos dados vêm da API do **TMDB** (The Movie Database).
- **Licença:** **não declarada** (o cartão do Hugging Face informa `license: unknown`, e a página de origem no Kaggle não estava mais acessível na data da coleta). Como os dados vêm do TMDB, valem os [termos de uso da API do TMDB](https://www.themoviedb.org/api-terms-of-use), que exigem a atribuição: *"This product uses the TMDB API but is not endorsed or certified by TMDB."* O uso neste projeto é **acadêmico e não comercial**.
- **10.000 filmes** brutos e **9.964** após a limpeza.
- Campos relevantes: `title`, `overview`, `genre_ids`, `release_date`, `original_language`, `vote_count`, entre outros.
- Os códigos numéricos de gêneros são convertidos em nomes textuais no pré-processamento.

### **Jogos — Steam Games Dataset**

- **Fonte:** [FronkonGames/steam-games-dataset](https://huggingface.co/datasets/FronkonGames/steam-games-dataset), arquivo `games.csv` (~400 MB). Coletado pela Fronkon Games com o [Steam-Games-Scraper](https://github.com/FronkonGames/Steam-Games-Scraper) a partir da API da Steam e do Steam Spy.
- **Licença:** **MIT** (declarada no cartão do dataset). Os dados de origem pertencem à Valve/Steam e aos respectivos desenvolvedores.
- **125.855 registros brutos** e **75.366 jogos** após a limpeza.
- Campos relevantes: `AppID`, `Name`, `About the game`, `Genres`, `Tags`, `Release date`, `Positive`, `Negative`, entre outros.
- O catálogo inclui descrições, gêneros e tags utilizados para calcular as similaridades.
- O cartão do dataset fala em 148.909 jogos e o Parquet do mesmo repositório tem 124.146 linhas: as contagens divergem entre os arquivos. Este projeto usa o `games.csv`.

O arquivo bruto de jogos tem um cabeçalho incorreto (`DiscountDLC count`), corrigido **apenas na leitura**: o arquivo original não é alterado.

### **Registro dos dados**

| | Filmes | Jogos |
|---|---|---|
| Repositório | `jason1966/algozee_global-movie-trends-2026` | `FronkonGames/steam-games-dataset` |
| Revisão (commit) | `1d112c7485f59eaa57fc78aa1ce16d5481964c74` | `6c21457b9ebf0a6a7f5b91e11281d65d456ea30e` |
| Data da revisão | 31/03/2026 | 08/11/2026 |
| Arquivo | `tmdb_top_10k_movies_2026.csv.csv` | `games.csv` |
| Tamanho | 3.399.497 bytes | 401.140.503 bytes |
| SHA-256 | `2e3e38e421afc935e1b686c47f7da32960baab12a962b8d75b767ea64556f00e` | `1b48008b01a799d82385d6e66ba0cb65dd477b6aa4b6c2ec8c443025ab6880ad` |
| Coletado em | 14/11/2026 | 14/11/2026 |

As URLs e os hashes também ficam registrados em `data/raw/manifesto.json`, gerado no download.

### **Preservação dos datasets originais**

- `data/raw/` guarda cópias fiéis dos datasets. Os arquivos ficam **somente leitura**, e o manifesto registra repositório, revisão, URL e **SHA-256** de cada um.
- Nenhuma etapa escreve em `data/raw/`. A limpeza só lê os originais e grava os resultados em `data/processed/`.
- `python scripts/baixar_datasets.py --verificar` confere se os originais continuam idênticos aos baixados.

### **Limpeza**

As regras estão documentadas no início de `backend/ml/preprocessamento_filmes.py` e `backend/ml/preprocessamento_jogos.py`. A cada execução, o efeito de cada regra é gravado em `docs/dados/limpeza_filmes.json` e `docs/dados/limpeza_jogos.json`.

**Filmes** (10.000 → 9.964):

| Regra | Removidos | Justificativa |
|---|---|---|
| `id` duplicado | 36 | Mesmo filme capturado duas vezes com contagens de votos diferentes; fica o registro com mais votos |
| Sem título / sem texto | 0 | Regras mantidas como proteção |

Sem remoção: a coluna `Unnamed: 0` é descartada; `release_date` vira data ISO e `ano`; os 690 filmes com título repetido (remakes e homônimos) ganham `titulo_exibicao` = "Título (ano)"; filmes sem sinopse ficam marcados em `sem_sinopse`. As sinopses estão em inglês mesmo nos filmes não ingleses (22% da base), então não há filtro de idioma.

**Jogos** (125.855 → 75.366):

| Regra | Removidos | Justificativa |
|---|---|---|
| Sem nome | 1 | — |
| Sem texto (descrição, gêneros e tags vazios) | 8.280 | Nada para vetorizar |
| Sem avaliação | 34.570 | Sem sinal de que o jogo foi publicado e jogado (mediana de 6 avaliações). Demos, playtests, soundtracks e DLCs ficam isentos |
| Software (só gêneros de aplicativo) | 977 | *Utilities*, *Video Production* etc. não são jogos. Demos, playtests, soundtracks e DLCs ficam isentos |
| Conteúdo sexual explícito | 4.159 | Gênero ou tag *Sexual Content*, *Nudity*, *NSFW* ou *Hentai*; pode ser desligado em `REMOVER_CONTEUDO_SEXUAL` |
| Título não latino | 1.241 | Menos de 50% de letras latinas no título |
| Descrição não latina | 513 | O tratamento textual (stopwords e lematização) é feito só em inglês |
| Nome duplicado | 748 | Mesmo nome após normalização; fica o registro com mais avaliações |

Demos, playtests, soundtracks e DLCs são **mantidos** e identificados na coluna `tipo_item`. A Steam não permite avaliar playtests, por isso eles ficam isentos da regra de avaliações. Mesmo assim, só 19 dos 8.135 playtests têm algum texto; os demais saem pela regra "sem texto".

Sinalizações sem remoção: `suporta_ingles`, `texto_curto` (descrição com menos de 100 caracteres), `idade_minima`, `ano`. Imagens de capa ausentes viram texto vazio.

### **Análise exploratória**

`python notebooks/eda.py` gera as figuras em `docs/figuras/eda/` e o resumo em `docs/dados/eda_resumo.md`: funil de limpeza, campos vazios, gêneros e tags, ano de lançamento, tamanho dos textos, popularidade e a cobertura dos gêneros de filme no vocabulário da Steam.

### **Como obter e preparar os dados**

```powershell
pip install -r requirements.txt
python scripts/baixar_datasets.py               # originais -> data/raw/
python -m backend.ml.preprocessamento_filmes    # limpeza -> data/processed/filmes_processados.csv
python -m backend.ml.preprocessamento_jogos     # limpeza -> data/processed/jogos_processados.csv
python notebooks/eda.py                         # análise exploratória -> docs/
```

Outras opções do download: `--verificar` só confere os hashes; `--forcar` baixa novamente (por exemplo, depois de trocar a revisão em `backend/config.py`).

## **5. Estrutura do projeto**

```
TP2 - Oficina Dev Soft/
├── backend/
│   └── services/
│       ├── preprocessamento.py
│       ├── preprocessamento_jogos.py
│       ├── padronizacao.py
│       ├── franquias.py
│       └── modelo_recomendacao.py
├── data/                                  # fora do Git
│   ├── raw/                               # originais, somente leitura
│   │   ├── filmes/tmdb_top_10k_movies_2026.csv.csv
│   │   ├── jogos/games.csv
│   │   └── manifesto.json
│   └── processed/
│       ├── filmes_processados.csv
│       ├── jogos_processados.csv
│       ├── filmes_padronizados.csv
│       └── jogos_padronizados.csv
├── docs/
│   ├── dados/                             # funil de limpeza e resumo da EDA
│   └── figuras/eda/                       # figuras da análise exploratória
├── scripts/
│   └── baixar_datasets.py
├── notebooks/
│   ├── analise_datasets.py
│   ├── analise_novo_dataset.py
│   └── eda.py
├── models/
├── frontend/
├── .gitignore
└── README.md
```

> Algumas pastas estão reservadas para etapas futuras. A estrutura acima representa a organização de trabalho adotada até o momento.

## **6. Etapas de processamento**

### **6.1. Pré-processamento dos filmes**

Em `backend/ml/preprocessamento_filmes.py`:

1. Leitura do original em `data/raw/` (sem alterá-lo).
2. Conversão dos identificadores dos gêneros para nomes textuais.
3. Tratamento de descrições ausentes.
4. Aplicação das regras de limpeza (seção 4) e registro do funil em `docs/dados/limpeza_filmes.json`.
5. Datas em formato ISO, `ano` e `titulo_exibicao`.
6. Construção de um campo textual com gêneros e descrição.
7. Exportação de `data/processed/filmes_processados.csv`.

### **6.2. Pré-processamento dos jogos**

Em `backend/ml/preprocessamento_jogos.py`:

1. Leitura do original em `data/raw/`, com correção do cabeçalho apenas na leitura.
2. Renomeação dos campos utilizados na aplicação.
3. Tratamento de nomes, descrições, gêneros, tags e imagens ausentes.
4. Classificação de `tipo_item` (jogo, demo, playtest, soundtrack, dlc).
5. Aplicação das regras de limpeza (seção 4) e registro do funil em `docs/dados/limpeza_jogos.json`.
6. Datas em formato ISO, `ano` e sinalizações (`suporta_ingles`, `texto_curto`, `idade_minima`).
7. Construção de um campo textual com gêneros, tags e descrição.
8. Exportação de `data/processed/jogos_processados.csv`.

### **6.3. Padronização textual**

Em `backend/services/padronizacao.py`:

- Normalização textual de gêneros e tags.
- Uniformização de termos equivalentes, como variações de ficção científica.
- Criação da coluna `texto_final` para filmes e jogos.
- Exportação de `filmes_padronizados.csv` e `jogos_padronizados.csv`.

## **7. Algoritmo de recomendação**

O sistema emprega **filtragem baseada em conteúdo**:

1. Concatena os textos padronizados dos filmes e jogos.
2. Ajusta um único vetorizador TF-IDF para criar um vocabulário comum.
3. Separa a matriz de filmes e a matriz de jogos.
4. Localiza o filme informado.
5. Calcula a similaridade do cosseno entre seu vetor TF-IDF e os vetores dos jogos.
6. Ordena os jogos da maior para a menor similaridade.
7. Aplica regras de franquia, remoção de títulos repetidos e filtragem de alfabeto.
8. Retorna as listas de recomendações.

Configuração utilizada:

```
TfidfVectorizer(    stop_words="english",    max_features=20000,    min_df=2,    ngram_range=(1, 2))
```

Nas execuções registradas, o vocabulário teve **20.000 termos**, com matrizes de dimensão `(10000, 20000)` para filmes e `(117574, 20000)` para jogos.

**Atenção:** o valor de similaridade do cosseno não representa probabilidade de o usuário gostar do jogo nem percentual de acerto do recomendador.

## **8. Regras das listas**

### **Lista principal: jogos recomendados**

Contém até **10 jogos**, ordenados por similaridade com o filme escolhido. Deve excluir os jogos identificados como pertencentes à mesma franquia do filme.

### **Lista secundária: jogos da franquia**

Aparece **somente se** o filme selecionado for reconhecido pelo mapeamento de franquias e houver jogos correspondentes no catálogo. Esses jogos também podem ser ordenados por similaridade.

A identificação está concentrada em `backend/services/franquias.py`, por meio de um catálogo explícito de filmes e prefixos de títulos de jogos. O catálogo inicial contempla Batman, Harry Potter, Star Wars, Spider-Man, Jurassic Park/World, Sonic, O Senhor dos Anéis e Resident Evil.

**Limitação conhecida:** os critérios baseados em títulos e prefixos não detectam automaticamente todas as relações de franquia. O filtro ainda requer validação para evitar que jogos da mesma franquia apareçam na lista principal ou que jogos não relacionados sejam classificados incorretamente.

### **Filtro de títulos**

A regra proposta em `modelo_recomendacao.py` utiliza `unicodedata` para contar a proporção de letras do alfabeto latino no nome do jogo, aceitando títulos com pelo menos **50% de letras latinas**.

- Permite nomes em português, inglês, espanhol e outros idiomas de alfabeto latino.
- Pode aceitar títulos mistos.
- Rejeita títulos predominantemente escritos em outros sistemas de escrita.
- **Não verifica o idioma ou a disponibilidade de tradução do jogo.**

**Estado de validação:** essa regra não estava implementada em `modelo_recomendacao.py`. Ela passou a ser aplicada na **limpeza dos dados** (`backend/ml/preprocessamento_jogos.py`, regra "título não latino", com 1.241 jogos removidos), então esses títulos já não chegam ao catálogo usado na recomendação.