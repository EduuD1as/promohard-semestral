document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu");

  // Verifica se o token está armazenado no localStorage
  const token = localStorage.getItem("authToken");

  if (token) {
    // Usuário logado: altera o menu para incluir "Perfil", "Favoritos" e "Sair"
    menu.innerHTML = `
      <li id="profile">
        <button id="addProductButton" style="border-radius: 20px; border: 1px solid #333; padding: 6px; margin-right: 28px; vertical-align: middle; font-family: 'Inter'; cursor: pointer;">
          Adicionar produto <img src="../assets/plus.svg" alt="Plus" style="vertical-align: middle; width: 18px; height: 18px; background: none;"/>
        </button>
        <img src="../assets/favorite-svgrepo-com.svg" alt="Favoritos" id="favoritesButton" style="width: 24px; height: 24px; cursor: pointer; margin-right: 30px;" />
        <div id="favoritesDropdown" class="dropdown-content">
          <p id="favoritesEmptyMessage">Nenhum item adicionado aos favoritos.</p>
          <ul id="favoritesList"></ul>
        </div>
        <a href="../pages/profile.html">
          <img
            src="../assets/user-circle.svg"
            alt="Perfil"
            style="width: 24px; height: 24px; border-radius: 50%;"
          />
        </a>
      </li>
      <li>
        <button id="logoutButton" style="background: none; border: none; color: #333; cursor: pointer; font-family: 'Inter'; font-size: 16px; padding: 0; vertical-align: middle;">
          Sair
        </button>
      </li>
    `;

    const gotoCommunityProductsButton = document.getElementById("gotoCommunityProducts");

    if (gotoCommunityProductsButton) {
      gotoCommunityProductsButton.addEventListener("click", () => {
        window.location.href = "../pages/productsCommunity.html";
      });
    } else {
      console.error("Botão de redirecionamento para Produtos da Comunidade não encontrado.");
    }

    const favoritesButton = document.getElementById("favoritesButton");
    const favoritesDropdown = document.getElementById("favoritesDropdown");
    const favoritesList = document.getElementById("favoritesList");
    const favoritesEmptyMessage = document.getElementById("favoritesEmptyMessage");

    if (favoritesButton && favoritesDropdown) {
      favoritesButton.addEventListener("click", (event) => {
        event.preventDefault();
        favoritesDropdown.style.display = (favoritesDropdown.style.display === "block") ? "none" : "block";
      });

      window.addEventListener("click", (event) => {
        if (!favoritesButton.contains(event.target) && !favoritesDropdown.contains(event.target)) {
          favoritesDropdown.style.display = "none";
        }
      });

      // Carrega os favoritos do localStorage
      loadFavorites();

      // Função para alternar um produto nos favoritos
      function toggleFavorite(name, link, image, price) {
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        const productIndex = favorites.findIndex(fav => fav.name === name);

        const productCards = document.querySelectorAll('.product');
        productCards.forEach(card => {
          const cardName = card.querySelector("p").innerText;
          if (cardName === name) {
            card.classList.toggle('favorited', productIndex === -1);
          }
        });

        if (productIndex === -1) {
          // Adiciona aos favoritos
          favorites.push({ name, link, image, price });
        } else {
          // Remove dos favoritos
          favorites.splice(productIndex, 1);
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));
        loadFavorites();
      }

      // Função para carregar favoritos do localStorage e exibir no menu suspenso
      function loadFavorites() {
        const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        favoritesList.innerHTML = "";

        if (favorites.length === 0) {
          favoritesEmptyMessage.style.display = "block";
        } else {
          favoritesEmptyMessage.style.display = "none";
          favorites.forEach(favorite => {
            const listItem = document.createElement("li");
            listItem.innerHTML = `
              <a href="${favorite.link}" target="_blank">
                <img src="${favorite.image}" alt="${favorite.name}" style="width: 40px; height: 40px; vertical-align: middle; margin-right: 10px;">
                ${favorite.name} - ${favorite.price}
              </a>
              <button class="remove-favorite" data-name="${favorite.name}">&times;</button>
            `;
            favoritesList.appendChild(listItem);
          });

          // Adiciona eventos aos botões de remoção
          document.querySelectorAll(".remove-favorite").forEach(button => {
            button.addEventListener("click", (event) => {
              const name = event.target.getAttribute("data-name");
              removeFavorite(name);
            });
          });
        }
      }

      // Função para remover um produto dos favoritos
      function removeFavorite(name) {
        let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
        favorites = favorites.filter(fav => fav.name !== name);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        loadFavorites();
      }
    } else {
      console.error("Botão de favoritos ou menu suspenso não encontrado.");
    }

    // Adiciona evento ao botão de sair
    const logoutButton = document.getElementById("logoutButton");
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        localStorage.removeItem("authToken"); // Remove o token do localStorage
        window.location.href = "/"; // Redireciona para a página inicial
      });
    } else {
      console.error("Botão de logout não encontrado.");
    }

    // Adiciona evento ao botão "Adicionar produto" para exibir o menu suspenso
    const addProductButton = document.getElementById("addProductButton");
    const addProductDropdown = document.getElementById("addProductDropdown");
    if (addProductButton && addProductDropdown) {
      addProductButton.addEventListener("click", (event) => {
        event.preventDefault(); // Previne o comportamento padrão de adicionar link na URL
        addProductDropdown.style.display = (addProductDropdown.style.display === "block") ? "none" : "block";
      });

      document.getElementById("cancelProductButton").addEventListener("click", (event) => {
        event.preventDefault(); // Previne o comportamento padrão
        addProductDropdown.style.display = "none";
      });

      document.getElementById("submitProductButton").addEventListener("click", async (event) => {
        event.preventDefault(); // Previne o comportamento padrão
        const productName = document.getElementById("productName").value.trim();
        const productLink = document.getElementById("productLink").value.trim();

        if (productName && productLink) {
          try {
            const response = await fetch('/api/addProduct', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              },
              body: JSON.stringify({ productName, productLink })
            });

            const result = await response.json();
            if (response.ok) {
              alert(result.message || "Produto adicionado com sucesso!");
              addProductDropdown.style.display = "none";
            } else {
              alert(result.error || "Erro ao adicionar produto.");
            }
          } catch (error) {
            console.error('Erro ao adicionar produto:', error);
            alert('Erro ao adicionar produto. Tente novamente mais tarde.');
          }
        } else {
          alert("Por favor, insira um nome e um link de produto válido.");
        }
      });
    } else {
      console.error("Botão de adicionar produto ou menu suspenso não encontrado.");
    }
  } else {
    console.log("Usuário não logado. Exibindo opções de login e registro...");
    // Usuário não logado: exibe os botões de login e registro
    menu.innerHTML = `
      <li id="create-account"><a href="../pages/cadastro.html">Criar Conta</a></li>
      <li id="login"><a href="../pages/login.html">Fazer Login</a></li>
    `;
  }

  const urlParams = new URLSearchParams(window.location.search);
  let category = urlParams.get('category');
  let currentPage = parseInt(urlParams.get('page')) || 1;
  const productsPerPage = 15;

  if (!category) {
    console.error('Categoria não selecionada!');
    return; // Retorna caso nenhuma categoria seja passada.
  }

  // Definição dos filtros baseados na categoria
  const filterMap = {
    cpu: ['AMD', 'Intel'],
    mobo: ['AMD', 'Intel', 'DDR3', 'DDR4', 'DDR5'],
    gpu: ['NVIDIA', 'AMD', 'Intel'],
    ram: ['DDR3', 'DDR4', 'DDR5'],
    ssd: ['NVME', 'SATA'],
    psu: ['Selo 80 Plus'],
    cooling: ['Ventoinha', 'Air Cooler', 'Water Cooler'],
    case: ['Full Tower', 'Mid Tower', 'Mini Tower'],
  };

  // Atualiza os filtros dinamicamente com base na categoria selecionada
  function updateFilters(category) {
    const filters = filterMap[category] || [];
    const filtersContainer = document.getElementById('filters');

    if (filtersContainer) {
      filtersContainer.innerHTML = filters.map(filter => `
        <label>
          <input type="checkbox" name="filter" value="${filter}">
          <span>${filter}</span>
        </label>
      `).join('');
    }
  }

  // Exibe os filtros na página inicial
  updateFilters(category);

  // Função para renderizar produtos
  function renderProducts(products) {
    const productGrid = document.getElementById('produtos-grid');
    if (!productGrid) {
      console.error("Elemento 'produtos-grid' não encontrado!");
      return;
    }

    productGrid.innerHTML = ''; // Limpa o grid antes de carregar novos produtos

    if (!products || products.length === 0) {
      productGrid.innerHTML = '<p>Nenhum produto encontrado para os critérios selecionados.</p>';
      return;
    }

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = products.slice(start, end);

    console.log(`Renderizando produtos da página ${currentPage} de ${products.length} produtos totais.`);
    paginatedProducts.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product';

      // Acessa as propriedades com fallback
      const productName = product.nome || 'Nome do Produto Indisponível';
      const productPrice = product.preco || 'Preço Indisponível';
      const productImage = product.img || '../assets/default-image.jpg'; // Imagem padrão caso não tenha
      const productLink = product.link || '#'; // Link padrão caso não tenha

      // Verifica se o produto está nos favoritos
      const isFavorited = favorites.some(fav => fav.name === productName);

      // Renderiza o produto no grid
      productCard.innerHTML = `
        <a href="${productLink}" target="_blank">
          <img src="${productImage}" alt="${productName}">
          <p>${productName}</p>
        </a>
        <span class="price">${productPrice}</span>
        <button class="favorite-button ${isFavorited ? 'favorited' : ''}">${isFavorited ? 'Favoritado' : 'Favoritar'}</button>
      `;
      productGrid.appendChild(productCard);
    });

    renderPagination(products.length);

    // Adiciona eventos aos botões "Favoritar" de cada produto
    document.querySelectorAll(".favorite-button").forEach(button => {
      button.addEventListener("click", (event) => {
        const productCard = event.target.closest(".product");
        const productName = productCard.querySelector("p").innerText;
        const productLink = productCard.querySelector("a").href;
        const productImage = productCard.querySelector("img").src;
        const productPrice = productCard.querySelector(".price").innerText;

        toggleFavorite(productName, productLink, productImage, productPrice);
        event.target.innerText = event.target.innerText === 'Favoritar' ? 'Favoritado' : 'Favoritar';
        event.target.classList.toggle('favorited');
      });
    });
  }


  function renderPagination(totalProducts) {
    const totalPages = Math.ceil(totalProducts / productsPerPage);
    const paginationContainer = document.querySelector('.pagination');
    const pageNumbersContainer = document.getElementById('page-numbers');

    pageNumbersContainer.innerHTML = '';

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
      const firstPageButton = document.createElement('button');
      firstPageButton.textContent = '1';
      firstPageButton.classList.add('page-button');
      firstPageButton.addEventListener('click', () => {
        currentPage = 1;
        urlParams.set('page', currentPage);
        window.history.pushState({}, '', `?${urlParams.toString()}`);
        loadProducts(category);
      });
      pageNumbersContainer.appendChild(firstPageButton);

      if (startPage > 2) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        pageNumbersContainer.appendChild(dots);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageButton = document.createElement('button');
      pageButton.textContent = i;
      pageButton.classList.add('page-button');
      if (i === currentPage) {
        pageButton.classList.add('active');
      }
      pageButton.addEventListener('click', () => {
        currentPage = i;
        urlParams.set('page', currentPage);
        window.history.pushState({}, '', `?${urlParams.toString()}`);
        loadProducts(category);
      });
      pageNumbersContainer.appendChild(pageButton);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement('span');
        dots.textContent = '...';
        pageNumbersContainer.appendChild(dots);
      }

      const lastPageButton = document.createElement('button');
      lastPageButton.textContent = totalPages;
      lastPageButton.classList.add('page-button');
      lastPageButton.addEventListener('click', () => {
        currentPage = totalPages;
        urlParams.set('page', currentPage);
        window.history.pushState({}, '', `?${urlParams.toString()}`);
        loadProducts(category);
      });
      pageNumbersContainer.appendChild(lastPageButton);
    }

    document.getElementById('prev-page').disabled = currentPage === 1;
    document.getElementById('next-page').disabled = currentPage === totalPages;
    document.getElementById('first-page').disabled = currentPage === 1;
    document.getElementById('last-page').disabled = currentPage === totalPages;
  }

  // Exibe indicador de carregamento
  function showLoadingIndicator() {
    const productGrid = document.getElementById('produtos-grid');
    productGrid.innerHTML = '<p id="loading-message">Carregando...</p>';
  }

  // Remove indicador de carregamento
  function hideLoadingIndicator() {
    const loadingMessage = document.getElementById('loading-message');
    if (loadingMessage) {
      loadingMessage.remove();
    }
  }

  // Função para carregar produtos do JSON
  function loadProducts(category) {
    console.log(`Carregando produtos para a categoria: ${category}`);
    fetch('/api/getProducts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erro ao carregar produtos: ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {
        hideLoadingIndicator();
        renderProducts(data);
      })
      .catch(error => {
        hideLoadingIndicator();
        console.error('Erro ao carregar produtos:', error);
        const productGrid = document.getElementById('produtos-grid');
        if (productGrid) {
          productGrid.innerHTML = `<p>Erro ao carregar produtos: ${error.message}</p>`;
        }
      });
  }

  // Função para executar o web scraping e carregar produtos
  function scrapeAndLoadProducts(category) {
    showLoadingIndicator();
    updateFilters(category); // Atualiza os filtros ao alternar categoria

    fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories: [category] })
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'Scripts executados!') {
          const intervalId = setInterval(() => {
            fetch('/api/getProducts', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ category })
            })
              .then(response => response.json())
              .then(products => {
                if (products.length > 0) {
                  clearInterval(intervalId);
                  hideLoadingIndicator();
                  renderProducts(products);
                }
              });
          }, 2000);
        } else {
          hideLoadingIndicator();
          throw new Error(data.error || 'Erro desconhecido.');
        }
      })
      .catch(error => {
        hideLoadingIndicator();
        console.error('Erro ao executar web scraping:', error);
        const productGrid = document.getElementById('produtos-grid');
        if (productGrid) {
          productGrid.innerHTML = `<p>Erro ao carregar produtos: ${error.message}</p>`;
        }
      });
  }

  // Adiciona evento ao clicar em um link de categoria para redirecionar e executar o web scraping
  document.querySelectorAll('#divNav a').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      category = event.target.getAttribute('data-category');
      urlParams.set('category', category);
      urlParams.set('page', 1);
      window.history.pushState({}, '', `?${urlParams.toString()}`);
      scrapeAndLoadProducts(category);
    });
  });

  // Controle de paginação
  document.getElementById('first-page').addEventListener('click', () => {
    currentPage = 1;
    urlParams.set('page', currentPage);
    window.history.pushState({}, '', `?${urlParams.toString()}`);
    loadProducts(category);
  });

  document.getElementById('prev-page').addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      urlParams.set('page', currentPage);
      window.history.pushState({}, '', `?${urlParams.toString()}`);
      loadProducts(category);
    }
  });

  document.getElementById('next-page').addEventListener('click', () => {
    fetch('/api/getProducts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category })
    })
      .then(response => response.json())
      .then(data => {
        const totalPages = Math.ceil(data.length / productsPerPage);
        if (currentPage < totalPages) {
          currentPage++;
          urlParams.set('page', currentPage);
          window.history.pushState({}, '', `?${urlParams.toString()}`);
          loadProducts(category);
        }
      })
      .catch(error => {
        console.error('Erro ao carregar produtos:', error);
      });
  });

  document.getElementById('last-page').addEventListener('click', () => {
    fetch('/api/getProducts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category })
    })
      .then(response => response.json())
      .then(data => {
        const totalPages = Math.ceil(data.length / productsPerPage);
        currentPage = totalPages;
        urlParams.set('page', currentPage);
        window.history.pushState({}, '', `?${urlParams.toString()}`);
        loadProducts(category);
      })
      .catch(error => {
        console.error('Erro ao carregar produtos:', error);
      });
  });

  // Carrega os produtos da categoria inicial ao carregar a página
  scrapeAndLoadProducts(category);
});

