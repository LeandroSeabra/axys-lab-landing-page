(() => {
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const ready = /^https:\/\//.test((window.AXYS_EDITOR || {}).oauthBaseUrl || '');
  if (local) {
    document.body.classList.add('is-local');
    document.querySelector('#status-title').textContent = 'Prévia local';
    document.querySelector('#status-copy').textContent = 'Crie, edite e exclua notícias neste computador. Nada é enviado ao GitHub ou ao site publicado.';
    document.querySelector('#editor-access').firstChild.textContent = 'Abrir editor local ';
    document.querySelector('.access-note').textContent = 'O servidor local deve estar em execução. O login GitHub será usado no site publicado.';
  } else if (ready) {
    document.querySelector('#status-title').textContent = 'Acesso com GitHub';
    document.querySelector('#status-copy').textContent = 'Entre com uma conta autorizada no repositório para gerenciar as publicações do portal.';
  } else {
    document.querySelector('#editor-access').firstChild.textContent = 'Ver acesso ao editor ';
  }
})();
