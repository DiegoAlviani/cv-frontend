import React, { useState, useEffect, useRef  } from "react";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, DoughnutController, ArcElement } from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { Box } from "@mui/material";
import { Edit as EditIcon, ArrowUpward, ArrowDownward } from "@mui/icons-material";
import { FormControl, InputLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material";  // Asegúrate de importar estos componentes
import { useAuth } from "../context/AuthContext";
import { 
  Card, CardContent, Button, TextField, Table, TableHead, TableRow, TableCell, TableBody, Typography, 
  Container, MenuItem, Select, IconButton, Tooltip, Alert 
} from "@mui/material";
import { API } from "../config"; // al inicio del archivo
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; 
import DeleteIcon from "@mui/icons-material/Delete"; 
import "chart.js/auto";

// Registra los componentes necesarios de Chart.js
ChartJS.register(BarElement, CategoryScale, LinearScale, DoughnutController, ArcElement);

export default function ExpenseTracker() {
  // Estados para manejar la edición de gastos
  const [editIndex, setEditIndex] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [expenseCurrency, setExpenseCurrency] = useState("EUR");
  const { user } = useAuth(); // 🔐 Verifica si estás logueado

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [expenses, setExpenses] = useState([]); // 🔹 Inicialización correcta
  const chartRef = useRef(null);

  // Obtiene la fecha actual y el mes/año actual
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString("default", { month: "long" }); 
  const currentYear = currentDate.getFullYear();

  // Categorías de gastos predefinidas
  const categories = ["Alimentazione", "Affitto", "Prestiti", "Formazione", "Trasporto", "Intrattenimento", "Salute", "Altro"];
  // Función para cargar datos desde localStorage
  const loadFromLocalStorage = (key, defaultValue) => {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : defaultValue;
  };
    // Estados para manejar el mes y año seleccionados, ingresos, gastos, etc.
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [income, setIncome] = useState(loadFromLocalStorage("income", 0));
    const [currency, setCurrency] = useState("EUR"); // Estado para la moneda
  
  
    const [archivedExpenses, setArchivedExpenses] = useState(loadFromLocalStorage("archivedExpenses", []));
    const [expenseName, setExpenseName] = useState("");
    const [expenseCategory, setExpenseCategory] = useState("");
    const [expenseAmount, setExpenseAmount] = useState("");
    const [filterCategory, setFilterCategory] = useState("Todas");
    const [editIncomeMode, setEditIncomeMode] = useState(false);
    const [newIncome, setNewIncome] = useState({ amount: "", currency: "EUR" });
    const [hiddenCategories, setHiddenCategories] = useState([]);


 // Función para editar un gasto existente
 const editExpense = (index) => {
  const expense = expenses[index]; // Accede directamente desde `expenses`
  if (!expense) return;

  setEditIndex(index);
  setEditName(expense.name);
  setEditCategory(expense.category);
  setEditAmount(Math.round(expense.amount));
  setExpenseCurrency(expense.currency || "EUR"); // 🔹 Asegura que la moneda se inicialice correctamente
};

// Función para guardar los cambios de un gasto editado
const saveEditedExpense = () => {
  if (editIndex !== null) {
    const updatedExpenses = expenses.map((exp, idx) =>
      idx === editIndex
        ? { ...exp, name: editName, category: editCategory, amount: parseFloat(editAmount), currency: expenseCurrency }
        : exp
    );

    setExpenses(updatedExpenses);
    localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

    setEditIndex(null);
    setEditName("");
    setEditCategory("");
    setEditAmount("");
    setExpenseCurrency("EUR"); // 🔹 Resetea la moneda al valor por defecto
  }
};
// Función para tasas de conversiones
const [exchangeRates, setExchangeRates] = useState({
MXN: 1, // Valor predeterminado (se actualizará con `useEffect`)
USD: 1, // Valor predeterminado
EUR: 1, // Euro siempre es 1
});

// 🔹 Mapeo de nombres de meses en español e italiano a formato `MM`
const monthMap = {
  // 🔹 Español
  enero: "01", febrero: "02",  abril: "04",
  mayo: "05", junio: "06", julio: "07", 
  septiembre: "09", octubre: "10", noviembre: "11", 

  // 🔹 Italiano
  gennaio: "01", febbraio: "02", marzo: "03", aprile: "04",
  maggio: "05", giugno: "06", luglio: "07", agosto: "08",
  settembre: "09", ottobre: "10", novembre: "11", dicembre: "12",

  // 🔹 Inglés
  january: "01", february: "02", march: "03", april: "04",
  may: "05", june: "06", july: "07", august: "08",
  september: "09", october: "10", november: "11", december: "12"
};

  
// Filtra los gastos según la categoría seleccionada antes de ordenarlos
const filteredExpenses = expenses.filter(exp => {
  return filterCategory === "Todas" || exp.category === filterCategory;
});

// Función para manejar el ordenamiento
const handleSort = (key) => {
  setSortConfig((prevConfig) => ({
    key,
    direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
  }));
};

// Ordenar los gastos antes de renderizarlos en la tabla
const sortedExpenses = [...filteredExpenses].sort((a, b) => {
  if (!sortConfig.key) return 0; // Si no hay una clave de ordenación, no hacemos nada

  const valueA = a[sortConfig.key];
  const valueB = b[sortConfig.key];

  if (typeof valueA === "number" && typeof valueB === "number") {
    return sortConfig.direction === "asc" ? valueA - valueB : valueB - valueA;
  }

  if (typeof valueA === "string" && typeof valueB === "string") {
    return sortConfig.direction === "asc"
      ? valueA.localeCompare(valueB)
      : valueB.localeCompare(valueA);
  }

  return 0;
});
const formattedMonth = monthMap[selectedMonth.toLowerCase()] || selectedMonth;

  // Efecto para guardar los datos en localStorage cuando cambian
useEffect(() => {
  /** ───────────────────────────────────────────────
   * 📌 1️⃣ Función para obtener datos financieros (ingresos y gastos)
   * ─────────────────────────────────────────────── */
  const fetchFinanceData = async () => {
    try {
      const monthNumber = new Date(Date.parse(`${selectedMonth} 1, ${selectedYear}`)).getMonth() + 1;

      console.log(`📡 Fetching data from: ${API.FINANCE}/${formattedMonth}/${selectedYear}`);
      const response = await fetch(`${API.FINANCE}/${formattedMonth}/${selectedYear}`);

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`⚠️ No hay datos para ${selectedMonth} ${selectedYear}, mostrando valores vacíos.`);
          setIncome({ amount: 0, currency: "EUR" });
          setExpenses([]);
          return;
        }
        throw new Error("Error al obtener los datos del backend");
      }

      const data = await response.json();
      console.log("📊 Datos recibidos del backend:", data);

      setIncome(data.income ?? { amount: 0, currency: "EUR" }); // ✅ Manejo correcto del income
      setCurrency(data.income?.currency ?? "EUR"); // ✅ Asegura que currency siempre tenga un valor
      setExpenses(data.expenses ?? []);

    } catch (error) {
      console.error("❌ Error al obtener los datos financieros:", error);
      setIncome({ amount: 0, currency: "EUR" });
      setCurrency("EUR");
      setExpenses([]);
    }
  };

  /** ───────────────────────────────────────────────
   * 💱 2️⃣ Función para obtener tasas de cambio desde el backend
   * ─────────────────────────────────────────────── */
  const fetchExchangeRates = async () => {
    try {
      const response = await fetch(`${API.EXCHANGE_RATES}`);
      if (!response.ok) {
        throw new Error("Error al obtener las tasas de cambio del backend");
      }

      const data = await response.json();
      //console.log("📊 Tasas de cambio obtenidas:", data.rates);

      // 🔹 Extraemos solo las tasas de MXN y USD, asegurando que EUR sea 1
      const mxnToEur = data.rates.MXN ? (1 / data.rates.MXN) : 1;
      const usdToEur = data.rates.USD ? (1 / data.rates.USD) : 1;

      //console.log(`💱 1 MXN = ${mxnToEur.toFixed(6)} EUR`);
      //console.log(`💱 1 USD = ${usdToEur.toFixed(6)} EUR`);

      setExchangeRates({
        MXN: mxnToEur, // Conversión 1 MXN a EUR
        USD: usdToEur, // Conversión 1 USD a EUR
        EUR: 1,        // EUR siempre es 1
      });

    } catch (error) {
      console.error("❌ Error al obtener tasas de cambio:", error);
    }
  };

  /** ───────────────────────────────────────────────
   * 🚀 3️⃣ Ejecutamos ambas funciones en paralelo
   * ─────────────────────────────────────────────── */
  fetchFinanceData();
  fetchExchangeRates();

}, [selectedMonth, selectedYear]); // 🔄 Se ejecuta cuando cambian el mes o el año

