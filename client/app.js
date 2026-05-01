/*
  API CONFIG
*/
const API_BASE = "https://hogwarts-magic-management.onrender.com/api/v1/magic-items";

/*
  STATE
*/
let items = []; // πλέον έρχεται από Mongo μέσω API

/*
  HELPERS
*/
const $ = (id) => document.getElementById(id);

function showWarning(message) {
  const box = $("warnBox");
  box.textContent = message;
  box.classList.remove("d-none");
  setTimeout(() => box.classList.add("d-none"), 2500);
}

/*
  MAPPERS (Greek UI <-> API English)
*/
function mapTypeToApi(grType) {
  return grType === "Ξόρκι" ? "Spell" : "Potion";
}

function mapElementToApi(grEl) {
  const map = { "Φωτιά": "Fire", "Πάγος": "Ice", "Αστραπή": "Lightning", "Γη": "Earth" };
  return map[grEl] || grEl;
}

function mapRarityToApi(grR) {
  const map = { "Κοινό": "Common", "Σπάνιο": "Rare", "Επικό": "Epic", "Θρυλικό": "Legendary", "Ουαου": "Wow" };
  return map[grR] || grR;
}

function mapTypeToGreek(apiType) {
  return apiType === "Spell" ? "Ξόρκι" : "Φίλτρο";
}

function mapElementToGreek(apiEl) {
  const map = { Fire: "Φωτιά", Ice: "Πάγος", Lightning: "Αστραπή", Earth: "Γη" };
  return map[apiEl] || apiEl;
}

function mapRarityToGreek(apiR) {
  const map = { Common: "Κοινό", Rare: "Σπάνιο", Epic: "Επικό", Legendary: "Θρυλικό", Wow: "Ουαου" };
  return map[apiR] || apiR;
}

function mapStatusToGreek(apiType, apiStatus) {
  if (apiType === "Spell") return apiStatus === "Learned" ? "Μαθημένο" : "Μη μαθημένο";
  return apiStatus === "Brewed" ? "Παρασκευασμένο" : "Μη παρασκευασμένο";
}

/*
  API CALLS
*/
async function fetchItems() {
  const res = await fetch(API_BASE);
  const json = await res.json();
  items = (json.data || []).map((i) => ({
    _id: i._id,
    name: i.name,
    type: mapTypeToGreek(i.type),
    element: mapElementToGreek(i.element),
    power: i.power,
    rarity: mapRarityToGreek(i.rarity),
    desc: i.description,
    status: mapStatusToGreek(i.type, i.status),
  }));
  renderList();
}

async function apiCreateItem(payload) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Create failed");
  }

  return res.json();
}

async function apiDeleteItem(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Delete failed");
  }
}

async function apiToggleStatus(id) {
  const res = await fetch(`${API_BASE}/${id}/toggle-status`, { method: "PATCH" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Toggle failed");
  }
  return res.json();
}

async function apiPowerUp(id) {
  const res = await fetch(`${API_BASE}/${id}/power-up`, { method: "PATCH" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Power-up failed");
  }
  return res.json();
}

/*
  RENDER LIST (σχεδόν ίδιο με το δικό σου)
*/
function renderList() {
  const container = $("labContainer");
  const stats = $("stats");

  if (items.length === 0) {
    container.innerHTML = `<div class="muted">Δεν υπάρχουν αντικείμενα.</div>`;
  } else {
    container.innerHTML = items
      .map(
        (item, index) => `
      <div class="card glass item-card mb-2 ${
        item.status.includes("Μαθημένο") || item.status.includes("Παρασκευασμένο")
          ? "item-active"
          : "item-inactive"
      }">
        <div class="card-body">
          <div class="d-flex justify-content-between">
            <div>
              <strong>${item.name}</strong>
              <div class="muted small text-secondary">
                ${item.type} | ${item.element} | Power: ${item.power} | ${item.rarity}
              </div>
              <div class="small mt-1">
                Κατάσταση: <strong>${item.status}</strong>
              </div>
              <div class="small mt-1">${item.desc}</div>
            </div>

            <div class="d-flex flex-column gap-2">
              <button class="btn btn-secondary btn-sm" onclick="toggleStatus(${index})">
                Αλλαγή Κατάστασης
              </button>
              <button class="btn btn-secondary btn-sm" onclick="upgrade(${index})">
                Αναβάθμιση +5
              </button>
              <button class="btn btn-danger btn-sm" onclick="removeItem(${index})">
                Διαγραφή
              </button>
            </div>
          </div>
        </div>
      </div>
    `
      )
      .join("");
  }

  const spells = items.filter((i) => i.type === "Ξόρκι").length;
  const potions = items.filter((i) => i.type === "Φίλτρο").length;

  stats.innerHTML = `
    <span class="badge bg-dark border">Σύνολο: ${items.length}</span> 
    <span class="badge bg-dark border">Ξόρκια: ${spells}</span>
    <span class="badge bg-dark border">Φίλτρα: ${potions}</span>
  `;
}

/*
  ACTIONS (τώρα καλούν API)
*/
async function toggleStatus(index) {
  try {
    const id = items[index]._id;
    await apiToggleStatus(id);
    await fetchItems();
  } catch (e) {
    showWarning(e.message);
  }
}

async function upgrade(index) {
  try {
    const id = items[index]._id;
    await apiPowerUp(id);
    await fetchItems();
  } catch (e) {
    showWarning(e.message);
  }
}

async function removeItem(index) {
  try {
    const id = items[index]._id;
    await apiDeleteItem(id);
    await fetchItems();
  } catch (e) {
    showWarning(e.message);
  }
}

/*
  ADD ITEM (POST)
*/
$("addBtn").addEventListener("click", async () => {
  try {
    const name = $("name").value.trim();
    const type = $("type").value;
    const element = $("element").value;
    const power = Number($("power").value);
    const rarity = $("rarity").value;
    const desc = $("desc").value.trim();

    if (!name || !desc) {
      showWarning("Συμπλήρωσε όλα τα πεδία.");
      return;
    }
    if (power < 1 || power > 100) {
      showWarning("Η δύναμη πρέπει να είναι 1–100.");
      return;
    }

    const apiType = mapTypeToApi(type);

    const payload = {
      name,
      type: apiType,
      element: mapElementToApi(element),
      power,
      rarity: mapRarityToApi(rarity),
      description: desc,
      status: apiType === "Spell" ? "Unlearned" : "Unbrewed",
    };

    await apiCreateItem(payload);

    $("name").value = "";
    $("desc").value = "";
    $("power").value = 40;

    await fetchItems();
  } catch (e) {
    showWarning(e.message);
  }
});

/*
  INIT
*/
fetchItems();
