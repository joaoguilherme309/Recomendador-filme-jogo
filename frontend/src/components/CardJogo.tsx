// Função no sistema: Exibir um jogo recomendado com imagem de capa, percentual de
// compatibilidade, explicação gerada pelo modelo TF-IDF e botões de avaliação.

import React from "react";
import { Box, Chip, Paper, Typography } from "@mui/material";
import { JogoRecomendado } from "../types/recomendacao";
import { AvaliacaoUsuario } from "./AvaliacaoUsuario";

interface CardJogoProps {
  posicao: number;
  jogo: JogoRecomendado;
  consultaId: number;
}

export const CardJogo: React.FC<CardJogoProps> = ({ posicao, jogo, consultaId }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: "#111111",
        border: "1px solid #242424",
        borderRadius: 3,
        p: 2,
        display: "flex",
        gap: 2,
        alignItems: "center",
        flexWrap: { xs: "wrap", sm: "nowrap" },
      }}
    >
      {jogo.header_image && (
        <Box
          component="img"
          src={jogo.header_image}
          alt={jogo.name}
          sx={{
            width: { xs: "100%", sm: 150 },
            height: 72,
            objectFit: "cover",
            borderRadius: 2,
            flexShrink: 0,
          }}
        />
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="subtitle1" sx={{ color: "#ffffff", fontWeight: 600 }}>
            {posicao}. {jogo.name}
          </Typography>
          <Chip
            label={`${(jogo.similaridade * 100).toFixed(1)}% compatível`}
            size="small"
            sx={{
              bgcolor: "#1c2b21",
              color: "#6ee7b7",
              fontSize: "0.72rem",
              height: 22,
            }}
          />
        </Box>

        {jogo.explicacao && (
          <Typography variant="body2" sx={{ color: "#a3a3a3", mt: 0.6, fontSize: "0.85rem" }}>
            {jogo.explicacao.justificativa}
          </Typography>
        )}

        {jogo.explicacao && jogo.explicacao.termos_em_comum.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6, mt: 1 }}>
            {jogo.explicacao.termos_em_comum.map((termo) => (
              <Chip
                key={termo}
                label={termo}
                size="small"
                sx={{
                  bgcolor: "#1c1c1c",
                  color: "#bdbdbd",
                  fontSize: "0.7rem",
                  height: 20,
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      <AvaliacaoUsuario consultaId={consultaId} jogo={jogo} />
    </Paper>
  );
};