useEffect(() => {
  const checkMonthChangeAndMovePendingExpenses = async () => {
    const today = new Date(); // ⚠️ RECUERDA VOLVER A NEW Date() CUANDO TERMINES
    const currentMonth = today.toLocaleString("default", { month: "long" }).toLowerCase();
    const currentYear = today.getFullYear(); 
    
    // 🔹 Obtener el último mes registrado en localStorage
    const lastCheckedMonth = localStorage.getItem("lastCheckedMonth");
    const lastCheckedYear = localStorage.getItem("lastCheckedYear");

    // 🔹 Si el mes cambió, migrar los gastos pendientes
    if (lastCheckedMonth !== currentMonth || lastCheckedYear !== `${currentYear}`) {
      console.log("🔄 Se detectó un cambio de mes. Migrando gastos pendientes...");
      
      try {
        const response = await fetch(`${API.FINANCE}/${currentMonth}/${currentYear}/migrate-expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          throw new Error("Error al migrar los gastos pendientes al nuevo mes");
        }

        console.log("✅ Gastos pendientes migrados al nuevo mes.");

        // 🔹 Guardar el nuevo mes y año en localStorage para futuras comparaciones
        localStorage.setItem("lastCheckedMonth", currentMonth);
        localStorage.setItem("lastCheckedYear", `${currentYear}`);

      } catch (error) {
        console.error("❌ Error al mover los gastos pendientes:", error);
      }
    }
  };

  checkMonthChangeAndMovePendingExpenses();
}, []); // 🔄 Se ejecuta solo una vez al cargar la aplicación

  
  

// 🔹 Función para añadir un nuevo gasto al backend
const addExpense = async () => {
  if (!expenseName || !expenseAmount || !expenseCategory) {
    alert("Compilare tutti i campi.");
    return;
  }

  const newExpense = {
    name: expenseName,
    category: expenseCategory,
    amount: parseFloat(expenseAmount),
    currency: expenseCurrency, // 🔹 Asegura que se envía la moneda seleccionada
    status: "pending"
  };

  try {
    console.log(`📡 Fetching data from: ${API.FINANCE}/${formattedMonth}/${selectedYear}/expenses`);
    const response = await fetch(`${API.FINANCE}/${formattedMonth}/${selectedYear}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newExpense)
    });

    if (!response.ok) {
      throw new Error("Error al añadir el gasto en el backend");
    }

    const data = await response.json();
    console.log("✅ Gasto agregado en el backend:", data.newExpense);

    // 🔹 Actualizamos la lista de gastos con el nuevo gasto
    setExpenses([...expenses, data.newExpense]);

    // 🔹 Reseteamos los campos del formulario
    setExpenseName("");
    setExpenseCategory("");
    setExpenseAmount("");
    setExpenseCurrency("EUR");

  } catch (error) {
    console.error("❌ Error al añadir el gasto:", error);
  }
};


  // Función para marcar un gasto como liquidado
  const markAsPaid = async (expenseId) => {
    try {
      const expenseToUpdate = expenses.find(exp => exp.id === expenseId);
      if (!expenseToUpdate) {
        console.error("❌ Error: No se encontró el gasto con el ID proporcionado.");
        return;
      }
  
      const newStatus = expenseToUpdate.status === "pending" ? "paid" : "pending";
  
      // 🔹 Mensaje de confirmación
      if (!window.confirm(`È sicuro di dover segnare questa spesa come ${newStatus}?`)) {
        return;
      }
  
      const response = await fetch(`${API.FINANCE}/${formattedMonth}/${selectedYear}/expenses/${expenseId}`, 
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
  
      if (!response.ok) {
        throw new Error("Error al actualizar el estado del gasto en el backend");
      }
  
      console.log(`✅ Gasto ${expenseId} actualizado a estado: ${newStatus}`);
  
      // 🔄 Actualizar el estado localmente
      setExpenses((prevExpenses) =>
        prevExpenses.map((exp) =>
          exp.id === expenseId ? { ...exp, status: newStatus } : exp
        )
      );
  
    } catch (error) {
      console.error("❌ Error al cambiar el estado del gasto:", error);
    }
  };

  // Función para eliminar un gasto 
  const deleteExpense = async (expenseId) => {
    // 🔹 Mensaje de confirmación
    if (!window.confirm("È sicuro di voler eliminare questa spesa? Questa azione non può essere annullata.")) {
      return;
    }
  
    try {
      const response = await fetch(`${API.FINANCE}/${formattedMonth}/${selectedYear}/expenses/${expenseId}`,
        { method: "DELETE" }
      );
  
      if (!response.ok) {
        throw new Error("Error al eliminar el gasto en el backend");
      }
  
      console.log(`✅ Gasto ${expenseId} eliminado del backend`);
  
      // 🔄 Actualizar el estado localmente eliminando el gasto
      setExpenses((prevExpenses) => prevExpenses.filter((exp) => exp.id !== expenseId));
  
    } catch (error) {
      console.error("❌ Error al eliminar el gasto:", error);
    }
  };
  
  // Filtra los gastos archivados según el mes y año seleccionados
  const filteredArchivedExpenses = archivedExpenses.filter(exp => exp.date === `${selectedMonth} ${selectedYear}`);

  // Calcula el total de gastos y el saldo restante
  const totalExpenses = filteredExpenses.reduce((acc, exp) => {
    const exchangeRate = exchangeRates[exp.currency] || 1; // 🔹 Obtiene la tasa de conversión
    return acc + (exp.amount * exchangeRate); // 🔹 Convierte el monto antes de sumarlo
  }, 0);
  // 🔹 Redondeamos el total para evitar decimales innecesarios
const formattedTotalExpenses = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: true
}).format(totalExpenses);

