# Site da Axys Geo Soluções

Site estático (HTML, CSS e JavaScript), com geração editorial em Python, publicado pelo GitHub Pages em
**https://axysgeosolucoes.com**. Tudo o que estiver na branch `main` vai ao ar em cerca de um minuto.

## Páginas

| Endereço | Pasta | O que é |
| --- | --- | --- |
| `/` | `index.html` | Página principal: as quatro áreas e o seletor "O que você precisa?" |
| `/geo/` | `geo/` | Axys Geofísica: levantamentos geofísicos |
| `/safe/` | `safe/` | Axys Safe: monitoramento de barragens e segurança geológica |
| `/topo/` | `topo/` | Axys Topo: topografia e regularização de imóveis |
| `/lab/` | `lab/` | Axys Lab: instrumentos geofísicos |
| `/conteudos/` | `conteudos/` | Artigos e notícias, gerados a partir dos arquivos editoriais |
| `/admin/` | `admin/` | Acesso ao Decap CMS (ativação OAuth pendente) |
| `/sobre/` | `sobre/` | Quem somos: história, equipe, dados da empresa |
| `/privacidade/` | `privacidade/` | Política de privacidade (LGPD) |
| `/en/geo/`, `/en/lab/` | `en/` | Versões em inglês da Geofísica e do Lab |
| qualquer endereço inexistente | `404.html` | Página "não encontrada" |

## Como o código está organizado

```
assets/
  css/base.css      estilos comuns (cores, tipografia, cabeçalho, botões, formulários, perguntas, normas, casos, rodapé)
  css/widgets.css   peças usadas também pelo Lab (WhatsApp, espaços reservados, equipe)
  css/home.css      só da página principal
  js/config.js      ← DADOS DA EMPRESA (o único arquivo a editar para contatos)
  js/site.js        comportamentos comuns: cabeçalho, menu, formulários, WhatsApp, dados da empresa, animações
  dados/            mapas e seções simulados (Topo, Safe, Geofísica)
  og/               imagens de prévia para WhatsApp e LinkedIn
  pdf/              apresentações em PDF de cada área (e pdf/src, as páginas que geram os PDFs)
geo/ safe/ topo/    cada área com o seu index.html, CSS e JS próprios
lab/                o Axys Lab tem sistema visual próprio (styles.css, script.js) e as fotos em lab/assets/
```

## O que preencher antes de divulgar

### 1. `assets/js/config.js`: contatos e dados da empresa

Abra o arquivo e preencha os campos vazios. Eles aparecem automaticamente em todas as páginas
(rodapés, contato, Quem somos, PDFs):

- `empresa.razaoSocial`, `empresa.cnpj`, `empresa.endereco`, `empresa.cep`
- `empresa.responsavelTecnico` e `empresa.crea`
- `whatsapp`: só números, com DDI e DDD, por exemplo `5591999999999`. Com o número preenchido,
  aparece o botão verde flutuante e os links "Conversar pelo WhatsApp", cada um com uma mensagem
  pronta da área.
- `telefone`, `redes.linkedin`, `redes.instagram`
- `emails`: um endereço por área. Enquanto não existirem, todos podem ser o mesmo.

### 2. Formulários que enviam de verdade

Hoje, sem configuração, o formulário abre o programa de e-mail do visitante com a mensagem pronta.
Para que as mensagens cheguem direto na caixa de entrada:

1. Acesse https://web3forms.com, informe o e-mail que deve receber as mensagens e copie a chave (Access Key).
2. Cole a chave em `formularioChave` no `config.js`.

É gratuito e não precisa de servidor.

### 3. Espaços reservados (equipe, números, casos)

A configuração pública usa `mostrarEspacosReservados: false`. Enquanto essa opção estiver `true` no `config.js`, os blocos sem dados aparecem
marcados com etiquetas "A preencher". Mude para `false` para escondê-los até que os dados reais existam.

| O quê | Onde editar |
| --- | --- |
| Os sócios (foto, nome, registro, formação, trajetória, LinkedIn) | `sobre/index.html`, bloco `id="socios"`. Troque o `<svg>` da silhueta por `<img src="...">` |
| História da empresa (ano de fundação, marcos) | `sobre/index.html`, bloco `id="historia"` |
| Números da experiência dos sócios e estados atendidos | `index.html`, bloco "Em números" |
| Experiência da equipe em cada área | `geo/`, `safe/` e `topo/index.html`, bloco `id="experiencia"` |
| Programa piloto e ficha técnica do Lab | `lab/index.html`, blocos `id="piloto"` e "Ficha técnica" |

Fotos reais: coloque os arquivos em `assets/` (ou `lab/assets/`) em JPG com cerca de 1600 px de
largura e menos de 400 KB, e aponte o `src` para eles.

