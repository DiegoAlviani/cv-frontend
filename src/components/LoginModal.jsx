import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, TextField, Button, Typography, Box, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import supabase from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function LoginModal({ open, onClose }) {
    const { setUser } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        setError(null);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError("⚠️ Credenciales incorrectas");
            return;
        }

        setUser(data.user);
        onClose(); // Cerrar el modal al iniciar sesión correctamente
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>
                Iniciar Sesión
                <IconButton
                    sx={{ position: "absolute", right: 8, top: 8 }}
                    onClick={onClose}
                >
                    <Close />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    {error && <Typography color="error">{error}</Typography>}
                    
                    <TextField
                        label="Correo electrónico"
                        type="email"
                        fullWidth
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    
                    <TextField
                        label="Contraseña"
                        type="password"
                        fullWidth
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    
                    <Button variant="contained" color="primary" onClick={handleLogin} fullWidth>
                        Iniciar sesión
                    </Button>
                </Box>
            </DialogContent>
        </Dialog>
    );
}
