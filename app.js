const supabaseUrl = "https://npvjrqaqulsbqnatjnry.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdmpycWFxdWxzYnFuYXRqbnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzE3NjAsImV4cCI6MjA4ODkwNzc2MH0.AhDaYjaGuxXlicg5mDyql2EvHnVKwGAi-0SUCRxxufY";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

//LOGIN CON GOOGLE
const googleBtn = document.getElementById("google-login");

if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    console.log("Botón Google presionado");

    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) {
      console.error("Error Google login:", error.message);
      alert("Error al iniciar con Google: " + error.message);
    } else {
      console.log("Redirigiendo a Google...", data);
    }
  });
}

//CREAR CUENTA
const signupBtn = document.getElementById("signup-btn");

if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password
    });

    if (error) {
      alert("Error al crear cuenta: " + error.message);
      console.error(error);
    } else {
      alert("Cuenta creada con éxito. Revisa tu correo si te pide confirmación.");
      console.log("Cuenta creada:", data);
    }
  });
}

//INICIAR SESIÓN CON EMAIL
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      alert("Error al iniciar sesión: " + error.message);
      console.error("Login error:", error);
    } else {
      alert("Inicio de sesión exitoso");
      console.log("Usuario logueado:", data);

      window.location.href = "dashboard.html";
    }
  });
}