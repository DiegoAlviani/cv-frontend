import { Container, Typography, Box, Link } from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";

export default function Footer() {
  return (
    <Box sx={{ bgcolor: "primary.main", color: "white", py: 0.3, mt: 5, textAlign: "center" }}>
      <Container>
        {/* 🔹 Cambiamos a flex para alinear texto e iconos en una sola línea */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
          <Typography variant="body2">
            © {new Date().getFullYear()} Diego Alviani | All Rights Reserved
          </Typography>
          {/* 🔹 Íconos alineados en la misma línea */}
          <Link href="https://github.com/diegoalviani" target="_blank" sx={{ color: "white" }}>
            <GitHubIcon />
          </Link>
          <Link href="https://linkedin.com/in/diego-alviani" target="_blank" sx={{ color: "white" }}>
            <LinkedInIcon />
          </Link>
        </Box>
      </Container>
    </Box>
  );
}