// 🔹 Convertimos también el ingreso total a EUR
const convertedIncome = (income.amount || 0) * (exchangeRates[income.currency] || 1);
const formattedRemaining = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: true
}).format(convertedIncome - totalExpenses);
  const remaining = (income?.amount || 0) - totalExpenses;
  

// 🔹 Agrupa los gastos por categoría y convierte los valores a EUR
const expensesByCategory = expenses.reduce((acc, exp) => {
  const exchangeRate = exchangeRates[exp.currency] || 1; // 🔹 Obtener tasa de conversión
  const amountInEUR = exp.amount * exchangeRate; // 🔹 Convertir a EUR solo para el gráfico
  const categoryKey = `${exp.category}_${exp.currency}`; // 🔹 Mantener la moneda original en la clave
  

  if (!acc[categoryKey]) {
    acc[categoryKey] = 0; // 🔹 Inicializamos la categoría
  }

  acc[categoryKey] += amountInEUR; // 🔹 Acumulamos en EUR para la visualización correcta

  return acc;
}, {});

const labels = Object.keys(expensesByCategory);
const dataValues = Object.values(expensesByCategory);
const backgroundColors = [
  "#ff0000", // Rojo
  "#6e00ff", // Violeta
  "#ffbc00", // Naranja fuerte
  "#004fff", // Azul fuerte
  "#85ff00", // Verde limón
  "#ff00d4", // Fucsia
  "#00ff37", // Verde esmeralda
  "#ff0018",  // Rojo cereza
  "#00fff3" // Cian
];

