document.addEventListener("DOMContentLoaded", () => {
    const userProductsContainer = document.getElementById("user-products");
    const communityProductsContainer = document.getElementById("community-products");
    const menuContainer = document.getElementById("menu");

    // Função para verificar se o usuário está logado e atualizar o menu
    function checkUserLoggedIn() {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Usuário logado: adicionar botão "Sair"
            menuContainer.innerHTML = `
          <li id="profile">
            <button id="logoutButton" style="background: none; border: none; color: #333; cursor: pointer; font-family: 'Inter'; font-size: 16px; padding: 0; vertical-align: middle;">
              Sair
            </button>
          </li>
        `;
            const logoutButton = document.getElementById("logoutButton");
            logoutButton.addEventListener("click", () => {
                localStorage.removeItem("authToken");
                alert("Você saiu com sucesso!");
                window.location.href = "../pages/login.html";
            });
        } else {
            // Usuário não logado: adicionar botões "Criar Conta" e "Fazer Login"
            menuContainer.innerHTML = `
          <li id="create-account"><a href="../pages/cadastro.html">Criar Conta</a></li>
          <li id="login"><a href="../pages/login.html">Fazer Login</a></li>
        `;
        }
    }

    // Função para renderizar produtos do usuário com status
    function renderUserProducts(container, products) {
        container.innerHTML = ''; // Limpa o container antes de carregar novos produtos

        if (!products || products.length === 0) {
            container.innerHTML = '<p>Nenhum produto encontrado.</p>';
            return;
        }

        products.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            // Acessa as propriedades com fallback
            const productName = product.nome || `Produto ${index + 1}`;
            const productLink = product.link || '#'; // Link padrão caso não tenha
            const productStatus = product.status || 'Status Indisponível';
            const productStatusClass = productStatus.toLowerCase();

            // Renderiza o produto no container
            productCard.innerHTML = `
          <p><strong>Nome do Produto:</strong> ${productName}</p>
          <p><strong>Link do Produto:</strong> <a href="${productLink}" target="_blank">${productLink}</a></p>
          <p class="status ${productStatusClass}">${productStatus}</p>
        `;
            container.appendChild(productCard);
        });
    }

    // Função para renderizar produtos da comunidade sem status
    function renderCommunityProducts(container, products) {
        container.innerHTML = ''; // Limpa o container antes de carregar novos produtos

        if (!products || products.length === 0) {
            container.innerHTML = '<p>Nenhum produto encontrado.</p>';
            return;
        }

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';

            // Acessa as propriedades com fallback
            const productName = product.nome || 'Nome do Produto Indisponível';
            const productLink = product.link || '#'; // Link padrão caso não tenha

            // Renderiza o produto no container
            productCard.innerHTML = `
          <p><strong>Nome do Produto:</strong> ${productName}</p>
          <p><strong>Link do Produto:</strong> <a href="${productLink}" target="_blank">${productLink}</a></p>
        `;
            container.appendChild(productCard);
        });
    }

    // Função para carregar produtos do usuário
    function loadUserProducts() {
        fetch('/api/getUserProducts', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar produtos do usuário');
                }
                return response.json();
            })
            .then(data => {
                renderUserProducts(userProductsContainer, data);
            })
            .catch(error => {
                console.error('Erro ao carregar produtos do usuário:', error);
                userProductsContainer.innerHTML = '<p>Erro ao carregar produtos do usuário. Tente novamente mais tarde.</p>';
            });
    }

    // Função para carregar produtos da comunidade
    function loadCommunityProducts() {
        fetch('/api/getCommunityProducts')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro ao carregar produtos da comunidade');
                }
                return response.json();
            })
            .then(data => {
                renderCommunityProducts(communityProductsContainer, data);
            })
            .catch(error => {
                console.error('Erro ao carregar produtos da comunidade:', error);
                communityProductsContainer.innerHTML = '<p>Erro ao carregar produtos da comunidade. Tente novamente mais tarde.</p>';
            });
    }

    // Verifica se o usuário está logado e atualiza o menu
    checkUserLoggedIn();

    // Carrega produtos do usuário e da comunidade ao carregar a página
    loadUserProducts();
    loadCommunityProducts();
});
