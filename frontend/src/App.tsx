
import React, { useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Paper,
  Typography,
} from "@mui/material";

import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MovieOutlinedIcon from "@mui/icons-material/MovieOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import VideogameAssetOutlinedIcon from "@mui/icons-material/VideogameAssetOutlined";
import { CabecalhoTransmutacao } from "./components/CabecalhoTransmutacao";

import { CardJogo } from "./components/CardJogo";
import { ListaFranquias } from "./components/ListaFranquias";
import { SeletorFilmes } from "./components/SeletorFilmes";
import { TelaLoginMockup } from "./components/TelaLogin";
import { gerarRecomendacoes } from "./services/api";

import type {
  FilmeResumo,
  RecomendacaoResponse,
} from "./types/recomendacao";

// IMAGEM DO ROY
// Local: frontend/public_mascote/mascote/roy.png

const imagemRoy = new URL(
  "../public_mascote/mascote/roy.png",
  import.meta.url
).href;

const MOSTRAR_LOGIN = false;

// CORES DO TRANSMUTIA

const cores = {
  fundo: "#FAF9F6",
  branco: "#FFFFFF",
  texto: "#171717",
  secundario: "#666666",
  verde: "#285C36",
  verdeClaro: "#E9EFE7",
  dourado: "#B48A43",
  borda: "#E7E5E1",
  lateral: "#F0EFEC",
  pergaminho: "#F7E8C6",
  tintaPergaminho: "#4E3A20",
};

// FONTES DO ROY

const fontes = {
  titulo: '"Cinzel", Georgia, serif',
  pergaminho: '"Cormorant Garamond", Georgia, serif',
  padrao: "Inter, Roboto, sans-serif",
};

// TRADUÇÃO DOS GÊNEROS

const traducoesGeneros: Record<string, string> = {
  action: "Ação",
  adventure: "Aventura",
  animation: "Animação",
  comedy: "Comédia",
  crime: "Crime",
  documentary: "Documentário",
  drama: "Drama",
  family: "Família",
  fantasy: "Fantasia",
  history: "História",
  horror: "Terror",
  music: "Música",
  mystery: "Mistério",
  romance: "Romance",
  "science fiction": "Ficção científica",
  "sci-fi": "Ficção científica",
  thriller: "Suspense",
  war: "Guerra",
  western: "Faroeste",
  "tv movie": "Filme para TV",
};

// NORMALIZAÇÃO DOS GÊNEROS

const normalizarGenero = (genero: string): string => {
  const limpo = genero.trim();
  const chave = limpo.toLowerCase();

  if (
    !limpo ||
    ["(no genres listed)", "unknown", "nan"].includes(chave)
  ) {
    return "";
  }

  return traducoesGeneros[chave] ?? limpo;
};

// IDENTIFICAÇÃO DAS ESSÊNCIAS

const identificarEssencias = (
  filmes: FilmeResumo[]
): string[] => {
  const frequencias = new Map<string, number>();

  filmes.forEach((filme) => {
    const generosDoFilme = new Set(
      (filme.genres ?? [])
        .flatMap((genero) => genero.split(/[|,]/))
        .map(normalizarGenero)
        .filter(Boolean)
    );

    generosDoFilme.forEach((genero) => {
      frequencias.set(
        genero,
        (frequencias.get(genero) ?? 0) + 1
      );
    });
  });

  return [...frequencias.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([genero]) => genero);
};

// MENSAGENS PERSONALIZADAS DO ROY

const gerarFalaRoy = (generos: string[]): string => {
  if (generos.length === 0) {
    return (
      "A transmutação está completa! " +
      "Encontrei jogos com características semelhantes " +
      "aos seus filmes favoritos. Vamos explorar?"
    );
  }

  if (generos.length === 1) {
    return (
      `Ora, ora! Percebi que ${generos[0]} é uma das ` +
      "essências dos filmes que você escolheu! " +
      "Preparei jogos que podem combinar com suas " +
      "preferências. Vamos descobrir?"
    );
  }

  const descricao = generos
    .slice(0, 2)
    .join(" e ")
    .toLowerCase();

  return (
    "Ora, ora! Vejo que seus filmes trazem " +
    `elementos de ${descricao}! ` +
    "Analisei suas preferências e encontrei jogos " +
    "que podem proporcionar experiências semelhantes. " +
    "Que tal descobrir sua próxima aventura?"
  );
};

