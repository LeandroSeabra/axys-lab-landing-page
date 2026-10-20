# Área de conteúdos

A área pública está em `/conteudos/`. O acesso ao painel fica em `/admin/`, com o Decap em `/admin/editor.html`. O site mantém HTML estático, com busca e filtros locais; as páginas e metadados existem antes da execução de JavaScript.

## Estado da integração

Implementado: layout, navegação, cinco artigos técnicos, gerador, sitemap, campos editoriais, testes e workflow do GitHub Pages. Não foram alterados serviços externos, configurações da conta, branch remota nem domínio.

Ainda é necessário conectar o login OAuth do Decap e mudar a fonte do GitHub Pages para GitHub Actions. Até lá, o painel informa que o acesso está pendente. Não há senhas, tokens ou chaves no código.

## Ativação em produção

1. Confirme que o repositório publicado é `LeandroSeabra/axys-lab-landing-page`, branch `main`. Esse foi o remoto origin encontrado. Se a hospedagem usa outro repositório, ajuste `backend.repo` em `admin/config.yml`.
2. Configure um provedor OAuth para o backend GitHub do Decap. O GitHub Pages não executa um servidor de autenticação. Opções documentadas: autenticação intermediada pelo Netlify, um serviço OAuth próprio ou Decap Turbo. Escolha o serviço antes de criar contas ou contratar planos. A documentação oficial está em https://decapcms.org/docs/github-backend/ .
3. Com servidor próprio, configure `backend.base_url` e `backend.auth_endpoint` conforme as instruções do provedor. Guarde o client secret somente no serviço de autenticação, nunca no site. Autorize o domínio `https://axysgeosolucoes.com` e use uma conta com permissão de escrita no repositório.
4. No GitHub, Settings → Pages → Build and deployment → Source: **GitHub Actions**. O workflow `.github/workflows/publicar.yml` gera e publica o site a cada push na main, manualmente ou diariamente às 03h15 de Brasília. Enquanto a fonte for a branch, os arquivos gerados precisam ser atualizados manualmente antes de cada push; alterações feitas só pelo CMS não gerarão páginas automaticamente.
5. Faça o primeiro teste com `published: false`. Depois valide a geração em um pull request. Só após autenticação e deploy confirmados, retire o aviso de ativação de `/admin/index.html` ou faça esse endereço abrir o editor diretamente.

A hospedagem atual continua no GitHub Pages: o serviço OAuth apenas viabiliza o login. Contas, planos e permissões externas não foram criados automaticamente.

## Escrever e publicar

1. Abra o Decap com sua conta GitHub autorizada.
2. Crie um conteúdo e preencha título, resumo, tipo, área, autor, data e imagem. Inclua descrição acessível e créditos da imagem.
3. Escreva a ideia central. Adicione seções com subtítulo e texto; separe os parágrafos com uma linha em branco. O editor usa texto simples por seção: HTML e Markdown não são interpretados. Isso permite colar textos revisados de IA sem carregar formatação ou código.
4. Cadastre as referências com autores ou instituição, título, ano e link HTTPS. Em cada seção, informe os números das fontes que a sustentam. Se houver uma tabela, use a mesma quantidade de células e títulos de colunas. Configure a chamada final com título, explicação e destino correspondente ao assunto. Marque no máximo um artigo como destaque.
5. Salve o rascunho e revise fatos, fontes e imagens. Marque **Visível no site** apenas quando estiver pronto. Conclua o fluxo editorial de publicação do Decap para integrar a alteração à main.
6. O workflow gera a página, atualiza a listagem e o sitemap e publica o resultado. A URL é `/conteudos/<nome-do-arquivo>/`. Preserve o nome do arquivo após publicar para não quebrar links.

Um conteúdo só aparece se `published` for exatamente `true` e a data não estiver no futuro (fuso de São Paulo). A tarefa diária inclui conteúdos agendados, mas o GitHub pode atrasar execuções; não é um agendamento de horário exato. Um conteúdo removido ou desmarcado deixa de ser gerado e sai do sitemap; sua URL passa a responder 404. Se precisar substituir uma URL pública, planeje o redirecionamento antes.

A seleção inicial reúne cinco artigos de divulgação técnica sobre geofísica, água subterrânea, GPR, georreferenciamento e barragens. O antigo guia de preparação de projeto foi retirado por solicitação. Cada texto inclui fontes identificadas e uma chamada contextual. O mapa de intenções e critérios editoriais está em `ESTRATEGIA_CONTEUDOS.md`. O arquivo `rascunho-noticia.json` é apenas um modelo e não aparece no site público. Rascunhos não vão no artefato publicado; se o repositório GitHub for público, seus arquivos continuam visíveis no GitHub. Não coloque informação confidencial nos rascunhos.

## Desenvolvimento local

Na raiz do site:

```bash
python3 -m unittest discover -s tools
python3 tools/gerar_conteudos.py
python3 -m http.server 8765
```

Abra `http://localhost:8765/conteudos/`. Não abra as páginas geradas diretamente com `file://`: seus links usam a raiz do site.

Os modelos ficam em `tools/templates/`; conteúdo, em `content/posts/*.json`; estilo, em `assets/css/conteudos.css`; busca e filtros, em `assets/js/conteudos.js`. Não edite os HTML gerados: a próxima geração os substitui. O gerador não depende de bibliotecas externas. A versão dos assets editoriais é calculada pelo conteúdo do arquivo.

O workflow exclui fontes editoriais, ferramentas e mockups do artefato público. O diretório de mockup é mantido localmente para referência. Não há integração de geração de texto por IA no painel nesta implementação.

## Assunto trazido do artigo

Os destinos das chamadas recebem o identificador do artigo. O mapa de assuntos em `assets/js/site.js` limita o preenchimento aos cinco artigos existentes e às áreas correspondentes. Ao adicionar um novo percurso de contato, inclua o assunto e a área nesse mapa e teste em `/tools/verificar_editorial.html`. As recomendações de leitura usam apenas os identificadores selecionados no campo `related`, sem preenchimento automático com outros temas.
