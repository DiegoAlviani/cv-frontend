import { Container, Typography, Card, CardContent, Grid, Link, Button, TextField, Box } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext"; // 🔹 Importa el contexto de idioma
import { useAuth } from "../context/AuthContext";
import { API } from "../config"; // al inicio del archivo

export default function Projects({ data, setCvData }) {
  const { language } = useLanguage(); // 🔹 Obtiene el idioma actual
  const [projectsData, setProjectsData] = useState(Array.isArray(data.projects) ? data.projects : []);
  const [editMode, setEditMode] = useState(null);
  const [editedProject, setEditedProject] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const { user } = useAuth(); // 🔐 Verifica si estás logueado

  const [newProject, setNewProject] = useState({
    name_en: "",
    name_es: "",
    name_it: "",
    description_en: "",
    description_es: "",
    description_it: "",
    technologies: "",
    link: "",
});

const handleChangeNewProject = (e) => {
  const { name, value } = e.target;
  setNewProject((prev) => ({ ...prev, [name]: value }));
};

const handleAddProject = async () => {
  // Verificar que todos los campos requeridos estén completos
  for (const key in newProject) {
    if (!newProject[key].trim()) {
      alert("Todos los campos deben estar llenos.");
      return;
    }
  }

  try {
    const response = await fetch(API.PROJECTS, { 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProject),
    });

    if (response.ok) {
      console.log("✅ Nuevo proyecto agregado.");

      // Recargar los datos actualizados
      const updatedResponse = await fetch(`${API.CV}?lang=${language}`);

      const updatedCvData = await updatedResponse.json();

      setProjectsData(updatedCvData.projects);
      setCvData(updatedCvData);
      setOpenModal(false); // Cerrar el modal
      setNewProject({ // Resetear el formulario
        name_en: "",
        name_es: "",
        name_it: "",
        description_en: "",
        description_es: "",
        description_it: "",
        technologies: "",
        link: "",
      });
    } else {
      console.error("❌ Error al agregar el proyecto.");
    }
  } catch (error) {
    console.error("❌ Error de conexión al servidor:", error);
  }
};

  // 🔹 Función para extraer datos en el idioma correcto
  const extractLanguageData = (proj) => ({
    id: proj.id,
    name: proj.name,
    description: proj.description,
    technologies: proj.technologies,
    link: proj.link || "",
  });

  // 🔹 Sincroniza los datos cuando cambia el idioma o se actualiza `data`
  useEffect(() => {
    console.log("📌 Datos recibidos en Projects.jsx:", data.projects);
    if (Array.isArray(data.projects)) {
      setProjectsData(
        data.projects
          .map((proj) => ({
            ...proj,
            ...extractLanguageData(proj),
          }))
          .sort((a, b) => b.id - a.id) // 🔹 Ordenar de mayor a menor ID
      );
    }

    // 🔹 Si el formulario de edición está abierto, actualizar `editedProject`
    if (editMode !== null) {
      const proj = data.projects.find((proj) => proj.id === editMode);
      if (proj) {
        setEditedProject(extractLanguageData(proj));
      }
    }
  }, [data, editMode, language]);

  const handleEditClick = (id, proj) => {
    setEditMode(id);
    console.log("📌 Cargando proyecto para edición:", proj);
    setEditedProject(extractLanguageData(proj));
    console.log("📌 Datos cargados en editedProject:", editedProject);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProject((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async (id) => {
    const { id: _, ...updatedProj } = editedProject; // 🔹 Elimina `id` antes de enviar los datos

    console.log("📌 Enviando actualización específica:", updatedProj);

    try {
      const response = await fetch(`${API.PROJECTS}/${id}/${language}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProj),
      });

      if (response.ok) {
        console.log(`✅ Proyecto con ID ${id} actualizado en ${language}`);

        // 🔹 Volver a obtener todo el CV actualizado después de la edición
        const updatedResponse = await fetch(`${API.CV}?lang=${language}`);
        const updatedCvData = await updatedResponse.json();

        console.log("📌 Datos actualizados después de guardar:", updatedCvData);

        // 🔹 ACTUALIZAR `projectsData` con la nueva data recibida
        setProjectsData(updatedCvData.projects);

        // 🔹 Actualizar el estado global `setCvData`
        setCvData(updatedCvData);

        // 🔹 Salir del modo edición
        setEditMode(null);
      } else {
        console.error("❌ Error al actualizar el proyecto en el backend.");
      }
    } catch (error) {
      console.error("❌ Error de conexión al servidor:", error);
    }
  };

  return (
    <Container id="projects" maxWidth="md" sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        {data.dictionary?.header_projects}
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
      {projectsData.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No projects data available.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {projectsData.map((project) => (
            <Grid item xs={12} key={project.id}>
              <Card>
                <CardContent>
                  {editMode === project.id ? (
                    <>
                      <TextField fullWidth label={data.dictionary?.project_name} name="name" value={editedProject.name || ""} onChange={handleChange} sx={{ mb: 2 }} />
                      <TextField fullWidth label={data.dictionary?.project_description} name="description" value={editedProject.description || ""} onChange={handleChange} sx={{ mb: 2 }} />
                      <TextField fullWidth label={data.dictionary?.technologies} name="technologies" value={editedProject.technologies || ""} onChange={handleChange} sx={{ mb: 2 }} />
                      <TextField fullWidth label={data.dictionary?.view_project} name="link" value={editedProject.link || ""} onChange={handleChange} sx={{ mb: 2 }} />
                      <Button variant="contained" color="primary" onClick={() => handleSaveClick(project.id)}>
                        {data.dictionary?.save_project}
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="h6" color="secondary">{project.name}</Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>{project.description}</Typography>
                      <Typography variant="body2" sx={{ fontStyle: "italic", mt: 1 }}>{project.technologies}</Typography>

                      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                      <Box sx={{ display: "flex", gap: 1 }}>

                        {/* Botón Editar */}
                        {user && (
                        <Button variant="outlined" color="primary" onClick={() => handleEditClick(project.id, project)}>
                          {data.dictionary?.edit_project}
                        </Button>
                        )}
                        {/* Botón Eliminar */}
                        {user && (
                        <Button
                          variant="contained"
                          color="error"
                          onClick={async () => {
                            if (!window.confirm(`¿Estás seguro de eliminar el proyecto "${project.name}"?`)) return;

                            try {
                              const response = await fetch(`${API.PROJECTS}/${project.id}`, {
                                method: "DELETE",
                              });

                              if (!response.ok) {
                                throw new Error("Error al eliminar el proyecto");
                              }

                              console.log(`✅ Proyecto con ID ${project.id} eliminado.`);
                              setProjectsData((prevData) => prevData.filter((item) => item.id !== project.id));
                              setCvData((prevData) => ({
                                ...prevData,
                                projects: prevData.projects.filter((item) => item.id !== project.id),
                              }));
                            } catch (error) {
                              console.error("❌ Error al eliminar el proyecto:", error);
                            }
                          }}
                        >
                          🗑️
                        </Button>
                        )}
                      </Box>
                        {/* Botón "View Project" mantiene su posición a la derecha */}
                        {project.link && (
                          <Link href={project.link} target="_blank" sx={{ display: "flex", alignItems: "center" }}>
                            <GitHubIcon sx={{ mr: 1 }} /> {data.dictionary?.view_project}
                          </Link>
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
              zIndex: 1300
            }}
          >
            <Typography variant="h6" color="primary" gutterBottom>
              {data.dictionary?.add_project || "Add Project"}
            </Typography>

            <Grid container spacing={2}>
              {/* 🔹 Primera columna - Inglés */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">English</Typography>
                <TextField fullWidth label="Project Name" name="name_en" value={newProject.name_en} onChange={handleChangeNewProject} margin="dense" />
                <TextField fullWidth multiline rows={3} label="Description" name="description_en" value={newProject.description_en} onChange={handleChangeNewProject} margin="dense" />
              </Grid>

              {/* 🔹 Segunda columna - Español */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Español</Typography>
                <TextField fullWidth label="Nombre del Proyecto" name="name_es" value={newProject.name_es} onChange={handleChangeNewProject} margin="dense" />
                <TextField fullWidth multiline rows={3} label="Descripción" name="description_es" value={newProject.description_es} onChange={handleChangeNewProject} margin="dense" />
              </Grid>

              {/* 🔹 Tercera columna - Italiano */}
              <Grid item xs={12} md={4}>
                <Typography variant="subtitle1">Italiano</Typography>
                <TextField fullWidth label="Nome del Progetto" name="name_it" value={newProject.name_it} onChange={handleChangeNewProject} margin="dense" />
                <TextField fullWidth multiline rows={3} label="Descrizione" name="description_it" value={newProject.description_it} onChange={handleChangeNewProject} margin="dense" />
              </Grid>
            </Grid>

            <TextField fullWidth label= {data.dictionary?.technologies}  name="technologies" value={newProject.technologies} onChange={handleChangeNewProject} margin="dense" sx={{ mt: 2 }} />
            <TextField fullWidth label="Project Link (Optional)" name="link" value={newProject.link} onChange={handleChangeNewProject} margin="dense" sx={{ mt: 2 }} />

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Button variant="contained" color="primary" fullWidth onClick={handleAddProject}>
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
