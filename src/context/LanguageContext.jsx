import { createContext, useState, useContext } from "react";

// Definimos los idiomas disponibles
const languages = {
  en: "English",
  es: "Español",
  it: "Italiano",
};

// Creamos el contexto de idioma
const LanguageContext = createContext();

// Proveedor de idioma para envolver la app
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en"); // Idioma por defecto

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook para usar el contexto en los componentes
export function useLanguage() {
  return useContext(LanguageContext);
}
