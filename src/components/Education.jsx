import { Container, Typography, Card, CardContent, Grid, Button, TextField, Box} from "@mui/material";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext"; // 🔹 Importa el contexto de idioma
import { useAuth } from "../context/AuthContext";
import { API } from "../config"; // al inicio del archivo

export default function Education({ data, setCvData }) {
  const { language } = useLanguage(); // 🔹 Obtiene el idioma actual
  const [educationData, setEducationData] = useState(Array.isArray(data.education) ? data.education : []);
  const [editMode, setEditMode] = useState(null);
  const [editedEducation, setEditedEducation] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const { user } = useAuth(); // 🔐 Verifica si estás logueado

  // 🔹 Extrae los datos en el idioma correcto
  const extractLanguageData = (edu) => ({
    id: edu.id,
    institution: edu.institution,
    degree: edu.degree,
    duration: edu.duration,
  });
  const [newEducation, setNewEducation] = useState({
    institution_en: "",
    institution_es: "",
    institution_it: "",
    degree_en: "",
    degree_es: "",
    degree_it: "",
    duration: ""
  });
  
  // 🔹 Sincroniza los datos cuando cambia el idioma o se actualiza `data`
  useEffect(() => {
    console.log("📌 Datos recibidos en Education.jsx:", data.education);
    if (Array.isArray(data.education)) {
      setEducationData(
        data.education
          .map((edu) => ({
            ...edu,
            ...extractLanguageData(edu),
          }))
          .sort((a, b) => b.id - a.id) // 🔹 Ordenar de mayor a menor ID
      );
    }

    // 🔹 Si el formulario de edición está abierto, actualizar `editedEducation`
    if (editMode !== null) {
      const edu = data.education.find((edu) => edu.id === editMode);
      if (edu) {
        setEditedEducation(extractLanguageData(edu));
      }
    }
  }, [data, editMode, language]);


  const handleAddEducation = async () => {
    // 📌 Verifica que todos los campos estén completos
    for (const key in newEducation) {
      if (!newEducation[key].trim()) {
        alert("Todos los campos deben estar llenos.");
        return;
      }
    }
  
    try {
      const response = await fetch(API.EDUCATION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEducation),
      });
  
      if (response.ok) {
        console.log("✅ Nueva educación agregada.");
  
        // Recargar los datos actualizados
        const updatedResponse = await fetch(`${API.CV}?lang=${language}`);
        const updatedCvData = await updatedResponse.json();
  
        setEducationData(updatedCvData.education);
        setCvData(updatedCvData);
        setOpenModal(false); // Cerrar el modal
        setNewEducation({
          institution_en: "",
          institution_es: "",
          institution_it: "",
          degree_en: "",
          degree_es: "",
          degree_it: "",
          duration: ""
        });
      } else {
        console.error("❌ Error al agregar la educación.");
      }
    } catch (error) {
      console.error("❌ Error de conexión al servidor:", error);
    }
  };

  
  const handleChangeNewEducation = (e) => {
    const { name, value } = e.target;
    setNewEducation((prev) => ({ ...prev, [name]: value }));
  };
  const handleEdit = (id, edu) => {
    setEditMode(id);
    console.log("📌 Cargando educación para edición:", edu);
    setEditedEducation(extractLanguageData(edu));
    console.log("📌 Datos cargados en editedEducation:", editedEducation);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedEducation((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    // ❌ Excluir `id` de los datos antes de enviarlos al backend
    const { id: _, ...updatedEdu } = editedEducation; 

    console.log("📌 Enviando actualización específica (sin ID):", updatedEdu); // 🔹 Ver qué datos se están enviando

    try {
        const response = await fetch(`${API.EDUCATION}/${id}/${language}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedEdu), // ✅ Ahora no incluye `id`
        });

        if (response.ok) {
            console.log(`✅ Educación con ID ${id} actualizada en ${language}`);

            // 🔹 Volver a obtener todo el CV actualizado después de la edición
            const updatedResponse = await fetch(`${API.CV}?lang=${language}`);
            const updatedCvData = await updatedResponse.json();

            console.log("📌 Datos actualizados después de guardar:", updatedCvData);

            // 🔹 ACTUALIZAR `educationData` con la nueva data recibida
            setEducationData(updatedCvData.education);

            // 🔹 Actualizar el estado global `setCvData`
            setCvData(updatedCvData);

            // 🔹 Salir del modo edición
            setEditMode(null);
        } else {
            console.error("❌ Error al actualizar la educación en el backend.");
            const errorData = await response.json();
            console.error("📌 Respuesta del servidor:", errorData);
        }
    } catch (error) {
        console.error("❌ Error de conexión al servidor:", error);
    }
};



  return (
    <Container id="education" maxWidth="md" sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        {data.dictionary?.header_education}
      </Typography>
    {user && (
    <Button 
    variant="contained" 
    color="primary" 
    sx={{ 
      minWidth: "50px", 
      height: "50px", 
      borderRadius: "50%", 
      fontSize: "24px", 
      fontWeight: "bold",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center" 
    }} 
    onClick={() => setOpenModal(true)}
  >
    +
  </Button>
    )}
      </Box>
      <Grid container spacing={3}>
        {Array.isArray(educationData) && educationData.length > 0 ? (
          educationData.map((edu) => (
            <Grid item xs={12} key={edu.id}>
              <Card>
                <CardContent>
                  {editMode === edu.id ? (
                    <>
                      <TextField
                        fullWidth
                        label={data.dictionary?.institution || "Institution"}
                        name="institution"
                        value={editedEducation.institution || ""}
                        onChange={handleChange}
                        margin="dense"
                      />
                      <TextField
                        fullWidth
                        label={data.dictionary?.degree || "Degree"}
                        name="degree"
                        value={editedEducation.degree || ""}
                        onChange={handleChange}
                        margin="dense"
                      />
                      <TextField
                        fullWidth
                        label={data.dictionary?.duration || "Duration"}
                        name="duration"
                        value={editedEducation.duration || ""}
                        onChange={handleChange}
                        margin="dense"
                      />
                      <Button onClick={() => handleSave(edu.id)} variant="contained" color="primary" sx={{ mt: 2 }}>
                        {data.dictionary?.save}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" color="secondary">
                        {edu.institution}
                      </Typography>
                      <Typography variant="subtitle1">{edu.degree}</Typography>
                      <Typography variant="body2" color="textSecondary">{edu.duration}</Typography>

                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                      {user && (
                      <Button onClick={() => handleEdit(edu.id, edu)} variant="outlined" color="primary" sx={{ mt: 2 }}>
                        {data.dictionary?.edit}
                      </Button>
                      )}
                      {user && (
                      <Button
                      variant="contained"
                      color="error"
                      sx={{ ml: "auto" }}
                      onClick={async () => {
                        if (!window.confirm(`¿Estás seguro de eliminar ${edu.institution}?`)) return;

                        try {
                          const response = await fetch(`${API.EDUCATION}/${edu.id}`, {
                            method: "DELETE",
                          });

                          if (!response.ok) {
                            throw new Error("Error al eliminar la educación");
                          }

                          console.log(`✅ Educación con ID ${edu.id} eliminada.`);
                          setEducationData((prevData) => prevData.filter((item) => item.id !== edu.id));
                          setCvData((prevData) => ({
                            ...prevData,
                            education: prevData.education.filter((item) => item.id !== edu.id),
                          }));
                        } catch (error) {
                          console.error("❌ Error al eliminar la educación:", error);
                        }
                      }}
                    >
                      🗑️
                    </Button>
                    )}
                  </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1" sx={{ mt: 2 }}>
            No education data available.
          </Typography>
        )}
        {/* Modal para agregar nueva educación */}
        {openModal && (
        <Box
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: "800px",
            bgcolor: "background.default",
            color: "text.primary",
            p: 3,
            boxShadow: 3,
            borderRadius: 2,
            maxHeight: "90vh",
            overflowY: "auto",
            zIndex: 1300,
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "#121212" : "#fff",
            backdropFilter: "blur(5px)", // 🔹 Difumina el fondo si hay transparencia
            border: "1px solid rgba(255, 255, 255, 0.1)", // 🔹 Asegura contraste en modo oscuro
          }}
        >
          <Typography variant="h6" color="primary" gutterBottom>
            {data.dictionary?.add_education || "Add Education"}
          </Typography>

          <Grid container spacing={2}>
            {/* 🔹 Primera columna - Inglés */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">English</Typography>
              <TextField fullWidth label="Institution" name="institution_en" value={newEducation.institution_en} onChange={handleChangeNewEducation} margin="dense" />
              <TextField fullWidth label="Degree" name="degree_en" value={newEducation.degree_en} onChange={handleChangeNewEducation} margin="dense" />
            </Grid>

            {/* 🔹 Segunda columna - Español */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Español</Typography>
              <TextField fullWidth label="Institución" name="institution_es" value={newEducation.institution_es} onChange={handleChangeNewEducation} margin="dense" />
              <TextField fullWidth label="Título" name="degree_es" value={newEducation.degree_es} onChange={handleChangeNewEducation} margin="dense" />
            </Grid>

            {/* 🔹 Tercera columna - Italiano */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Italiano</Typography>
              <TextField fullWidth label="Istituzione" name="institution_it" value={newEducation.institution_it} onChange={handleChangeNewEducation} margin="dense" />
              <TextField fullWidth label="Laurea" name="degree_it" value={newEducation.degree_it} onChange={handleChangeNewEducation} margin="dense" />
            </Grid>

            {/* 🔹 Duración (único valor) */}
            <Grid item xs={12}>
              <TextField fullWidth label={data.dictionary?.duration || "Duration"} name="duration" value={newEducation.duration} onChange={handleChangeNewEducation} margin="dense" />
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button variant="contained" color="primary" fullWidth onClick={handleAddEducation}>
                {data.dictionary?.save || "Save"}
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button variant="outlined" color="error" fullWidth onClick={() => setOpenModal(false)}>
                {data.dictionary?.cancel || "Cancel"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}


      </Grid>
    </Container>
  );
}
