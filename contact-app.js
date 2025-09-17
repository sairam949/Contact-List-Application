const express = require("express");
const app = express();
const PORT = 3030;

app.use(express.json());

// In-memory contact list
let contacts = [];
let idCounter = 1;

// ---- API Endpoints ----
app.get("/api/contacts", (req, res) => res.json(contacts));

app.post("/api/contacts", (req, res) => {
  const { name, email, phone } = req.body;
  const newContact = { id: idCounter++, name, email, phone };
  contacts.push(newContact);
  res.json(newContact);
});

app.put("/api/contacts/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email, phone } = req.body;
  contacts = contacts.map(c =>
    c.id === id ? { ...c, name, email, phone } : c
  );
  res.json({ success: true });
});

app.delete("/api/contacts/:id", (req, res) => {
  const id = parseInt(req.params.id);
  contacts = contacts.filter(c => c.id !== id);
  res.json({ success: true });
});

// ---- Frontend (HTML + JS) ----
app.get("/", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Contact List App</title>
<style>
  body { 
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
    max-width: 600px; 
    margin: 30px auto; 
    background: #f4f4f9; 
    color: #333; 
  }
  h1 { text-align: center; color: #4a4a4a; }
  form { background: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }
  input { 
    width: 100%; padding: 10px; margin: 8px 0; border-radius: 5px; 
    border: 1px solid #ccc; font-size: 14px; 
  }
  button { 
    padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; 
  }
  button:hover { opacity: 0.9; }
  button[type="submit"] { background: #4caf50; color: white; width: 100%; margin-top: 10px; }
  .search-box { display: flex; gap: 5px; margin: 20px 0; }
  .search-box input { flex: 1; }
  .search-box button { background: #2196f3; color: white; }
  .search-box button:nth-child(3) { background: #f44336; }
  .contact { 
    background: #fff; padding: 15px; margin: 10px 0; border-radius: 10px; 
    display: flex; justify-content: space-between; align-items: center; 
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  .contact div b { font-size: 16px; }
  .actions button { 
    margin-left: 5px; padding: 6px 12px; font-size: 13px; border-radius: 5px; 
    border: none; cursor: pointer; 
  }
  .actions button:nth-child(1) { background: #ffb74d; color: white; }
  .actions button:nth-child(2) { background: #e57373; color: white; }
</style>
</head>
<body>
<h1>📇 Contact List</h1>

<form id="contactForm">
  <input id="name" placeholder="Name" required>
  <input id="email" placeholder="Email" required>
  <input id="phone" placeholder="Phone" required>
  <button type="submit">Add Contact</button>
</form>

<div class="search-box">
  <input id="search" placeholder="Search contacts...">
  <button onclick="searchContacts()">Search</button>
  <button onclick="clearSearch()">Clear</button>
</div>

<div id="contactList"></div>

<script>
let editingId = null;
let allContacts = [];

async function fetchContacts() {
  const res = await fetch('/api/contacts');
  allContacts = await res.json();
  renderContacts(allContacts);
}

function renderContacts(contacts) {
  const list = document.getElementById("contactList");
  list.innerHTML = "";
  contacts.forEach(c => {
    const div = document.createElement("div");
    div.className = "contact";
    div.innerHTML = \`
      <div>
        <b>\${c.name}</b><br>
        \${c.email}<br>
        \${c.phone}
      </div>
      <div class="actions">
        <button onclick="editContact(\${c.id}, '\${c.name}', '\${c.email}', '\${c.phone}')">Edit</button>
        <button onclick="deleteContact(\${c.id})">Delete</button>
      </div>
    \`;
    list.appendChild(div);
  });
}

function searchContacts() {
  const search = document.getElementById("search").value.toLowerCase();
  const filtered = allContacts.filter(c =>
    c.name.toLowerCase().includes(search) ||
    c.email.toLowerCase().includes(search) ||
    c.phone.includes(search)
  );
  renderContacts(filtered);
}

function clearSearch() {
  document.getElementById("search").value = "";
  renderContacts(allContacts);
}

document.getElementById("contactForm").onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;

  if (editingId) {
    await fetch('/api/contacts/' + editingId, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone })
    });
    editingId = null;
  } else {
    await fetch('/api/contacts', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone })
    });
  }
  e.target.reset();
  fetchContacts();
};

async function deleteContact(id) {
  await fetch('/api/contacts/' + id, { method: "DELETE" });
  fetchContacts();
}

function editContact(id, name, email, phone) {
  document.getElementById("name").value = name;
  document.getElementById("email").value = email;
  document.getElementById("phone").value = phone;
  editingId = id;
}

fetchContacts();
</script>
</body>
</html>
  `);
});

// ---- Start server ----
app.listen(PORT, () => console.log(`Contact List App running at http://localhost:${PORT}`));
