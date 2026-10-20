const search = document.querySelector('#search');
if (search) {
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const cards = [...document.querySelectorAll('[data-category]')];
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const applyFilters = () => {
    const category = buttons.find(button => button.getAttribute('aria-pressed') === 'true').dataset.filter;
    const query = normalize(search.value.trim());
    let count = 0;
    cards.forEach(card => {
      card.hidden = !(category === 'Todos' || card.dataset.category === category) || !normalize(card.dataset.search).includes(query);
      if (!card.hidden) count++;
    });
    document.querySelector('.result-count').textContent = `${count} ${count === 1 ? 'conteúdo encontrado' : 'conteúdos encontrados'}`;
    document.querySelector('#empty').hidden = count > 0;
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    applyFilters();
  }));
  search.addEventListener('input', applyFilters);
  document.querySelector('#reset').addEventListener('click', () => {
    search.value = '';
    buttons[0].click();
    search.focus();
  });
}
