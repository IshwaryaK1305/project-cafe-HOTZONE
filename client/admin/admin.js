const API = "http://127.0.0.1:5000/api";
let menuItems = [];

// ────────────────────────────────────────────────────────
// TOGGLE PASSWORD VISIBILITY
// ────────────────────────────────────────────────────────
function togglePassword(inputId, iconEl) {

  const input = document.getElementById(inputId);

  if (!input) return;

  const icon = iconEl.querySelector("i");

  if (input.type === "password") {

    input.type = "text";

    icon.classList.remove("fa-eye");
    icon.classList.add("fa-eye-slash");

    iconEl.style.color = "#ff6200";

  } else {

    input.type = "password";
    icon.classList.remove("fa-eye-slash");
    icon.classList.add("fa-eye");
    iconEl.style.color = "#888";
  }
}

// ────────────────────────────────────────────────────────
// PANEL SWITCHER  (login ↔ forgot password)
// ────────────────────────────────────────────────────────
function showPanel(id) {
  ["panelLogin", "panelForgot"].forEach((p) => {
    const el = document.getElementById(p);
    if (el) el.style.display = p === id ? "block" : "none";
  });
  // clear messages when switching
  ["loginError", "fpError", "fpSuccess"].forEach((eid) => {
    const el = document.getElementById(eid);
    if (el) {
      el.style.display = "none";
      el.textContent = "";
    }
  });
}

// ────────────────────────────────────────────────────────
// LOGIN
// ────────────────────────────────────────────────────────
async function doLogin() {
  const errorBox = document.getElementById("loginError");
  errorBox.style.display = "none";

  const username = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value;

  if (!username || !password) {
    errorBox.textContent = "Please fill in all fields";
    errorBox.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "./dashboard.html";
    } else {
      errorBox.textContent = data.msg || "Invalid credentials";
      errorBox.style.display = "block";
    }
  } catch {
    errorBox.textContent = "Cannot connect to server";
    errorBox.style.display = "block";
  }
}

// ────────────────────────────────────────────────────────
// FORGOT PASSWORD  (recovery PIN flow)
// ────────────────────────────────────────────────────────
async function doForgotPassword() {
  const err = document.getElementById("fpError");
  const ok = document.getElementById("fpSuccess");
  err.style.display = "none";
  ok.style.display = "none";

  const username = document.getElementById("fpUsername").value.trim();
  const recoveryPin = document.getElementById("fpPin").value;
  const newPassword = document.getElementById("fpNewPass").value;
  const confirm = document.getElementById("fpConfirmPass").value;

  if (!username || !recoveryPin || !newPassword || !confirm) {
    err.textContent = "Please fill in all fields";
    err.style.display = "block";
    return;
  }
  if (newPassword.length < 8) {
    err.textContent = "New password must be at least 8 characters";
    err.style.display = "block";
    return;
  }
  if (newPassword !== confirm) {
    err.textContent = "Passwords do not match";
    err.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, recoveryPin, newPassword }),
    });
    const data = await res.json();

    if (res.ok) {
      ok.textContent = "✅ Password reset! Redirecting to login…";
      ok.style.display = "block";
      ["fpUsername", "fpPin", "fpNewPass", "fpConfirmPass"].forEach(
        (id) => (document.getElementById(id).value = ""),
      );
      setTimeout(() => showPanel("panelLogin"), 2000);
    } else {
      err.textContent = data.msg || "Reset failed";
      err.style.display = "block";
    }
  } catch {
    err.textContent = "Cannot connect to server";
    err.style.display = "block";
  }
}

// ────────────────────────────────────────────────────────
// VERIFY ADMIN  (dashboard guard)
// ────────────────────────────────────────────────────────
async function verifyAdmin() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  try {
    const res = await fetch(`${API}/auth/verify`, {
      headers: { Authorization: "Bearer " + token },
    });
    if (!res.ok) {
      localStorage.removeItem("token");
      window.location.href = "./login.html";
    }
  } catch {
    showMessage("Cannot connect to server. Is it running? ❌");
  }
}

// ────────────────────────────────────────────────────────
// LOGOUT
// ────────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem("token");
  window.location.href = "../index.html";
}

// ────────────────────────────────────────────────────────
// FETCH MENU
// ────────────────────────────────────────────────────────
async function fetchMenu() {
  try {
    const res = await fetch(`${API}/menu`);
    menuItems = await res.json();
    renderAdmin();
  } catch (err) {
    console.error("Error fetching menu:", err);
  }
}