// PERSONAGEM ROY

const Roy: React.FC<{ tamanho?: number }> = ({
  tamanho = 130,
}) => (
  <Box
    component="img"
    src={imagemRoy}
    alt="Roy, o alquimista do Transmutia"
    sx={{
      width: tamanho,
      maxWidth: "100%",
      height: "auto",
      objectFit: "contain",
      imageRendering: "auto",
      flexShrink: 0,
      filter: "drop-shadow(0 5px 5px rgba(0,0,0,0.12))",
    }}
  />
);

// COMPONENTE DO PERGAMINHO

const PergaminhoRoy: React.FC<{
  carregando: boolean;
  ultimaConsulta: RecomendacaoResponse | null;
  essencias: string[];
}> = ({
  carregando,
  ultimaConsulta,
  essencias,
}) => {
  const mensagem = carregando
    ? "Um instante, viajante! Estou reunindo " +
      "as essências dos seus filmes e preparando " +
      "novas aventuras para você!"
    : ultimaConsulta
    ? gerarFalaRoy(essencias)
    : "Saudações, viajante! Sou Roy, o alquimista " +
      "do Transmutia! Escolha de 2 a 3 filmes " +
      "que você adora e transformarei suas " +
      "preferências em novas descobertas!";

  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        width: "100%",
        position: "relative",
        borderRadius: "14px",
        p: { xs: 2.5, md: 3 },
        border: "1px solid #D2B277",

        background:
          "linear-gradient(135deg, #FFF4D9 0%, #F7E8C6 45%, #EED5A7 100%)",

        boxShadow:
          "0 5px 15px rgba(92, 61, 22, 0.12), " +
          "inset 0 0 15px rgba(145, 97, 35, 0.12)",

        // BORDAS SUPERIORES DO PERGAMINHO
        "&::before": {
          content: '""',
          position: "absolute",
          top: 8,
          left: 12,
          right: 12,
          height: 5,
          borderTop: "2px solid rgba(126, 85, 31, 0.22)",
          borderRadius: "50%",
          pointerEvents: "none",
        },

        // BORDAS INFERIORES DO PERGAMINHO
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 8,
          left: 12,
          right: 12,
          height: 5,
          borderBottom: "2px solid rgba(126, 85, 31, 0.22)",
          borderRadius: "50%",
          pointerEvents: "none",
        },
      }}
    >
      {/* PONTA DO BALÃO APONTANDO PARA ROY */}

      <Box
        sx={{
          position: "absolute",
          left: -9,
          top: "45%",
          width: 17,
          height: 17,
          backgroundColor: "#F7E8C6",
          borderLeft: "1px solid #D2B277",
          borderBottom: "1px solid #D2B277",
          transform: "rotate(45deg)",
          display: { xs: "none", sm: "block" },
        }}
      />

      {/* NOME DO PERSONAGEM */}

      <Typography
        sx={{
          position: "relative",
          zIndex: 1,
          fontFamily: fontes.titulo,
          fontSize: {
            xs: "0.95rem",
            md: "1.05rem",
          },
          fontWeight: 700,
          color: "#70491E",
          mb: 1.3,
          letterSpacing: 0.2,
        }}
      >
        Roy, o Alquimista
      </Typography>

      {/* FALA DO ROY */}

      <Typography
        sx={{
          position: "relative",
          zIndex: 1,
          color: cores.tintaPergaminho,
          fontFamily: fontes.pergaminho,
          fontSize: {
          xs: "1rem",
          md: "1.05rem",
            },
              fontWeight: 600,
              lineHeight: 1.5,
        }}
      >
        {mensagem}
      </Typography>

      {/* DECORAÇÃO DO PERGAMINHO */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          mt: 1.5,
        }}
      >
        <AutoAwesomeOutlinedIcon
          sx={{
            color: "#B48A43",
            fontSize: 17,
            opacity: 0.75,
          }}
        />
      </Box>
    </Box>
  );
};

// COMPONENTE PRINCIPAL

