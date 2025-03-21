import { AppBar, Toolbar, Typography, Avatar, Container, Box, Button, IconButton, Menu, MenuItem } from "@mui/material";
import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useThemeMode } from "../context/ThemeContext";
import TranslateIcon from "@mui/icons-material/Translate";
import { AccountCircle } from "@mui/icons-material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import LoginModal from "./LoginModal"; 
import LogoutModal from "./LogoutModal";
import { useAuth } from "../context/AuthContext";
import { Tooltip } from "@mui/material";


// 🔹 Importamos las banderas
import SpainFlag from "../assets/spain.png";
import ItalyFlag from "../assets/italy.png";
import UKFlag from "../assets/uk.png";

// 🔹 Mapeamos los idiomas con sus banderas
const flagMap = {
  es: SpainFlag,
  it: ItalyFlag,
  en: UKFlag
};




export default function Header({ setActiveSection, data }) {
  const { language, setLanguage, languages } = useLanguage();
  const { darkMode, toggleDarkMode } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState(null);
  const [openLogin, setOpenLogin] = useState(false); // Estado para controlar el modal
  const [openLogout, setOpenLogout] = useState(false);
  const { user } = useAuth();
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (lang) => {
    if (lang) setLanguage(lang);
    setAnchorEl(null);
    // 🔹 Mueve el foco al body para evitar el error
    setTimeout(() => {
      document.body.focus();
    }, 100);
  };

  // 🔹 Verifica si `data` aún no está cargado
  if (!data) {
    return null; // Evita renderizar el Header hasta que haya datos
  }

  return (
    <AppBar position="static" color="primary" sx={{ padding: 2, position: "relative" }}>
      <Container maxWidth={false}>
        {/* 🔹 Icono de login en la esquina superior izquierda */}
        <Tooltip title={user ? "Estás logueado" : "Iniciar sesión"}>
        <IconButton
          onClick={() => {
            if (user) {
              setOpenLogout(true);
            } else {
              setOpenLogin(true);
            }
          }}
          sx={{
            position: "absolute",
            left: 16,
            top: 16,
            color: user ? "green" : "inherit",
          }}
        >
          <AccountCircle />
        </IconButton>
      </Tooltip>


        <Toolbar sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Avatar y Nombre */}
          <Avatar alt="Diego Alviani" src="/profile.jpg" sx={{ width: 80, height: 80, mb: 1 }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: "bold", textAlign: "center" }}>
            Diego Alviani
          </Typography>
          <Typography variant="subtitle1" component="div" sx={{ fontSize: "1rem", opacity: 0.8, textAlign: "center" }}>
            {data.dictionary?.header_title || "Título no disponible"}
          </Typography>

          {/* Navegación */}
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              width: "90%",
              gap: 1.1, // 🔹 Ajustamos el espacio entre botones
            }}
          >
            <Button color="inherit" onClick={() => setActiveSection("profile")}>
              {data.dictionary?.header_profile}
            </Button>
            <Button color="inherit" onClick={() => setActiveSection("experience")}>
              {data.dictionary?.header_experience}
            </Button>
            <Button color="inherit" onClick={() => setActiveSection("education")}>
              {data.dictionary?.header_education}
            </Button>
            <Button color="inherit" onClick={() => setActiveSection("projects")}>
              {data.dictionary?.header_projects}
            </Button>
            <Button color="inherit" onClick={() => setActiveSection("skills")}>
              {data.dictionary?.header_skills}
            </Button>
            <Button color="inherit" onClick={() => setActiveSection("languages")}>
              {data.dictionary?.header_languages}
            </Button>
            <Button color="inherit" onClick={() => setActiveSection("contact")}>
              {data.dictionary?.header_contact}
            </Button>
            {user && (
            <Button color="inherit" onClick={() => setActiveSection("expenses")}>
              Controllo delle Spese
            </Button>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* 🔹 Botones de Tema Oscuro & Selección de Idioma en la esquina superior derecha */}
      <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", alignItems: "center", gap: 2 }}>
        <IconButton color="inherit" onClick={toggleDarkMode}>
          {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
        </IconButton>

        <IconButton color="inherit" onClick={handleMenuOpen}>
          <TranslateIcon />
        </IconButton>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => handleMenuClose(null)}>
          {Object.entries(languages).map(([key]) => (
            <MenuItem key={key} onClick={() => handleMenuClose(key)}>
              <img src={flagMap[key]} alt={key} style={{ width: 30, height: 20, marginRight: 10 }} />
            </MenuItem>
          ))}
        </Menu>
      </Box>

      {/* 🔹 Modal de Login */}
      <LoginModal open={openLogin} onClose={() => setOpenLogin(false)} />
      <LogoutModal open={openLogout} onClose={() => setOpenLogout(false)} />
    </AppBar>
  );
}
