import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

let users = [
  {
    username: "Ferraodev",
    password: "Diogomiranda00k",
    admin: true,
    plan: "basico",
    planLimit: 500,
    planEnd: null,
    avatar: "https://via.placeholder.com/60",
    keysGenerated: 0,
    device: null
  }
];

// GET - listar todos
app.get("/dados", (req, res) => res.json(users));

// POST - criar novo usuário
app.post("/dados", (req, res) => {
  const { username, password, avatar } = req.body;
  if(!username || !password) return res.status(400).json({ error: "Preencha todos os campos" });
  if(users.find(u => u.username === username)) return res.status(400).json({ error: "Usuário já existe" });

  const newUser = {
    username,
    password,
    admin: false,
    plan: null,
    planLimit: 0,
    planEnd: null,
    avatar: avatar || "https://via.placeholder.com/60",
    keysGenerated: 0,
    device: null
  };

  users.push(newUser);
  res.json(newUser);
});

// PUT - atualizar usuário
app.put("/dados/:username", (req, res) => {
  const { username } = req.params;
  const user = users.find(u => u.username === username);
  if(!user) return res.status(404).json({ error: "Usuário não encontrado" });

  Object.assign(user, req.body);
  res.json(user);
});

// DELETE - remover usuário
app.delete("/dados/:username", (req,res)=>{
  const { username } = req.params;
  const index = users.findIndex(u => u.username === username);
  if(index === -1) return res.status(404).json({ error: "Usuário não encontrado" });
  const removed = users.splice(index,1)[0];
  res.json(removed);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API de usuários rodando na porta", PORT));
