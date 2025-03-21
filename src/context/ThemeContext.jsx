import { createContext, useState, useContext, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProviderComponent({ children }) {
  // 🔹 Cargar el estado del tema desde localStorage (por defecto en oscuro si no hay valor guardado)
  const storedTheme = localStorage.getItem("darkMode") === "true";
  const [darkMode, setDarkMode] = useState(storedTheme);

  // 🔹 Guardar el estado en localStorage cada vez que cambie el tema
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook para acceder al estado del tema en cualquier componente
export function useThemeMode() {
  return useContext(ThemeContext);
}
