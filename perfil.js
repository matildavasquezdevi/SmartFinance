const supabaseUrl = "https://npvjrqaqulsbqnatjnry.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdmpycWFxdWxzYnFuYXRqbnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzE3NjAsImV4cCI6MjA4ODkwNzc2MH0.AhDaYjaGuxXlicg5mDyql2EvHnVKwGAi-0SUCRxxufY";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let currentUser = null;

async function cargarPerfil(){

    const { data: { user } } = await supabaseClient.auth.getUser();

    if(!user){
        window.location.href = "login.html";
        return;
    }

    currentUser = user;

    /* CREAR PERFIL SI NO EXISTE */
    await supabaseClient
    .from("profiles")
    .upsert({
        id: user.id,
        email: user.email
    });

    /* OBTENER PERFIL */
    const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

    if(error){
        console.error(error);
        return;
    }

    /* MOSTRAR DATOS */
    const nombreCompleto =
    (data.name ? data.name : "") +
    (data.last_name ? " " + data.last_name : "");

    document.getElementById("profile-name").textContent =
    nombreCompleto || "Perfil incompleto";

    document.getElementById("profile-email").textContent =
    data.email;

    document.getElementById("profile-email-2").textContent =
    data.email;

    document.getElementById("profile-birth").textContent =
    data.birth_date || "No definida";

    document.getElementById("profile-phone").textContent =
    data.phone || "No definido";


    /* AVATAR */
    const avatar = document.getElementById("avatar");

    if(data.name){
        avatar.textContent = data.name.charAt(0).toUpperCase();
    } else {
        avatar.textContent = data.email.charAt(0).toUpperCase();
    }

    /* FORM */
    document.getElementById("email_profile").value = data.email;
    document.getElementById("name").value = data.name || "";
    document.getElementById("last_name").value = data.last_name || "";
    document.getElementById("birth_date").value = data.birth_date || "";
    document.getElementById("phone").value = data.phone || "";
}

/* MOSTRAR FORM */
document
.getElementById("edit-profile-btn")
.addEventListener("click", () => {
    document
    .getElementById("profile-form-section")
    .classList.remove("hidden");
});

/* GUARDAR PERFIL */
document
.getElementById("profile-form")
.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const last_name = document.getElementById("last_name").value;
    const birth_date = document.getElementById("birth_date").value;
    const phone = document.getElementById("phone").value;

    const { error } = await supabaseClient
    .from("profiles")
    .update({
    name,
    last_name,
    birth_date,
    phone
    })
    .eq("id", currentUser.id);

    if(error){
    alert("Error al guardar");
    console.error(error);
    return;
    }

    alert("Perfil actualizado");

    location.reload();
});

/* LOGOUT */
document
.getElementById("logout-btn")
.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
});


cargarPerfil();
