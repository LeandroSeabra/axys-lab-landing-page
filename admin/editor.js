(async () => {
  const message = document.querySelector('#editor-message');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  const settings = window.AXYS_EDITOR || {};
  const notice = (title, text) => {
    message.hidden = false;
    message.replaceChildren();
    const heading = document.createElement('h1'); heading.textContent = title;
    const copy = document.createElement('p'); copy.textContent = text;
    const back = document.createElement('a'); back.href = '/admin/'; back.textContent = 'Voltar à área de membros';
    message.append(heading, copy, back);
  };
  if (!local && !/^https:\/\//.test(settings.oauthBaseUrl || '')) {
    notice('Login GitHub em ativação', 'Falta conectar o provedor de autenticação do GitHub. O editor local já pode ser usado para revisão. As instruções de ativação estão no arquivo PUBLICACAO.md do projeto.');
    return;
  }
  if (!window.CMS || !window.h) {
    notice('Não foi possível carregar o editor', 'Verifique sua conexão com a internet e recarregue a página.');
    return;
  }
  if (local) {
    document.querySelector('#editor-mode').textContent = 'PRÉVIA LOCAL · SEM ENVIO AO GITHUB';
    try {
      const response = await fetch('http://127.0.0.1:8081/api/v1', {
        method: 'POST', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({action: 'info'}), signal: AbortSignal.timeout(5000)
      });
      if (!response.ok) throw new Error('proxy');
    } catch {
      notice('Inicie o servidor do editor', 'Na pasta do site, execute: python -X utf8 tools/dev_portal.py. Depois recarregue esta página.');
      return;
    }
  }
  const {CMS, h} = window;
  CMS.registerPreviewStyle('/admin/preview.css');
  CMS.registerPreviewTemplate('posts', ({entry, getAsset}) => {
    const data = entry.get('data').toJS();
    const asset = path => path ? String(getAsset(path)) : '';
    const paragraphs = text => String(text || '').split(/\n\s*\n/).map((p, i) => h('p', {key:i}, p));
    const figure = (src, alt, caption, credit) => src ? h('figure', {},
      h('img', {src: asset(src), alt:alt || ''}),
      h('figcaption', {}, [caption, credit?.creator, credit?.license].filter(Boolean).join(' · '))) : null;
    const method = window.AXYS_METHODS[data.method];
    return h('article', {className:'preview-article'},
      h('div', {className:'preview-status'}, data.published ? 'VISÍVEL APÓS PUBLICAÇÃO / GERAÇÃO' : 'RASCUNHO · FORA DO PORTAL PÚBLICO'),
      h('header', {}, h('span', {className:'eyebrow'}, `${data.type || 'Notícias'} · ${data.area || 'Área'}`),
        h('h1', {}, data.title || 'Título da notícia'), h('p', {className:'lead'}, data.description || 'Resumo da notícia'),
        h('small', {}, `${data.author || ''} · ${data.date || ''}`)),
      figure(data.image, data.image_alt, data.caption, data.image_credit),
      h('div', {className:'takeaway'}, h('strong', {}, 'A IDEIA CENTRAL'), ...paragraphs(data.summary || data.description)),
      ...(data.sections || []).map((section, i) => h('section', {key:i}, h('h2', {}, section.heading || ''),
        ...paragraphs(section.text), figure(section.image?.src, section.image?.alt, section.image?.caption, section.image?.credit),
        section.table?.headers?.length ? h('div', {className:'table-scroll'}, h('table', {},
          h('thead', {}, h('tr', {}, ...section.table.headers.map((cell,j) => h('th',{key:j},cell)))),
          h('tbody', {}, ...(section.table.rows || []).map((row,j) => h('tr',{key:j}, ...(row.cells || []).map((cell,k)=>h('td',{key:k},cell))))))) : null,
        section.references?.length ? h('small', {}, `Fontes: ${section.references.map(n=>`[${n}]`).join(', ')}`) : null)),
      method ? h('aside', {className:'method-link'}, h('strong', {}, 'CONHEÇA A AXYS'), h('p', {}, 'Explore a abordagem técnica relacionada a este assunto.'), h('a', {href:method.url,target:'_blank',rel:'noopener'}, `${method.label} ↗`)) : null,
      data.cta?.heading ? h('aside',{className:'method-link'},h('h2',{},data.cta.heading),h('p',{},data.cta.text),h('a',{href:data.cta.url,target:'_blank',rel:'noopener'},data.cta.label)) : null,
      data.references?.length ? h('section', {}, h('h2', {}, 'Referências e fontes'), h('ol', {}, ...data.references.map((ref,i) => h('li', {key:i}, `${ref.institution || ''} · ${ref.year || ''} — `, /^https:\/\//.test(ref.url || '') ? h('a', {href:ref.url,target:'_blank',rel:'noopener'}, ref.title) : ref.title)))) : null);
  });
  CMS.registerEventListener({name:'preSave', handler:({entry}) => {
    let data = entry.get('data');
    if (!data.get('summary')?.trim()) data = data.set('summary', data.get('description') || '');
    return data;
  }});
  message.hidden = true;
  const config = local
    ? {local_backend:{url:'http://127.0.0.1:8081/api/v1'}, publish_mode:'simple', site_url:location.origin, display_url:location.origin}
    : {backend:{base_url:settings.oauthBaseUrl, auth_endpoint:settings.authEndpoint || 'auth'}};
  CMS.init({config});
})();
