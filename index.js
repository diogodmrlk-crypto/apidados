import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

let users = [
  { username:"Ferraodev", password:"Diogomiranda00k", admin:true, plan:"basico", planLimit:500, planEnd:null, avatar:"https://via.placeholder.com/60", keysGenerated:0 }
];

// GET todos os usuários
app.get("/dados", (req,res)=>{
  res.json(users);
});

// POST criar usuário
app.post("/dados", (req,res)=>{
  const u = req.body;
  if(!u.username || !u.password) return res.status(400).json({error:"Preencha todos os campos"});
  if(users.find(x=>x.username===u.username)) return res.status(400).json({error:"Usuário já existe"});
  users.push(u);
  res.json(u);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log("API rodando na porta", PORT));
