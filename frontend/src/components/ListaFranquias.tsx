// ListaFranquias.tsx

import React from "react";

import {
  Box,
  Chip,
  Divider,
  Typography,
} from "@mui/material";

import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import LocalMoviesOutlinedIcon from "@mui/icons-material/LocalMoviesOutlined";

import type { JogoRecomendado } from "../types/recomendacao";
import { CardJogo } from "./CardJogo";

interface ListaFranquiasProps {
  franquias: string[];
  jogos: JogoRecomendado[];
  consultaId: number;
}

const cores = {
  texto: "#E6EDF3",
  secundario: "#A7B8C8",
  azul: "#66C0F4",
  azulClaro: "#31485F",
  borda: "#34495E",
};

export const ListaFranquias: React.FC<ListaFranquiasProps> = ({
  franquias,
  jogos,
  consultaId,
}) => {
  if (!jogos || jogos.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 5 }}>
      {/* SEPARADOR */}

      <Divider
        sx={{
          borderColor: cores.borda,
          mb: 2.5,
        }}
      />

      {/* CABEÇALHO */}

      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            mb: 1,
          }}
        >
          <SportsEsportsOutlinedIcon
            sx={{
              color: cores.azul,
              fontSize: 24,
            }}
          />

          <Typography
            variant="h5"
            sx={{
              fontWeight: 750,
              color: cores.texto,
              fontSize: 20,
            }}
          >
            Jogos da mesma franquia
          </Typography>
        </Box>

        <Typography
          sx={{
            color: cores.secundario,
            lineHeight: 1.6,
            mb: 1.5,
            fontSize: 13,
          }}
        >
          Além das recomendações personalizadas,
          encontramos jogos relacionados diretamente
          às franquias ou universos dos filmes escolhidos.
        </Typography>

        {/* FRANQUIAS IDENTIFICADAS */}

        {franquias.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: 1,
            }}
          >
            <LocalMoviesOutlinedIcon
              sx={{
                color: cores.azul,
                fontSize: 20,
              }}
            />

            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: cores.texto,
                mr: 0.5,
                fontSize: 12,
              }}
            >
              Franquias identificadas:
            </Typography>

            {franquias.map((franquia) => (
              <Chip
                key={franquia}
                label={franquia}
                size="small"
                sx={{
                  bgcolor: cores.azulClaro,
                  color: cores.azul,
                  fontWeight: 600,
                  borderRadius: "0px",
                  border: "1px solid #405A70",
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* CARDS PADRONIZADOS */}

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
        {jogos.map((jogo) => (
          <Box
            key={jogo.game_id}
            sx={{
              minWidth: 0,
            }}
          >
            <CardJogo
              jogo={jogo}
              consultaId={consultaId}
              variante="franquia"
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
