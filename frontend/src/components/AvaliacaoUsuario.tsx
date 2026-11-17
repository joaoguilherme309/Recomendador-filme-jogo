// AvaliacaoUsuario.tsx

import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";

import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";

export type TipoVoto = "positivo" | "negativo" | null;

interface AvaliacaoUsuarioProps {
  voto: TipoVoto;
  enviando: boolean;
  onVotar: (relevante: boolean) => void;
}

export const AvaliacaoUsuario: React.FC<AvaliacaoUsuarioProps> = ({
  voto,
  enviando,
  onVotar,
}) => {
  return (
    <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
      <Tooltip title="Boa recomendação">
        <span>
          <IconButton
            size="small"
            disabled={enviando}
            onClick={() => onVotar(true)}
            aria-label="Gostei desta recomendação"
            sx={{
              color:
                voto === "positivo"
                  ? "#6ee7b7"
                  : "#AAB7C4",
              "&:hover": {
                color: "#6ee7b7",
              },
            }}
          >
            <ThumbUpAltOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Pouco relevante">
        <span>
          <IconButton
            size="small"
            disabled={enviando}
            onClick={() => onVotar(false)}
            aria-label="Não gostei desta recomendação"
            sx={{
              color:
                voto === "negativo"
                  ? "#f87171"
                  : "#AAB7C4",
              "&:hover": {
                color: "#f87171",
              },
            }}
          >
            <ThumbDownAltOutlinedIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};