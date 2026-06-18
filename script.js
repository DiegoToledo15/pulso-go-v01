// Este objeto guarda las secciones principales de la app.
// Cada propiedad apunta a una pantalla del HTML usando su id.
const screens = {
  home: document.querySelector("#screen-home"),
  checkin: document.querySelector("#screen-checkin"),
  route: document.querySelector("#screen-route"),
  activities: document.querySelector("#screen-activities"),
  campus: document.querySelector("#screen-campus"),
  team: document.querySelector("#screen-team"),
};

// Estado temporal del check-in.
// No se guarda en base de datos: solo vive mientras la pagina esta abierta.
const checkinState = {
  mood: "bien",
  need: "descansar",
  energy: "media",
  stress: "medio",
};

// Rutas disponibles.
// La clave de cada ruta coincide con el data-value de la pregunta
// "Que necesitas ahora?" en el HTML.
const routes = {
  descansar: {
    icon: "spa",
    title: "Tu Ruta Reset",
    message: "Parece que necesitas una pausa. Te recomendamos tomar unos minutos para respirar, descansar y bajar la carga mental.",
    actions: [
      "Respiración guiada de 2 minutos",
      "Buscar una zona tranquila",
      "Tomar agua y descansar la vista",
      "Revisar actividades de relajación",
    ],
  },
  moverme: {
    icon: "directions_run",
    title: "Tu Ruta Movimiento",
    message: "Tu cuerpo también necesita liberar tensión. Te recomendamos una actividad breve para activar energía y reducir estrés.",
    actions: [
      "Pausa activa de 5 minutos",
      "Caminata breve",
      "Actividades deportivas",
      "Convenios con gimnasios o centros recreativos",
    ],
  },
  hablar: {
    icon: "forum",
    title: "Tu Ruta Apoyo",
    message: "No tienes que enfrentar todo solo/a. Puedes revisar los canales de apoyo disponibles en la institución.",
    actions: [
      "Contactar bienestar estudiantil",
      "Revisar horarios de orientación",
      "Solicitar apoyo inicial",
      "Hablar con un embajador Pulso GO",
    ],
  },
  conectar: {
    icon: "groups",
    title: "Tu Ruta Comunidad",
    message: "Conectar con otros también es parte del bienestar. Puedes participar en actividades grupales o intereses compartidos.",
    actions: [
      "Caminatas grupales",
      "Clubes o talleres",
      "Actividades recreativas",
      "Grupos de estudiantes con intereses similares",
    ],
  },
  urgente: {
    icon: "support_agent",
    title: "Ruta de Ayuda Rápida",
    message: "Si estás pasando por una situación difícil o urgente, busca apoyo inmediato. No tienes que enfrentarlo solo/a.",
    actions: [
      "Contactar bienestar estudiantil",
      "Hablar con un profesional disponible",
      "Acudir a un encargado de sede",
      "En caso de emergencia, contactar servicios de emergencia locales",
    ],
  },
};

// Lista de actividades de la demo.
// JavaScript usa estos datos para crear las tarjetas automaticamente.
const activities = [
  {
    name: "Pausa activa en patio central",
    type: "Movimiento",
    duration: "10 minutos",
    place: "Patio principal",
  },
  {
    name: "Caminata grupal",
    type: "Comunidad / Movimiento",
    duration: "30 minutos",
    place: "Entrada principal",
  },
  {
    name: "Taller de manejo del estrés",
    type: "Apoyo",
    duration: "45 minutos",
    place: "Sala multiuso",
  },
  {
    name: "Zona tranquila de descanso",
    type: "Reset",
    duration: "Libre",
    place: "Biblioteca o sala tranquila",
  },
  {
    name: "Convenio con centro de escalada",
    type: "Movimiento",
    duration: "1 hora",
    place: "Centro externo con descuento para estudiantes",
  },
  {
    name: "Sesión de respiración guiada",
    type: "Reset",
    duration: "5 minutos",
    place: "Online o zona tranquila",
  },
  {
    name: "Club de juegos de mesa",
    type: "Comunidad",
    duration: "1 hora",
    place: "Casino o sala común",
  },
];

// Elementos de la pantalla "Mi Ruta" que cambian segun la respuesta.
const routeHero = document.querySelector("#route-hero");
const routeIcon = document.querySelector("#route-icon");
const routeTitle = document.querySelector("#route-title");
const routeMessage = document.querySelector("#route-message");
const routeActions = document.querySelector("#route-actions");
const routeNote = document.querySelector("#route-note");
const urgentHelpButton = document.querySelector("#urgent-help");

// Elementos usados por otras partes de la app.
const activityList = document.querySelector("#activity-list");
const toast = document.querySelector("#toast");
const formAlert = document.querySelector("#form-alert");

// Guardamos el temporizador del toast para poder reiniciarlo
// si el usuario hace clic en varios botones rapidamente.
let toastTimer;

// Muestra un mensaje breve en la parte inferior de la pantalla.
function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("show");

  toastTimer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 2600);
}

