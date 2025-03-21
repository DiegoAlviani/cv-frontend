import { createClient } from "@supabase/supabase-js";

// ⚡ Obtiene las credenciales desde el .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 🚨 Verifica si las variables están definidas
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("❌ ERROR: Supabase URL o API Key no están definidas.");
}

// ✅ Crea la conexión con Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
