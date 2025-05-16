const usuarios = [
  { email: "admin@rest.com", senha: "admin123", tipo: "admin" },
  { email: "recep@rest.com", senha: "recep123", tipo: "recepcionista" },
  { email: "garcom@rest.com", senha: "garcom123", tipo: "garcom" },
  { email: "fin@rest.com", senha: "fin123", tipo: "financeiro" }
];

document.getElementById("formLogin").addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const mensagemErro = document.getElementById("mensagemErro");

  const usuario = usuarios.find(u => u.email === email && u.senha === senha);

  if (usuario) {
    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));
    window.location.href = "painel.html";
  } else {
    mensagemErro.textContent = "Email ou senha inválidos.";
  }
});