// Cambia la pantalla visible.
// En esta demo no cargamos paginas nuevas: solo ocultamos una seccion
// y mostramos otra usando la clase CSS "active".
function showScreen(screenName) {
  const target = screens[screenName] || screens.home;

  Object.values(screens).forEach((screen) => {
    screen.classList.toggle("active", screen === target);
  });

  // Actualiza tambien el boton activo del menu inferior.
  document.querySelectorAll(".bottom-nav button").forEach((button) => {
    const isActive = button.dataset.go === screenName;
    button.classList.toggle("active", isActive);
  });

  // Si vamos a "Mi Ruta", la volvemos a generar con la seleccion actual.
  if (screenName === "route") {
    renderRoute();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Construye la pantalla "Mi Ruta" usando la necesidad elegida en el check-in.
function renderRoute() {
  const currentRoute = routes[checkinState.need] || routes.descansar;
  const isUrgent = checkinState.need === "urgente";

  routeIcon.textContent = currentRoute.icon;
  routeTitle.textContent = currentRoute.title;
  routeMessage.textContent = currentRoute.message;

  // La ruta urgente usa un color mas sobrio y muestra elementos extra.
  routeHero.classList.toggle("urgent-mode", isUrgent);
  routeNote.classList.toggle("hidden", !isUrgent);
  urgentHelpButton.classList.toggle("hidden", !isUrgent);

  // Limpiamos acciones anteriores para no duplicarlas cada vez que se renderiza.
  routeActions.innerHTML = "";

  currentRoute.actions.forEach((action) => {
    const item = document.createElement("button");
    item.className = "route-action";
    item.type = "button";
    item.innerHTML = `
      <span class="material-symbols-outlined">check_circle</span>
      ${action}
    `;

    item.addEventListener("click", () => showToast("Acción seleccionada para la demo."));
    routeActions.appendChild(item);
  });
}

// Crea las tarjetas de actividades a partir del arreglo "activities".
// Asi es mas facil agregar o quitar actividades sin tocar el HTML.
function renderActivities() {
  activityList.innerHTML = "";

  activities.forEach((activity) => {
    const card = document.createElement("article");
    card.className = "activity-card";
    card.innerHTML = `
      <div class="activity-top">
        <h2>${activity.name}</h2>
        <span class="activity-type">${activity.type}</span>
      </div>
      <div class="activity-meta">
        <span><span class="material-symbols-outlined">schedule</span>${activity.duration}</span>
        <span><span class="material-symbols-outlined">location_on</span>${activity.place}</span>
      </div>
      <button class="interest-button" type="button">Me interesa</button>
    `;

    // Feedback simple: cambia el texto del boton y muestra un toast.
    const button = card.querySelector(".interest-button");
    button.addEventListener("click", () => {
      button.textContent = "Interés registrado";
      button.classList.add("registered");
      showToast("Interés registrado para la demo.");
    });

    activityList.appendChild(card);
  });
}

// Marca visualmente la opcion seleccionada dentro de una pregunta.
// Por ejemplo: en "need", deja seleccionado solo "moverme".
function syncChoiceStyles(field, value) {
  document.querySelectorAll(`[data-field="${field}"]`).forEach((button) => {
    button.classList.toggle("selected", button.dataset.value === value);
  });
}

// Escucha clics generales en toda la pagina.
// Sirve para los botones que tienen data-go o data-toast.
document.addEventListener("click", (event) => {
  const goButton = event.target.closest("[data-go]");
  if (goButton) {
    showScreen(goButton.dataset.go);
    return;
  }

  const toastButton = event.target.closest("[data-toast]");
  if (toastButton) {
    showToast(toastButton.dataset.toast);
  }
});

// Escucha los botones del check-in.
// data-field indica que pregunta estamos respondiendo.
// data-value indica la respuesta elegida.
document.querySelectorAll("[data-field]").forEach((button) => {
  button.addEventListener("click", () => {
    const { field, value } = button.dataset;
    checkinState[field] = value;
    syncChoiceStyles(field, value);
    formAlert.textContent = "";
  });
});

// Cuando se envia el formulario, evitamos que el navegador recargue la pagina
// y mostramos la ruta recomendada.
document.querySelector("#checkin-form").addEventListener("submit", (event) => {
  event.preventDefault();

  // Respaldo por si en algun cambio futuro no queda una necesidad seleccionada.
  if (!checkinState.need) {
    checkinState.need = "descansar";
    syncChoiceStyles("need", "descansar");
    formAlert.textContent = "Usamos Descansar como ruta inicial para esta demo.";
  }

  renderRoute();
  showScreen("route");
});

urgentHelpButton.addEventListener("click", () => {
  showToast("En una versión real se mostrarían contactos institucionales y de emergencia.");
});

document.querySelector("#join-team").addEventListener("click", () => {
  showToast("Gracias por tu interés. En una versión real se abriría un formulario de inscripción.");
});

// Al cargar la pagina, dejamos listas las partes que se generan con JavaScript.
renderActivities();
renderRoute();
