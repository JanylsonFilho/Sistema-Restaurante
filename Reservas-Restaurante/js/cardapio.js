document.getElementById("formCardapio").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const descricao = document.getElementById("descricao").value;
  const categoria = document.getElementById("categoria").value;
  const preco = parseFloat(document.getElementById("preco").value);

  const itens = JSON.parse(localStorage.getItem("cardapio")) || [];

  const novoItem = {
    id_item_cardapio: Date.now(),
    nome,
    descricao,
    categoria,
    preco
  };

  itens.push(novoItem);
  localStorage.setItem("cardapio", JSON.stringify(itens));
  this.reset();
  listarCardapio();
});

function listarCardapio() {
  const lista = document.getElementById("listaCardapio");
  const itens = JSON.parse(localStorage.getItem("cardapio")) || [];
  lista.innerHTML = "";

  itens.forEach((item) => {
    const row = `
      <tr>
        <td>${item.id_item_cardapio}</td>
        <td>${item.nome}</td>
        <td>${item.descricao}</td>
        <td>${item.categoria}</td>
        <td>R$ ${item.preco.toFixed(2)}</td>
        <td><button onclick="deletarItem(${item.id_item_cardapio})">Excluir</button></td>
      </tr>`;
    lista.innerHTML += row;
  });
}

function deletarItem(id) {
  let itens = JSON.parse(localStorage.getItem("cardapio")) || [];
  itens = itens.filter((i) => i.id_item_cardapio !== id);
  localStorage.setItem("cardapio", JSON.stringify(itens));
  listarCardapio();
}

document.addEventListener("DOMContentLoaded", listarCardapio);
