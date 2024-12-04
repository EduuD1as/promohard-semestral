document.getElementById('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    const loginData = {
      email,
      password
    };
  
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
  
      const result = await response.json();
  
      if (response.ok) {
        localStorage.setItem('authToken', result.token); // Salva o token no localStorage
        alert('Login bem-sucedido!');
        window.location.href = '/'; // Redireciona para a página principal ou outra página
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      alert('Erro ao fazer login. Tente novamente mais tarde.');
    }
  });
  