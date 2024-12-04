const form = document.getElementById('formCadastro');
const campos = document.querySelectorAll('.required');
const spans = document.querySelectorAll('.span-required');
const emailRegex = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

formCadastro.addEventListener('submit', (event) => {
    event.preventDefault();
    usernameValidate();
    emailValidate();
    passwordValidate();
});

function setError(index) {
    campos[index].style.border = '2px solid #e63636';
    spans[index].style.display = 'block';
}

function removeError(index) {
    campos[index].style.border = '';
    spans[index].style.display = 'none';
}

function usernameValidate() {
    if (campos[0].value.length < 3) {
        setError(0);
    }
    else {
        removeError(0);
    }
}

function emailValidate() {
    if (!emailRegex.test(campos[1].value)) {
        setError(1);
    }
    else {
        removeError(1);
    }
}

function passwordValidate() {
    if (campos[2].value.length < 8) {
        setError(2);
    }
    else {
        removeError(2);
    }
}

document.getElementById('formCadastro').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const data = { username, email, password };

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Cadastro realizado com sucesso!');
            window.location.href = "../pages/login.html";
        } else {
            alert('Erro no cadastro: ' + result.error);
        }
    } catch (error) {
        console.error('Erro ao enviar a requisição:', error);
    }
});



