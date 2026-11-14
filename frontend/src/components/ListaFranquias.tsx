// Função no sistema: Apresentar a lista secundária de jogos pertencentes às mesmas
// franquias ou universos dos filmes selecionados pelo usuário.

import React from "react";
import { Box, Chip, Divider, Typography } from "@mui/material";
import { JogoRecomendado } from "../types/recomendacao";

interface ListaFranquiasProps {
  franquias: string[];
  jogos: JogoRecomendado[];
}

export const ListaFranquias: React.FC<ListaFranquiasProps> = ({ franquias, jogos }) => {
  if (jogos.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ borderColor: "#222222", mb: 2 }} />
      <Typography variant="subtitle2" sx={{ color: "#e5e5e5", mb: 1.2 }}>
        Jogos da mesma franquia ({franquias.join(", ")}):
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {jogos.map((jogo) => (
          <Chip
            key={jogo.game_id}
            label={`${jogo.name} (${(jogo.similaridade * 100).toFixed(0)}%)`}
            sx={{
              bgcolor: "#181818",
              color: "#d4d4d4",
              border: "1px solid #2e2e2e",
            }}
          />
        ))}
      </Box>
    </Box>
  );
};