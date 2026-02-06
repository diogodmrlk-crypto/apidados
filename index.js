const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

const DB_FILE = "./database.json";


// ============================
// CRIAR DB SE NÃO EXISTIR
// ============================

if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({
    users: [
      {
        username: "Ferraodev",
        password: "Diogomiranda00k",
        admin: true,
        plan: "avancado",
        planLimit: 9999,
        keysGenerated: 0,
        planEnd: null,
        avatar: null
      }
    ]
  }, null, 2));
}


// ============================
// FUNÇÕES DB
// ============================

function readDB() {
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}


// ============================
// GET TODOS USUÁRIOS
// ============================

app.get("/dados", (req, res) => {
  const db = readDB();
  res.json(db.users);
});


// ============================
// CRIAR USUÁRIO
// ============================

app.post("/dados", (req, res) => {

  const db = readDB();
  const { username, password, avatar } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Campos obrigatórios" });

  const exists = db.users.find(u => u.username === username);

  if (exists)
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

  db.users.push(newUser);
  writeDB(db);

  res.json({ success: true, user: newUser });
});


// ============================
// ATUALIZAR USUÁRIO
// ============================

app.put("/dados/:username", (req, res) => {

  const db = readDB();

  const user = db.users.find(
    u => u.username === req.params.username
  );

  if (!user)
    return res.status(404).json({ error: "Usuário não encontrado" });

  Object.assign(user, req.body);

  writeDB(db);

  res.json({ success: true, user });
});


// ============================
// EXCLUIR USUÁRIO
// ============================

app.delete("/dados/:username", (req, res) => {

  const db = readDB();

  db.users = db.users.filter(
    u => u.username !== req.params.username
  );

  writeDB(db);

  res.json({ success: true });
});


// ============================
// EXPORT VERCEL
// ============================

module.exports = app;