// Função para buscar produtos
function searchProducts(term) {
  const productGrid = document.getElementById('produtos-grid');
  const products = Array.from(productGrid.querySelectorAll('.product'));
  const noResultsMessageId = 'no-results-message'; // ID da mensagem de "nenhum resultado"

  if (!products.length) {
    console.error("Nenhum produto para filtrar.");
    return;
  }

  // Remove a mensagem de "nenhum resultado" existente (se houver)
  const existingMessage = document.getElementById(noResultsMessageId);
  if (existingMessage) {
    existingMessage.remove();
  }

  // Converte o termo para minúsculas para comparação
  const searchTerm = term.toLowerCase();
  let matchFound = false;

  products.forEach(product => {
    const productName = product.querySelector('p').innerText.toLowerCase();
    const isMatch = productName.includes(searchTerm);
    product.style.display = isMatch ? 'block' : 'none';
    if (isMatch) matchFound = true;
  });

  // Adiciona uma mensagem se nenhum produto for encontrado
  if (!matchFound) {
    const noResultsMessage = document.createElement('p');
    noResultsMessage.id = noResultsMessageId;
    noResultsMessage.innerText = "Nenhum produto encontrado.";
    noResultsMessage.style.textAlign = 'center';
    noResultsMessage.style.fontSize = '18px';
    noResultsMessage.style.color = '#555';
    noResultsMessage.style.marginTop = '20px';
    productGrid.appendChild(noResultsMessage);
  }
}

