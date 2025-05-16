document.addEventListener("DOMContentLoaded", () => {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!usuario) {
  alert("Acesso não autorizado.");
  window.location.href = "login.html";
  return;
  }
 

  // Esconde cadastro e exclusão para não-admins
  if (usuario.tipo !== "admin") {
  const form = document.getElementById("formMesa");
  if (form) form.style.display = "none";
  }
 

  listarMesas();
 });
 

 document.getElementById("formMesa")?.addEventListener("submit", function (e) {
  e.preventDefault();
 

  const numero_mesa = document.getElementById("num_mesa").value;
  const capacidade = parseInt(document.getElementById("capacidade").value);
  const nome_garcom = document.getElementById("nome_garcom").value;
  const disponibilidade = document.getElementById("disponibilidade").value;
 

  const mesas = JSON.parse(localStorage.getItem("mesas")) || [];
 

  const novaMesa = {
  id_mesa: Date.now(),
  num_mesa: numero_mesa,
  capacidade,
  nome_garcom,
  disponibilidade
  };
 

  mesas.push(novaMesa);
  localStorage.setItem("mesas", JSON.stringify(mesas));
  this.reset();
  listarMesas();
 });
 

 function listarMesas() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const lista = document.getElementById("listaMesas");
  const mesas = JSON.parse(localStorage.getItem("mesas")) || [];
  lista.innerHTML = "";
 

  mesas.forEach((mesa) => {
  let botoes = "";
  if (usuario.tipo === "admin") {
  botoes = `<button class="botao-excluir" onclick="deletarMesa(${mesa.id_mesa})">Excluir</button>`;
  }
 

  const row = `
  <tr>
  <td>${mesa.id_mesa}</td>
  <td>${mesa.num_mesa}</td>
  <td>${mesa.capacidade}</td>
  <td>${mesa.nome_garcom}</td>
  <td>${mesa.disponibilidade}</td>
  <td>${botoes}</td>
  </tr>`;
  lista.innerHTML += row;
  });
 }
 

 function deletarMesa(id) {
  let mesas = JSON.parse(localStorage.getItem("mesas")) || [];
  mesas = mesas.filter((m) => m.id_mesa !== id);
  localStorage.setItem("mesas", JSON.stringify(mesas));
  listarMesas();
 }