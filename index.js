import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// JSON online dos usuários (substitui banco)
let users = [
  {
    username: "Ferraodev",
    password: "Diogomiranda00k",
    admin: true,
    plan: "basico",
    planLimit: 500,
    planEnd: null,
    avatar: "https://via.placeholder.com/60",
    keysGenerated: 0
  }
];

// ==================== ROTAS ====================

// Listar todos usuários
app.get("/users", (req, res) => {
  res.json(users);
});

// Criar novo usuário
app.post("/users", (req, res) => {
  const { username, password, avatar } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Preencha todos os campos" });

  // Verifica se já existe
  if (users.find(u => u.username === username)) return res.status(400).json({ error: "Usuário já existe" });

  const newUser = {
    username,
    password,
    admin: false,
    plan: null,
    planLimit: 0,
    planEnd: null,
    avatar: avatar || "https://via.placeholder.com/60",
    keysGenerated: 0
  };
  users.push(newUser);
  res.json(newUser);
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(400).json({ error: "Usuário ou senha inválidos" });
  res.json(user);
});

// Atualizar usuário (planos, avatar, etc)
app.patch("/users/:username", (req, res) => {
  const { username } = req.params;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

  const { plan, planLimit, planEnd, avatar, keysGenerated } = req.body;
  if (plan !== undefined) user.plan = plan;
  if (planLimit !== undefined) user.planLimit = planLimit;
  if (planEnd !== undefined) user.planEnd = planEnd;
  if (avatar !== undefined) user.avatar = avatar;
  if (keysGenerated !== undefined) user.keysGenerated = keysGenerated;

  res.json(user);
});

// ==================== INICIAR SERVIDOR ====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API de usuários rodando na porta ${PORT}`);
});
