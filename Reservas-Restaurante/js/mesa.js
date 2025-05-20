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
 

let idMesaEditando = null;



function listarMesas() {
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  const lista = document.getElementById("listaMesas");
  const mesas = JSON.parse(localStorage.getItem("mesas")) || [];
  lista.innerHTML = "";

  mesas.forEach((mesa) => {
    let botoes = "";
    if (usuario.tipo === "admin") {
      botoes = `
        <button class="botao-excluir" onclick="deletarMesa(${mesa.id_mesa})">Excluir</button>
        <button class="botao-editar" onclick="editarMesa(${mesa.id_mesa})">Editar</button>
      `;
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

function editarMesa(id) {
  const mesas = JSON.parse(localStorage.getItem("mesas")) || [];
  const mesa = mesas.find(m => m.id_mesa === id);
  if (mesa) {
    document.getElementById("num_mesa").value = mesa.num_mesa;
    document.getElementById("capacidade").value = mesa.capacidade;
    document.getElementById("nome_garcom").value = mesa.nome_garcom;
    document.getElementById("disponibilidade").value = mesa.disponibilidade;
    idMesaEditando = id;
    alert("Modo de edição ativado para a mesa: " + id);
  }
}

document.getElementById("formMesa")?.addEventListener("submit", function (e) {
  e.preventDefault();

  const numero_mesa = document.getElementById("num_mesa").value;
  const capacidade = parseInt(document.getElementById("capacidade").value);
  const nome_garcom = document.getElementById("nome_garcom").value;
  const disponibilidade = document.getElementById("disponibilidade").value;

  const mesas = JSON.parse(localStorage.getItem("mesas")) || [];

  if (idMesaEditando) {
    // Atualiza mesa existente
    const index = mesas.findIndex(m => m.id_mesa === idMesaEditando);
    if (index !== -1) {
      mesas[index] = {
        ...mesas[index],
        num_mesa: numero_mesa,
        capacidade,
        nome_garcom,
        disponibilidade
      };
      alert("Mesa atualizada com sucesso!");
    }
    idMesaEditando = null;
  } else {
    // Cria nova mesa
    const novaMesa = {
      id_mesa: Date.now(),
      num_mesa: numero_mesa,
      capacidade,
      nome_garcom,
      disponibilidade
    };
    mesas.push(novaMesa);
    alert("Mesa cadastrada com sucesso!");
  }

  localStorage.setItem("mesas", JSON.stringify(mesas));
  this.reset();
  listarMesas();
});



 function deletarMesa(id) {
  let mesas = JSON.parse(localStorage.getItem("mesas")) || [];
  mesas = mesas.filter((m) => m.id_mesa !== id);
  localStorage.setItem("mesas", JSON.stringify(mesas));
  listarMesas();
 }