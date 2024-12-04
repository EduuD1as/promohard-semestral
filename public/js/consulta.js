document.addEventListener("DOMContentLoaded", () => {
    const menu = document.getElementById("menu");
  
    // Verifica se o token está armazenado no localStorage
    const token = localStorage.getItem("authToken");
  
    if (token) {
      // Usuário logado: altera o menu para incluir "Perfil" e "Sair"
      menu.innerHTML = `
        <li id="profile">
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
    } else {
      // Usuário não logado: exibe os botões de login e registro
      menu.innerHTML = `
        <li id="create-account"><a href="../pages/cadastro.html">Criar Conta</a></li>
        <li id="login"><a href="../pages/login.html">Fazer Login</a></li>
      `;
    }
  });
  
  document.getElementById('consultarButton').addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('input[name="category"]:checked');
    const selectedCategories = Array.from(checkboxes).map(cb => cb.value);
  
    if (selectedCategories.length > 0) {
      try {
        // Exibe um indicador de carregamento enquanto o web scraping é executado
        const loadingIndicator = document.getElementById('loadingIndicator');
        if (loadingIndicator) {
          loadingIndicator.style.display = 'block';
        }
  
        const response = await fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categories: selectedCategories })
        });
  
        const data = await response.json();
  
        if (response.ok) {
          // Considera apenas a primeira categoria selecionada
          const selectedCategory = selectedCategories[0];
          if (selectedCategory) {
            // Salva a categoria no localStorage para consulta posterior
            localStorage.setItem('selectedCategory', selectedCategory);
            // Redireciona para a página de produtos
            window.location.href = `/pages/products.html?category=${selectedCategory}`;
          } else {
            alert('Por favor, selecione uma categoria.');
          }
        } else {
          alert('Erro ao executar web scraping: ' + (data.error || 'Erro desconhecido.'));
        }
      } catch (error) {
        console.error('Erro ao executar web scraping:', error);
        alert('Erro ao executar web scraping. Tente novamente mais tarde.');
      } finally {
        // Oculta o indicador de carregamento
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none';
        }
      }
    } else {
      alert('Por favor, selecione pelo menos uma categoria.');
    }
  });
  