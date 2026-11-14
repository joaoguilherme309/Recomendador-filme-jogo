// Função no sistema: Exibir uma tela protótipo (modelo visual) de Login e Criação de
// Usuário, ainda desacoplada do fluxo principal de recomendação.

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

interface TelaLoginMockupProps {
  onVoltar: () => void;
}

export const TelaLoginMockup: React.FC<TelaLoginMockupProps> = ({ onVoltar }) => {
  const [aba, setAba] = useState<"login" | "cadastro">("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagemMock, setMensagemMock] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const acao = aba === "login" ? "Login" : "Criação de usuário";
    setMensagemMock(
      `${acao} simulada! Este componente é um protótipo visual e será integrado ao backend nas próximas etapas.`
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          bgcolor: "#111111",
          border: "1px solid #262626",
          borderRadius: 4,
          p: 4,
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={onVoltar}
          sx={{ color: "#a3a3a3", textTransform: "none", mb: 2, px: 0 }}
        >
          Voltar ao Recomendador
        </Button>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <LockOutlinedIcon sx={{ color: "#ffffff" }} />
          <Typography variant="h6" sx={{ color: "#ffffff", fontWeight: 600 }}>
            Conta do Usuário
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: "#8e8e8e", mb: 3 }}>
          Modelo de autenticação para gerenciamento futuro de perfis.
        </Typography>

        <Tabs
          value={aba}
          onChange={(_, novaAba) => {
            setAba(novaAba);
            setMensagemMock(null);
          }}
          variant="fullWidth"
          sx={{
            mb: 3,
            borderBottom: "1px solid #262626",
            "& .MuiTab-root": { color: "#8e8e8e", textTransform: "none" },
            "& .Mui-selected": { color: "#ffffff" },
            "& .MuiTabs-indicator": { backgroundColor: "#ffffff" },
          }}
        >
          <Tab label="Entrar" value="login" />
          <Tab label="Criar Conta" value="cadastro" />
        </Tabs>

        {mensagemMock && (
          <Alert
            severity="info"
            sx={{
              mb: 2.5,
              bgcolor: "#1a2332",
              color: "#d0e2ff",
              border: "1px solid #2c3e5a",
            }}
          >
            {mensagemMock}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {aba === "cadastro" && (
            <TextField
              label="Nome completo"
              variant="outlined"
              fullWidth
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              InputProps={{ sx: { bgcolor: "#181818", borderRadius: 2.5, color: "#fff" } }}
              InputLabelProps={{ sx: { color: "#8e8e8e" } }}
            />
          )}

          <TextField
            label="E-mail"
            type="email"
            variant="outlined"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{ sx: { bgcolor: "#181818", borderRadius: 2.5, color: "#fff" } }}
            InputLabelProps={{ sx: { color: "#8e8e8e" } }}
          />

          <TextField
            label="Senha"
            type="password"
            variant="outlined"
            fullWidth
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            InputProps={{ sx: { bgcolor: "#181818", borderRadius: 2.5, color: "#fff" } }}
            InputLabelProps={{ sx: { color: "#8e8e8e" } }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 1,
              py: 1.3,
              borderRadius: 2.5,
              bgcolor: "#ffffff",
              color: "#000000",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": { bgcolor: "#e0e0e0" },
            }}
          >
            {aba === "login" ? "Entrar" : "Criar conta"}
          </Button>
        </Box>

        <Divider sx={{ my: 3, borderColor: "#222222" }} />

        <Typography
          variant="caption"
          sx={{ color: "#666666", display: "block", textAlign: "center" }}
        >
          Tela ilustrativa — ainda não conectada ao fluxo principal
        </Typography>
      </Paper>
    </Box>
  );
};