### 4. Experiência dos sócios × projetos da empresa

A Axys é nova e ainda não tem projetos próprios. O site apresenta a **experiência dos sócios**
(trabalhos feitos antes da Axys, como pessoa física ou por outras empresas) sempre como experiência
individual, nunca como projeto da Axys. Regras:

- Escreva "antes de fundar a Axys, [Nome] atuou em…", nunca "a Axys fez…".
- Números: "anos de experiência somados dos sócios", nunca "km levantados pela Axys".
- Nomes de clientes só com autorização e só no texto; nada de logotipos de clientes de trabalhos anteriores.
- Confira contratos de confidencialidade antes de citar empresas ou projetos.
- As Certidões de Acervo Técnico (CAT) do CREA comprovam a experiência de cada profissional.

Quando a empresa tiver os primeiros projetos próprios, a seção "Experiência" de cada área pode ganhar
um bloco "Projetos da Axys" (a estrutura de estudos de caso está em `assets/css/base.css`, classes `.case`).

### 5. Textos para revisar

Os textos de serviços, normas e perguntas frequentes foram escritos a partir das informações
disponíveis. Revise especialmente: métodos oferecidos, prazos, normas aplicáveis e o programa piloto do Lab.
Os mapas, seções e simulações são ilustrativos e estão marcados como tal nas páginas.

## Apresentações em PDF

Os PDFs ficam em `assets/pdf/` e são gerados a partir de `assets/pdf/src/*.html` (que também lê o
`config.js`). Depois de preencher os dados, gere de novo com o Chrome ou Chromium:

```bash
python3 -m http.server 8765          # na pasta do site, em outro terminal
chromium --headless --no-pdf-header-footer --virtual-time-budget=10000 \
  --print-to-pdf=assets/pdf/axys-safe.pdf http://127.0.0.1:8765/assets/pdf/src/axys-safe.html
```

(repita para `axys-geofisica`, `axys-topo` e `axys-lab`).

## Ver o site no computador

```bash
python3 -m http.server 8765
```

e abra http://127.0.0.1:8765/

## Google e redes sociais

- Cada página tem título, descrição, imagem de prévia (`assets/og/`) e dados estruturados (schema.org).
- `sitemap.xml` e `robots.txt` estão na raiz. Depois de publicar, cadastre o site no
  **Google Search Console** (https://search.google.com/search-console), confirme o domínio e envie
  `https://axysgeosolucoes.com/sitemap.xml`.

### Google Meu Negócio (Perfil da Empresa no Google)

1. Acesse https://business.google.com com a conta Google da empresa.
2. Cadastre "Axys Geo Soluções", categoria **Serviço de geofísica** (ou "Empresa de engenharia"),
   endereço em Belém (ou área de atendimento, se não houver atendimento no local).
3. Informe telefone, site `https://axysgeosolucoes.com` e horário.
4. Confirme pelo código que o Google envia (carta, telefone ou vídeo).
5. Adicione fotos reais da equipe e dos trabalhos e peça avaliações aos clientes.

## Publicação

Antes de publicar uma alteração em CSS ou JavaScript, rode:

```bash
python3 tools/versionar.py
```

As páginas editoriais em `conteudos/` usam versões calculadas pelo gerador e ficam fora deste comando.

Isso põe um número de versão nos arquivos (`geo.js?v=...`), para o navegador dos visitantes baixar
os arquivos novos junto com a página nova, em vez de usar uma cópia antiga guardada em cache.

- O GitHub Pages publica a branch `main` deste repositório no domínio do arquivo `CNAME`.
- Nas configurações do repositório (Settings → Pages), mantenha **Enforce HTTPS** ligado.

## Publicar artigos e notícias

Consulte [PUBLICACAO.md](PUBLICACAO.md) para ativar o login do Decap, configurar o GitHub Pages e usar o painel. Para gerar as páginas localmente: `python3 tools/gerar_conteudos.py`. O conteúdo fica em `content/posts/`; não edite os HTML gerados diretamente.

A pauta inicial e as chamadas de cada artigo estão em [ESTRATEGIA_CONTEUDOS.md](ESTRATEGIA_CONTEUDOS.md). Para conferir o comportamento em navegador, sirva o site e abra `/tools/verificar_editorial.html` (ferramenta local, excluída do pacote de publicação).

A revisão editorial e os itens que dependem de confirmação documental estão em [AUDITORIA_TEXTOS.md](AUDITORIA_TEXTOS.md). Evite promessas de detecção, produtividade, antecipação de risco ou resultado registral; descreva o objetivo, as condições e as entregas de cada serviço.
