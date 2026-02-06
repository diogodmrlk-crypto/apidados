const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/*
MEMÓRIA GLOBAL PERSISTENTE NA INSTÂNCIA
*/
global.users = global.users || [
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
];


// ================= GET USERS
app.get("/dados", (req, res) => {
  res.json(global.users);
});


// ================= CREATE USER
app.post("/dados", (req, res) => {

  const { username, password, avatar } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Campos obrigatórios" });

  if (global.users.find(u => u.username === username))
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

  global.users.push(newUser);

  res.json({ success: true, user: newUser });
});


// ================= UPDATE USER
app.put("/dados/:username", (req, res) => {

  const user = global.users.find(u => u.username === req.params.username);

  if (!user)
    return res.status(404).json({ error: "Usuário não encontrado" });

  Object.assign(user, req.body);

  res.json({ success: true, user });
});


// ================= DELETE USER
app.delete("/dados/:username", (req, res) => {

  global.users = global.users.filter(
    u => u.username !== req.params.username
  );

  res.json({ success: true });
});

module.exports = app;
