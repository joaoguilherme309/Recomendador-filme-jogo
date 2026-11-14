// Função no sistema: Permitir que o usuário avalie cada jogo recomendado (gostei / não gostei),
// persistindo o feedback no banco SQLite através do endpoint /api/feedback.

import React, { useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import ThumbDownAltOutlinedIcon from "@mui/icons-material/ThumbDownAltOutlined";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import { enviarFeedback } from "../services/api";
import { JogoRecomendado } from "../types/recomendacao";

interface AvaliacaoUsuarioProps {
  consultaId: number;
  jogo: JogoRecomendado;
}

export const AvaliacaoUsuario: React.FC<AvaliacaoUsuarioProps> = ({ consultaId, jogo }) => {
  const [voto, setVoto] = useState<"positivo" | "negativo" | null>(null);
  const [enviando, setEnviando] = useState(false);

  const registrarVoto = async (relevante: boolean) => {
    if (enviando) return;
    setVoto(relevante ? "positivo" : "negativo");
    setEnviando(true);
    try {
      await enviarFeedback({
        consulta_id: consultaId,
        game_id: jogo.game_id,
        game_name: jogo.name,
        nota: relevante ? 5 : 1,
        relevante,
      });
    } catch {
      // Mantém a interface fluida mesmo se houver falha pontual de rede
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
      <Tooltip title="Boa recomendação">
        <IconButton
          size="small"
          onClick={() => registrarVoto(true)}
          sx={{ color: voto === "positivo" ? "#6ee7b7" : "#666666" }}
        >
          <ThumbUpAltOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Pouco relevante">
        <IconButton
          size="small"
          onClick={() => registrarVoto(false)}
          sx={{ color: voto === "negativo" ? "#f87171" : "#666666" }}
        >
          <ThumbDownAltOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};