// ────────────────────────────────────────────────────────
// RENDER ADMIN TABLE  (scrolls horizontally on mobile)
// ────────────────────────────────────────────────────────
function renderAdmin() {
  const body = document.getElementById("adminBody");
  const countEl = document.getElementById("adminItemCount");
  if (!body) return;
  if (countEl) countEl.textContent = `— ${menuItems.length} items`;

  const thumb = (item) => item.image || "../img/default-food.png";

  body.innerHTML = menuItems
    .map(
      (item) => `
    <tr>
      <td>
        <div class="tbl-item-cell">
          <img loading="lazy" class="tbl-thumb"
            src="${thumb(item)}" alt="${item.name}">
          <span class="tbl-item-name">${item.name}</span>
        </div>
      </td>
      <td>${item.category}</td>
      <td style="font-weight:700;color:var(--primary);">₹${item.price}</td>
     <td>
  <span class="type-badge">
    <span style="
      color:${
        item.type === "veg"
          ? "#22c55e"
          : item.type === "nonveg"
            ? "#ef4444"
            : "#3b82f6"
      }">
      ●
    </span>

    ${
      item.type === "veg"
        ? "Veg"
        : item.type === "nonveg"
          ? "Non-Veg"
          : "Beverage"
    }
  </span>
</td>
      <td>
        <span class="status-badge">
          <span class="status-dot ${item.available ? "on" : "off"}"></span>
          ${item.available ? "Available" : "Unavailable"}
        </span>
      </td>
      <td>
        <div class="actions-cell">
          <label class="switch">
            <input type="checkbox" ${item.available ? "checked" : ""}
              onchange="toggleAvail('${item._id}')">
            <span class="slider"></span>
          </label>
          <button class="tbl-btn btn-edit"   onclick="editItem('${item._id}')">Edit</button>
          <button class="tbl-btn btn-delete" onclick="deleteItem('${item._id}')">Delete</button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");
}

// ────────────────────────────────────────────────────────
// ADD ITEM
// ────────────────────────────────────────────────────────
async function addItem() {
  const token = localStorage.getItem("token");
  if (!token) {
    showMessage("Session expired ❌");
    logout();
    return;
  }

  const item = {
    name: document.getElementById("newName").value.trim(),
    price: Number(document.getElementById("newPrice").value),
    category: document.getElementById("newCat").value,
    type: document.getElementById("newType").value,
    desc: document.getElementById("newDesc").value.trim(),
    image: document.getElementById("newImage").value.trim(),
    available: true,
  };

  if (!item.name || !item.price) {
    showMessage("Name and price are required ❌");
    return;
  }

  try {
    const res = await fetch(`${API}/menu`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(item),
    });
    if (res.status === 401) {
      showMessage("Session expired ❌");
      setTimeout(logout, 1200);
      return;
    }
    await fetchMenu();
    clearAddForm();
    closeAddItem();
    showMessage("Item Added ✅");
  } catch {
    showMessage("Error adding item ❌");
  }
}

// ────────────────────────────────────────────────────────
// TOGGLE AVAILABILITY
// ────────────────────────────────────────────────────────
async function toggleAvail(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    logout();
    return;
  }

  const item = menuItems.find((i) => i._id === id);
  try {
    const res = await fetch(`${API}/menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ available: !item.available }),
    });
    if (res.status === 401) {
      showMessage("Session expired ❌");
      setTimeout(logout, 1200);
      return;
    }
    await fetchMenu();
  } catch {
    showMessage("Error updating availability ❌");
  }
}

// ────────────────────────────────────────────────────────
// DELETE ITEM
// ────────────────────────────────────────────────────────
async function deleteItem(id) {
  const token = localStorage.getItem("token");
  if (!token) {
    logout();
    return;
  }
  if (!confirm("Delete this item?")) return;

  try {
    const res = await fetch(`${API}/menu/${id}`, {
      method: "DELETE",
      headers: { Authorization: "Bearer " + token },
    });
    if (res.status === 401) {
      showMessage("Session expired ❌");
      setTimeout(logout, 1200);
      return;
    }
    await fetchMenu();
    showMessage("Item Deleted 🗑️");
  } catch {
    showMessage("Error deleting item ❌");
  }
}

// ────────────────────────────────────────────────────────
// TOGGLE ADD FORM
// ────────────────────────────────────────────────────────
function toggleAddForm() {
  const form = document.getElementById("addForm");
  if (!form) return;
  form.style.display = form.style.display === "block" ? "none" : "block";
}

