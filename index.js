const express = require("express");
const cors = require("cors");
const app = express();

// Configurações
app.use(cors());
app.use(express.json());

// Banco em memória (substitua por JSON se quiser persistir)
let users = [
  {
    username: "Ferraodev",
    password: "Diogomiranda00k",
    admin: true,
    avatar: "https://via.placeholder.com/60",
    plan: null,
    keysGenerated: 0,
    planLimit: 0,
    planEnd: null,
    keys: []
  }
];

// Rotas
app.get("/dados", (req, res) => {
  res.json({ users });
});

app.post("/dados", (req, res) => {
  const { username, password, avatar } = req.body;
  if(!username || !password) return res.status(400).json({ error: "Usuário e senha obrigatórios" });
  if(users.find(u => u.username === username)) return res.status(400).json({ error: "Usuário já existe" });

  const newUser = {
    username,
    password,
    avatar: avatar || "https://via.placeholder.com/60",
    admin: false,
    plan: null,
    keysGenerated: 0,
    planLimit: 0,
    planEnd: null,
    keys: []
  };
  users.push(newUser);
  res.json({ success: true, user: newUser });
});

app.patch("/dados/:username", (req, res) => {
  const u = users.find(x => x.username === req.params.username);
  if(!u) return res.status(404).json({ error: "Usuário não encontrado" });
  Object.assign(u, req.body);
  res.json({ success: true, user: u });
});

// Porta padrão Vercel
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API rodando na porta ${port}`));
