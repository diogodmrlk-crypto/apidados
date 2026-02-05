
const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const app = express();

app.use(cors());
app.use(express.json());

const USERS_FILE = "./users.json";

// Função para ler JSON
async function readUsers() {
    const data = await fs.readFile(USERS_FILE, "utf8");
    return JSON.parse(data);
}

// Função para salvar JSON
async function saveUsers(users) {
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

// GET todos usuários
app.get("/dados", async (req, res) => {
    try {
        const data = await readUsers();
        res.json(data);
    } catch (e) {
        res.status(500).json({ error: "Erro ao ler usuários" });
    }
});

// POST criar usuário
app.post("/dados", async (req, res) => {
    try {
        const { username, password, avatar } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Usuário e senha obrigatórios" });

        const data = await readUsers();
        if (data.users.find(u => u.username === username)) return res.status(400).json({ error: "Usuário já existe" });

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

        data.users.push(newUser);
        await saveUsers(data);
        res.json({ success: true, user: newUser });
    } catch (e) {
        res.status(500).json({ error: "Erro ao salvar usuário" });
    }
});

// PATCH atualizar usuário
app.patch("/dados/:username", async (req, res) => {
    try {
        const username = req.params.username;
        const data = await readUsers();
        const user = data.users.find(u => u.username === username);
        if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

        Object.assign(user, req.body);
        await saveUsers(data);
        res.json({ success: true, user });
    } catch (e) {
        res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
});

// Porta Vercel
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API rodando na porta ${port}`));
