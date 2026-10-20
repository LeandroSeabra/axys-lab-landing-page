"""Gera a área editorial a partir dos JSON do Decap, sem dependências externas."""
import hashlib
import json
import math
import re
from datetime import datetime
from html import escape
from pathlib import Path
from string import Template
from zoneinfo import ZoneInfo
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET

DOMAIN = 'https://axysgeosolucoes.com'
SLUG = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*')
TYPES = ('Artigos e guias', 'Notícias', 'Na prática')
AREAS = ('Geofísica', 'Monitoramento', 'Topografia', 'Axys Lab', 'Institucional')

TOPICS = {
    'geologia': ('Geologia', 'Estruturas, materiais e processos que ajudam a interpretar o território.'),
    'geofisica': ('Geofísica', 'Medições, métodos e limites da investigação por propriedades físicas.'),
    'agua-subterranea': ('Água subterrânea', 'Investigação do subsolo e informações para discutir a pesquisa de água.'),
    'mineracao': ('Mineração', 'Conceitos e métodos ligados à investigação de alvos minerais.'),
    'topografia': ('Topografia e território', 'Levantamento de limites, georreferenciamento e documentação técnica.'),
    'monitoramento': ('Monitoramento', 'Investigações e acompanhamento de estruturas, com seus limites de interpretação.'),
    'instrumentacao': ('Instrumentação', 'Tecnologia e equipamentos aplicados à aquisição de dados.'),
}
DEFAULT_TOPIC = {'Geofísica': 'geofisica', 'Topografia': 'topografia', 'Monitoramento': 'monitoramento', 'Axys Lab': 'instrumentacao'}
RESERVED = {'index', 'noticias', 'temas', 'politica-editorial'}

def e(value):
    return escape(str(value), quote=True)

