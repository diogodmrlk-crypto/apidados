<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Painel Keys</title>

<style>
body{
  font-family: Arial;
  background:#0b0b0d;
  color:white;
  display:flex;
  justify-content:center;
  align-items:center;
  height:100vh;
  margin:0;
}

.box{
  background:#141417;
  padding:25px;
  border-radius:12px;
  width:320px;
}

input{
  width:100%;
  padding:10px;
  margin-top:10px;
  border:none;
  border-radius:8px;
  background:#1f1f25;
  color:white;
}

button{
  width:100%;
  padding:10px;
  margin-top:12px;
  border:none;
  border-radius:8px;
  background:#5865F2;
  color:white;
  font-weight:bold;
  cursor:pointer;
}

h2{
  text-align:center;
}

.hide{
  display:none;
}
</style>
</head>

<body>

<!-- LOGIN -->
<div class="box" id="loginBox">

<h2>Login</h2>

<input id="logUser" placeholder="Usuário">
<input id="logPass" type="password" placeholder="Senha">

<button onclick="login()">Entrar</button>
<button onclick="showCadastro()">Criar Conta</button>

</div>


<!-- CADASTRO -->
<div class="box hide" id="cadBox">

<h2>Criar Conta</h2>

<input id="cadUser" placeholder="Usuário">
<input id="cadPass" type="password" placeholder="Senha">

<button onclick="cadastrar()">Cadastrar</button>
<button onclick="showLogin()">Voltar</button>

</div>


<!-- DASHBOARD -->
<div class="box hide" id="dashBox">

<h2 id="welcome"></h2>

<p id="planInfo"></p>

<button onclick="logout()">Logout</button>

</div>



<script>
const API = "https://gerador-online-9fqv.vercel.app/api/dados";


// =====================
// TROCAR TELAS
// =====================
function showCadastro(){
  loginBox.classList.add("hide");
  cadBox.classList.remove("hide");
}

function showLogin(){
  cadBox.classList.add("hide");
  loginBox.classList.remove("hide");
}


// =====================
// CADASTRAR
// =====================
async function cadastrar(){

  const username = cadUser.value;
  const password = cadPass.value;

  if(!username || !password)
    return alert("Preencha tudo");

  try{

    const res = await fetch(API,{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if(data.error){
      alert(data.error);
      return;
    }

    alert("Conta criada!");
    showLogin();

  }catch{
    alert("Erro ao conectar API");
  }
}


// =====================
// LOGIN
// =====================
async function login(){

  try{

    const res = await fetch(API);
    const users = await res.json();

    const user = users.find(u =>
      u.username === logUser.value &&
      u.password === logPass.value
    );

    if(!user)
      return alert("Login inválido");

    localStorage.setItem("user", JSON.stringify(user));

    carregarDashboard();

  }catch{
    alert("Erro ao conectar API");
  }
}


// =====================
// DASHBOARD
// =====================
function carregarDashboard(){

  const user = JSON.parse(localStorage.getItem("user"));

  if(!user) return;

  loginBox.classList.add("hide");
  cadBox.classList.add("hide");
  dashBox.classList.remove("hide");

  welcome.innerText = "Olá, " + user.username;

  if(user.admin){
    planInfo.innerText = "👑 Admin";
  }else{
    planInfo.innerText = "Plano: " + (user.plan || "Nenhum");
  }
}


// =====================
// LOGOUT
// =====================
function logout(){
  localStorage.removeItem("user");
  location.reload();
}


// =====================
// AUTO LOGIN
// =====================
window.onload = ()=>{
  if(localStorage.getItem("user")){
    carregarDashboard();
  }
};
</script>

</body>
</html>