// Aplicar filtro según hiddenCategories
const visibleLabels = labels.filter((label) => !hiddenCategories.includes(label));
const visibleData = labels.map((label, i) =>
  !hiddenCategories.includes(label) ? dataValues[i] : null
);
const visibleColors = labels.map((_, i) =>
  !hiddenCategories.includes(labels[i]) ? backgroundColors[i % backgroundColors.length] : null
);
const filteredPieChartData = {
  labels: visibleLabels,
  datasets: [
    {
      label: "Spese per Categoria",
      data: visibleData.filter((v) => v !== null),
      backgroundColor: visibleColors.filter((c) => c !== null)
    }
  ]
};


const visibleTotal = labels.reduce((sum, label, i) => {
  if (hiddenCategories.includes(label)) return sum;
  return sum + dataValues[i];
}, 0);

const visibleRemaining = convertedIncome - visibleTotal;

const formattedVisibleTotal = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: true
}).format(visibleTotal);

const formattedVisibleRemaining = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
  useGrouping: true
}).format(visibleRemaining);


// 🔹 Opciones del gráfico de pastel
const pieChartOptions = {
  animation: {
    animateRotate: true,
    animateScale: true,
    duration: 1200,
    easing: "easeOutBounce" // Puedes probar: "easeInOutQuad", "easeOutCirc", etc.
  },
  plugins: {
    tooltip: {
      callbacks: {
        label: function (tooltipItem) {
          const categoryKey = tooltipItem.label;
          if (!expensesByCategory[categoryKey]) return "";
          const amountInEUR = expensesByCategory[categoryKey];
          const currency = categoryKey.split("_")[1];
          const categoryName = categoryKey.split("_")[0];

          const matchingExpenses = expenses.filter(
            (exp) => exp.category === categoryName && exp.currency === currency
          );

          const originalAmount = matchingExpenses.reduce(
            (sum, exp) => sum + parseFloat(exp.amount || 0),
            0
          );

          const formattedEUR = `💶 ${new Intl.NumberFormat("es-ES", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            useGrouping: true
          }).format(amountInEUR)} €`;

          const formattedOriginal = currency === "MXN"
            ? `🟢 ${new Intl.NumberFormat("es-ES", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
                useGrouping: true
              }).format(originalAmount)} MXN`
            : "";

          return `${categoryName}: ${formattedEUR} ${formattedOriginal ? `(${formattedOriginal})` : ""}`;
        }
      }
    },
    legend: {
      display: false
    }
  }
};







// 🔹 Filtrar valores válidos (>0) para evitar segmentos invisibles en el gráfico
const validLabels = labels.filter((_, index) => dataValues[index] > 0);
const validData = dataValues.filter(value => value > 0);

