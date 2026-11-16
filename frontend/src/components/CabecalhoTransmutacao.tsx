
import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { AnimatePresence, motion } from "motion/react";

import { CirculoTransmutacao } from "./CirculoTransmutacao";
import { exemplosTransmutacao } from "../data/exemplosTransmutacao";

const MotionBox = motion.create(Box);

// CONTROLE INDIVIDUAL DAS POSIÇÕES
// Primeiro número: horizontal (X)
// Segundo número: vertical (Y)
// Valores positivos: direita / baixo
// Valores negativos: esquerda / cima

const posicoes = {
  filme: {
    x: -150,
    y: 0,
  },
  circulo: {
    x: 0,
    y: 0,
  },
  jogos: {
    x: 150,
    y: 0,
  },
};

export const CabecalhoTransmutacao: React.FC = () => {
  const [indiceAtual, setIndiceAtual] = useState(0);

  // TROCA AUTOMÁTICA DO CARROSSEL
  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndiceAtual(
        (anterior) =>
          (anterior + 1) % exemplosTransmutacao.length
      );
    }, 6000);

    return () => clearInterval(intervalo);
  }, []);

  const exemploAtual = exemplosTransmutacao[indiceAtual];

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "#E9EFE7",
        border: "1px solid #D9E4D7",
        borderRadius: 4,
        p: { xs: 3, md: 5 },
        textAlign: "center",
        overflow: "hidden",
      }}
    >
      {/* TÍTULO */}
      <Typography
        sx={{
          fontFamily: "Cinzel, serif",
          fontWeight: 700,
          fontSize: { xs: 22, md: 30 },
          color: "#285C36",
          mb: 4,
        }}
      >
        O Círculo da Transmutação
      </Typography>

      {/* CARROSSEL ANIMADO */}
      <AnimatePresence mode="wait">
        <MotionBox
          key={exemploAtual.id}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.5 }}
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              md: "220px 200px 220px",
            },
            alignItems: "center",
            justifyContent: "center",
            columnGap: { xs: 3, md: 6 },
            rowGap: 3,
            width: "100%",
            mx: "auto",
          }}
        >
          {/* FILME DE ORIGEM */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1.5,
              transform: {
                xs: "none",
                md: `translate(
                  ${posicoes.filme.x}px,
                  ${posicoes.filme.y}px
                )`,
              },
            }}
          >
            <Box
              component="img"
              src={exemploAtual.filme.imagem}
              alt={`Pôster de ${exemploAtual.filme.titulo}`}
              sx={{
                width: 180,
                height: 270,
                maxWidth: "100%",
                objectFit: "cover",
                borderRadius: 2,
                boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
              }}
            />

            <Typography
              sx={{
                fontWeight: 700,
                fontSize: 20,
                color: "#285C36",
              }}
            >
              {exemploAtual.filme.titulo}
            </Typography>

            <Typography
              sx={{
                color: "#666666",
                fontSize: 13,
              }}
            >
              Filme de origem
            </Typography>
          </Box>

          {/* CÍRCULO ALQUÍMICO */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              transform: {
                xs: "none",
                md: `translate(
                  ${posicoes.circulo.x}px,
                  ${posicoes.circulo.y}px
                )`,
              },
            }}
          >
            <CirculoTransmutacao />
          </Box>

          {/* JOGOS RECOMENDADOS */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: { xs: "100%", md: "220px" },
              maxWidth: "100%",
              minWidth: 0,
              mx: "auto",
              transform: {
                xs: "none",
                md: `translate(
                  ${posicoes.jogos.x}px,
                  ${posicoes.jogos.y}px
                )`,
              },
            }}
          >
            {exemploAtual.jogos.map((jogo, index) => (
              <MotionBox
                key={jogo.titulo}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.2,
                }}
                sx={{
                  bgcolor: "#FFFFFF",
                  border: "1px solid #C5D7C7",
                  borderRadius: 2,
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  textAlign: "left",
                  gap: 1.5,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              >
                {/* CAPA DO JOGO */}
                <Box
                  component="img"
                  src={jogo.imagem}
                  alt={`Capa de ${jogo.titulo}`}
                  sx={{
                    width: 65,
                    height: 85,
                    objectFit: "cover",
                    borderRadius: 1,
                    flexShrink: 0,
                  }}
                />

                {/* INFORMAÇÕES DO JOGO */}
                <Box
                  sx={{
                    minWidth: 0,
                    flex: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#285C36",
                      fontSize: 14,
                      overflowWrap: "break-word",
                    }}
                  >
                    {jogo.titulo}
                  </Typography>

                  <Typography
                    sx={{
                      color: "#777777",
                      fontSize: 11,
                      mt: 0.5,
                    }}
                  >
                    Jogo relacionado
                  </Typography>
                </Box>
              </MotionBox>
            ))}
          </Box>
        </MotionBox>
      </AnimatePresence>
    </Box>
  );
};
