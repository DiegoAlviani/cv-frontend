import { Container, Typography, Card, CardContent, Grid, Button, TextField, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext"; // 🔹 Importa el contexto de idioma
import SpainFlag from "../assets/spain.png";
import ItalyFlag from "../assets/italy.png";
import UKFlag from "../assets/uk.png";
import { useAuth } from "../context/AuthContext";
import { API } from "../config"; // al inicio del archivo

// 🔹 Mapeamos los flags en un objeto para usarlos dinámicamente
const flagMap = {
  Spanish: SpainFlag, Español: SpainFlag, Spagnolo: SpainFlag,
  Italian: ItalyFlag, Italiano: ItalyFlag,
  Inglese: UKFlag, English: UKFlag, Inglés: UKFlag
};

export default function Languages({ data, setCvData }) {
  const { language } = useLanguage(); // 🔹 Obtiene el idioma actual
  const [languagesData, setLanguagesData] = useState(Array.isArray(data.languages) ? data.languages : []);
  const [editMode, setEditMode] = useState(null);
  const [editedLanguage, setEditedLanguage] = useState({});
  const { user } = useAuth(); // 🔐 Verifica si estás logueado

  // 🔹 Función para extraer datos en el idioma correcto
  const extractLanguageData = (langObj) => ({
    id: langObj.id,
    language: langObj.language,
    level: langObj.level,
  });

  // 🔹 Sincroniza los datos cuando cambia el idioma o se actualiza `data`
  useEffect(() => {
    console.log("📌 Datos recibidos en Languages.jsx:", data.languages);
    if (Array.isArray(data.languages)) {
      setLanguagesData(
        data.languages
          .map((lang) => ({
            ...lang,
            ...extractLanguageData(lang),
          }))
          .sort((a, b) => b.id - a.id) // 🔹 Ordenar de mayor a menor ID
      );
    }

    // 🔹 Si el formulario de edición está abierto, actualizar `editedLanguage`
    if (editMode !== null) {
      const langObj = data.languages.find((lang) => lang.id === editMode);
      if (langObj) {
        setEditedLanguage(extractLanguageData(langObj));
      }
    }
  }, [data, editMode, language]);

  const handleEditClick = (id, langObj) => {
    setEditMode(id);
    console.log("📌 Cargando idioma para edición:", langObj);
    setEditedLanguage(extractLanguageData(langObj));
  };

  const handleChange = (e) => {
    setEditedLanguage({ level: e.target.value });
  };

  const handleSaveClick = async (id) => {
    const { id: _, language: __, ...updatedLang } = editedLanguage; // 🔹 Elimina `id` y `language` antes de enviar los datos

    console.log("📌 Enviando actualización específica:", updatedLang);

    try {
      const response = await fetch(`${API.LANGUAGES}/${id}/${language}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedLang),
      });

      if (response.ok) {
        console.log(`✅ Idioma con ID ${id} actualizado en ${language}`);

        // 🔹 Volver a obtener todo el CV actualizado después de la edición
        const updatedResponse = await fetch(`${API.CV}?lang=${language}`);
        const updatedCvData = await updatedResponse.json();

        console.log("📌 Datos actualizados después de guardar:", updatedCvData);

        // 🔹 ACTUALIZAR `languagesData` con la nueva data recibida
        setLanguagesData(updatedCvData.languages);

        // 🔹 Actualizar el estado global `setCvData`
        setCvData(updatedCvData);

        // 🔹 Salir del modo edición
        setEditMode(null);
      } else {
        console.error("❌ Error al actualizar el idioma en el backend.");
      }
    } catch (error) {
      console.error("❌ Error de conexión al servidor:", error);
    }
  };

  return (
    <Container id="languages" maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        {data.dictionary?.header_languages}
      </Typography>

      {languagesData.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No language data available.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {languagesData.map((lang) => (
            <Grid item xs={12} key={lang.id}>
              <Card>
                <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={flagMap[lang.language]}
                      alt={`${lang.language} flag`}
                      style={{ width: 40, height: 25, marginRight: 15, transform: "scale(1.3)" }}
                    />
                    {editMode === lang.id ? (
                      <Box>
                        <TextField fullWidth label={data.dictionary?.level} name="level" value={editedLanguage.level || ""} onChange={handleChange} sx={{ mb: 2 }} />
                        <Button variant="contained" color="primary" onClick={() => handleSaveClick(lang.id)}>
                          {data.dictionary?.save}
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="h6" color="secondary">{lang.language}</Typography>
                        <Typography variant="body1">{lang.level}</Typography>
                      </Box>
                    )}
                  </Box>
                  {editMode !== lang.id && user && (
                    <Button variant="outlined" color="primary" onClick={() => handleEditClick(lang.id, lang)}>
                      {data.dictionary?.edit}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