// 🔹 Configuración del gráfico de pastel
const pieChartData = {
  labels: Object.keys(expensesByCategory),
  datasets: [
    {
      label: "Spese per Categoria",
      data: dataValues,
      backgroundColor: labels.map((_, i) => {
        const step = Math.floor(backgroundColors.length / labels.length);
        return backgroundColors[(i * step) % backgroundColors.length];
      }),
    },
  ],
};
 
  return (
    <>
{/* Modal para editar gasto */}
{editIndex !== null && (
  <Box
  sx={{
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: "800px",
    bgcolor: "background.default", // 🔹 Usa el fondo general del tema
    color: "text.primary",
    p: 3,
    boxShadow: 3,
    borderRadius: 2,
    maxHeight: "90vh",
    overflowY: "auto",
    zIndex: 1300,
    backgroundColor: (theme) => theme.palette.mode === "dark" ? "#121212" : "#fff", // 🔹 Fallback para fondo oscuro
  }}
>

    <Typography variant="h6" sx={{ mb: 2 }}>Modifica Spesa</Typography>

    {/* Nombre del gasto */}
    <TextField
      fullWidth
      label="Nome"
      value={editName}
      onChange={(e) => setEditName(e.target.value)}
      sx={{ mb: 2 }}
      error={!editName} // 🔹 Muestra error si el campo está vacío
      helperText={!editName ? "Questo campo è obbligatorio." : ""}
    />

    {/* Categoría del gasto */}
    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }} error={!editCategory}>
      <InputLabel>Categoria</InputLabel>
      <Select
        value={editCategory}
        onChange={(e) => setEditCategory(e.target.value)}
        label="Categoria"
      >
        {categories.map((cat, i) => (
          <MenuItem key={i} value={cat}>
            {cat}
          </MenuItem>
        ))}
      </Select>
      {!editCategory && <Typography sx={{ color: "red", fontSize: "0.75rem", mt: 0.5 }}>Questo campo è obbligatorio.</Typography>}
    </FormControl>

    {/* Moneda del gasto */}
    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }} error={!expenseCurrency}>
      <InputLabel id="currency-label">Valuta</InputLabel>
      <Select
        labelId="currency-label"
        value={expenseCurrency}
        onChange={(e) => setExpenseCurrency(e.target.value)}
        label="Moneda"
      >
        <MenuItem value="EUR">€ - Euro</MenuItem>
        <MenuItem value="MXN">MX$ - Peso Messicano</MenuItem>
      </Select>
      {!expenseCurrency && <Typography sx={{ color: "red", fontSize: "0.75rem", mt: 0.5 }}>Questo campo è obbligatorio.</Typography>}
    </FormControl>

    {/* Monto del gasto */}
    <TextField
      fullWidth
      type="text" // ✅ Control total del input
      label="Importo"
      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }} // ✅ Teclado numérico sin permitir letras ni símbolos
      value={editAmount}
      onChange={(e) => {
        const value = e.target.value;
        // ✅ Solo números enteros, sin punto ni coma
        if (/^\d*$/.test(value)) {
          setEditAmount(value);
        }
      }}
      sx={{ mb: 2 }}
      error={!editAmount || parseInt(editAmount) <= 0}
      helperText={!editAmount || parseInt(editAmount) <= 0 ? "Inserire un importo valido." : ""}
    />


    {/* Botones de acción */}
    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", mt: 2 }}>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mr: 1 }}
        onClick={async () => {
          if (!editName || !editCategory || !expenseCurrency || !editAmount || parseFloat(editAmount) <= 0) {
            console.error("❌ Errore: Tutti i campi sono obbligatori.");
            return;
          }

          const expenseId = expenses[editIndex]?.id;
          if (!expenseId) {
            console.error("❌ Error: El gasto seleccionado no tiene un ID válido.");
            return;
          }

          try {
            const response = await fetch(
              `${API.FINANCE}/${formattedMonth}/${selectedYear}/expenses/${expenseId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: editName,
                  category: editCategory,
                  amount: parseFloat(editAmount),
                  currency: expenseCurrency,
                  status: "pending"
                }),
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || "Error al actualizar el gasto en el backend");
            }

            const data = await response.json();
            console.log("✅ Gasto actualizado en el backend:", data);

            // 🔄 Actualizar la lista de gastos en la UI
            setExpenses((prevExpenses) =>
              prevExpenses.map((exp) =>
                exp.id === expenseId
                  ? {
                      ...exp,
                      name: editName,
                      category: editCategory,
                      amount: parseFloat(editAmount),
                      currency: expenseCurrency,
                    }
                  : exp
              )
            );

            // 🔄 Cerrar el formulario de edición
            setEditIndex(null);
            setEditName("");
            setEditCategory("");
            setEditAmount("");
          } catch (error) {
            console.error("❌ Error al actualizar el gasto:", error);
          }
        }}
      >
        Salva
      </Button>

      <Button
        variant="outlined"
        color="error"
        fullWidth
        sx={{ ml: 1 }}
        onClick={() => setEditIndex(null)}
      >
        Annulla
      </Button>
    </Box>
  </Box>
)}



      <Container id="expense-tracker" maxWidth="sm" sx={{ mt: 4 }}>
      <Card variant="outlined" sx={{ textAlign: "center", mb: 3 }}>
  <CardContent>
    {/* 🔹 Título principal */}
    <Typography variant="h5" sx={{ mb: 3 }} gutterBottom>
    Controllo delle Spese - {selectedMonth} {selectedYear}
    </Typography>

    {/* 🔹 Alerta si los gastos superan los ingresos */}
    {totalExpenses > income.amount && (
      <Alert severity="error" sx={{ mb: 2 }}>
      Attenzione! Questo mese hai speso più di quanto hai guadagnato.
      </Alert>
    )}

    {/* 🔹 Entrada Mensual */}
    <Typography variant="h6">💰 Ingresso Mensile</Typography>

    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 2 }}>
      {/* 🔹 Muestra la entrada mensual si existe */}
      {income.amount > 0 ? (
        <Typography variant="h5" sx={{ color: "primary.main" }}>
          {new Intl.NumberFormat("es-ES", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            useGrouping: true
          }).format(income.amount)} {income.currency === "MXN" ? "MX$" : "€"}
        </Typography>
      ) : (
        <Typography variant="body1" sx={{ color: "gray" }}>
          Non è stato definito un ingresso mensile per {selectedMonth} {selectedYear}.
        </Typography>
      )}

      {/* 🔹 Formulario para editar o añadir la entrada mensual */}
      {editIncomeMode ? (
        <Box
          sx={{
            width: 320,
            bgcolor: "background.paper",
            color: "text.primary",
            p: 3,
            boxShadow: 3,
            borderRadius: 2,
            zIndex: 1300
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            {income.amount === 0 ? "Aggiungi voce mensile" : "Modifica voce mensile"}
          </Typography>

          <TextField
            fullWidth
            type="text"
            label="Ingresso (€)"
            value={newIncome.amount}
            inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || /^\d*$/.test(value)) {
                setNewIncome({ ...newIncome, amount: value }); // ✅ permite borrar y escribir libre
              }
            }}
            error={!newIncome.amount || parseInt(newIncome.amount) <= 0}
            helperText={!newIncome.amount || parseInt(newIncome.amount) <= 0 ? "Inserire un importo valido." : ""}
          />

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 1 }}
            onClick={async () => {
              try {
                const response = await fetch(
                  `${API.FINANCE}/${formattedMonth}/${selectedYear}/income`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount: newIncome.amount, currency: newIncome.currency }),
                  }
                );

                if (!response.ok) {
                  throw new Error("Error al actualizar la entrada mensual en el backend");
                }

                const data = await response.json();
                console.log("✅ Entrada mensual actualizada en el backend:", data);

                // 🔹 Actualiza el estado con los datos del backend
                setIncome({ amount: newIncome.amount, currency: newIncome.currency }); 
                setEditIncomeMode(false);
                
              } catch (error) {
                console.error("❌ Error al actualizar la entrada mensual:", error);
              }
            }}
          >
            Salva
          </Button>



          <Button
            variant="outlined"
            color="error"
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => setEditIncomeMode(false)}
          >
            Annulla
          </Button>
        </Box>
      ) : (
        <>
          {/* 🔹 Botón para editar o añadir entrada */}
          {user && (
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2, width: "80%" }}
            onClick={() => {
              setNewIncome({
                amount: income?.amount > 0 ? String(Math.round(income.amount)) : "", // ✅ vacío si no hay ingreso, redondeado si lo hay
                currency: income?.currency || "EUR"
              });
              
              setEditIncomeMode(true);
            }}
          >
            {income.amount > 0 ? "Modificare Voce" : "Aggiungi Voce"}
          </Button>
          )}
          {/* 🔹 Botón para eliminar entrada */}
          {income.amount > 0 && !editIncomeMode && user && (
            <Button
              variant="contained"
              color="error"
              sx={{ mt: 2, width: "80%" }}
              onClick={async () => {
                if (!window.confirm("È sicuro di voler eliminare la voce d'ingresso mensile?")) return;
                

                try {
                  const response = await fetch(
                    `${API.FINANCE}/${formattedMonth}/${selectedYear}/income`,
                    {
                      method: "DELETE",
                    }
                  );

                  if (!response.ok) {
                    throw new Error("Error al eliminar la entrada mensual en el backend");
                  }

                  console.log("✅ Entrada mensual eliminada en el backend");
                  setIncome({ amount: 0, currency: "EUR" }); // 🔹 Se reinicia el ingreso en la UI
                } catch (error) {
                  console.error("❌ Error al eliminar la entrada mensual:", error);
                }
              }}
            >
              Eliminare Voce
            </Button>
          )}

        </>
      )}
    </Box>

    {/* 🔹 Selección de Mes y Año */}
    <Box sx={{ display: "flex", justifyContent: "center", gap: "10px", mt: 4, mb: 2 }}>
      <FormControl variant="outlined">
        <InputLabel id="month-label">Mese</InputLabel>
        <Select
          labelId="month-label"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          label="Mese"
        >
          {Array.from({ length: 12 }, (_, i) => (
            <MenuItem key={i} value={new Date(0, i).toLocaleString("default", { month: "long" })}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl variant="outlined">
        <InputLabel id="year-label">Anno</InputLabel>
        <Select
          labelId="year-label"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          label="Anno"
        >
          {Array.from({ length: 5 }, (_, i) => (
            <MenuItem key={i} value={currentYear - i}>
              {currentYear - i}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>

    {/* 🔹 Formulario de Nuevo Gasto */}
    <TextField
      fullWidth
      label="Nome della spesa"
      sx={{ mb: 2 }}
      variant="outlined"
      margin="normal"
      value={expenseName}
      onChange={(e) => setExpenseName(e.target.value)}
    />

    <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
      <InputLabel id="category-label">Categoria</InputLabel>
      <Select
        labelId="category-label"
        value={expenseCategory}
        onChange={(e) => setExpenseCategory(e.target.value)}
        label="Categoria"
      >
        {categories.map((cat, i) => (
          <MenuItem key={i} value={cat}>
            {cat}
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    <TextField
      fullWidth
      type="text" // ✅ Usamos texto para controlar mejor la entrada
      label="Importo"
      variant="outlined"
      margin="normal"
      value={expenseAmount || ""}
      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }} // ✅ Solo enteros
      onChange={(e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value)) {
          setExpenseAmount(value); // Solo guarda si es un número entero
        }
      }}
    />

    {/* 🔹 Moneda del gasto (Radio Buttons) */}
    <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
      <Typography variant="subtitle1">Valuta</Typography>
      <RadioGroup row value={expenseCurrency} onChange={(e) => setExpenseCurrency(e.target.value)} sx={{ justifyContent: "center" }}>
        <FormControlLabel value="EUR" control={<Radio />} label="€ - Euro" />
        <FormControlLabel value="MXN" control={<Radio />} label="MX$ - Peso Messicano" />
      </RadioGroup>
    </FormControl>
    {user && (
    <Button variant="contained" color="primary" fullWidth onClick={addExpense} sx={{ mt: 2 }}>
    Aggiungi Spesa
    </Button>
    )}
  </CardContent>
</Card>


        {/* Lista de Gastos y Gráfico de Pastel */}
         <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" }, // 📱 column en mobile, 🖥️ row en desktop
              justifyContent: "center",
              alignItems: "flex-start",
              gap: 6,
              mt: 3,
              width: "100%",
            }}
          >
          {/* Lista de Gastos */}
          <Box sx={{ flex: 3 }}>
            <Typography variant="h6" sx={{ textAlign: "left" }}>
              📋 Elenco Spese
            </Typography>

                <Box sx={{ overflowX: "auto" }}>
                <Table sx={{ mt: 2, minWidth: 600 }}>
                <TableHead>
  <TableRow>
    <TableCell 
      onClick={() => handleSort("name")} 
      sx={{ cursor: "pointer", whiteSpace: "nowrap", textAlign: "center", fontSize: { xs: "0.8rem", md: "1rem" }, px: { xs: 0.5, md: 2 }, py: { xs: 0.5, md: 1 } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "left", gap: 1 }}>
        <strong>Nome</strong>
        {sortConfig.key === "name" && (sortConfig.direction === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
      </Box>
    </TableCell>

    <TableCell 
      onClick={() => handleSort("category")} 
      sx={{ cursor: "pointer", whiteSpace: "nowrap", textAlign: "center", fontSize: { xs: "0.8rem", md: "1rem" }, px: { xs: 0.5, md: 2 }, py: { xs: 0.5, md: 1 } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <strong>Categoria</strong>
        {sortConfig.key === "category" && (sortConfig.direction === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
      </Box>
    </TableCell>

    <TableCell 
      onClick={() => handleSort("amount")} 
      sx={{ cursor: "pointer", whiteSpace: "nowrap", textAlign: "center", fontSize: { xs: "0.8rem", md: "1rem" }, px: { xs: 0.5, md: 2 }, py: { xs: 0.5, md: 1 } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <strong>Importo (€)</strong>
        {sortConfig.key === "amount" && (sortConfig.direction === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
      </Box>
    </TableCell>

    <TableCell 
      onClick={() => handleSort("status")} 
      sx={{ cursor: "pointer", whiteSpace: "nowrap", textAlign: "center", fontSize: { xs: "0.8rem", md: "1rem" }, px: { xs: 0.5, md: 2 }, py: { xs: 0.5, md: 1 } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
        <strong>Stato</strong>
        {sortConfig.key === "status" && (sortConfig.direction === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)}
      </Box>
    </TableCell>
    {user && (
      <TableCell sx={{ textAlign: "center", whiteSpace: "nowrap", fontSize: { xs: "0.8rem", md: "1rem" }, px: { xs: 0.5, md: 2 }, py: { xs: 0.5, md: 1 } }}>
        <strong>Azioni</strong>
      </TableCell>
    )}
  </TableRow>
</TableHead>

<TableBody>
  {sortedExpenses.length > 0 ? (
    sortedExpenses.map((exp, index) => (
      <TableRow key={index}>
        <TableCell sx={{ fontSize: { xs: "0.8rem", md: "1rem" }, px: { xs: 0.5, md: 2 }, py: { xs: 0.5, md: 1 } }}>{exp.name}</TableCell>
        <TableCell sx={{ fontSize: { xs: "0.8rem", md: "1rem" }, px: { xs: 0.5, md: 2 }, py: { xs: 0.5, md: 1 } }}>{exp.category}</TableCell>
        <TableCell sx={{ fontSize: { xs: "0.8rem", md: "1rem" }, px: { xs: 0.5, md: 2 }, py: { xs: 0.5, md: 1 } }}>
          {new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: exp.currency || "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
            useGrouping: true,
          }).format(exp.amount)}
        </TableCell>
        <TableCell sx={{ fontSize: { xs: "0.8rem", md: "1rem" }, px: { xs: 0.5, md: 2 }, py: { xs: 0.5, md: 1 } }}>{exp.status}</TableCell>
        
        {user && (
        <TableCell sx={{ whiteSpace: "nowrap", px: { xs: 0.5, md: 2 }, py: { xs: 0.5, md: 1 } }}>
          {/* 🔧 Editar */}
          <Tooltip title="Modifica Spesa">
            <IconButton onClick={() => editExpense(index)}>
              <EditIcon color="primary" />
            </IconButton>
          </Tooltip>

          {/* 🔧 Marcar como pagado */}
          <Tooltip title={exp.status === "pending" ? "Segnare come liquidato" : "Segna come in attesa"}>
            <IconButton onClick={() => markAsPaid(exp.id)}>
              <CheckCircleIcon color={exp.status === "paid" ? "success" : "default"} />
            </IconButton>
          </Tooltip>

          {/* 🔧 Eliminar */}
          <Tooltip title="Eliminare">
            <IconButton onClick={() => deleteExpense(exp.id)}>
              <DeleteIcon color="error" />
            </IconButton>
          </Tooltip>
        </TableCell>
      )}
      </TableRow>
    ))
  ) : (
    <TableRow>
      <TableCell colSpan={6} sx={{ textAlign: "center", fontStyle: "italic", color: "gray", fontSize: { xs: "0.8rem", md: "1rem" }, px: { xs: 0.5, md: 2 }, py: { xs: 1, md: 2 } }}>
        Non ci sono registrazioni di spesa per {selectedMonth} {selectedYear}.
      </TableCell>
    </TableRow>
  )}
</TableBody>

                  </Table>
                  </Box>
          </Box>

          {/* Gráfico de pastel */}
          <Box sx={{ flex: 3, textAlign: "center" }}>
          <Typography variant="h6">🥧 Distribuzione delle Spese</Typography>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            {filteredExpenses.length > 0 ? (
              <div style={{ width: "100%", maxWidth: "500px", height: "auto" }}>
                <Doughnut ref={chartRef} data={filteredPieChartData} options={pieChartOptions} />
                <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2 }}>
                  {labels.map((label, i) => {
                    const isHidden = hiddenCategories.includes(label);
                    return (
                      <Box
                        key={i}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          cursor: "pointer",
                          opacity: isHidden ? 0.5 : 1
                        }}
                        onClick={() => {
                          const updatedHidden = isHidden
                            ? hiddenCategories.filter((cat) => cat !== label)
                            : [...hiddenCategories, label];
                        
                          setHiddenCategories(updatedHidden);
                        
                          // 🔄 Fuerza la actualización con animación
                          setTimeout(() => {
                            if (chartRef.current) {
                              chartRef.current.update(); // Re-renderiza con transición
                            }
                          }, 100);
                        }}
                      >
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: "50%",
                            backgroundColor: backgroundColors[i % backgroundColors.length],
                            border: "1px solid #ccc"
                          }}
                        />
                        <Typography
                        variant="body2"
                        sx={{
                          textDecoration: isHidden ? "line-through" : "none",
                          opacity: isHidden ? 0.5 : 1
                        }}
                      >
                        {label.split("_")[0]} ({label.split("_")[1]})
                      </Typography>

                      </Box>
                    );
                  })}
                </Box>

              </div>
            ) : (
              <Typography sx={{ color: "gray", fontStyle: "italic", mt: 2 }}>
                Non sono disponibili dati per la visualizzazione del grafico.
              </Typography>
            )}
          </Box>

            {/* Total Gastado y Restante */}
            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "error.main" }}>
              Totale speso:  {formattedVisibleTotal} €
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: remaining < 0 ? "error.main" : "success.main" }}>
              Rimanente: {formattedVisibleRemaining} €
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}