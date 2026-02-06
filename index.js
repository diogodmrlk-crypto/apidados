import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Base de dados em memória
let users = [
  {
    id: "1",
    username: "Ferraodev",
    password: "Diogomiranda00k",
    admin: true,
    plan: "avancado",
    planLimit: 999999,
    planEnd: null,
    avatar: "https://via.placeholder.com/60",
    keysGenerated: 0,
    device: null
  }
];

let keys = [];

// ==================== ROTAS DE USUÁRIOS ====================

// GET - listar todos os usuários
app.get("/dados", (req, res) => res.json(users));

// POST - criar novo usuário
app.post("/dados", (req, res) => {
  const { username, password, avatar, plan } = req.body;
  
  if(!username || !password) {
    return res.status(400).json({ error: "Preencha todos os campos" });
  }
  
  if(users.find(u => u.username === username)) {
    return res.status(400).json({ error: "Usuário já existe" });
  }
  
  const newUser = {
    id: Date.now().toString(),
    username,
    password,
    admin: false,
    plan: plan || "basico",
    planLimit: plan === "avancado" ? 999999 : 500,
    planEnd: null,
    avatar: avatar || "https://via.placeholder.com/60",
    keysGenerated: 0,
    device: null
  };
  
  users.push(newUser);
  res.json(newUser);
});

// PUT - atualizar usuário
app.put("/dados/:id", (req, res) => {
  const { id } = req.params;
  const user = users.find(u => u.id === id || u.username === id);
  
  if(!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  
  // Atualizar limite do plano se mudou
  if(req.body.plan) {
    req.body.planLimit = req.body.plan === "avancado" ? 999999 : 500;
  }
  
  Object.assign(user, req.body);
  res.json(user);
});

// DELETE - remover usuário
app.delete("/dados/:id", (req, res) => {
  const { id } = req.params;
  const index = users.findIndex(u => u.id === id || u.username === id);
  
  if(index === -1) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  
  const removed = users.splice(index, 1)[0];
  
  // Remover todas as keys do usuário
  keys = keys.filter(k => k.username !== removed.username);
  
  res.json(removed);
});

// ==================== ROTAS DE KEYS ====================

// GET - listar todas as keys
app.get("/keys", (req, res) => {
  res.json(keys);
});

// GET - buscar key específica
app.get("/keys/:key", (req, res) => {
  const { key } = req.params;
  const foundKey = keys.find(k => k.key === key);
  
  if(!foundKey) {
    return res.status(404).json({ error: "Key não encontrada" });
  }
  
  res.json(foundKey);
});

// POST - criar nova key
app.post("/keys", (req, res) => {
  const { key, type, username, used, device, createdAt } = req.body;
  
  if(!key || !type || !username) {
    return res.status(400).json({ error: "Campos obrigatórios: key, type, username" });
  }
  
  // Verificar se key já existe
  if(keys.find(k => k.key === key)) {
    return res.status(400).json({ error: "Key já existe" });
  }
  
  // Verificar se usuário existe
  const user = users.find(u => u.username === username);
  if(!user) {
    return res.status(404).json({ error: "Usuário não encontrado" });
  }
  
  // Verificar limite do plano
  const userKeysCount = keys.filter(k => k.username === username).length;
  const limit = user.plan === "avancado" ? 999999 : 500;
  
  if(userKeysCount >= limit) {
    return res.status(403).json({ error: "Limite de keys atingido" });
  }
  
  const newKey = {
    key,
    type,
    username,
    used: used || false,
    device: device || null,
    createdAt: createdAt || Date.now()
  };
  
  keys.push(newKey);
  
  // Incrementar contador de keys geradas
  user.keysGenerated = (user.keysGenerated || 0) + 1;
  
  res.json(newKey);
});

// PUT - atualizar key (revogar, resetar device, etc)
app.put("/keys/:key", (req, res) => {
  const { key } = req.params;
  const foundKey = keys.find(k => k.key === key);
  
  if(!foundKey) {
    return res.status(404).json({ error: "Key não encontrada" });
  }
  
  Object.assign(foundKey, req.body);
  res.json(foundKey);
});

// DELETE - remover key
app.delete("/keys/:key", (req, res) => {
  const { key } = req.params;
  const index = keys.findIndex(k => k.key === key);
  
  if(index === -1) {
    return res.status(404).json({ error: "Key não encontrada" });
  }
  
  const removed = keys.splice(index, 1)[0];
  res.json(removed);
});

// ==================== ROTAS EXTRAS ====================

// GET - estatísticas
app.get("/stats", (req, res) => {
  const totalUsers = users.length;
  const totalKeys = keys.length;
  const activeKeys = keys.filter(k => !k.used).length;
  const expiredKeys = keys.filter(k => {
    if(k.type === "perm") return false;
    
    let duration = 0;
    if(k.type.startsWith("hour-")) {
      const hours = parseInt(k.type.split("-")[1]);
      duration = hours * 60 * 60 * 1000;
    } else if(k.type === "daily") {
      duration = 24 * 60 * 60 * 1000;
    } else if(k.type === "weekly") {
      duration = 7 * 24 * 60 * 60 * 1000;
    }
    
    return (Date.now() - k.createdAt) > duration;
  }).length;
  
  res.json({
    totalUsers,
    totalKeys,
    activeKeys,
    expiredKeys,
    usedKeys: keys.filter(k => k.used).length
  });
});

// GET - verificar key (para sistemas externos)
app.get("/verify/:key", (req, res) => {
  const { key } = req.params;
  const foundKey = keys.find(k => k.key === key);
  
  if(!foundKey) {
    return res.json({ valid: false, message: "Key não encontrada" });
  }
  
  if(foundKey.used) {
    return res.json({ valid: false, message: "Key já foi usada/revogada" });
  }
  
  // Verificar se expirou
  if(foundKey.type !== "perm") {
    let duration = 0;
    if(foundKey.type.startsWith("hour-")) {
      const hours = parseInt(foundKey.type.split("-")[1]);
      duration = hours * 60 * 60 * 1000;
    } else if(foundKey.type === "daily") {
      duration = 24 * 60 * 60 * 1000;
    } else if(foundKey.type === "weekly") {
      duration = 7 * 24 * 60 * 60 * 1000;
    }
    
    const elapsed = Date.now() - foundKey.createdAt;
    if(elapsed > duration) {
      return res.json({ valid: false, message: "Key expirada" });
    }
  }
  
  res.json({ 
    valid: true, 
    message: "Key válida",
    type: foundKey.type,
    username: foundKey.username
  });
});

// POST - ativar key (vincular device)
app.post("/activate/:key", (req, res) => {
  const { key } = req.params;
  const { device } = req.body;
  
  const foundKey = keys.find(k => k.key === key);
  
  if(!foundKey) {
    return res.status(404).json({ error: "Key não encontrada" });
  }
  
  if(foundKey.used) {
    return res.status(403).json({ error: "Key já foi revogada" });
  }
  
  if(foundKey.device && foundKey.device !== device) {
    return res.status(403).json({ error: "Key já vinculada a outro device" });
  }
  
  foundKey.device = device;
  res.json({ success: true, message: "Key ativada com sucesso", key: foundKey });
});

// ==================== INICIAR SERVIDOR ====================

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API rodando na porta ${PORT}`);
  console.log(`📊 Usuários: ${users.length}`);
  console.log(`🔑 Keys: ${keys.length}`);
});
