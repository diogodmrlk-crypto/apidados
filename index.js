import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

// ----- Banco de usuários em memória (substituir por DB se quiser persistência real) -----
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

// ----- Endpoints -----

// GET todos usuários
app.get("/dados", (req, res) => {
    res.json({ users });
});

// POST criar usuário
app.post("/dados", (req, res) => {
    const { username, password, avatar } = req.body;
    if(!username || !password) return res.status(400).json({ error: "Usuário e senha obrigatórios" });
    if(users.find(u=>u.username===username)) return res.status(400).json({ error: "Usuário já existe" });

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

// PATCH atualizar usuário (plano, keys, avatar etc)
app.patch("/dados/:username", (req, res) => {
    const user = users.find(u => u.username===req.params.username);
    if(!user) return res.status(404).json({ error: "Usuário não encontrado" });

    Object.assign(user, req.body);
    res.json({ success: true, user });
});

// ----- Conectar com API de keys -----
app.post("/gerar-key/:username", async (req,res) => {
    const { tipo } = req.body;
    const user = users.find(u=>u.username===req.params.username);
    if(!user) return res.status(404).json({error:"Usuário não encontrado"});
    if(!user.plan) return res.status(403).json({error:"Usuário sem plano"});
    if(user.keysGenerated>=user.planLimit) return res.status(403).json({error:"Limite de keys atingido"});

    const novaKey = `FERRAO-CHEATS-${Math.random().toString(36).substring(2,10).toUpperCase()}`;
    // Enviar para a API de keys
    try{
        await fetch("https://teste-api-mcok.vercel.app/keys", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
                key: novaKey,
                type: tipo,
                used:false,
                revoked:false,
                device:null,
                createdAt:new Date()
            })
        });
    }catch(err){ console.error(err); return res.status(500).json({error:"Erro ao conectar com API de keys"}); }

    user.keys.push({ key: novaKey, tipo, createdAt: new Date(), device:null, used:false });
    user.keysGenerated++;
    res.json({ success:true, key:novaKey });
});

// Porta Vercel
const port = process.env.PORT || 3000;
app.listen(port, ()=>console.log(`API Users rodando na porta ${port}`));
