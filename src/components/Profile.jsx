import { Container, Typography, Button, Box, TextField, Card, CardContent } from "@mui/material";
import { GitHub, LinkedIn, Download } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext"; // 🔹 Importa el contexto de idioma
import generatePDF from "../utils/generatePDF"; // 🔹 Importamos la función desde generatePDF.js
import { useAuth } from "../context/AuthContext";
import { API } from "../config"; // al inicio del archivo

export default function Profile({ data, setCvData }) {
  const { language } = useLanguage(); // 🔹 Obtiene el idioma actual
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState("");
  const { user } = useAuth(); 

  const [pdfUrl, setPdfUrl] = useState(null);

  // 🔹 Función para extraer los datos en el idioma correcto y evitar repetición de código
  const extractLanguageData = (profileData, lang) =>
    typeof profileData.dictionary?.profile_description === "object"
      ? profileData.dictionary?.profile_description[lang] || ""
      : profileData.dictionary?.profile_description;

  // 🔹 Generar el PDF automáticamente cuando cambia el perfil
  useEffect(() => {
    const generateAndSetPDF = async () => {

    // ⚠️ Elimina el PDF anterior para evitar que se use en caché
    setPdfUrl(null);

    // 🚀 Genera un nuevo PDF con el idioma actualizado
    const pdfBlob = await generatePDF(data, language, true);

      // ✅ Asegurar que `pdfBlob` es válido antes de crear el objeto URL
      if (pdfBlob) {
        setPdfUrl(URL.createObjectURL(pdfBlob));
      }
    };
  
    generateAndSetPDF();
  }, [data, language]);

  // 🔹 Sincroniza los datos cuando cambia el idioma o se actualiza `data`
  useEffect(() => {
    if (data?.dictionary) {
      setEditedProfile(extractLanguageData(data, language));
    }
  }, [data, language]);

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleChange = (e) => {
    setEditedProfile(e.target.value);
  };

  const handleSaveClick = async () => {
    console.log("📌 Enviando actualización específica:", editedProfile);

    try {
      const response = await fetch(`${API.PROFILE}/${language}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile_description: editedProfile }),
      });

      if (response.ok) {
        console.log(`✅ Perfil actualizado en ${language}`);

        // 🔹 Volver a obtener todo el CV actualizado después de la edición
        const updatedResponse = await fetch(`${API.CV}?lang=${language}`);
        const updatedCvData = await updatedResponse.json();

        console.log("📌 Datos actualizados después de guardar:", updatedCvData);

        // 🔹 Actualizar el estado global `setCvData` con la nueva data recibida
        setCvData(updatedCvData);

        // 🔹 Salir del modo edición
        setEditMode(false);
      } else {
        console.error("❌ Error al actualizar el perfil en el backend.");
      }
    } catch (error) {
      console.error("❌ Error de conexión al servidor:", error);
    }
  };

  return (
    <Container id="profile" maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        {data.dictionary?.header_profile}
      </Typography>

      <Card>
        <CardContent>
          {editMode ? (
            <>
              <TextField
                fullWidth
                label={data.dictionary?.description}
                value={editedProfile}
                onChange={handleChange}
                sx={{ mb: 2 }}
                multiline
                rows={6} // 🔹 Permite escribir en múltiples líneas
              />
              <Button variant="contained" color="primary" onClick={handleSaveClick}>
                {data.dictionary?.save || "Save"}
              </Button>
            </>
          ) : (
            <>
              <Box sx={{ maxWidth: "100%", margin: "0 auto", textAlign: "justify" }}>
              {(editedProfile || "").split("\n\n").map((paragraph, index) => (
                  <Typography key={index} variant="body1" sx={{ mt: 2 }}>
                    {paragraph}
                  </Typography>
                ))}
              </Box>
              {user && (
              <Button variant="outlined" color="primary" onClick={handleEditClick} sx={{ mt: 2 }}>
                {data.dictionary?.edit || "Edit"}
              </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 📌 Sección donde se muestra el PDF en tiempo real 
      {pdfUrl && (
        <Box sx={{ mt: 3, width: "100%", height: "500px", border: "1px solid #ccc" }}>
          <iframe src={pdfUrl} width="100%" height="100%" title="CV Preview"></iframe>
        </Box>
      )}
        */}
      <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Download />}
          onClick={() => {
            if (!pdfUrl) {
              alert("⚠️ El PDF aún se está generando, intenta nuevamente.");
              return;
            }
          
            const fileName = `Diego_Alviani_CV_${language}.pdf`;
            const a = document.createElement("a");
            a.href = pdfUrl;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }}
        >
          {data.dictionary?.download_cv}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          href="https://github.com/diegoalviani"
          target="_blank"
          startIcon={<GitHub />}
        >
          GitHub
        </Button>
        <Button
          variant="outlined"
          color="primary"
          href="https://linkedin.com/in/diego-alviani"
          target="_blank"
          startIcon={<LinkedIn />}
        >
          LinkedIn
        </Button>
      </Box>
    </Container>
  );
}
