const API =
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "localhost"
    ? "http://127.0.0.1:5000/api"
    : "https://your-railway-app.up.railway.app/api";

let menuItems = [];
let activeCategory = "All";

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ FETCH MENU
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function fetchMenu() {
  try {
    const res = await fetch(`${API}/menu`);
    menuItems = await res.json();
    renderMenu();
  } catch (err) {
    console.error("Error fetching menu:", err);
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ SHOW PAGE — smooth scroll to section
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function showPage(pageId) {
  const target = document.getElementById("page-" + pageId);
  if (target) {
    target.scrollIntoView({ behavior: "smooth" });
  }

  // Update navbar active button
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  const activeBtn = document.querySelector(`[onclick="showPage('${pageId}')"]`);
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ HIGHLIGHT NAV ON SCROLL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function updateNavOnScroll() {
  const sections = ["home", "about", "menu"];
  const navHeight = 75;

  let current = "home";

  for (const id of sections) {
    const el = document.getElementById("page-" + id);
    if (el) {
      const top = el.getBoundingClientRect().top;
      if (top <= navHeight + 60) {
        current = id;
      }
    }
  }

  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  const activeBtn = document.querySelector(
    `[onclick="showPage('${current}')"]`,
  );
  if (activeBtn) {
    activeBtn.classList.add("active");
  }
}

window.addEventListener("scroll", updateNavOnScroll, { passive: true });

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ CATEGORY LIST
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function categories() {
  return ["All", ...new Set(menuItems.map((i) => i.category))];
}

// ✅ RENDER CATEGORY BAR
function renderCatBar() {
  const bar = document.getElementById("catBar");
  bar.innerHTML = categories()
    .map(
      (c) =>
        `<button class="cat-btn ${c === activeCategory ? "active" : ""}" onclick="filterCat('${c}')">${c}</button>`,
    )
    .join("");
}

// ✅ FILTER CATEGORY
function filterCat(cat) {
  activeCategory = cat;
  renderMenu();
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ RENDER MENU
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
function renderMenu() {
  renderCatBar();

  const items =
    activeCategory === "All"
      ? menuItems
      : menuItems.filter((i) => i.category === activeCategory);

  const grid = document.getElementById("menuGrid");
  if (!grid) return;

  grid.innerHTML = items
    .map(
      (item) => `
    <div class="menu-card ${item.available ? "" : "unavailable"}">

      ${!item.available ? '<span class="unavail-tag">Unavailable</span>' : ""}

      <div class="card-emoji">
        <img
          class="food-img"
          loading="lazy"
          src="${item.image?.trim() || "./img/default-food.png"}"
          alt="${item.name}"
        >
      </div>

      <div class="card-body">

        <div class="card-name">${item.name}</div>

        <div class="card-desc">
          ${item.desc || "Delicious freshly prepared item"}
        </div>

        <div class="card-footer">

          <span class="card-price">
            ₹${item.price}
          </span>

          <span class="
  ${
    item.type === "veg"
      ? "tag-veg"
      : item.type === "nonveg"
        ? "tag-nonveg"
        : "tag-beverage"
  }
">

  ${
    item.type === "veg"
      ? "🟢 Veg"
      : item.type === "nonveg"
        ? "🔴 Non-Veg"
        : "🔵 Beverage"
  }

</span>

        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ✅ INIT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
window.onload = async () => {
  await fetchMenu();
};
