import { useEffect, useState } from "react";
import { Container, Typography, Card, CardContent, Grid, Box } from "@mui/material";
import { API } from "../config"; // ajusta la ruta si estás en otra carpeta
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useThemeMode } from "../context/ThemeContext";

export default function VisitorStats() {
  const [stats, setStats] = useState({ todayUsers: 0, countries: {}, locations: [] });
  const { darkMode } = useThemeMode();

  useEffect(() => {
    fetch(API.VISITOR_STATS)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .catch((err) => console.error("Error al obtener estadísticas de visitantes:", err));
  }, []);

  const countryList = Object.entries(stats.countries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5 países + ciudades

  // Función auxiliar para obtener emoji de país
  const getFlagEmoji = (countryCode) => {
    if (!countryCode) return "";
    return countryCode
      .toUpperCase()
      .replace(/./g, (char) =>
        String.fromCodePoint(127397 + char.charCodeAt())
      );
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h5" color="primary" gutterBottom>
        🌍 Estadísticas de Visitantes
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">👤 Usuarios que nos visitaron hoy</Typography>
              <Typography variant="h4" color="secondary" sx={{ mt: 1 }}>{stats.todayUsers}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">🌐 Países y ciudades más frecuentes</Typography>
              <Box sx={{ mt: 1 }}>
                {countryList.map(([location, count], index) => (
                  <Typography key={index} variant="body1">
                    {location}: {count} visitas
                  </Typography>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 🗺️ Mapa interactivo con Leaflet */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🗺️ Mapa de visitantes (por coordenadas geográficas)
              </Typography>
              <Box sx={{ height: "500px", width: "100%" }}>
                <MapContainer center={[20, 0]} zoom={2} style={{ height: "100%", width: "100%" }}>
                  <TileLayer
                    url={
                      darkMode
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    }
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  {stats.locations.map((loc, index) => {
                    const [lat, lng] = loc.loc.split(",").map(Number);
                    return (
                      <Marker key={index} position={[lat, lng]}>
                        <Popup>
                          <strong>{getFlagEmoji(loc.country)} {loc.city}, {loc.country}</strong><br />
                          👤 {loc.count} visita{loc.count > 1 ? 's' : ''}<br />
                          🗓️ Visita registrada
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
