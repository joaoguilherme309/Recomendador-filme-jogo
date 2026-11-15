
import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Divider,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SportsEsportsOutlinedIcon from "@mui/icons-material/SportsEsportsOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";

interface TelaLoginMockupProps {
  onVoltar: () => void;
}

const cores = {
  fundo: "#FAF9F6",
  branco: "#FFFFFF",
  texto: "#171717",
  secundario: "#666666",
  verde: "#285C36",
  verdeClaro: "#E9EFE7",
  borda: "#E7E5E1",
};

export const TelaLoginMockup: React.FC<TelaLoginMockupProps> = ({
  onVoltar,
}) => {
  const [aba, setAba] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemMock, setMensagemMock] = useState<string | null>(
    null
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const acao =
      aba === "login" ? "Login" : "Criação de usuário";

    setMensagemMock(
      `${acao} simulada! Esta tela ainda não está conectada ao backend.`
    );
  };

  // Estilo padrão dos campos de preenchimento
  const estiloCampo = {
    "& .MuiOutlinedInput-root": {
      bgcolor: cores.branco,
      borderRadius: "10px",
      minHeight: 56,
      color: cores.texto,

      "& fieldset": {
        borderColor: "#D9D9D9",
      },

      "&:hover fieldset": {
        borderColor: "#879C88",
      },

      "&.Mui-focused fieldset": {
        borderColor: cores.verde,
        borderWidth: "2px",
      },
    },

    "& .MuiInputBase-input": {
      fontSize: "15px",
      color: cores.texto,
    },

    // Texto indicativo dentro dos campos
    "& .MuiInputBase-input::placeholder": {
      color: "#999999",
      opacity: 1,
      fontSize: "15px",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: cores.fundo,
        color: cores.texto,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* CABEÇALHO */}
      <Box
        sx={{
          bgcolor: cores.branco,
          borderBottom: `1px solid ${cores.borda}`,
          px: { xs: 2, md: 5 },
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          component="button"
          type="button"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.2,
            cursor: "pointer",
            border: 0,
            bgcolor: "transparent",
            p: 0,
            color: cores.texto,
          }}
          onClick={onVoltar}
        >
          <SportsEsportsOutlinedIcon
            sx={{ color: cores.texto, fontSize: 29 }}
          />

          <Typography
            sx={{
              fontWeight: 700,
              fontSize: { xs: 15, md: 19 },
              letterSpacing: -0.4,
            }}
          >
            CineGame Recommender
          </Typography>
        </Box>

        <Button
          variant="outlined"
          size="small"
          startIcon={<PersonOutlineIcon />}
          onClick={() => {
            setAba("login");
            setMensagemMock(null);
          }}
          sx={{
            color: cores.texto,
            borderColor: "#DADADA",
            borderRadius: "25px",
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
            "&:hover": {
              borderColor: cores.verde,
              bgcolor: cores.verdeClaro,
            },
          }}
        >
          Entrar / Criar conta
        </Button>
      </Box>

      {/* ÁREA CENTRAL */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 6,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 480,
            bgcolor: cores.branco,
            border: `1px solid ${cores.borda}`,
            borderRadius: "20px",
            p: { xs: 3, sm: 4.5 },
            boxShadow: "0 10px 35px rgba(0,0,0,0.045)",
          }}
        >
          {/* VOLTAR */}
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={onVoltar}
            sx={{
              color: cores.verde,
              textTransform: "none",
              fontWeight: 500,
              mb: 3,
              px: 0,
              "&:hover": {
                bgcolor: "transparent",
                color: "#1D4629",
              },
            }}
          >
            Voltar ao Recomendador
          </Button>

          {/* TÍTULO */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              mb: 1.5,
            }}
          >
            <LockOutlinedIcon
              sx={{ color: cores.texto, fontSize: 27 }}
            />

            <Typography
              variant="h5"
              sx={{
                color: cores.texto,
                fontWeight: 700,
                letterSpacing: -0.5,
              }}
            >
              Conta do Usuário
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              color: cores.secundario,
              lineHeight: 1.7,
              mb: 3.5,
            }}
          >
            Modelo de autenticação para gerenciamento
            futuro de perfis.
          </Typography>

          {/* ABAS */}
          <Tabs
            value={aba}
            onChange={(_, novaAba) => {
              setAba(novaAba);
              setMensagemMock(null);
            }}
            variant="fullWidth"
            sx={{
              mb: 3.5,
              borderBottom: `1px solid ${cores.borda}`,

              "& .MuiTab-root": {
                color: cores.secundario,
                textTransform: "none",
                fontWeight: 500,
                fontSize: 15,
              },

              "& .Mui-selected": {
                color: `${cores.verde} !important`,
                fontWeight: 700,
              },

              "& .MuiTabs-indicator": {
                backgroundColor: cores.verde,
                height: 2,
              },
            }}
          >
            <Tab label="Entrar" value="login" />
            <Tab label="Criar Conta" value="cadastro" />
          </Tabs>

          {/* AVISO */}
          {mensagemMock && (
            <Alert
              severity="info"
              sx={{
                mb: 3,
                bgcolor: "#EDF4F0",
                color: cores.verde,
                border: "1px solid #CDDFD1",
                borderRadius: 2,
              }}
            >
              {mensagemMock}
            </Alert>
          )}

          {/* FORMULÁRIO */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            {/* NOME COMPLETO - APENAS CADASTRO */}
            {aba === "cadastro" && (
              <TextField
                placeholder="Digite seu nome completo"
                aria-label="Nome completo"
                type="text"
                fullWidth
                required
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                sx={estiloCampo}
              />
            )}

            {/* E-MAIL */}
            <TextField
              placeholder="Digite seu e-mail"
              aria-label="E-mail"
              type="email"
              fullWidth
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={estiloCampo}
            />

            {/* SENHA */}
            <TextField
              placeholder="Digite sua senha"
              aria-label="Senha"
              type="password"
              fullWidth
              required
              autoComplete={
                aba === "cadastro"
                  ? "new-password"
                  : "current-password"
              }
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              sx={estiloCampo}
            />

            {/* BOTÃO */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: "10px",
                bgcolor: cores.verde,
                color: cores.branco,
                fontWeight: 600,
                textTransform: "none",
                fontSize: 15,
                boxShadow: "none",

                "&:hover": {
                  bgcolor: "#1D4629",
                  boxShadow: "none",
                },
              }}
            >
              {aba === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </Box>

          <Divider
            sx={{
              my: 3.5,
              borderColor: cores.borda,
            }}
          />

          {/* RODAPÉ */}
          <Typography
            variant="caption"
            sx={{
              color: "#858585",
              display: "block",
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            Tela ilustrativa — ainda não conectada
            ao fluxo principal.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
};
