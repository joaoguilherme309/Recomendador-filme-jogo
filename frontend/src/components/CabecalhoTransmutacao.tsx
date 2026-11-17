import React, { useEffect, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { AnimatePresence, motion } from "motion/react";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import { CirculoTransmutacao } from "./CirculoTransmutacao";
import { exemplosTransmutacao } from "../data/exemplosTransmutacao";

const MotionBox = motion.create(Box);

export const CabecalhoTransmutacao: React.FC = () => {
  const [indiceAtual, setIndiceAtual] = useState(0);
  const total = exemplosTransmutacao.length;

  const anterior = () => setIndiceAtual((atual) => (atual - 1 + total) % total);
  const proximo = () => setIndiceAtual((atual) => (atual + 1) % total);

  useEffect(() => {
    if (total <= 1) return;
    const intervalo = window.setInterval(proximo, 7000);
    return () => window.clearInterval(intervalo);
  }, [total]);

  const exemploAtual = exemplosTransmutacao[indiceAtual];

  return (
    <Box sx={{
      width: "100%",
      bgcolor: "#172635",
      border: "1px solid #34495E",
      borderTop: "2px solid #66C0F4",
      borderRadius: 0,
      overflow: "hidden",
    }}>
      <Box sx={{
        px: { xs: 1.5, md: 2.2 }, py: 1.25,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 1, bgcolor: "#1B2838", borderBottom: "1px solid #34495E",
      }}>
        <Box>
          <Typography sx={{ color: "#E6EDF3", fontSize: { xs: 18, md: 22 }, fontWeight: 800, letterSpacing: 0.15 }}>
            Exemplos de Transmutação
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton aria-label="Exemplo anterior" onClick={anterior} size="small"
            sx={{ color: "#C6D4DF", bgcolor: "#26394D", borderRadius: 0, "&:hover": { bgcolor: "#38536B", color: "#fff" } }}>
            <ChevronLeftRoundedIcon />
          </IconButton>
          <IconButton aria-label="Próximo exemplo" onClick={proximo} size="small"
            sx={{ color: "#C6D4DF", bgcolor: "#26394D", borderRadius: 0, "&:hover": { bgcolor: "#38536B", color: "#fff" } }}>
            <ChevronRightRoundedIcon />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ px: { xs: 1.5, md: 2.5 }, py: { xs: 2, md: 2.5 } }}>
        <AnimatePresence mode="wait">
          <MotionBox
            key={exemploAtual.id}
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -18 }}
            transition={{ duration: 0.3 }}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "minmax(145px, 190px) minmax(130px, 190px) minmax(180px, 250px)" },
              alignItems: "center",
              justifyContent: "center",
              gap: { xs: 2, md: 3 },
              width: "100%",
              maxWidth: 850,
              mx: "auto",
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.7, minWidth: 0 }}>
              <Box component="img" src={exemploAtual.filme.imagem}
                alt={`Pôster de ${exemploAtual.filme.titulo}`}
                sx={{
                  width: { xs: 120, md: 160 }, height: { xs: 180, md: 225 },
                  objectFit: "cover", bgcolor: "#101820", display: "block",
                  border: "1px solid #40566B",
                }} />
              <Typography sx={{ color: "#E6EDF3", fontWeight: 750, fontSize: 13, textAlign: "center", lineHeight: 1.3 }}>
                {exemploAtual.filme.titulo}
              </Typography>
              <Typography sx={{ color: "#8299AD", fontSize: 10 }}>Filme de origem</Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minWidth: 0, "& > *": { maxWidth: "100%" } }}>
              <CirculoTransmutacao />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, width: "100%", minWidth: 0 }}>
              <Typography sx={{ color: "#A7B8C8", fontSize: 10, fontWeight: 800, letterSpacing: 0.7 }}>
                JOGOS RELACIONADOS
              </Typography>
              {exemploAtual.jogos.map((jogo, index) => (
                <MotionBox key={jogo.titulo}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: index * 0.1 }}
                  sx={{
                    bgcolor: "#26394D", border: "1px solid #3A5268",
                    borderRadius: 0, p: 0.9, display: "flex",
                    alignItems: "center", textAlign: "left", gap: 1,
                    width: "100%", boxSizing: "border-box",
                    "&:hover": { bgcolor: "#30485F", borderColor: "#66C0F4" },
                  }}>
                  <Box component="img" src={jogo.imagem} alt={`Capa de ${jogo.titulo}`}
                    sx={{ width: 56, height: 72, objectFit: "cover", bgcolor: "#172432", flexShrink: 0 }} />
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{
                      color: "#E6EDF3", fontWeight: 750, fontSize: 12,
                      lineHeight: 1.35, overflowWrap: "anywhere",
                    }}>{jogo.titulo}</Typography>
                    <Typography sx={{ color: "#8299AD", fontSize: 10, mt: 0.45 }}>Jogo relacionado</Typography>
                  </Box>
                </MotionBox>
              ))}
            </Box>
          </MotionBox>
        </AnimatePresence>

        {total > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 0.65, mt: 2 }}>
            {exemplosTransmutacao.map((exemplo, index) => (
              <Box key={exemplo.id} component="button" aria-label={`Mostrar exemplo ${index + 1}`}
                onClick={() => setIndiceAtual(index)}
                sx={{
                  width: index === indiceAtual ? 22 : 8, height: 7, p: 0, border: 0,
                  bgcolor: index === indiceAtual ? "#66C0F4" : "#526579",
                  cursor: "pointer", transition: "all .18s",
                  "&:hover": { bgcolor: "#9ACFF0" },
                }} />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};
