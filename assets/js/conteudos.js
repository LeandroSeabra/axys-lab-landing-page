const search = document.querySelector('#search');
if (search) {
  const library = document.querySelector('#biblioteca');
  const buttons = [...library.querySelectorAll('[data-filter]')];
  const cards = [...library.querySelectorAll('[data-category]')];
  const topic = library.querySelector('#topic-filter');
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const applyFilters = (save = true) => {
    const category = buttons.find(button => button.getAttribute('aria-pressed') === 'true').dataset.filter;
    const query = normalize(search.value.trim());
    let count = 0;
    cards.forEach(card => {
      const matchesTopic = topic.value === 'Todos' || card.dataset.topics.split(' ').includes(topic.value);
      card.hidden = !(category === 'Todos' || card.dataset.category === category) || !matchesTopic || !normalize(card.dataset.search).includes(query);
      if (!card.hidden) count++;
    });
    library.querySelector('.result-count').textContent = `${count} ${count === 1 ? 'conteúdo encontrado' : 'conteúdos encontrados'}`;
    library.querySelector('#empty').hidden = count > 0;
    if (save) {
      const url = new URL(location.href);
      const state = {q: search.value.trim(), tema: topic.value === 'Todos' ? '' : topic.value, formato: category === 'Notícias' ? 'noticias' : category === 'Artigos e guias' ? 'guias' : category === 'Na prática' ? 'pratica' : ''};
      Object.entries(state).forEach(([key, value]) => value ? url.searchParams.set(key, value) : url.searchParams.delete(key));
      history.replaceState(null, '', url);
    }
  };
  const readLocation = () => {
    const params = new URLSearchParams(location.search);
    search.value = params.get('q') || '';
    topic.value = [...topic.options].some(option => option.value === params.get('tema')) ? params.get('tema') : 'Todos';
    const category = {noticias: 'Notícias', guias: 'Artigos e guias', pratica: 'Na prática'}[params.get('formato')] || 'Todos';
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    applyFilters(false);
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    applyFilters();
  }));
  search.addEventListener('input', () => applyFilters());
  topic.addEventListener('change', () => applyFilters());
  library.querySelector('#reset').addEventListener('click', () => {
    search.value = '';
    topic.value = 'Todos';
    buttons[0].click();
    search.focus();
  });
  window.addEventListener('popstate', readLocation);
  readLocation();
}
