const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, "users.json");

function readUsers() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function saveUsers(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}


// =====================
// GET USERS
// =====================
app.get("/dados", (req, res) => {
  try {
    const users = readUsers();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: "Erro ao ler dados" });
  }
});


// =====================
// CREATE USER
// =====================
app.post("/dados", (req, res) => {
  try {
    const { username, password, avatar } = req.body;

    if (!username || !password)
      return res.status(400).json({ error: "Campos obrigatórios" });

    const users = readUsers();

    if (users.find(u => u.username === username))
      return res.status(400).json({ error: "Usuário já existe" });

    const newUser = {
      username,
      password,
      admin: false,
      plan: null,
      planLimit: 0,
      keysGenerated: 0,
      planEnd: null,
      avatar: avatar || null
    };

    users.push(newUser);
    saveUsers(users);

    res.json({ success: true, user: newUser });

  } catch (e) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});


// =====================
// UPDATE USER
// =====================
app.put("/dados/:username", (req, res) => {
  try {
    const users = readUsers();

    const user = users.find(u => u.username === req.params.username);

    if (!user)
      return res.status(404).json({ error: "Usuário não encontrado" });

    Object.assign(user, req.body);

    saveUsers(users);

    res.json({ success: true, user });

  } catch {
    res.status(500).json({ error: "Erro ao atualizar" });
  }
});


// =====================
// DELETE USER
// =====================
app.delete("/dados/:username", (req, res) => {
  try {
    let users = readUsers();

    users = users.filter(u => u.username !== req.params.username);

    saveUsers(users);

    res.json({ success: true });

  } catch {
    res.status(500).json({ error: "Erro ao deletar" });
  }
});

module.exports = app;
