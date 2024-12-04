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
        <button id="logoutButton" style="{ background: none; border: none; color: #333; cursor: pointer; font-family: 'Inter'; font-size: 16px; padding: 0; vertical-align: middle; } { button:hover { } }">
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
