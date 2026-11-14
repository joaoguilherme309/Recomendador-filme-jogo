// Função no sistema: Renderizar a caixa de entrada estilo chatbot (retangular com bordas
// arredondadas) onde o usuário pesquisa e seleciona de 2 a 3 filmes favoritos.

import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import MovieFilterOutlinedIcon from "@mui/icons-material/MovieFilterOutlined";
import { buscarFilmes } from "../services/api";
import { FilmeResumo } from "../types/recomendacao";

interface SeletorFilmesProps {
  onEnviar: (filmes: FilmeResumo[]) => void;
  carregando: boolean;
}

export const SeletorFilmes: React.FC<SeletorFilmesProps> = ({ onEnviar, carregando }) => {
  const [selecionados, setSelecionados] = useState<FilmeResumo[]>([]);
  const [opcoes, setOpcoes] = useState<FilmeResumo[]>([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [buscando, setBuscando] = useState(false);

  // Consulta o endpoint /api/filmes/buscar conforme o usuário digita
  useEffect(() => {
    const query = termoBusca.trim();
    if (query.length < 2) {
      setOpcoes([]);
      return;
    }

    const timer = setTimeout(async () => {
      setBuscando(true);
      try {
        const resultados = await buscarFilmes(query, 10);
        setOpcoes(resultados);
      } catch {
        setOpcoes([]);
      } finally {
        setBuscando(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [termoBusca]);

  const podeEnviar = selecionados.length >= 2 && selecionados.length <= 3 && !carregando;

  const handleEnviar = () => {
    if (!podeEnviar) return;
    onEnviar(selecionados);
    setSelecionados([]);
    setTermoBusca("");
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 820, mx: "auto" }}>
      <Box
        sx={{
          bgcolor: "#141414",
          border: "1px solid #2b2b2b",
          borderRadius: "24px",
          px: 2.5,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          transition: "border-color 0.2s",
          "&:focus-within": { borderColor: "#525252" },
        }}
      >
        <MovieFilterOutlinedIcon sx={{ color: "#737373", fontSize: 22 }} />

        <Autocomplete<FilmeResumo, true, false, false>
          multiple
          fullWidth
          options={opcoes}
          value={selecionados}
          loading={buscando}
          filterOptions={(x) => x}
          getOptionLabel={(option) => option.title}
          isOptionEqualToValue={(opt, val) => opt.movie_id === val.movie_id}
          onInputChange={(_, novoTexto, reason) => {
            if (reason === "input") setTermoBusca(novoTexto);
          }}
          onChange={(_, novosValores) => {
            if (novosValores.length <= 3) {
              setSelecionados(novosValores);
            }
          }}
          noOptionsText={
            termoBusca.trim().length < 2
              ? "Digite pelo menos 2 letras do filme..."
              : "Nenhum filme encontrado"
          }
          slotProps={{
            paper: {
              sx: {
                bgcolor: "#1a1a1a",
                color: "#f5f5f5",
                border: "1px solid #2e2e2e",
                borderRadius: 3,
                mb: 1,
              },
            },
          }}
          renderTags={(tagValue, getTagProps) =>
            tagValue.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return (
                <Chip
                  key={key}
                  label={option.title}
                  size="small"
                  {...tagProps}
                  sx={{
                    bgcolor: "#262626",
                    color: "#ffffff",
                    borderRadius: "10px",
                    "& .MuiChip-deleteIcon": { color: "#a3a3a3" },
                  }}
                />
              );
            })
          }
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <Box
                component="li"
                key={key}
                {...rest}
                sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start !important" }}
              >
                <Typography variant="body2" sx={{ color: "#ffffff", fontWeight: 500 }}>
                  {option.title}
                </Typography>
                {option.genres.length > 0 && (
                  <Typography variant="caption" sx={{ color: "#8e8e8e" }}>
                    {option.genres.join(" • ")}
                  </Typography>
                )}
              </Box>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              placeholder={
                selecionados.length === 0
                  ? "Digite 2 ou 3 filmes favoritos (ex: The Lord of the Rings, Interstellar)..."
                  : selecionados.length < 3
                  ? "Adicione mais um filme ou envie..."
                  : "Limite de 3 filmes atingido"
              }
              InputProps={{
                ...params.InputProps,
                disableUnderline: true,
                sx: { color: "#ffffff", fontSize: "0.95rem" },
                endAdornment: (
                  <>
                    {buscando ? <CircularProgress color="inherit" size={18} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        <IconButton
          onClick={handleEnviar}
          disabled={!podeEnviar}
          aria-label="Gerar recomendações"
          sx={{
            bgcolor: podeEnviar ? "#ffffff" : "#262626",
            color: podeEnviar ? "#000000" : "#666666",
            width: 38,
            height: 38,
            "&:hover": { bgcolor: podeEnviar ? "#e5e5e5" : "#262626" },
            "&.Mui-disabled": { bgcolor: "#222222", color: "#555555" },
          }}
        >
          {carregando ? (
            <CircularProgress size={18} sx={{ color: "#ffffff" }} />
          ) : (
            <ArrowUpwardIcon fontSize="small" />
          )}
        </IconButton>
      </Box>

      <Typography
        variant="caption"
        sx={{ color: "#666666", display: "block", textAlign: "center", mt: 1 }}
      >
        Selecione entre 2 e 3 filmes ({selecionados.length}/3 selecionados) para gerar recomendações.
      </Typography>
    </Box>
  );
};