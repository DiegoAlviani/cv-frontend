import { Container, Typography, Card, CardContent, Grid, Button, TextField, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext"; // 🔹 Importa el contexto de idioma
import { useAuth } from "../context/AuthContext";
import { API } from "../config"; // al inicio del archivo

export default function Skills({ data, setCvData }) {
  const { language } = useLanguage(); // 🔹 Obtiene el idioma actual
  const [skillsData, setSkillsData] = useState(Array.isArray(data.skills) ? data.skills : []);
  const [editMode, setEditMode] = useState(null);
  const [editedSkill, setEditedSkill] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const { user } = useAuth(); // 🔐 Verifica si estás logueado

  
  // 🔹 Función para extraer datos en el idioma correcto
  const extractLanguageData = (skill) => ({
    id: skill.id,
    category: skill.category,
    skills: skill.skills,
  });

  // 📌 Estado para manejar una nueva habilidad
const [newSkill, setNewSkill] = useState({
  category_en: "",
  category_es: "",
  category_it: "",
  skills: "",
});

// 📌 Función para manejar cambios en los campos del formulario
const handleChangeNewSkill = (e) => {
  const { name, value } = e.target;
  setNewSkill((prev) => ({ ...prev, [name]: value }));
};

// 📌 Función para agregar una nueva habilidad
const handleAddSkill = async () => {
  for (const key in newSkill) {
    if (!newSkill[key].trim()) {
      alert("Todos los campos deben estar llenos.");
      return;
    }
  }

  try {
    const response = await fetch(`${API.SKILLS}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newSkill),
    });

    if (response.ok) {
      console.log("✅ Nueva habilidad agregada.");

      // Recargar los datos actualizados
      const updatedResponse = await fetch(`${API.CV}?lang=${language}`);
      const updatedCvData = await updatedResponse.json();

      setSkillsData(updatedCvData.skills);
      setCvData(updatedCvData);
      setOpenModal(false); // Cerrar el modal
      setNewSkill({ category_en: "", category_es: "", category_it: "", skills: "" });
    } else {
      console.error("❌ Error al agregar la habilidad.");
    }
  } catch (error) {
    console.error("❌ Error de conexión al servidor:", error);
  }
};


  // 🔹 Sincroniza los datos cuando cambia el idioma o se actualiza `data`
  useEffect(() => {
   // console.log("📌 Datos recibidos en Skills.jsx:", data.skills);
    if (Array.isArray(data.skills)) {
      setSkillsData(
        data.skills
          .map((skill) => ({
            ...skill,
            ...extractLanguageData(skill),
          }))
          .sort((a, b) => b.id - a.id) // 🔹 Ordenar de mayor a menor ID
      );
    }

    // 🔹 Si el formulario de edición está abierto, actualizar `editedSkill`
    if (editMode !== null) {
      const skill = data.skills.find((s) => s.id === editMode);
      if (skill) {
        setEditedSkill(extractLanguageData(skill));
      }
    }
  }, [data, editMode, language]);

  const handleEdit = (id, skill) => {
    setEditMode(id);
   // console.log("📌 Cargando habilidad para edición:", skill);
    setEditedSkill(extractLanguageData(skill));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedSkill((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (id) => {
    const { id: _, ...updatedSkill } = editedSkill; // 🔹 Elimina `id` antes de enviar los datos

   // console.log("📌 Enviando actualización específica:", updatedSkill);

    try {
      const response = await fetch(`${API.SKILLS}/${id}/${language}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSkill),
      });

      if (response.ok) {
        console.log(`✅ Habilidad con ID ${id} actualizada en ${language}`);

        // 🔹 Volver a obtener todo el CV actualizado después de la edición
        const updatedResponse = await fetch(`${API.CV}?lang=${language}`);

        const updatedCvData = await updatedResponse.json();

      //  console.log("📌 Datos actualizados después de guardar:", updatedCvData);

        // 🔹 ACTUALIZAR `skillsData` con la nueva data recibida
        setSkillsData(updatedCvData.skills);

        // 🔹 Actualizar el estado global `setCvData`
        setCvData(updatedCvData);

        // 🔹 Salir del modo edición
        setEditMode(null);
      } else {
        console.error("❌ Error al actualizar la habilidad en el backend.");
      }
    } catch (error) {
      console.error("❌ Error de conexión al servidor:", error);
    }
  };

  return (
    <Container id="skills" maxWidth="md" sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>

      <Typography variant="h5" color="primary" gutterBottom>
        {data.dictionary?.header_skills}
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
      {skillsData.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No skills data available.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {skillsData.map((skill) => (
            <Grid item xs={12} key={skill.id}>
              <Card>
                <CardContent>
                  {editMode === skill.id ? (
                    <>
                      <TextField fullWidth label={data.dictionary?.category} name="category" value={editedSkill.category || ""} onChange={handleChange} margin="dense" />
                      <TextField fullWidth label={data.dictionary?.technologies} name="skills" value={editedSkill.skills || ""} onChange={handleChange} margin="dense" />
                      <Button onClick={() => handleSave(skill.id)} variant="contained" color="primary" sx={{ mt: 2 }}>
                        {data.dictionary?.save}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" color="secondary">{skill.category}</Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>{skill.skills}</Typography>

                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                        {/* Botón Editar */}
                        {user && (
                      <Button onClick={() => handleEdit(skill.id, skill)} variant="outlined" color="primary" sx={{ mt: 2 }}>
                        {data.dictionary?.edit}
                      </Button>
                        )}
                        {/* Botón Eliminar */}
                        {user && (
                      <Button
                        variant="contained"
                        color="error"
                        onClick={async () => {
                          if (!window.confirm(`¿Estás seguro de eliminar la habilidad ${skill.category}?`)) return;

                          try {
                            const response = await fetch(`${API.SKILLS}/${skill.id}`, {

                              method: "DELETE",
                            });

                            if (!response.ok) {
                              throw new Error("Error al eliminar la habilidad");
                            }

                            console.log(`✅ Habilidad con ID ${skill.id} eliminada.`);

                            // 🔹 Actualizar la lista de habilidades en el frontend
                            setSkillsData((prevData) => prevData.filter((item) => item.id !== skill.id));
                            setCvData((prevData) => ({
                              ...prevData,
                              skills: prevData.skills.filter((item) => item.id !== skill.id),
                            }));
                          } catch (error) {
                            console.error("❌ Error al eliminar la habilidad:", error);
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
          ))}
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
      backgroundColor: (theme) => theme.palette.mode === "dark" ? "#121212" : "#fff",
      backdropFilter: "blur(5px)",
      border: "1px solid rgba(255, 255, 255, 0.1)"
    }}
  >
    <Typography variant="h6" color="primary" gutterBottom>
      {data.dictionary?.add_skill || "Add Skill"}
    </Typography>

    <Grid container spacing={2}>
      {/* Inglés */}
      <Grid item xs={12} md={4}>
        <Typography variant="subtitle1">English</Typography>
        <TextField fullWidth label="Category" name="category_en" value={newSkill.category_en} onChange={handleChangeNewSkill} margin="dense" />
      </Grid>

      {/* Español */}
      <Grid item xs={12} md={4}>
        <Typography variant="subtitle1">Español</Typography>
        <TextField fullWidth label="Categoría" name="category_es" value={newSkill.category_es} onChange={handleChangeNewSkill} margin="dense" />
      </Grid>

      {/* Italiano */}
      <Grid item xs={12} md={4}>
        <Typography variant="subtitle1">Italiano</Typography>
        <TextField fullWidth label="Categoria" name="category_it" value={newSkill.category_it} onChange={handleChangeNewSkill} margin="dense" />
      </Grid>
    </Grid>

    {/* Campo único de tecnologías */}
    <TextField
      fullWidth
      label={data.dictionary?.technologies || "Technologies"}
      name="skills"
      value={newSkill.skills}
      onChange={handleChangeNewSkill}
      margin="dense"
      sx={{ mt: 2 }}
    />

    {/* Botones */}
    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={6}>
        <Button variant="contained" color="primary" fullWidth onClick={handleAddSkill}>
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
      )}
    </Container>
  );
}
