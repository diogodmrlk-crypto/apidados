const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

/*
  BANCO EM MEMÓRIA
  (Vercel mantém enquanto função estiver ativa)
*/

let users = [
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


// =====================
// GET TODOS USUÁRIOS
// =====================
app.get("/dados", (req, res) => {
  res.json(users);
});


// =====================
// CRIAR USUÁRIO
// =====================
app.post("/dados", (req, res) => {

  const { username, password, avatar } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: "Campos obrigatórios" });

  const exists = users.find(u => u.username === username);

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

  users.push(newUser);

  res.json({ success: true, user: newUser });
});


// =====================
// ATUALIZAR USUÁRIO
// =====================
app.put("/dados/:username", (req, res) => {

  const user = users.find(u => u.username === req.params.username);

  if (!user)
    return res.status(404).json({ error: "Usuário não encontrado" });

  Object.assign(user, req.body);

  res.json({ success: true, user });
});


// =====================
// EXCLUIR USUÁRIO
// =====================
app.delete("/dados/:username", (req, res) => {

  users = users.filter(u => u.username !== req.params.username);

  res.json({ success: true });
});


// =====================
app.listen(3000, () => console.log("API ONLINE"));
