
import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  Grid,
  IconButton,
  Typography,
  Chip,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { DetalhesJogoSteam, JogoRecomendado } from "../types/recomendacao";
import { buscarDetalhesJogo } from "../services/api";
import { AvaliacaoUsuario, TipoVoto } from "./AvaliacaoUsuario";

interface DetalhesJogoProps {
  open: boolean;
  gameId: number | null;
  nomeFallback: string;
  imagemFallback: string | null;
  jogo: JogoRecomendado;
  consultaId: number;
  voto: TipoVoto;
  enviandoVoto: boolean;
  onVotar: (relevante: boolean) => void;
  onClose: () => void;
}

const cores = {
  fundo: "#1B2838",
  fundoSecundario: "#171A21",
  fundoBloco: "#263747",
  texto: "#FFFFFF",
  textoSecundario: "#C6D4DF",
  azul: "#66C0F4",
  borda: "#34485A",
};

export const DetalhesJogo: React.FC<DetalhesJogoProps> = ({
  open,
  gameId,
  nomeFallback,
  imagemFallback,
  jogo,
  consultaId,
  voto,
  enviandoVoto,
  onVotar,
  onClose,
}) => {
  const [detalhes, setDetalhes] =
    useState<DetalhesJogoSteam | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!open || gameId === null) return;

    let ativo = true;

    async function carregarDetalhes() {
      setCarregando(true);
      setErro(null);
      setDetalhes(null);

      try {
        const resultado = await buscarDetalhesJogo(gameId!);

        if (ativo) {
          setDetalhes(resultado);
        }
      } catch {
        if (ativo) {
          setErro(
            "Não foi possível carregar as informações da Steam."
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarDetalhes();

    return () => {
      ativo = false;
    };
  }, [open, gameId]);

  const imagemPrincipal =
    detalhes?.header_image || imagemFallback;

  const nome = detalhes?.name || nomeFallback;

  const urlSteam =
    detalhes?.store_url ||
    `https://store.steampowered.com/app/${gameId}/`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: {
          bgcolor: cores.fundo,
          color: cores.texto,
          borderRadius: "12px",
          overflow: "hidden",
          border: `1px solid ${cores.borda}`,
        },
      }}
    >
      {/* CABEÇALHO */}
      <Box
        sx={{
          bgcolor: cores.fundoSecundario,
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${cores.borda}`,
        }}
      >
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{ color: cores.texto }}
        >
          Detalhes do jogo
        </Typography>

        <IconButton
          onClick={onClose}
          aria-label="Fechar"
          sx={{
            color: "#AAB7C4",
            "&:hover": {
              color: "#FFFFFF",
              bgcolor: "#34485A",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: cores.fundo,
          color: cores.texto,
        }}
      >
        {/* CARREGAMENTO */}
        {carregando && (
          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <CircularProgress sx={{ color: cores.azul }} />

            <Typography sx={{ color: cores.textoSecundario }}>
              Carregando informações da Steam...
            </Typography>
          </Box>
        )}

        {/* CONTEÚDO */}
        {!carregando && (
          <Box>
            {/* CAPA PRINCIPAL */}
            {imagemPrincipal && (
              <Box
                component="img"
                src={imagemPrincipal}
                alt={`Capa de ${nome}`}
                sx={{
                  width: "100%",
                  maxHeight: 340,
                  objectFit: "cover",
                  objectPosition: "center",
                  borderRadius: "8px",
                  display: "block",
                  mb: 2.5,
                }}
              />
            )}

            {/* TÍTULO E INFORMAÇÕES */}
            <Typography
              variant="h4"
              sx={{
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: { xs: "1.5rem", sm: "2rem" },
                mb: 1,
              }}
            >
              {nome}
            </Typography>

            {detalhes && (
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1,
                  mb: 2,
                }}
              >
                {detalhes.genres.map((genero) => (
                  <Chip
                    key={genero}
                    label={genero}
                    size="small"
                    sx={{
                      bgcolor: "#34485A",
                      color: "#C6D4DF",
                      borderRadius: "4px",
                    }}
                  />
                ))}
              </Box>
            )}

            {/* METADADOS */}
            {detalhes && (
              <Box
                sx={{
                  bgcolor: cores.fundoSecundario,
                  borderRadius: "8px",
                  p: 2,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 2,
                  mb: 3,
                }}
              >
                {[
                  {
                    label: "Desenvolvedora",
                    value: detalhes.developers.join(", "),
                  },
                  {
                    label: "Publicadora",
                    value: detalhes.publishers.join(", "),
                  },
                  {
                    label: "Lançamento",
                    value: detalhes.release_date,
                  },
                  {
                    label: "Plataforma",
                    value: "Steam",
                  },
                ].map((item) => (
                  <Box key={item.label}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#8F98A0",
                        display: "block",
                        mb: 0.4,
                      }}
                    >
                      {item.label}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: "#C6D4DF",
                        fontWeight: 500,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.value || "Não informado"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}

            {/* ERRO */}
            {erro && (
              <Alert
                severity="warning"
                sx={{
                  mb: 3,
                  bgcolor: "#493C25",
                  color: "#FFE0A3",
                  "& .MuiAlert-icon": {
                    color: "#F0C674",
                  },
                }}
              >
                {erro}
              </Alert>
            )}

            {/* DESCRIÇÃO */}
            <Box sx={{ mb: 3 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  color: "#FFFFFF",
                  mb: 1.5,
                }}
              >
                Sobre o jogo
              </Typography>

              <Box
                sx={{
                  bgcolor: cores.fundoBloco,
                  borderRadius: "8px",
                  p: 2.5,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: "#C6D4DF",
                    lineHeight: 1.9,
                    fontSize: "0.9rem",
                    whiteSpace: "pre-line",
                    overflowWrap: "anywhere",
                  }}
                >
                  {detalhes?.description ||
                    "Descrição indisponível no momento."}
                </Typography>
              </Box>
            </Box>

            {/* CAPTURAS DE TELA */}
            {detalhes && detalhes.screenshots.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: "#FFFFFF",
                    mb: 1.5,
                  }}
                >
                  Capturas de tela
                </Typography>

                <Grid container spacing={1.5}>
                  {detalhes.screenshots
                    .slice(0, 8)
                    .map((imagem, index) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        key={`${imagem}-${index}`}
                      >
                        <Box
                          component="img"
                          src={imagem}
                          alt={`Captura de tela ${index + 1}`}
                          loading="lazy"
                          sx={{
                            width: "100%",
                            aspectRatio: "16 / 9",
                            objectFit: "cover",
                            borderRadius: "6px",
                            display: "block",
                            transition: "transform 0.2s",
                            "&:hover": {
                              transform: "scale(1.02)",
                            },
                          }}
                        />
                      </Grid>
                    ))}
                </Grid>
              </Box>
            )}

            <Divider sx={{ borderColor: cores.borda, my: 3 }} />

            {/* AVALIAÇÃO */}
            <Box
              sx={{
                bgcolor: cores.fundoSecundario,
                border: `1px solid ${cores.borda}`,
                borderRadius: "8px",
                p: 2.5,
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{
                  color: "#FFFFFF",
                  mb: 0.5,
                }}
              >
                Sua avaliação
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: "#AAB7C4",
                  mb: 1.5,
                }}
              >
                Essa recomendação foi relevante para você?
              </Typography>

              <AvaliacaoUsuario
                voto={voto}
                enviando={enviandoVoto}
                onVotar={onVotar}
                />
            </Box>

            {/* LINK DA STEAM */}
            <Button
              variant="contained"
              fullWidth
              endIcon={<OpenInNewIcon />}
              href={urlSteam}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                py: 1.5,
                bgcolor: "#66C0F4",
                color: "#10202D",
                fontWeight: 800,
                fontSize: "0.95rem",
                textTransform: "none",
                borderRadius: "5px",
                "&:hover": {
                  bgcolor: "#8ED0F8",
                },
              }}
            >
              Ver página na Steam
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};