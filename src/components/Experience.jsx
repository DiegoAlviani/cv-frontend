import { Container, Typography, Card, CardContent, Grid, Button, TextField, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext"; // 🔹 Importa el contexto de idioma
import { useAuth } from "../context/AuthContext";
import { API } from "../config"; // al inicio del archivo

export default function Experience({ data, setCvData }) {
  const { language } = useLanguage(); // 🔹 Obtiene el idioma actual
  const [experienceData, setExperienceData] = useState(Array.isArray(data.experience) ? data.experience : []);
  const [editMode, setEditMode] = useState(null);
  const [editedExperience, setEditedExperience] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const { user } = useAuth(); // 🔐 Verifica si estás logueado

  const [newExperience, setNewExperience] = useState({
    company_en: "",
    company_es: "",
    company_it: "",
    role_en: "",
    role_es: "",
    role_it: "",
    duration_en: "",
    duration_es: "",
    duration_it: "",
    description_en: "",
    description_es: "",
    description_it: ""
  });

  const handleChangeNewExperience = (e) => {
    const { name, value } = e.target;
    setNewExperience((prev) => ({ ...prev, [name]: value }));
  };
  const handleAddExperience = async () => {
  // Verifica que todos los campos estén completos
  for (const key in newExperience) {
    if (!newExperience[key].trim()) {
      alert("Todos los campos deben estar llenos.");
      return;
    }
  }

  try {
    const response = await fetch(API.EXPERIENCE, {

      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExperience),
    });

    if (response.ok) {
      console.log("✅ Nueva experiencia agregada.");

      // Recargar los datos actualizados
      const updatedResponse = await fetch(`${API.CV}?lang=${language}`);
      const updatedCvData = await updatedResponse.json();

      setExperienceData(updatedCvData.experience);
      setCvData(updatedCvData);
      setOpenModal(false); // Cerrar el modal
      setNewExperience({ // Resetear el formulario
        company_en: "",
        company_es: "",
        company_it: "",
        role_en: "",
        role_es: "",
        role_it: "",
        duration_en: "",
        duration_es: "",
        duration_it: "",
        description_en: "",
        description_es: "",
        description_it: ""
      });
    } else {
      console.error("❌ Error al agregar la experiencia.");
    }
  } catch (error) {
    console.error("❌ Error de conexión al servidor:", error);
  }
};

  // 🔹 Función para extraer datos en el idioma correcto y evitar repetición de código
  const extractLanguageData = (exp) => ({
    id: exp.id,
    company: exp.company,
    role: exp.role,
    duration: exp.duration,
    description: exp.description,
  });
  
  // 🔹 Sincroniza los datos cuando cambia el idioma o se actualiza `data`
  useEffect(() => {
    if (Array.isArray(data.experience)) {
      setExperienceData(
        data.experience
          .map((exp) => ({
            ...exp,
            ...extractLanguageData(exp), // 🔹 Extrae solo los datos en el idioma correcto
          }))
          .sort((a, b) => b.id - a.id) // 🔹 Ordenar de mayor a menor ID
      );
    }

    // 🔹 Si el formulario de edición está abierto, actualizar `editedExperience`
    if (editMode !== null) {
      const exp = data.experience.find((exp) => exp.id === editMode);
      if (exp) {
        setEditedExperience(extractLanguageData(exp)); // 🔹 Usa la función optimizada
      }
    }
}, [data, editMode, language]); // 🔹 Se ejecuta cuando cambian los datos, `editMode` o el idioma


  

  const handleEdit = (id, exp) => {
    setEditMode(id);
    //console.log("📌 Cargando experiencia para edición:", exp);
    setEditedExperience(extractLanguageData(exp, language)); // 🔹 Usa la función optimizada
    //console.log("📌 Datos cargados en editedExperience:", editedExperience);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedExperience((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    const updatedExp = { ...editedExperience };
  
    //console.log("📌 Enviando actualización específica:", updatedExp);
  
    try {
        // 🚀 Asegurar que la URL coincide con la estructura del backend
        const response = await fetch(`${API.EXPERIENCE}/${id}/${language}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedExp),
        });

        if (response.ok) {
            console.log(`✅ Experiencia con ID ${id} actualizada en ${language}`);

            // 🔹 Volver a obtener todo el CV actualizado después de la edición
            const updatedResponse = await fetch(`${API.CV}?lang=${language}`);
            const updatedCvData = await updatedResponse.json();

           // console.log("📌 Datos actualizados después de guardar:", updatedCvData);

            // 🔹 ACTUALIZAR `experienceData` con la nueva data recibida
            setExperienceData(updatedCvData.experience);

            // 🔹 Actualizar el estado global `setCvData` con la nueva data recibida
            setCvData(updatedCvData);

            // 🔹 Salir del modo edición
            setEditMode(null);
        } else {
            console.error("❌ Error al actualizar la experiencia en el backend.");
        }
    } catch (error) {
        console.error("❌ Error de conexión al servidor:", error);
    }
};


  
  return (
    <Container id="experience" maxWidth="md" sx={{ mt: 2 }}>

      {/* Contenedor del título y el botón */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>

      <Typography variant="h5" color="primary" gutterBottom>
        {data.dictionary?.header_experience}
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
        {Array.isArray(experienceData) && experienceData.length > 0 ? (
          experienceData.map((exp) => (
            <Grid item xs={12} key={exp.id}>
              <Card>
                <CardContent>
                  {editMode === exp.id ? (
                    <>
                      <TextField
                        fullWidth
                        label={data.dictionary?.company || "Company"}
                        name="company"
                        value={editedExperience.company || ""}
                        onChange={handleChange}
                        margin="dense"
                      />
                      <TextField
                        fullWidth
                        label={data.dictionary?.role || "Role"}
                        name="role"
                        value={editedExperience.role || ""}
                        onChange={handleChange}
                        margin="dense"
                      />
                      <TextField
                        fullWidth
                        label={data.dictionary?.duration || "Duration"}
                        name="duration"
                        value={editedExperience.duration || ""}
                        onChange={handleChange}
                        margin="dense"
                      />
                      <TextField
                        fullWidth
                        label={data.dictionary?.description || "Description"}
                        name="description"
                        value={editedExperience.description || ""}
                        onChange={handleChange}
                        margin="dense"
                        multiline
                        rows={3}
                      />
                      <Button onClick={() => handleSave(exp.id)} variant="contained" color="primary" sx={{ mt: 2 }}>
                        {data.save || "Save"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" color="secondary">
                        {exp.company}
                      </Typography>
                      <Typography variant="subtitle1">{exp.role}</Typography>
                      <Typography variant="body2" color="textSecondary">{exp.duration}</Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>{exp.description}</Typography>

                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
  {/* Botón Editar (A la izquierda) */}
  {user && (                  
  <Button onClick={() => handleEdit(exp.id, exp)} variant="outlined" color="primary">
    {data.dictionary?.edit}

  </Button>
  )}
  {/* Botón Eliminar (A la derecha) */}
  {user && ( 
  <Button
    variant="contained"
    color="error"
    onClick={async () => {
      if (!window.confirm(`¿Estás seguro de eliminar la experiencia en ${exp.company}?`)) return;

      try {
        const response = await fetch(`${API.EXPERIENCE}/${exp.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Error al eliminar la experiencia");
        }

        console.log(`✅ Experiencia con ID ${exp.id} eliminada.`);

        // 🔹 Actualizar la lista de experiencias en el frontend
        setExperienceData((prevData) => prevData.filter((item) => item.id !== exp.id));
        setCvData((prevData) => ({
          ...prevData,
          experience: prevData.experience.filter((item) => item.id !== exp.id),
        }));
      } catch (error) {
        console.error("❌ Error al eliminar la experiencia:", error);
      }
    }}
    sx={{
      borderRadius: "50%", // 🔹 Hace que el botón sea redondo
      minWidth: "50px",
      height: "50px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
      {data.dictionary?.add_experience || "Add Experience"}
    </Typography>

    <Grid container spacing={2}>
      {/* 🔹 Primera columna - Inglés */}
      <Grid item xs={12} md={4}>
        <Typography variant="subtitle1">English</Typography>
        <TextField fullWidth label="Company" name="company_en" value={newExperience.company_en} onChange={handleChangeNewExperience} margin="dense" />
        <TextField fullWidth label="Role" name="role_en" value={newExperience.role_en} onChange={handleChangeNewExperience} margin="dense" />
        <TextField fullWidth label="Duration" name="duration_en" value={newExperience.duration_en} onChange={handleChangeNewExperience} margin="dense" />
        <TextField fullWidth multiline rows={3} label="Description" name="description_en" value={newExperience.description_en} onChange={handleChangeNewExperience} margin="dense" />
      </Grid>

      {/* 🔹 Segunda columna - Español */}
      <Grid item xs={12} md={4}>
        <Typography variant="subtitle1">Español</Typography>
        <TextField fullWidth label="Compañía" name="company_es" value={newExperience.company_es} onChange={handleChangeNewExperience} margin="dense" />
        <TextField fullWidth label="Puesto" name="role_es" value={newExperience.role_es} onChange={handleChangeNewExperience} margin="dense" />
        <TextField fullWidth label="Duración" name="duration_es" value={newExperience.duration_es} onChange={handleChangeNewExperience} margin="dense" />
        <TextField fullWidth multiline rows={3} label="Descripción" name="description_es" value={newExperience.description_es} onChange={handleChangeNewExperience} margin="dense" />
      </Grid>

      {/* 🔹 Tercera columna - Italiano */}
      <Grid item xs={12} md={4}>
        <Typography variant="subtitle1">Italiano</Typography>
        <TextField fullWidth label="Azienda" name="company_it" value={newExperience.company_it} onChange={handleChangeNewExperience} margin="dense" />
        <TextField fullWidth label="Ruolo" name="role_it" value={newExperience.role_it} onChange={handleChangeNewExperience} margin="dense" />
        <TextField fullWidth label="Durata" name="duration_it" value={newExperience.duration_it} onChange={handleChangeNewExperience} margin="dense" />
        <TextField fullWidth multiline rows={3} label="Descrizione" name="description_it" value={newExperience.description_it} onChange={handleChangeNewExperience} margin="dense" />
      </Grid>
    </Grid>

    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={6}>
        <Button variant="contained" color="primary" fullWidth onClick={handleAddExperience}>
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
            
          ))
        ) : (
          <Typography variant="body1" sx={{ mt: 2 }}>
            No experience data available.
          </Typography>
        )}
      </Grid>
    </Container>
  );
}
