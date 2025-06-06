const API_BASE_URL = "http://localhost:3000/api";

document.getElementById("formLogin").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const mensagemErro = document.getElementById("mensagemErro");

  mensagemErro.textContent = ""; 

  try {
    const response = await fetch(`${API_BASE_URL}/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, senha }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
    
      localStorage.setItem("usuarioLogado", JSON.stringify(result.data)); 
      window.location.href = "painel.html"; 
    } else {
      mensagemErro.textContent = result.message || "Erro desconhecido ao fazer login.";
    }
  } catch (error) {
    console.error("Erro ao tentar login:", error);
    mensagemErro.textContent = "Erro de conexão. Tente novamente mais tarde.";
  }
});