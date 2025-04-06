// RecurringExpenses.jsx
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  MenuItem,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Delete,
  Edit,
  Save,
  Cancel,
  AttachMoney,
  Category,
  Label,
  Euro,
  Sort,
  FilterList,
} from "@mui/icons-material";
import categories from "../utils/categories";
import { useEffect } from "react";
import { API } from "../config";

  
const initialForm = {
  name: "",
  amount: "",
  category: "",
  currency: "EUR",
};

const RecurringExpenses = ({ recurringExpenses, setRecurringExpenses, refreshExpenses }) => {
  const [form, setForm] = useState(initialForm);
  const [editingIndex, setEditingIndex] = useState(null);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const [errorMessages, setErrorMessages] = useState([]);

  useEffect(() => {  
    fetchRecurringExpenses();
  }, []);

  const triggerRecurringMigration = async () => {
    try {
      const response = await fetch(`${API.FINANCE}/migrate-recurring-expenses`, {
        method: "POST",
      });
      if (!response.ok) {
        console.error("❌ No se pudo migrar gastos recurrentes automáticamente.");
      } else {
        console.log("✅ Verificación de gastos recurrentes ejecutada.");
      }
    } catch (error) {
      console.error("❌ Error al llamar al endpoint de migración recurrente:", error);
    }
  };
  
  
  const fetchRecurringExpenses = async () => {
    try {
      const response = await fetch(API.RECURRING_EXPENSES);
      const data = await response.json();
      setRecurringExpenses(data);
    } catch (error) {
      console.error("❌ Error al cargar gastos recurrentes:", error);
    }
  };
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    const errors = [];
    if (!form.name.trim()) errors.push("Nombre es obligatorio");
    if (!form.amount || parseFloat(form.amount) <= 0) errors.push("Cantidad debe ser mayor a 0");
    if (!form.category) errors.push("Categoría es obligatoria");
    if (!form.currency) errors.push("Moneda es obligatoria");
  
    if (errors.length > 0) {
      setErrorMessages(errors);
      setErrorDialogOpen(true);
      return;
    }
  
    if (editingIndex !== null) {
        try {
          const expenseToUpdate = recurringExpenses[editingIndex];
          const response = await fetch(`${API.RECURRING_EXPENSES}/${expenseToUpdate.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: form.name,
              amount: form.amount,
              category: form.category,
              currency: form.currency,
              due_day: 1,
              active: true
            })
          });
      
          if (response.ok) {
            await triggerRecurringMigration();  // <-- agrega esta línea aquí también
            await fetchRecurringExpenses(); // 🔄 Recargar lista completa
            await refreshExpenses(); // 🔄 ¡Actualiza la lista de gastos reales!
            setForm(initialForm);
            setEditingIndex(null);
          } else {
            throw new Error("❌ Error al actualizar en el backend");
          }
        } catch (error) {
          console.error(error.message);
        }
      } else {
      try {
        const response = await fetch(API.RECURRING_EXPENSES, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: form.name,
            amount: form.amount,
            category: form.category,
            currency: form.currency,
            due_day: 1, // Puedes ajustar esto después
            active: true
          })
        });
  
        if (response.ok) {
          const newExpense = await response.json();
          setRecurringExpenses((prev) => [...prev, newExpense]);
          await triggerRecurringMigration(); 
          await fetchRecurringExpenses();
          await refreshExpenses(); // 🔄 ¡Actualiza la lista de gastos reales!
          setForm(initialForm);
          setEditingIndex(null);

        } else {
          throw new Error("❌ Error al guardar en el backend");
        }
      } catch (error) {
        console.error(error.message);
      }
    }
  };
  
  
  

  const handleEdit = (index) => {
    setForm({
        name: recurringExpenses[index].title,
        amount: recurringExpenses[index].amount,
        category: recurringExpenses[index].category,
        currency: recurringExpenses[index].currency,
      });
    setEditingIndex(index);
  };

  const confirmDelete = async () => {
    try {
      const expenseToDelete = recurringExpenses[deleteIndex];
      const response = await fetch(`${API.RECURRING_EXPENSES}/${expenseToDelete.id}`, {
        method: "DELETE",
      });
  
      if (response.ok) {
        await fetchRecurringExpenses(); // 🔄 Recargar lista desde el backend
        await refreshExpenses(); // 🔄 ¡Actualiza la lista de gastos reales!
        setDeleteIndex(null);
      } else {
        throw new Error("❌ Error al eliminar en el backend");
      }
    } catch (error) {
      console.error(error.message);
    }
  };
  
  const handleCancel = () => {
    setForm(initialForm);
    setEditingIndex(null);
  };

  const filteredExpenses = recurringExpenses
  .filter((expense) =>
    expense &&
    typeof expense.title === "string" &&
    typeof expense.category === "string" &&
    (
      expense.title.toLowerCase().includes(filter.toLowerCase()) ||
      expense.category.toLowerCase().includes(filter.toLowerCase())
    )
  )
  .sort((a, b) => {
    if (!sortBy) return 0;
    const valueA = a[sortBy];
    const valueB = b[sortBy];
    if (sortDirection === "asc") return valueA > valueB ? 1 : -1;
    return valueA < valueB ? 1 : -1;
  });


  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Lista de Gastos Recurrentes
      </Typography>

      <Box display="flex" flexDirection="column" alignItems="center" gap={2} mb={2}>
        <TextField
          label="Nombre"
          name="name"
          value={form.name}
          onChange={handleChange}
          size="small"
          sx={{ width: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Label />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Cantidad"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          type="number"
          size="small"
          inputProps={{ min: 1 }}
          sx={{ width: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {form.currency === "MXN" ? <AttachMoney /> : <Euro />}
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Categoría"
          name="category"
          value={form.category}
          onChange={handleChange}
          size="small"
          sx={{ width: 260 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Category />
              </InputAdornment>
            ),
          }}
        >
          {categories.map((cat, index) => (
            <MenuItem key={index} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Moneda"
          name="currency"
          value={form.currency}
          onChange={handleChange}
          size="small"
          sx={{ width: 260 }}
        >
        <MenuItem value="EUR">€ - Euro</MenuItem>
        <MenuItem value="MXN">MX$ - Peso Mexicano</MenuItem>
        </TextField>

        <Box display="flex" justifyContent="center" gap={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            startIcon={<Save />}
          >
            {editingIndex !== null ? "Guardar" : "Añadir"}
          </Button>
          {editingIndex !== null && (
            <Button variant="outlined" onClick={handleCancel} startIcon={<Cancel />}>
              Cancelar
            </Button>
          )}
        </Box>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <TextField
          size="small"
          placeholder="Filtrar por nombre o categoría"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <FilterList />
              </InputAdornment>
            ),
          }}
          sx={{ width: 260 }}
        />
        <Box display="flex" gap={1}>
          <Button onClick={() => toggleSort("name")} startIcon={<Sort />}>
            Nombre
          </Button>
          <Button onClick={() => toggleSort("amount")} startIcon={<Sort />}>
            Cantidad
          </Button>
          <Button onClick={() => toggleSort("category")} startIcon={<Sort />}>
            Categoría
          </Button>
          <Button onClick={() => toggleSort("currency")} startIcon={<Sort />}>
            Moneda
          </Button>
        </Box>
      </Box>

      <List dense>
        {filteredExpenses.map((expense, index) => (
          <div key={index}>
            <ListItem>
              <ListItemText
                primary={`${expense.title} - ${expense.amount} ${expense.currency}`}
                secondary={expense.category}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => handleEdit(index)} title="Editar">
                  <Edit />
                </IconButton>
                <IconButton edge="end" onClick={() => setDeleteIndex(index)} title="Eliminar">
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </div>
        ))}
      </List>

      {/* Modal de error */}
      <Dialog open={errorDialogOpen} onClose={() => setErrorDialogOpen(false)}>
        <DialogTitle>Campos incompletos</DialogTitle>
        <DialogContent>
            {errorMessages.map((msg, i) => (
            <Typography key={i} color="error" variant="body2" sx={{ mb: 0.5 }}>
                • {msg}
            </Typography>
            ))}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setErrorDialogOpen(false)} autoFocus>
            Aceptar
            </Button>
        </DialogActions>
        </Dialog>

      {/* Confirmación de eliminación */}
      <Dialog open={deleteIndex !== null} onClose={() => setDeleteIndex(null)}>
        <DialogTitle>¿Eliminar gasto recurrente?</DialogTitle>
        <DialogContent>
          Esta acción no se puede deshacer. ¿Estás seguro que quieres eliminarlo?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteIndex(null)}>Cancelar</Button>
          <Button onClick={confirmDelete} color="error">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default RecurringExpenses;