export const App: React.FC = () => {
  const [exibirLoginMockup, setExibirLoginMockup] =
    useState(false);

  const [ultimaConsulta, setUltimaConsulta] =
    useState<RecomendacaoResponse | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const resultadosRef = useRef<HTMLDivElement | null>(null);

  const irParaResultados = () => {
    resultadosRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // REQUISIÇÃO AO BACKEND

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

      setUltimaConsulta(resposta);

      setTimeout(() => {
        resultadosRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch {
      setErro(
        "Não foi possível gerar as recomendações. " +
        "Verifique se o servidor FastAPI está em execução na porta 8000."
      );
    } finally {
      setCarregando(false);
    }
  };

  const filmes = ultimaConsulta?.filmes_selecionados ?? [];
  const essencias = identificarEssencias(filmes);

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
        fontFamily: fontes.padrao,
      }}
    >
      {/* IMPORTAÇÃO DAS FONTES DO GOOGLE */}

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=Cormorant+Garamond:wght@400;500;600;700&display=swap');
        `}
      </style>

      {/* CABEÇALHO */}

      <Box
        component="header"
        sx={{
          bgcolor: cores.branco,
          borderBottom: `1px solid ${cores.borda}`,
          px: { xs: 2, md: 5 },
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <ScienceOutlinedIcon
            sx={{
              color: cores.verde,
              fontSize: 30,
            }}
          />

          <Typography
            sx={{
              fontWeight: 800,
              fontSize: { xs: 19, md: 23 },
              letterSpacing: -0.5,
            }}
          >
            Transmutia
          </Typography>

          <Typography
            sx={{
              display: { xs: "none", md: "block" },
              color: cores.secundario,
              fontSize: 12,
              ml: 2,
              borderLeft: `1px solid ${cores.borda}`,
              pl: 2,
            }}
          >
            A alquimia entre cinema e jogos
          </Typography>
        </Box>

        {/* LOGIN PRESERVADO, MAS OCULTO */}

        {MOSTRAR_LOGIN && (
          <Button
            variant="outlined"
            startIcon={<PersonOutlineIcon />}
            onClick={() => setExibirLoginMockup(true)}
          >
            Entrar / Criar conta
          </Button>
        )}
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
              fontSize: { xs: "2rem", md: "3.2rem" },
              lineHeight: 1.15,
              letterSpacing: -1.5,
              maxWidth: 850,
              mb: 2.5,
            }}
          >
            Transforme seus filmes favoritos
            <br />
            em novas aventuras
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
            Descubra a alquimia entre cinema e jogos.
            Selecione seus filmes favoritos e encontre
            experiências com gêneros, temas e atmosferas semelhantes.
          </Typography>
        </Box>

        {/* CARROSSEL DE TRANSMUTAÇÃO */}

          <Box sx={{ mb: 5 }}>
            <CabecalhoTransmutacao />
          </Box>

        {/* SELETOR E PAINEL LATERAL */}

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
            {/* INDICADOR DE ETAPAS */}

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

          {/* PAINEL LATERAL DO ROY */}

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              bgcolor: cores.lateral,
              borderRadius: "18px",
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
              color: cores.texto,
            }}
          >
            {/* TÍTULO DO PAINEL */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <AutoAwesomeOutlinedIcon
                sx={{ color: cores.dourado }}
              />

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  color: cores.texto,
                  fontFamily: fontes.titulo,
                  fontSize: {
                    xs: "1.1rem",
                    md: "1.25rem",
                  },
                  letterSpacing: -0.3,
                }}
              >
                {carregando
                  ? "Transmutação em andamento"
                  : ultimaConsulta
                  ? "Sua última transmutação"
                  : "Conheça seu guia alquímico"}
              </Typography>
            </Box>

            {/* ROY + PERGAMINHO */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexDirection: {
                  xs: "column",
                  sm: "row",
                },
              }}
            >
              <Roy tamanho={120} />

              <PergaminhoRoy
                carregando={carregando}
                ultimaConsulta={ultimaConsulta}
                essencias={essencias}
              />
            </Box>

            {/* CARREGAMENTO */}

            {carregando && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  py: 2,
                }}
              >
                <CircularProgress
                  size={22}
                  sx={{ color: cores.verde }}
                />

                <Typography
                  variant="body2"
                  sx={{ color: cores.secundario }}
                >
                  Preparando sua transmutação...
                </Typography>
              </Box>
            )}

            {/* ANTES DA RECOMENDAÇÃO */}

            {!ultimaConsulta && !carregando && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: cores.texto,
                    fontFamily: fontes.titulo,
                    fontSize: "1rem",
                  }}
                >
                  Como funciona a alquimia?
                </Typography>

                {[
                  {
                    titulo: "Escolha seus filmes",
                    descricao:
                      "Selecione de 2 a 3 filmes favoritos.",
                    icone: <MovieOutlinedIcon />,
                  },
                  {
                    titulo: "Extração das essências",
                    descricao:
                      "Analisamos gêneros, temas e características.",
                    icone: <ScienceOutlinedIcon />,
                  },
                  {
                    titulo: "Descubra novos jogos",
                    descricao:
                      "Receba recomendações personalizadas.",
                    icone: <VideogameAssetOutlinedIcon />,
                  },
                ].map((passo, index) => (
                  <Box
                    key={passo.titulo}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 2,
                      p: 1.5,
                      bgcolor: cores.branco,
                      borderRadius: 2,
                      border: `1px solid ${cores.borda}`,
                    }}
                  >
                    <Box
                      sx={{
                        bgcolor: cores.verdeClaro,
                        color: cores.verde,
                        borderRadius: 2,
                        p: 1,
                        display: "flex",
                      }}
                    >
                      {passo.icone}
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          color: cores.texto,
                          fontWeight: 650,
                        }}
                      >
                        {index + 1}. {passo.titulo}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          mt: 0.5,
                          color: cores.secundario,
                        }}
                      >
                        {passo.descricao}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

            {/* DEPOIS DA RECOMENDAÇÃO */}

            {ultimaConsulta && !carregando && (
              <>
                {/* ESSÊNCIAS IDENTIFICADAS */}

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: cores.texto,
                      mb: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      fontFamily: fontes.titulo,
                      fontSize: "0.95rem",
                    }}
                  >
                    <ScienceOutlinedIcon
                      sx={{ color: cores.dourado }}
                    />
                    Essências identificadas
                  </Typography>

                  {essencias.length > 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 1,
                      }}
                    >
                      {essencias.map((genero) => (
                        <Chip
                          key={genero}
                          label={genero}
                          sx={{
                            bgcolor: cores.verdeClaro,
                            color: cores.verde,
                            fontWeight: 600,
                          }}
                        />
                      ))}
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ color: cores.secundario }}
                    >
                      Não foram encontrados gêneros
                      cadastrados para os filmes selecionados.
                    </Typography>
                  )}
                </Box>

                {/* ESTATÍSTICAS */}

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  {[
                    {
                      numero:
                        ultimaConsulta.filmes_selecionados.length,
                      legenda: "Filmes analisados",
                    },
                    {
                      numero:
                        ultimaConsulta.recomendacoes.length,
                      legenda: "Jogos encontrados",
                    },
                  ].map((item) => (
                    <Box
                      key={item.legenda}
                      sx={{
                        bgcolor: cores.branco,
                        borderRadius: 2,
                        p: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          color: cores.verde,
                          fontWeight: 800,
                          fontSize: 28,
                        }}
                      >
                        {item.numero}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ color: cores.secundario }}
                      >
                        {item.legenda}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* FILMES ANALISADOS */}

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: cores.texto,
                      mb: 1.5,
                    }}
                  >
                    Filmes da transmutação
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
                </Box>

                {/* BOTÃO DE RESULTADOS */}

                <Button
                  variant="contained"
                  onClick={irParaResultados}
                  sx={{
                    bgcolor: cores.verde,
                    color: "#FFFFFF",
                    textTransform: "none",
                    borderRadius: 2,
                    py: 1.3,
                    fontWeight: 600,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#1D4629",
                    },
                  }}
                >
                  Ver recomendações
                </Button>
              </>
            )}
          </Paper>
        </Box>

        {/* ERROS */}

        {erro && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {erro}
          </Alert>
        )}

        {/* RESULTADOS DA CONSULTA */}

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

            {/* FILMES DA CONSULTA */}

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
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

            {/* CARDS PRINCIPAIS */}

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

            {/* JOGOS DA MESMA FRANQUIA */}

            <Box sx={{ mt: 4 }}>
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
