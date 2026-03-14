const supabaseUrl = "https://npvjrqaqulsbqnatjnry.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wdmpycWFxdWxzYnFuYXRqbnJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMzE3NjAsImV4cCI6MjA4ODkwNzc2MH0.AhDaYjaGuxXlicg5mDyql2EvHnVKwGAi-0SUCRxxufY";
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let currentUser = null;
let categoryChart = null;

function formatCLP(value) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(value);
}

async function initPage() {
  const { data, error } = await supabaseClient.auth.getSession();

  if (error || !data.session) {
    window.location.href = "login.html";
    return;
  }

  currentUser = data.session.user;

  await loadTransactions();
}

async function loadTransactions() {
  if (!currentUser) return;

  const { data, error } = await supabaseClient
    .from("transactions")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al cargar movimientos:", error);
    return;
  }

  renderSummary(data || []);
  renderMovements(data || []);
  renderChart(data || []);
}

function renderSummary(movements) {
  const ingresos = movements
    .filter(m => m.type === "ingreso")
    .reduce((sum, m) => sum + Number(m.amount), 0);

  const gastos = movements
    .filter(m => m.type === "gasto")
    .reduce((sum, m) => sum + Number(m.amount), 0);

  const balance = ingresos - gastos;

  document.getElementById("total-income").textContent = formatCLP(ingresos);
  document.getElementById("total-expense").textContent = formatCLP(gastos);
  document.getElementById("total-balance").textContent = formatCLP(balance);
}

function renderMovements(movements) {
  const container = document.getElementById("movements-list");
  if (!container) return;

  container.innerHTML = "";

  if (movements.length === 0) {
    container.innerHTML = `<p class="empty-state">Todavía no tienes movimientos.</p>`;
    return;
  }

  movements.forEach((movement) => {
    const item = document.createElement("div");
    item.classList.add("movement-item");

    item.innerHTML = `
      <div class="movement-left">
        <span class="movement-title">${movement.category}</span>
        <span class="movement-subtitle">
          ${movement.description || "Sin descripción"} · ${movement.movement_date}
        </span>
      </div>
      <div class="${movement.type === "ingreso" ? "amount-income" : "amount-expense"}">
        ${movement.type === "ingreso" ? "+" : "-"} ${formatCLP(Number(movement.amount))}
      </div>
    `;

    container.appendChild(item);
  });
}

function renderChart(movements) {
  const canvas = document.getElementById("categoryChart");
  if (!canvas) return;

  const gastos = movements.filter(m => m.type === "gasto");

  const totalsByCategory = {};

  gastos.forEach(m => {
    const category = m.category || "Sin categoría";
    totalsByCategory[category] = (totalsByCategory[category] || 0) + Number(m.amount);
  });

  const labels = Object.keys(totalsByCategory);
  const values = Object.values(totalsByCategory);

  if (categoryChart) {
    categoryChart.destroy();
  }

  categoryChart = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: labels.length ? labels : ["Sin datos"],
      datasets: [{
        data: values.length ? values : [1]
      }]
    },
    options: {
      responsive: true,
      animation: false,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

const movementForm = document.getElementById("movement-form");

if (movementForm) {
  movementForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentUser) return;

    const type = document.getElementById("type").value;
    const amount = document.getElementById("amount").value;
    const category = document.getElementById("category").value;
    const movement_date = document.getElementById("movement_date").value;
    const description = document.getElementById("description").value;

    const { error } = await supabaseClient
      .from("transactions")
      .insert([
        {
          user_id: currentUser.id,
          type,
          amount,
          category,
          movement_date,
          description
        }
      ]);

    if (error) {
      alert("Error al guardar movimiento: " + error.message);
      console.error(error);
      return;
    }

    movementForm.reset();
    document.getElementById("movement_date").valueAsDate = new Date();

    await loadTransactions();
  });
}

const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();
    window.location.href = "login.html";
  });
}

const movementDateInput = document.getElementById("movement_date");
if (movementDateInput) {
  movementDateInput.valueAsDate = new Date();
}

initPage();