def read_posts(root):
    today = datetime.now(ZoneInfo('America/Sao_Paulo')).date()
    posts = []
    for file in sorted((root / 'content/posts').glob('*.json')):
        data = json.loads(file.read_text(encoding='utf-8'))
        if not SLUG.fullmatch(file.stem) or file.stem in RESERVED:
            raise ValueError(f'Endereço inválido: {file.name}')
        if data.get('published') is not True:
            continue
        for key in ('title', 'description', 'author', 'date', 'image', 'image_alt', 'summary'):
            if not isinstance(data.get(key), str) or not data[key].strip():
                raise ValueError(f'{file.name}: campo obrigatório {key}')
        day = datetime.strptime(data['date'], '%Y-%m-%d').date()
        if day > today:
            continue
        if data.get('type') not in TYPES or data.get('area') not in AREAS:
            raise ValueError(f'{file.name}: tipo ou área inválida')
        topics = data.get('topics', [DEFAULT_TOPIC[data['area']]] if data['area'] in DEFAULT_TOPIC else [])
        if not isinstance(topics, list) or any(not isinstance(topic, str) or topic not in TOPICS for topic in topics) or len(set(topics)) != len(topics):
            raise ValueError(f'{file.name}: tema editorial inválido ou repetido')
        data['topics'] = topics
        if data.get('updated'):
            updated = datetime.strptime(data['updated'], '%Y-%m-%d').date()
            if not day <= updated <= today:
                raise ValueError(f'{file.name}: atualização fora do período publicado')
        for field in ('reviewer', 'correction_note'):
            if field in data and not isinstance(data[field], str):
                raise ValueError(f'{file.name}: {field} deve ser texto')
        image = data['image']
        if not image.startswith('/') or image.startswith('//') or '..' in Path(image).parts or '?' in image or '#' in image:
            raise ValueError(f'{file.name}: imagem deve ser um caminho local absoluto')
        target = (root / image.lstrip('/')).resolve()
        if not target.is_relative_to(root.resolve()) or not target.is_file() or target.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.webp'):
            raise ValueError(f'{file.name}: imagem ausente ou formato inválido')
        credit = data.get('image_credit')
        if not isinstance(credit, dict) or not all(isinstance(credit.get(k), str) and credit[k].strip() for k in ('title', 'creator', 'source', 'license', 'license_url')):
            raise ValueError(f'{file.name}: informe autoria, fonte e licença da imagem')
        for key in ('source', 'license_url'):
            url = urlsplit(credit[key])
            if url.scheme != 'https' or not url.hostname or url.username or url.password or any(c.isspace() for c in credit[key]):
                raise ValueError(f'{file.name}: crédito de imagem deve usar HTTPS')
        sections = data.get('sections')
        if not isinstance(sections, list) or not sections:
            raise ValueError(f'{file.name}: inclua ao menos uma seção')
        for section in sections:
            if not isinstance(section, dict) or not all(isinstance(section.get(k), str) and section[k].strip() for k in ('heading', 'text')):
                raise ValueError(f'{file.name}: seção incompleta')
        references = data.get('references', [])
        if not isinstance(references, list):
            raise ValueError(f'{file.name}: referências devem ser uma lista')
        for reference in references:
            if not isinstance(reference, dict) or not all(isinstance(reference.get(k), str) and reference[k].strip() for k in ('title', 'institution', 'url', 'year')):
                raise ValueError(f'{file.name}: referência incompleta')
            url = urlsplit(reference['url'])
            if url.scheme != 'https' or not url.hostname or url.username or url.password or any(c.isspace() for c in reference['url']):
                raise ValueError(f'{file.name}: referência deve usar HTTPS')
        for section in sections:
            numbers = section.get('references', [])
            if not isinstance(numbers, list) or any(type(n) is not int or not 1 <= n <= len(references) for n in numbers):
                raise ValueError(f'{file.name}: referência de seção inexistente')
            table = section.get('table')
            if table is not None:
                if not isinstance(table, dict) or not isinstance(table.get('headers'), list) or not table['headers'] or not isinstance(table.get('rows'), list):
                    raise ValueError(f'{file.name}: tabela inválida')
                if any(not isinstance(cell, str) for cell in table['headers']) or any(not isinstance(row, dict) or not isinstance(row.get('cells'), list) or len(row['cells']) != len(table['headers']) or any(not isinstance(cell, str) for cell in row['cells']) for row in table['rows']):
                    raise ValueError(f'{file.name}: células de tabela inválidas')
        cta = data.get('cta')
        if cta is not None:
            if not isinstance(cta, dict) or not all(isinstance(cta.get(k), str) and cta[k].strip() for k in ('heading', 'text', 'label', 'url')):
                raise ValueError(f'{file.name}: chamada incompleta')
            # CTAs levam apenas às áreas e ao contato existentes, sem destinos externos.
            if not re.fullmatch(r'/(?:geo/|safe/|topo/|lab/)?(?:#[a-z0-9-]+)?', cta['url']):
                raise ValueError(f'{file.name}: destino de chamada inválido')
        if data.get('featured', False) not in (True, False):
            raise ValueError(f'{file.name}: destaque deve ser booleano')
        data['slug'] = file.stem
        data['display_date'] = day.strftime('%d/%m/%Y')
        words = ' '.join(section['text'] for section in sections).split()
        data['minutes'] = max(1, math.ceil(len(words) / 200))
        posts.append(data)
    return sorted(posts, key=lambda item: (item['date'], item['slug']), reverse=True)

def card(post):
    url = f'/conteudos/{post["slug"]}/'
    return f'''<article class="card" data-category="{e(post['type'])}" data-topics="{e(" ".join(post["topics"]))}" data-search="{e(post['area']+' '+post['title']+' '+post['description']+' '+' '.join(TOPICS[t][0] for t in post['topics']))}"><a class="image-link" href="{url}" tabindex="-1" aria-hidden="true"><img src="{e(post['image'])}" alt="" loading="lazy" width="800" height="520"></a><div class="meta"><span>{e(post['area'])}</span><span>{e(post['type'])}</span></div><h3><a href="{url}">{e(post['title'])} <span aria-hidden="true">↗</span></a></h3><p>{e(post['description'])}</p><div class="read-meta"><time datetime="{post['date']}">{post['display_date']}</time><span>{post['minutes']} min de leitura</span></div></article>'''

