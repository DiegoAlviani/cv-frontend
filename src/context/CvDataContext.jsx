import { createContext, useContext, useState, useEffect } from "react";
import { API } from "../config";
const CvDataContext = createContext();

// Proveedor del contexto
export function CvDataProvider({ children }) {
  const [cvData, setCvData] = useState(null);
  const [language, setLanguage] = useState("en"); // Idioma por defecto

  // 🔹 Cargar datos del backend al inicio o cuando cambie el idioma
  useEffect(() => {
    fetch(`${API.CV}?lang=${language}`)
      .then((res) => res.json())
      .then((data) => {
       // console.log("📌 Datos recibidos del backend:", data);
        setCvData(data);
      })
      .catch((error) => console.error("Error al obtener datos del CV:", error));
  }, [language]);

  return (
    <CvDataContext.Provider value={{ cvData, setCvData, language, setLanguage }}>
      {children}
    </CvDataContext.Provider>
  );
}

// Hook para consumir el contexto
export function useCvData() {
  return useContext(CvDataContext);
}
