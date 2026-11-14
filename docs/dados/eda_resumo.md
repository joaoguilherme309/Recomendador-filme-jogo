# Análise exploratória dos dados

Gerado por `notebooks/eda.py`. Figuras em `docs/figuras/eda/`.

## 1. Funil de limpeza

**Filmes**

| Etapa | Removidos | Restantes |
|---|---|---|
| registros brutos | 0 | 10000 |
| sem título | 0 | 10000 |
| id duplicado | 36 | 9964 |
| sem texto (sem sinopse e sem gêneros) | 0 | 9964 |

**Jogos**

| Etapa | Removidos | Restantes |
|---|---|---|
| registros brutos | 0 | 125855 |
| sem nome | 1 | 125854 |
| sem texto (descrição, gêneros e tags vazios) | 8280 | 117574 |
| sem avaliação | 34570 | 83004 |
| software (só gêneros de aplicativo) | 977 | 82027 |
| conteúdo sexual explícito | 4159 | 77868 |
| título não latino | 1241 | 76627 |
| descrição não latina | 513 | 76114 |
| nome duplicado | 748 | 75366 |
| AppID duplicado | 0 | 75366 |

## 2. Campos vazios

**Jogos**

| Campo | Bruto (%) | Após limpeza (%) |
|---|---|---|
| Descrição | 6.7 | 0.1 |
| Gêneros | 6.7 | 0.1 |
| Tags | 33.8 | 0.1 |
| Imagem de capa | 0.1 | 0.1 |

**Filmes (bruto)**

| Campo | Vazios |
|---|---|
| overview | 2 |
| genre_ids | 3 |
| release_date | 3 |

## 3. Gêneros e tags

- Gêneros distintos nos filmes: **18**; média de 2.6 gêneros por filme.
- Tags distintas nos jogos: **445**; média de 14.2 tags por jogo.
- 5 tags mais comuns: Singleplayer, Indie, Action, Casual, Adventure. Tags genéricas como *Indie* e *Singleplayer* descrevem o modelo de produção, não o tema, e pesam pouco na ponte com filmes.

## 4. Ano de lançamento

- Filmes: mediana **2010**, de 1902 a 2026; 28% antes de 2000.
- Jogos: mediana **2021**, de 1997 a 2026; 96% a partir de 2015 (crescimento da Steam).
- As bases cobrem épocas diferentes: filmes clássicos têm poucos jogos contemporâneos.

## 5. Tamanho dos textos

- Sinopses: mediana de **40 palavras** (máx. 168).
- Descrições de jogos: mediana de **182 palavras** (máx. 11530), cerca de 5× maiores. Sem normalização, os textos de jogos dominariam o vocabulário; o TF-IDF com `sublinear_tf` e a normalização L2 atenuam isso.

## 6. Popularidade

- Filmes: mediana de **868 votos**; todos têm votos (a base já é um recorte dos 10 mil mais populares).
- Jogos brutos: 34% não têm nenhuma avaliação; mediana de 6.
- Sensibilidade do limite de avaliações (regra 3 da limpeza):

| Mínimo de avaliações | Jogos brutos que atendem |
|---|---|
| 1 | 82.956 |
| 5 | 67.142 |
| 10 | 56.662 |
| 50 | 30.624 |
| 100 | 22.804 |

## 7. Ponte entre gêneros de filmes e vocabulário dos jogos

Porcentagem dos jogos limpos que têm o gênero do filme entre seus gêneros/tags, pelo mesmo termo e por termos equivalentes (mapeamento em `PONTE_GENEROS`).

| Gênero (filme) | Filmes | Mesmo termo (%) | Com equivalentes (%) | Termos equivalentes |
|---|---|---|---|---|
| Drama | 4644 | 3.3 | 5.6 | Emotional |
| Comedy | 3577 | 6.9 | 14.4 | Funny |
| Thriller | 2656 | 2.5 | 2.5 | — |
| Action | 2295 | 48.0 | 48.0 | — |
| Romance | 1745 | 2.0 | 2.0 | — |
| Adventure | 1652 | 45.5 | 45.5 | — |
| Crime | 1597 | 1.3 | 1.3 | — |
| Horror | 1358 | 11.6 | 13.8 | Psychological Horror, Survival Horror |
| Science Fiction | 1184 | 0.0 | 13.6 | Sci-fi, Space, Cyberpunk |
| Fantasy | 1128 | 13.9 | 15.8 | Dark Fantasy |
| Family | 1124 | 0.0 | 11.4 | Family Friendly |
| Animation | 939 | 0.0 | 19.1 | Cartoon, Cartoony, Anime, Hand-drawn |
| Mystery | 923 | 7.6 | 8.6 | Detective |
| History | 514 | 0.0 | 3.1 | Historical |
| War | 338 | 3.2 | 4.6 | Military, World War II |
| Music | 282 | 1.4 | 2.2 | Rhythm |
| Western | 146 | 0.5 | 0.5 | — |
| TV Movie | 121 | 0.0 | 0.0 | — |
| Documentary | 0 | 0.0 | 0.0 | — |

- Gêneros praticamente sem o mesmo termo na Steam (< 0,5% dos jogos): **Science Fiction, Family, Animation, History, Western, TV Movie, Documentary**. Para eles, a ligação filme→jogo depende de sinônimos na padronização ou só das palavras da sinopse.

## 8. Outros recortes

**Idioma original dos filmes (top 8)**: en 7761, fr 649, it 352, ja 308, es 195, de 107, ko 100, zh 67. As sinopses estão em inglês mesmo nos filmes não ingleses.

**Tipos de item no catálogo de jogos**: jogo 75279, demo 61, playtest 19, dlc 4, soundtrack 3.

**Títulos de filme repetidos**: 690 filmes compartilham título com outro (remakes e homônimos); use `titulo_exibicao`.
