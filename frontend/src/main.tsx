import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from "./App";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1B3A57", dark: "#142B40", light: "#E8F0F7", contrastText: "#FFFFFF" },
    secondary: { main: "#397052" },
    background: { default: "#F3F5F7", paper: "#FFFFFF" },
    text: { primary: "#17212B", secondary: "#657381" },
    divider: "#DCE3E9",
  },
  typography: {
    fontFamily: 'Inter, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    button: { fontWeight: 650, textTransform: "none" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: "none", borderRadius: 8 } } },
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    MuiCssBaseline: {
      styleOverrides: {
        "*": { boxSizing: "border-box" },
        body: { margin: 0, minWidth: 320, backgroundColor: "#F3F5F7", WebkitFontSmoothing: "antialiased" },
        "::selection": { background: "#C9D9E6", color: "#142B40" },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