// ────────────────────────────────────────────────────────
// EDIT ITEM
// ────────────────────────────────────────────────────────
function editItem(id) {
  const item = menuItems.find((i) => i._id === id);
  if (!item) return;

  document.getElementById("editId").value = item._id;
  document.getElementById("editName").value = item.name;
  document.getElementById("editPrice").value = item.price;
  document.getElementById("editCategory").value = item.category;
  document.getElementById("editType").value = item.type;
  document.getElementById("editImage").value = item.image || "";
  document.getElementById("editDesc").value = item.desc || "";

  document.getElementById("editForm").style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function saveEdit() {
  const token = localStorage.getItem("token");
  if (!token) {
    logout();
    return;
  }

  const id = document.getElementById("editId").value;
  const updatedItem = {
    name: document.getElementById("editName").value.trim(),
    price: document.getElementById("editPrice").value,
    category: document.getElementById("editCategory").value,
    type: document.getElementById("editType").value,
    image: document.getElementById("editImage").value.trim(),
    desc: document.getElementById("editDesc").value.trim(),
  };

  try {
    const res = await fetch(`${API}/menu/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify(updatedItem),
    });
    if (res.status === 401) {
      showMessage("Session expired ❌");
      setTimeout(logout, 1200);
      return;
    }
    document.getElementById("editForm").style.display = "none";
    showMessage("Item Updated ✔️");
    await fetchMenu();
  } catch {
    showMessage("Error saving changes ❌");
  }
}

function closeEdit() {
  document.getElementById("editForm").style.display = "none";
}

// ────────────────────────────────────────────────────────
// MODAL HELPERS
// ────────────────────────────────────────────────────────
function openChangePassword() {
  ["cpError", "cpSuccess"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  ["cpOldPass", "cpNewPass", "cpConfirmPass"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("modalChangePassword").style.display = "flex";
}

function openChangeUsername() {
  ["cuError", "cuSuccess"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
  });
  ["cuNewUsername"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
  document.getElementById("modalChangeUsername").style.display = "flex";
}

function closeModal(id) {
  document.getElementById(id).style.display = "none";
}

function closeModalOnOverlay(event, id) {
  if (event.target.id === id) closeModal(id);
}

// ────────────────────────────────────────────────────────
// CHANGE PASSWORD (dashboard modal)
// ────────────────────────────────────────────────────────
async function doChangePassword() {
  const token = localStorage.getItem("token");
  const errEl = document.getElementById("cpError");
  const okEl = document.getElementById("cpSuccess");
  errEl.style.display = "none";
  okEl.style.display = "none";

  const oldPassword = document.getElementById("cpOldPass").value;
  const newPassword = document.getElementById("cpNewPass").value;
  const confirm = document.getElementById("cpConfirmPass").value;

  if (!oldPassword || !newPassword || !confirm) {
    errEl.textContent = "Please fill in all fields";
    errEl.style.display = "block";
    return;
  }
  if (newPassword.length < 8) {
    errEl.textContent = "New password must be at least 8 characters";
    errEl.style.display = "block";
    return;
  }
  if (newPassword !== confirm) {
    errEl.textContent = "Passwords do not match";
    errEl.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API}/auth/change-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    const data = await res.json();

    if (res.ok) {
      okEl.textContent = "✅ Password updated!";
      okEl.style.display = "block";
      ["cpOldPass", "cpNewPass", "cpConfirmPass"].forEach(
        (id) => (document.getElementById(id).value = ""),
      );
      setTimeout(() => closeModal("modalChangePassword"), 1800);
    } else if (res.status === 401) {
      showMessage("Session expired ❌");
      setTimeout(logout, 1200);
    } else {
      errEl.textContent = data.msg || "Failed";
      errEl.style.display = "block";
    }
  } catch {
    errEl.textContent = "Cannot connect to server";
    errEl.style.display = "block";
  }
}

// ────────────────────────────────────────────────────────
// CHANGE USERNAME (dashboard modal)
// ────────────────────────────────────────────────────────
async function doChangeUsername() {
  const token = localStorage.getItem("token");
  const errEl = document.getElementById("cuError");
  const okEl = document.getElementById("cuSuccess");
  errEl.style.display = "none";
  okEl.style.display = "none";

  const newUsername = document.getElementById("cuNewUsername").value.trim();

  if (!newUsername) {
    errEl.textContent = "Please enter a new username";
    errEl.style.display = "block";
    return;
  }

  try {
    const res = await fetch(`${API}/auth/change-username`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ newUsername }),
    });
    const data = await res.json();

    if (res.ok) {
      okEl.textContent = "✅ Username updated! Logging out…";
      okEl.style.display = "block";
      setTimeout(logout, 2000);
    } else if (res.status === 401) {
      showMessage("Session expired ❌");
      setTimeout(logout, 1200);
    } else {
      errEl.textContent = data.msg || "Failed";
      errEl.style.display = "block";
    }
  } catch {
    errEl.textContent = "Cannot connect to server";
    errEl.style.display = "block";
  }
}

// ────────────────────────────────────────────────────────
// TOAST MESSAGE
// ────────────────────────────────────────────────────────
function showMessage(text) {
  const msg = document.createElement("div");
  msg.innerText = text;
  Object.assign(msg.style, {
    position: "fixed",
    top: "20px",
    right: "20px",
    background: "#22c55e",
    color: "white",
    padding: "14px 22px",
    borderRadius: "12px",
    fontWeight: "600",
    zIndex: "9999",
    boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
  });
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 2500);
}

// ────────────────────────────────────────────────────────
// CLEAR / CLOSE ADD FORM
// ────────────────────────────────────────────────────────
function clearAddForm() {
  ["newName", "newPrice", "newDesc", "newImage"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );
}

function closeAddItem() {
  document.getElementById("addForm").style.display = "none";
}

// ────────────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────────────
window.onload = async () => {
  if (document.getElementById("adminBody")) {
    await verifyAdmin();
    await fetchMenu();
  }
};
