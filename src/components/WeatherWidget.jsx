import { useEffect, useState } from "react";
import { Typography, Box } from "@mui/material";
import { useLanguage } from "../context/LanguageContext";

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const { language } = useLanguage();
  const API_KEY = import.meta.env.VITE_WEATHER_KEY;

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("GPS non supportato");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=${language}&appid=${API_KEY}`
        )
          .then((res) => res.json())
          .then((data) => {
            setWeather({
              city: data.name,
              temp: Math.round(data.main.temp),
              icon: data.weather[0].icon,
              desc: data.weather[0].description,
            });
          })
          .catch(() => setError("Errore caricando il meteo"));
      },
      () => setError("Posizione negata")
    );
  }, [language]);

  if (!weather || error) return null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <img
        src={`https://openweathermap.org/img/wn/${weather.icon}.png`}
        alt="weather icon"
        width={24}
        height={24}
      />
      <Typography variant="caption" sx={{ textTransform: "capitalize" }}>
        {weather.city} | {weather.temp}°C | {weather.desc}
      </Typography>
    </Box>
  );
}
