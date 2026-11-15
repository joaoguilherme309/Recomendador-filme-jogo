
import React, { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { buscarFilmes } from "../services/api";
import { FilmeResumo } from "../types/recomendacao";

interface SeletorFilmesProps {
  onEnviar: (filmes: FilmeResumo[]) => void;
  carregando: boolean;
}

export const SeletorFilmes: React.FC<SeletorFilmesProps> = ({
  onEnviar,
  carregando,
}) => {
  const [selecionados, setSelecionados] = useState<FilmeResumo[]>([]);
  const [opcoes, setOpcoes] = useState<FilmeResumo[]>([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    const query = termoBusca.trim();
    let ativo = true;

    if (query.length < 2) {
      setOpcoes([]);
      setBuscando(false);
      return;
    }

    setBuscando(true);

    const timer = setTimeout(async () => {
      try {
        const resultados = await buscarFilmes(query, 10);
        if (ativo) setOpcoes(resultados);
      } catch {
        if (ativo) setOpcoes([]);
      } finally {
        if (ativo) setBuscando(false);
      }
    }, 300);

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [termoBusca]);

  const podeEnviar =
    selecionados.length >= 2 &&
    selecionados.length <= 3 &&
    !carregando;

  const handleEnviar = () => {
    if (!podeEnviar) return;

    onEnviar(selecionados);
    setSelecionados([]);
    setTermoBusca("");
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: "#171717",
          mb: 1,
        }}
      >
        Quais filmes você mais gosta?
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "#6B6B6B",
          mb: 3,
        }}
      >
        Escolha de 2 a 3 filmes para começarmos.
      </Typography>

      <Autocomplete<FilmeResumo, true, false, false>
        multiple
        fullWidth
        options={opcoes}
        value={selecionados}
        loading={buscando}
        filterOptions={(x) => x}
        filterSelectedOptions
        getOptionLabel={(option) => option.title}
        isOptionEqualToValue={(opt, val) =>
          opt.movie_id === val.movie_id
        }
        onInputChange={(_, novoTexto, reason) => {
          if (reason === "input") {
            setTermoBusca(novoTexto);
          } else if (reason === "clear" || reason === "reset") {
            setTermoBusca("");
          }
        }}
        onChange={(_, novosValores) => {
          if (novosValores.length <= 3) {
            setSelecionados(novosValores);
          }
        }}
        noOptionsText={
          termoBusca.trim().length < 2
            ? "Digite pelo menos 2 letras..."
            : "Nenhum filme encontrado"
        }
        slotProps={{
          paper: {
            sx: {
              bgcolor: "#FFFFFF",
              color: "#171717",
              border: "1px solid #E5E5E5",
              borderRadius: 2,
              boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
            },
          },
        }}
        renderTags={() => null}
        renderOption={(props, option) => {
          const { key, ...rest } = props;

          return (
            <Box
              component="li"
              key={key}
              {...rest}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start !important",
                py: 1.5,
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "#171717" }}
              >
                {option.title}
              </Typography>

              {option.genres.length > 0 && (
                <Typography
                  variant="caption"
                  sx={{ color: "#777777" }}
                >
                  {option.genres.join(" • ")}
                </Typography>
              )}
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={
              selecionados.length >= 3
                ? "Limite de 3 filmes atingido"
                : "Buscar ou selecionar um filme..."
            }
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <>
                  <SearchIcon
                    sx={{ color: "#858585", mr: 1 }}
                  />
                  {params.InputProps.startAdornment}
                </>
              ),
              endAdornment: (
                <>
                  {buscando && (
                    <CircularProgress size={18} />
                  )}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#FFFFFF",
                borderRadius: "10px",
                minHeight: 56,
                "& fieldset": {
                  borderColor: "#D9D9D9",
                },
                "&:hover fieldset": {
                  borderColor: "#879C88",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#285C36",
                },
              },
            }}
          />
        )}
      />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          mt: 2.5,
          minHeight: 38,
        }}
      >
        {selecionados.map((filme) => (
          <Chip
            key={filme.movie_id}
            label={filme.title}
            onDelete={() =>
              setSelecionados((prev) =>
                prev.filter(
                  (f) => f.movie_id !== filme.movie_id
                )
              )
            }
            sx={{
              bgcolor: "#E9EFE7",
              color: "#24492C",
              fontWeight: 500,
              borderRadius: "9px",
              "& .MuiChip-deleteIcon": {
                color: "#52735A",
                "&:hover": {
                  color: "#285C36",
                },
              },
            }}
          />
        ))}
      </Box>

      <Typography
        variant="caption"
        sx={{
          display: "block",
          color: "#858585",
          mt: 1,
        }}
      >
        {selecionados.length}/3 filmes selecionados
        (mínimo de 2)
      </Typography>

      <Box
        sx={{
          borderTop: "1px solid #EAEAEA",
          mt: 3,
          pt: 2.5,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          endIcon={
            carregando ? (
              <CircularProgress
                size={18}
                sx={{ color: "#FFFFFF" }}
              />
            ) : (
              <ArrowForwardIcon />
            )
          }
          disabled={!podeEnviar}
          onClick={handleEnviar}
          sx={{
            bgcolor: "#285C36",
            color: "#FFFFFF",
            px: 3,
            py: 1.4,
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#1D4629",
              boxShadow: "none",
            },
          }}
        >
          {carregando
            ? "Gerando..."
            : "Gerar recomendações"}
        </Button>
      </Box>
    </Box>
  );
};
