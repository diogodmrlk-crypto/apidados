const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// ------------------------------
// Dados em memória
// ------------------------------
let users = [
  {
    username: "Ferraodev",
    password: "Diogomiranda00k",
    avatar: "https://via.placeholder.com/60",
    admin: true,
    plan: "Admin",
    planEnd: null,
    keysGenerated: 0,
    planLimit: 0,
    devices: [],
    keys: []
  }
];

// ------------------------------
// Rotas
// ------------------------------

// Retorna todos os usuários
app.get("/dados", (req, res) => {
  res.json({ users });
});

// Criar usuário normal
app.post("/usuario", (req, res) => {
  const { username, password, avatar } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: "Username e password obrigatórios" });

  if (users.find(u => u.username === username))
    return res.status(400).json({ error: "Usuário já existe" });

  const newUser = {
    username,
    password,
    avatar: avatar || "",
    admin: false,
    plan: null,
    planEnd: null,
    keysGenerated: 0,
    planLimit: 0,
    devices: [],
    keys: []
  };

  users.push(newUser);
  res.json({ success: true, user: newUser });
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(400).json({ error: "Usuário ou senha incorretos" });
  res.json({ success: true, user });
});

// Atualizar plano de usuário
app.post("/plan", (req, res) => {
  const { username, plan, planLimit, planEnd } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

  user.plan = plan || user.plan;
  user.planLimit = planLimit || user.planLimit;
  user.planEnd = planEnd || user.planEnd;
  res.json({ success: true, user });
});

// Resetar devices
app.post("/reset-device", (req, res) => {
  const { username } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: "Usuário não encontrado" });

  user.devices = [];
  res.json({ success: true });
});

app.listen(PORT, () => console.log(`API de usuários rodando na porta ${PORT}`));