def build(root):
    root = Path(root)
    posts = read_posts(root)  # Valide todos os conteúdos antes de alterar as páginas.
    templates = {name: Template((root / 'tools/templates' / (name + '.html')).read_text(encoding='utf-8')) for name in ('shell', 'listing', 'article', 'collection', 'policy')}
    out = root / 'conteudos'
    out.mkdir(exist_ok=True)
    pages = {}
    def shell(title, description, path, image, content, structured=None):
        schema = '' if structured is None else '<script type="application/ld+json">'+json.dumps(structured, ensure_ascii=False).replace('<', '\\u003c')+'</script>'
        html = templates['shell'].substitute(title=e(title), description=e(description), url=DOMAIN+path, image=DOMAIN+image, og_type='article' if structured else 'website', schema=schema, content=content)
        html = html.replace(f'<a href="{path}">', f'<a href="{path}" aria-current="page">', 1)
        if structured:
            html = re.sub(r'<section class="cta">.*?</section>', '', html, flags=re.S)
        # A versão acompanha o conteúdo de cada asset, sem alterar páginas não relacionadas.
        def version(match):
            path = match[1]
            file = root / path.lstrip('/')
            digest = hashlib.sha256(file.read_bytes()).hexdigest()[:12] if file.is_file() else '1'
            return f'{path}?v={digest}"'
        return re.sub(r'(/assets/(?:css|js)/[^"?]+\.(?:css|js))"', version, html)
    feature = ''
    featured_slug = ''
    if posts:
        post = next((p for p in posts if p.get('featured')), posts[0])
        featured_slug = post['slug']
        url = f'/conteudos/{post["slug"]}/'
        feature = f'''<section class="feature wrap" aria-labelledby="featured-title"><a class="feature-photo" href="{url}" tabindex="-1" aria-hidden="true"><img src="{e(post['image'])}" alt="" width="800" height="520"></a><div class="feature-copy"><span class="eyebrow">EM DESTAQUE · {e(post['area'])}</span><h2 id="featured-title"><a href="{url}">{e(post['title'])}</a></h2><p>{e(post['description'])}</p><div class="read-meta">{e(post['type'])} · {post['display_date']} · {post['minutes']} min de leitura</div><a class="text-link" href="{url}">Explorar o conteúdo ↗</a></div></section>'''
    active_topics = {key: value for key, value in TOPICS.items() if any(key in post['topics'] for post in posts)}
    topic_links = ''.join(f'<a href="/conteudos/temas/{key}/">{e(label)}</a>' for key, (label, _) in active_topics.items())
    topic_cards = ''.join(f'<a class="topic-card" href="/conteudos/temas/{key}/"><span>{e(label)} ↗</span><p>{e(description)}</p><small>{sum(key in post["topics"] for post in posts)} {"publicação" if sum(key in post["topics"] for post in posts) == 1 else "publicações"}</small></a>' for key, (label, description) in active_topics.items())
    options = ''.join(f'<option value="{key}">{e(label)}</option>' for key, (label, _) in active_topics.items())
    starters = [item for item in posts if item['slug'] != featured_slug][:3]
    latest = ''.join(f'<a class="portal-brief" href="/conteudos/{post["slug"]}/"><span>{e(post["area"])} · {post["minutes"]} min</span><h3>{e(post["title"])}</h3><span aria-hidden="true">↗</span></a>' for post in starters)
    news = [post for post in posts if post['type'] == 'Notícias']
    news_content = '<div class="cards">'+''.join(map(card, news[:3]))+'</div>' if news else '<div class="portal-news-empty"><p>Ainda não há notícias publicadas.</p><p>Enquanto isso, explore os artigos sobre métodos, aplicações e dúvidas da área.</p><a class="text-link" href="#biblioteca">Consultar os artigos ↗</a></div>'
    listing = templates['listing'].substitute(feature=feature, latest=latest, topic_links=topic_links, topics=topic_cards, topic_options=options, news=news_content, cards=''.join(map(card, posts)), count=len(posts))
    if len(posts) == 1:
        listing = listing.replace('1 conteúdos para explorar', '1 conteúdo para explorar')
    if not posts:
        listing = listing.replace('<div id="empty" hidden>', '<div id="empty">').replace('Nenhum conteúdo encontrado.', 'Os primeiros conteúdos chegam em breve.')
    pages['index.html'] = shell('Portal Axys: geologia, geofísica e território', 'Artigos, guias e notícias sobre geologia, geofísica, água subterrânea, topografia e monitoramento. Um portal da Axys Geo Soluções.', '/conteudos/', '/assets/og/home.jpg', listing)
    def collection(path, title, description, selected, eyebrow):
        empty = '' if selected else '<div class="portal-news-empty"><h2>Ainda não há notícias publicadas.</h2><p>Você pode consultar os artigos e guias já disponíveis no portal.</p><a class="text-link" href="/conteudos/#biblioteca">Explorar os artigos ↗</a></div>'
        content = templates['collection'].substitute(label=e(title), title=e(title), description=e(description), eyebrow=e(eyebrow), count=len(selected), count_label='publicação' if len(selected) == 1 else 'publicações', cards=''.join(map(card, selected)), empty=empty)
        pages[path+'index.html'] = shell(title+' — Portal Axys', description, '/conteudos/'+path, '/assets/og/home.jpg', content)
    for key, (label, description) in active_topics.items():
        collection('temas/'+key+'/', label, description, [post for post in posts if key in post['topics']], 'EXPLORE POR TEMA')
    collection('noticias/', 'Notícias', 'Acontecimentos, pesquisas e atualizações da área, com contexto e fontes identificadas.', news, 'PORTAL AXYS')
    pages['politica-editorial/index.html'] = shell('Sobre o portal e política editorial — Portal Axys', 'Conheça a relação com a Axys, os critérios de fontes, autoria, revisão, correções e uso de imagens.', '/conteudos/politica-editorial/', '/assets/og/home.jpg', templates['policy'].substitute())
    for post in posts:
        values = {k: e(v) for k, v in post.items() if isinstance(v, (str, int))}
        values['topic_tags'] = '<nav class="article-topics" aria-label="Assuntos desta publicação">'+''.join(f'<a href="/conteudos/temas/{key}/">{e(TOPICS[key][0])}</a>' for key in post['topics'])+'</nav>'
        meta = []
        if post.get('updated'):
            meta.append('Atualizado em <time datetime="'+post['updated']+'">'+datetime.strptime(post['updated'], '%Y-%m-%d').strftime('%d/%m/%Y')+'</time>')
        if post.get('reviewer'):
            meta.append('Revisão técnica: '+e(post['reviewer']))
        values['editorial_meta'] = '<p class="editorial-meta">'+' · '.join(meta)+'</p>' if meta else ''
        if post.get('correction_note'):
            values['editorial_meta'] += '<p class="correction-note"><strong>Nota de correção:</strong> '+e(post['correction_note'])+'</p>'
        credit = post['image_credit']
        values['caption'] = e(post.get('caption', '')) + ' Foto: ' + e(credit['creator']) + ' · <a href="' + e(credit['source']) + '">' + e(credit['title']) + '</a> · <a href="' + e(credit['license_url']) + '">' + e(credit['license']) + '</a>. Redimensionada; pode haver recorte de exibição.'
        values['toc'] = ''.join(f'<a href="#secao-{i}">{i:02d} &nbsp; {e(s["heading"])}</a>' for i, s in enumerate(post['sections'], 1))
        sections = []
        for i, section in enumerate(post['sections'], 1):
            content = ''.join('<p>'+e(paragraph).replace('\n', '<br>')+'</p>' for paragraph in re.split(r'\n\s*\n', section['text'].strip()))
            table = section.get('table')
            if table:
                content += '<div class="article-table-scroll" tabindex="0" role="region" aria-label="'+e(section['heading'])+'"><table><thead><tr>'+''.join('<th scope="col">'+e(cell)+'</th>' for cell in table['headers'])+'</tr></thead><tbody>'+''.join('<tr>'+''.join('<td>'+e(cell)+'</td>' for cell in row['cells'])+'</tr>' for row in table['rows'])+'</tbody></table></div>'
            numbers = section.get('references', [])
            if numbers:
                content += '<p class="section-sources">Fontes: '+', '.join(f'<a href="#referencia-{n}" aria-label="Referência {n}">[{n}]</a>' for n in numbers)+'.</p>'
            sections.append(f'<section id="secao-{i}"><h2>{e(section["heading"])}</h2>{content}</section>')
        values['sections'] = ''.join(sections)
        references = post.get('references', [])
        values['references'] = ''
        if references:
            values['toc'] += '<a href="#referencias">Referências e fontes</a>'
            items = ''.join(f'<li id="referencia-{i}"><span>{e(ref["institution"])} · {e(ref["year"])}</span><a href="{e(ref["url"])}">{e(ref["title"])}</a></li>' for i, ref in enumerate(references, 1))
            values['references'] = '<section class="article-references" id="referencias"><h2>Referências e fontes</h2><ol>'+items+'</ol><p class="reference-note">Publicação com referências institucionais e científicas. Fontes consultadas em '+e(post.get('sources_checked', post['display_date']))+'.</p></section>'
        cta = post.get('cta')
        destination = urlsplit(cta['url']) if cta else None
        contact_url = '' if not cta else destination.path+'?artigo='+post['slug']+('#'+destination.fragment if destination.fragment else '')
        values['conversion'] = '' if not cta else '<section class="article-conversion" aria-label="Próximo passo"><span class="eyebrow">APLIQUE AO SEU PROJETO</span><h2>'+e(cta['heading'])+'</h2><p>'+e(cta['text'])+'</p><a class="button" href="'+e(contact_url)+'">'+e(cta['label'])+' ↗</a></section>'
        # Só exiba leituras escolhidas editorialmente; não complete com assuntos aleatórios.
        published = {p['slug']: p for p in posts if p['slug'] != post['slug']}
        related = [published[slug] for slug in post.get('related', []) if slug in published][:2]
        values['related'] = '<section class="related wrap"><h2>Continue explorando</h2><div class="cards">'+''.join(map(card, related))+'</div></section>' if related else ''
        path = f'/conteudos/{post["slug"]}/'
        structured = {'@context':'https://schema.org', '@type':'NewsArticle' if post['type']=='Notícias' else 'BlogPosting', 'headline':post['title'], 'description':post['description'], 'datePublished':post['date'], 'author':{'@type':'Organization','name':post['author']}, 'publisher':{'@type':'Organization','name':'Axys Geo Soluções','url':DOMAIN}, 'image':DOMAIN+post['image'], 'mainEntityOfPage':DOMAIN+path, 'inLanguage':'pt-BR'}
        if post.get('updated'):
            structured['dateModified'] = post['updated']
        structured['articleSection'] = [TOPICS[key][0] for key in post['topics']]
        if references:
            structured['citation'] = [ref['url'] for ref in references]
        pages[post['slug']+'/index.html'] = shell(post['title'], post['description'], path, post['image'], templates['article'].substitute(values), structured)
    manifest = out / '.generated.json'
    previous = json.loads(manifest.read_text()) if manifest.exists() else []
    for name, html in pages.items():
        target = out / name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(html, encoding='utf-8')
    for name in set(previous) - set(pages):
        # Remova apenas páginas anteriormente geradas, nunca diretórios ou arquivos manuais.
        if re.fullmatch(r'(?:temas/)?[a-z0-9]+(?:-[a-z0-9]+)*/index\.html', name):
            target = out / name
            if target.is_file(): target.unlink()
    manifest.write_text(json.dumps(sorted(pages), indent=2)+'\n', encoding='utf-8')
    ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    ET.register_namespace('', ns)
    sitemap = ET.parse(root / 'sitemap.xml')
    for item in list(sitemap.getroot()):
        if (item.findtext(f'{{{ns}}}loc') or '').startswith(DOMAIN+'/conteudos/'):
            sitemap.getroot().remove(item)
    for path in ['/conteudos/'+name.removesuffix('index.html') for name in pages]:
        item = ET.SubElement(sitemap.getroot(), f'{{{ns}}}url')
        ET.SubElement(item, f'{{{ns}}}loc').text = DOMAIN+path
    ET.indent(sitemap, space='  ')
    sitemap.write(root / 'sitemap.xml', encoding='utf-8', xml_declaration=True)
    return len(posts)

if __name__ == '__main__':
    print(f'Conteúdos gerados: {build(Path(__file__).resolve().parents[1])} publicações.')