// Adiciona evento ao botão de pesquisa
document.getElementById('search-button').addEventListener('click', () => {
  const searchInput = document.getElementById('search-input').value.trim();
  searchProducts(searchInput);
});

// Permite busca ao pressionar "Enter" no campo de pesquisa
document.getElementById('search-input').addEventListener('keypress', event => {
  if (event.key === 'Enter') {
    const searchInput = event.target.value.trim();
    searchProducts(searchInput);
  }
});

// Função para alternar um produto nos favoritos
function toggleFavorite(name, link, image, price) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const productIndex = favorites.findIndex(fav => fav.name === name);

  const productCards = document.querySelectorAll('.product');
  productCards.forEach(card => {
    const cardName = card.querySelector("p").innerText;
    if (cardName === name) {
      const favoriteButton = card.querySelector('.favorite-button');
      if (productIndex === -1) {
        favoriteButton.classList.add('favorited');
        favoriteButton.innerText = 'Favoritado';
      } else {
        favoriteButton.classList.remove('favorited');
        favoriteButton.innerText = 'Favoritar';
      }
    }
  });

  if (productIndex === -1) {
    // Adiciona aos favoritos
    favorites.push({ name, link, image, price });
  } else {
    // Remove dos favoritos
    favorites.splice(productIndex, 1);
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  loadFavorites(false); // Passar false para manter o menu aberto
}

