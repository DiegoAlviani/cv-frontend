import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import supabase from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function LogoutModal({ open, onClose }) {
  const { setUser } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>¿Cerrar sesión?</DialogTitle>
      <DialogContent>
        ¿Estás seguro de que quieres cerrar sesión?
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleLogout} color="error" variant="contained">
          Cerrar sesión
        </Button>
      </DialogActions>
    </Dialog>
  );
}
