import { Container, Typography, Box, Grid, TextField, Button } from "@mui/material";
import { Email, Phone, LocationOn } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext"; // 🔹 Importa el contexto de idioma
import { useAuth } from "../context/AuthContext";
import { API } from "../config"; // al inicio del archivo
import { GOOGLE_FORMS } from "../config";

export default function Contact({ data, setCvData }) {
  const { language } = useLanguage(); // 🔹 Obtiene el idioma actual
  const { user } = useAuth(); // 🔐 Verifica si estás logueado

  const [contactData, setContactData] = useState({
    email: data.dictionary?.email || "",
    phone: data.dictionary?.phone || "",
    address: data.dictionary?.address || "",
  });
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // 🔹 Sincroniza los datos cuando cambia el idioma o se actualiza `data`
  useEffect(() => {
    setContactData({
      email: data.dictionary?.email || "",
      phone: data.dictionary?.phone || "",
      address: data.dictionary?.address || "",
    });
  }, [data, language]);

  const handleEditClick = () => setEditMode(true);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = async () => {
    //console.log("📌 Enviando actualización específica:", contactData);

    try {
      const response = await fetch(`${API.CONTACT}/${language}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      if (response.ok) {
        //console.log(`✅ Datos de contacto actualizados en ${language}`);

        // 🔹 Volver a obtener todo el CV actualizado después de la edición
        const updatedResponse = await fetch(`${API.CV}?lang=${language}`);
        const updatedCvData = await updatedResponse.json();

       // console.log("📌 Datos actualizados después de guardar:", updatedCvData);

        // 🔹 Actualizar el estado global `setCvData`
        setCvData(updatedCvData);

        // 🔹 Salir del modo edición
        setEditMode(false);
      } else {
        console.error("❌ Error al actualizar los datos de contacto en el backend.");
      }
    } catch (error) {
      console.error("❌ Error de conexión al servidor:", error);
    }
  };

  // 📌 Función para manejar cambios en el formulario de contacto
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 📌 Función para enviar el mensaje a Google Forms
  const handleSendMessage = (e) => {
    e.preventDefault();

    const googleFormURL = GOOGLE_FORMS.CONTACT;

    const formDataGoogle = new FormData();
    formDataGoogle.append("entry.1884809184", formData.name); // Nombre
    formDataGoogle.append("entry.1593291523", formData.email); // Correo
    formDataGoogle.append("entry.243542332", formData.message); // Mensaje

    fetch(googleFormURL, {
      method: "POST",
      body: formDataGoogle,
      mode: "no-cors",
    })
      .then(() => alert("✅ " + data.dictionary?.mess_success))
      .catch(() => alert("❌ " + data.dictionary?.mess_error));

    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <Container id="contact" maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        {data.dictionary?.header_contact}
      </Typography>
      <Grid container spacing={3}>
        {/* 📌 SECCIÓN DE DATOS DE CONTACTO */}
        <Grid item xs={12} sm={6}>
          {editMode ? (
            <>
              <TextField
                fullWidth
                label={data.dictionary?.email}
                name="email"
                value={contactData.email}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={data.dictionary?.phone}
                name="phone"
                value={contactData.phone}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label={data.dictionary?.address}
                name="address"
                value={contactData.address}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" color="primary" onClick={handleSaveClick}>
                {data.dictionary?.save}
              </Button>
            </>
          ) : (
            <>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <Email sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="body1">{contactData.email}</Typography>
              </Box>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <Phone sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="body1">{contactData.phone}</Typography>
              </Box>
              <Box display="flex" alignItems="center" sx={{ mb: 2 }}>
                <LocationOn sx={{ mr: 1, color: "primary.main" }} />
                <Typography variant="body1">{contactData.address}</Typography>
              </Box>
              {user && (
              <Button variant="outlined" color="primary" onClick={handleEditClick}>
                {data.dictionary?.edit}
              </Button>
              )}
            </>
          )}
        </Grid>

        {/* 📌 FORMULARIO DE ENVÍO DE MENSAJES CON GOOGLE FORMS */}
        <Grid item xs={12} sm={6}>
          <Typography variant="h6" gutterBottom>
            {data.dictionary?.send_message}
          </Typography>
          <form onSubmit={handleSendMessage}>
            <TextField
              fullWidth
              label={data.dictionary?.your_name}
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              variant="outlined"
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label={data.dictionary?.your_email}
              name="email"
              type="email"
              value={formData.email}
              onChange={handleFormChange}
              variant="outlined"
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label={data.dictionary?.message}
              name="message"
              value={formData.message}
              onChange={handleFormChange}
              multiline
              rows={4}
              variant="outlined"
              sx={{ mb: 2 }}
              required
            />
            <Button variant="contained" color="primary" type="submit" fullWidth>
              {data.dictionary?.send_button}
            </Button>
          </form>
        </Grid>
      </Grid>
    </Container>
  );
}
