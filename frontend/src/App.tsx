
import React, { useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Typography,
} from "@mui/material";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MovieOutlinedIcon from "@mui/icons-material/MovieOutlined";

import { CardJogo } from "./components/CardJogo";
import { ListaFranquias } from "./components/ListaFranquias";
import { SeletorFilmes } from "./components/SeletorFilmes";
import { TelaLoginMockup } from "./components/TelaLogin";
import { gerarRecomendacoes } from "./services/api";

import {
  FilmeResumo,
  RecomendacaoResponse,
} from "./types/recomendacao";

const cores = {
  fundo: "#FAF9F6",
  branco: "#FFFFFF",
  texto: "#171717",
  secundario: "#666666",
  verde: "#285C36",
  verdeClaro: "#E9EFE7",
  borda: "#E7E5E1",
};

export const App: React.FC = () => {
  const [exibirLoginMockup, setExibirLoginMockup] =
    useState(false);

  // Armazena apenas a consulta mais recente
  const [ultimaConsulta, setUltimaConsulta] =
    useState<RecomendacaoResponse | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const resultadosRef = useRef<HTMLDivElement | null>(null);

  const handleGerarRecomendacoes = async (
    filmes: FilmeResumo[]
  ) => {
    setCarregando(true);
    setErro(null);

    try {
      const resposta = await gerarRecomendacoes({
        movie_ids: filmes.map((f) => f.movie_id),
        top_n: 10,
      });

      // Substitui os resultados anteriores pela nova consulta
      setUltimaConsulta(resposta);

      setTimeout(() => {
        resultadosRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch {
      // Mantém a consulta anterior em caso de falha
      setErro(
        "Não foi possível gerar as recomendações. Verifique se o servidor FastAPI está em execução na porta 8000."
      );
    } finally {
      setCarregando(false);
    }
  };

  if (exibirLoginMockup) {
    return (
      <TelaLoginMockup
        onVoltar={() => setExibirLoginMockup(false)}
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: cores.fundo,
        color: cores.texto,
        fontFamily: "Inter, Roboto, sans-serif",
      }}
    >
      {/* CABEÇALHO */}
      <Box
        sx={{
          bgcolor: cores.branco,
          borderBottom: `1px solid ${cores.borda}`,
          px: { xs: 2, md: 5 },
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <SportsEsportsOutlinedIcon
            sx={{
              color: cores.texto,
              fontSize: 29,
            }}
          />

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: 15, md: 19 },
              letterSpacing: -0.4,
            }}
          >
            CineGame Recommender
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<PersonOutlineIcon />}
          onClick={() => setExibirLoginMockup(true)}
          sx={{
            color: cores.texto,
            borderColor: "#DADADA",
            borderRadius: "25px",
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
            "&:hover": {
              borderColor: cores.verde,
              bgcolor: cores.verdeClaro,
            },
          }}
        >
          Entrar / Criar conta
        </Button>
      </Box>

      {/* CONTEÚDO */}
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 5, md: 9 },
          px: { xs: 2, md: 5 },
        }}
      >
        {/* APRESENTAÇÃO */}
        <Box sx={{ mb: 7 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 750,
              fontSize: {
                xs: "2rem",
                md: "3.2rem",
              },
              lineHeight: 1.15,
              letterSpacing: -1.5,
              maxWidth: 850,
              mb: 2.5,
            }}
          >
            Descubra jogos com a mesma
            <br />
            vibe dos seus filmes favoritos
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: cores.secundario,
              maxWidth: 760,
              fontSize: "1.1rem",
              lineHeight: 1.8,
            }}
          >
            Diga quais filmes você gosta e receba
            recomendações de jogos com gêneros,
            temas e atmosferas semelhantes.
          </Typography>
        </Box>

        {/* DUAS COLUNAS */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "minmax(0, 1.7fr) minmax(0, 1fr)",
            },
            gap: 3,
            alignItems: "stretch",
          }}
        >
          {/* CARD DE SELEÇÃO */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: "18px",
              border: `1px solid ${cores.borda}`,
              bgcolor: cores.branco,
              boxShadow: "0 8px 30px rgba(0,0,0,0.035)",
            }}
          >
            {/* ETAPAS */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1.5,
                mb: 5,
              }}
            >
              {[
                "Filmes",
                "Preferências",
                "Recomendações",
              ].map((etapa, index) => (
                <React.Fragment key={etapa}>
                  {index > 0 && (
                    <Box
                      sx={{
                        width: { xs: 15, md: 35 },
                        height: 1,
                        bgcolor: "#D9D9D9",
                      }}
                    />
                  )}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        bgcolor:
                          index === 0
                            ? cores.verde
                            : "#F1F0ED",
                        color:
                          index === 0
                            ? "#FFFFFF"
                            : "#666666",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 600,
                        fontSize: 14,
                      }}
                    >
                      {index + 1}
                    </Box>

                    <Typography
                      sx={{
                        color:
                          index === 0
                            ? cores.texto
                            : cores.secundario,
                        fontSize: 14,
                        fontWeight:
                          index === 0 ? 700 : 400,
                      }}
                    >
                      {etapa}
                    </Typography>
                  </Box>
                </React.Fragment>
              ))}
            </Box>

            <SeletorFilmes
              onEnviar={handleGerarRecomendacoes}
              carregando={carregando}
            />
          </Paper>

          {/* PAINEL LATERAL */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              bgcolor: "#F0EFEC",
              borderRadius: "18px",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: cores.texto,
              }}
            >
              {ultimaConsulta
                ? "Sua última recomendação"
                : "Como funciona?"}
            </Typography>

            {ultimaConsulta ? (
              <>
                <Typography
                  sx={{
                    color: cores.secundario,
                    lineHeight: 1.7,
                  }}
                >
                  Encontramos{" "}
                  {ultimaConsulta.recomendacoes.length} jogos
                  com características semelhantes
                  aos seus filmes favoritos.
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  {ultimaConsulta.filmes_selecionados.map(
                    (filme) => (
                      <Chip
                        key={filme.movie_id}
                        label={filme.title}
                        sx={{
                          bgcolor: cores.verdeClaro,
                          color: cores.verde,
                          fontWeight: 500,
                        }}
                      />
                    )
                  )}
                </Box>

                <Button
                  variant="contained"
                  onClick={() =>
                    resultadosRef.current?.scrollIntoView({
                      behavior: "smooth",
                    })
                  }
                  sx={{
                    mt: 2,
                    bgcolor: cores.verde,
                    color: "#FFFFFF",
                    textTransform: "none",
                    borderRadius: 2,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#1D4629",
                    },
                  }}
                >
                  Ver recomendações
                </Button>
              </>
            ) : (
              <>
                <Typography
                  sx={{
                    color: cores.secundario,
                    lineHeight: 1.8,
                  }}
                >
                  Nosso sistema analisa as características
                  dos filmes selecionados e procura jogos
                  com experiências semelhantes.
                </Typography>

                {[
                  {
                    numero: "01",
                    titulo: "Escolha seus filmes",
                    descricao:
                      "Selecione de 2 a 3 filmes que você gosta.",
                  },
                  {
                    numero: "02",
                    titulo: "Análise de conteúdo",
                    descricao:
                      "Comparamos gêneros, temas e características.",
                  },
                  {
                    numero: "03",
                    titulo: "Descubra novos jogos",
                    descricao:
                      "Receba uma lista de jogos recomendados.",
                  },
                ].map((passo) => (
                  <Box
                    key={passo.numero}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      py: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        color: cores.verde,
                        fontWeight: 700,
                        fontSize: 15,
                      }}
                    >
                      {passo.numero}
                    </Typography>

                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 650,
                          color: cores.texto,
                        }}
                      >
                        {passo.titulo}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          color: cores.secundario,
                          mt: 0.5,
                        }}
                      >
                        {passo.descricao}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </>
            )}
          </Paper>
        </Box>

        {/* ERRO */}
        {erro && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {erro}
          </Alert>
        )}

        {/* RESULTADOS DA ÚLTIMA CONSULTA */}
        {ultimaConsulta && (
          <Box
            ref={resultadosRef}
            sx={{
              mt: 9,
              scrollMarginTop: "30px",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              Seus jogos recomendados
            </Typography>

            <Typography
              sx={{
                color: cores.secundario,
                mb: 4,
              }}
            >
              Resultados personalizados com base
              nos filmes que você escolheu.
            </Typography>

            {/* FILMES DA CONSULTA ATUAL */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
                mb: 3,
              }}
            >
              <MovieOutlinedIcon
                sx={{ color: cores.verde }}
              />

              <Typography sx={{ fontWeight: 600 }}>
                Filmes selecionados:
              </Typography>

              {ultimaConsulta.filmes_selecionados.map(
                (filme) => (
                  <Chip
                    key={filme.movie_id}
                    label={filme.title}
                    size="small"
                    sx={{
                      bgcolor: cores.verdeClaro,
                      color: cores.verde,
                    }}
                  />
                )
              )}
            </Box>

            {/* 10 CARDS DA CONSULTA ATUAL */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              {ultimaConsulta.recomendacoes.map(
                (jogo, idx) => (
                  <Box key={jogo.game_id}>
                    <CardJogo
                      posicao={idx + 1}
                      jogo={jogo}
                      consultaId={ultimaConsulta.consulta_id}
                    />
                  </Box>
                )
              )}
            </Box>

            {/* FRANQUIAS IDENTIFICADAS */}
            <Box sx={{ mt: 3 }}>
              <ListaFranquias
                franquias={
                  ultimaConsulta.franquias_identificadas
                }
                jogos={ultimaConsulta.jogos_franquia}
              />
            </Box>

            {/* VOLTAR AO SELETOR */}
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              sx={{
                mt: 3,
                color: cores.verde,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Escolher outros filmes
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default App;
