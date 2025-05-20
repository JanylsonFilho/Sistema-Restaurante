let idItemEditando = null;

document.getElementById("formCardapio").addEventListener("submit", function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const descricao = document.getElementById("descricao").value;
  const categoria = document.getElementById("categoria").value;
  const preco = parseFloat(document.getElementById("preco").value);

  const itens = JSON.parse(localStorage.getItem("cardapio")) || [];

  if (idItemEditando) {
    // Atualiza item existente
    const index = itens.findIndex(i => i.id_item_cardapio === idItemEditando);
    if (index !== -1) {
      itens[index] = {
        ...itens[index],
        nome,
        descricao,
        categoria,
        preco
      };
      alert("Item do cardápio atualizado com sucesso!");
    }
    idItemEditando = null;
  } else {
    // Cria novo item
    const novoItem = {
      id_item_cardapio: Date.now(),
      nome,
      descricao,
      categoria,
      preco
    };
    itens.push(novoItem);
    alert("Item do cardápio cadastrado com sucesso!");
  }

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
        <td>
          <button onclick="deletarItem(${item.id_item_cardapio})">Excluir</button>
          <button onclick="editarItem(${item.id_item_cardapio})">Editar</button>
        </td>
      </tr>`;
    lista.innerHTML += row;
  });
}

function editarItem(id) {
  const itens = JSON.parse(localStorage.getItem("cardapio")) || [];
  const item = itens.find(i => i.id_item_cardapio === id);
  if (item) {
    document.getElementById("nome").value = item.nome;
    document.getElementById("descricao").value = item.descricao;
    document.getElementById("categoria").value = item.categoria;
    document.getElementById("preco").value = item.preco;
    idItemEditando = id;
    alert("Modo de edição ativado para o item do cardápio: " + id);
  }
}

function deletarItem(id) {
  let itens = JSON.parse(localStorage.getItem("cardapio")) || [];
  itens = itens.filter((i) => i.id_item_cardapio !== id);
  localStorage.setItem("cardapio", JSON.stringify(itens));
  listarCardapio();
}

document.addEventListener("DOMContentLoaded", listarCardapio);