// Atualizar a função loadFavorites para aceitar um parâmetro
function loadFavorites(keepOpen = true) {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const favoritesList = document.getElementById("favoritesList");
  const favoritesEmptyMessage = document.getElementById("favoritesEmptyMessage");

  favoritesList.innerHTML = "";

  if (favorites.length === 0) {
    favoritesEmptyMessage.style.display = "block";
  } else {
    favoritesEmptyMessage.style.display = "none";
    favorites.forEach(favorite => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
        <a href="${favorite.link}" target="_blank">
          <img src="${favorite.image}" alt="${favorite.name}" style="width: 40px; height: 40px; vertical-align: middle; margin-right: 10px;">
          ${favorite.name} - ${favorite.price}
        </a>
        <button class="remove-favorite" data-name="${favorite.name}">&times;</button>
      `;
      favoritesList.appendChild(listItem);
    });

    // Adiciona eventos aos botões de remoção
    document.querySelectorAll(".remove-favorite").forEach(button => {
      button.addEventListener("click", (event) => {
        const name = event.target.getAttribute("data-name");
        removeFavorite(name, keepOpen);
      });
    });
  }

  // Manter o menu aberto se keepOpen for true
  if (keepOpen) {
    document.getElementById('favoritesDropdown').style.display = 'block';
  }
}

// Atualizar a função removeFavorite para aceitar um parâmetro
function removeFavorite(name, keepOpen = true) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  favorites = favorites.filter(fav => fav.name !== name);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  loadFavorites(keepOpen);
}

