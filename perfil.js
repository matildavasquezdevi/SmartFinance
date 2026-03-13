const supabaseUrl = "https://npvjrqaqulsbqnatjnry.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdmpycWFxdWxzYnFuYXRqbnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzE3NjAsImV4cCI6MjA4ODkwNzc2MH0.AhDaYjaGuxXlicg5mDyql2EvHnVKwGAi-0SUCRxxufY";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

async function cargarPerfil() {
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser();

  if (userError || !user) {
    alert("No hay sesión iniciada");
    window.location.href = "login.html";
    return;
  }

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Error al cargar perfil:", error);
    return;
  }

  document.getElementById("profile-name").textContent = data.full_name || "No definido";
  document.getElementById("profile-birth").textContent = data.birth_date || "No definido";
  document.getElementById("profile-email").textContent = data.email || user.email;
  document.getElementById("profile-phone").textContent = data.phone || "No definido";
}

cargarPerfil();