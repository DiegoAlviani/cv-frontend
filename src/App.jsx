import { createTheme, ThemeProvider, CssBaseline, Box } from "@mui/material";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { ThemeProviderComponent, useThemeMode } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

import Header from "./components/Header";
import Profile from "./components/Profile";
import Experience from "./components/Experience";
import Education from "./components/Education";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import Languages from "./components/Languages";
import ExpenseTracker from "./components/ExpenseTracker"; 
import Footer from "./components/Footer";
import VisitorStats from "./components/VisitorStats"; 

import { useState, useEffect } from "react";
import { API } from "./config";

function AppContent() {
  const { language } = useLanguage();
  const { darkMode } = useThemeMode();

  useEffect(() => {
    if (!localStorage.getItem("visitorLogged")) {
      fetch("https://ipinfo.io/json?token=06ce9c0616eb92")
        .then((res) => res.json())
        .then((data) => {
          const visitorInfo = {
            ip: data.ip,
            city: data.city,
            region: data.region,
            country: data.country,
            org: data.org,
            loc: data.loc,
            timestamp: new Date().toISOString()
          };
  
          fetch(API.VISITORS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(visitorInfo),
          });
  
          localStorage.setItem("visitorLogged", "true");
        })
        .catch((err) => console.error("Error al obtener IP info:", err));
    }
  }, []); // Solo una vez al montar
  

  const [cvData, setCvData] = useState(null);

  useEffect(() => {
    fetch(`${API.CV}?lang=${language}`)
      .then((res) => res.json())
      .then((data) => {
      //  console.log("📌 Datos recibidos del backend:", data);
        setCvData(data);
        window.cvData = data; // 🔹 Guardar en window para acceso en consola
      })
      .catch((error) => console.error("Error al obtener datos del CV:", error));
  }, [language]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: { main: "#1976d2" },
      secondary: { main: "#ff4081" },
      background: {
        default: darkMode ? "#121212" : "#f4f4f4",
        paper: darkMode ? "#1e1e1e" : "#ffffff",
      },
    },
    typography: {
      fontFamily: "'Poppins', sans-serif",
      h5: { fontWeight: "bold" },
      body1: { fontSize: "1.1rem" },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: "30px",
            textTransform: "none",
            fontWeight: "bold",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: "15px",
            boxShadow: darkMode
              ? "0px 4px 10px rgba(255, 255, 255, 0.1)"
              : "0px 4px 10px rgba(0, 0, 0, 0.1)",
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        <Header setActiveSection={setActiveSection} data={cvData} />

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-start",
            overflowY: "auto",
            paddingTop: 3,
          }}
        >
          {cvData ? (
            <>
             
              {activeSection === "profile" && <Profile data={cvData} setCvData={setCvData} />}
              {activeSection === "expenses" && <ExpenseTracker />} 
              {activeSection === "experience" && <Experience data={cvData} setCvData={setCvData} />}
              {activeSection === "education" && <Education data={cvData} setCvData={setCvData} />}
              {activeSection === "projects" && <Projects data={cvData} setCvData={setCvData} />}
              {activeSection === "skills" && <Skills data={cvData} setCvData={setCvData} />}
              {activeSection === "languages" && <Languages data={cvData} setCvData={setCvData} />}
              {activeSection === "contact" && <Contact data={cvData} setCvData={setCvData} />}
              {activeSection === "visitors" && <VisitorStats />}

            </>
          ) : (
            <p>Loading...</p>
          )}
        </Box>

        <Footer />
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
    <ThemeProviderComponent>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProviderComponent>
    </AuthProvider>
  );
}

export default App;
