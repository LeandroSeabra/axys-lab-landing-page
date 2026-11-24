# Publicação no Portal Axys

O site continua em HTML estático no GitHub Pages. As fontes são `content/posts/*.json`; o gerador `tools/gerar_conteudos.py` atualiza páginas, listagens e sitemap. Não edite os HTML de `conteudos/` manualmente.

## Área de membros

O botão “Área de membros” está no menu da página inicial e do portal. `/admin/` apresenta o acesso e as instruções; `/admin/editor.html` abre o Decap CMS 3.18.0 com uma prévia dos artigos. É possível criar, editar e excluir publicações, enviar capa e imagens por seção e selecionar um link para um método relacionado da Axys.

O editor preserva o cabeçalho, a tipografia e a paleta escura da área de membros. O tema da interface fica em `admin/editor-theme.css`, separado do estilo da prévia (`admin/preview.css`). Os seletores do tema correspondem aos nomes dos componentes da versão 3.18.0; confira campos, biblioteca de imagens e diálogos ao atualizar o Decap.

O login escolhido é GitHub, para contas com permissão de escrita em `LeandroSeabra/axys-lab-landing-page`. O botão de entrada não concede essa permissão. A autenticação pública ainda depende de conectar um provedor OAuth; até lá, o site público informa que o acesso está em ativação. Não há login simulado, senha compartilhada, token ou client secret no projeto.

## Revisão local, sem publicar

Requisitos: Python 3.12+ com os dados de fuso horário disponíveis, Node.js 20+ e internet para o Decap. Execute na raiz:

```powershell
python -X utf8 tools/dev_portal.py
```

Abra **http://127.0.0.1:8766/admin/** e aguarde o Decap Proxy iniciar na porta 8081. Se outra aplicação já ocupa uma dessas portas, encerre apenas o processo correspondente ou ajuste a configuração antes de iniciar. O editor depende da conexão com o CDN do Decap.

O helper executa `decap-server@3.11.6`, em modo `fs`, limitado a `127.0.0.1`. O cache de dependências fica em `.portal-dev/`, ignorado pelo Git. Esse servidor não possui autenticação e nunca deve ser exposto à rede ou usado na hospedagem pública. Acesso local dispensa login apenas nesse ambiente de desenvolvimento.

Os salvamentos alteram arquivos reais deste checkout. O gerador acompanha as mudanças e atualiza a prévia pública local; recarregue o portal depois de salvar. Nada é commitado, enviado ao GitHub ou publicado. O terminal informa erros de validação. Ctrl+C encerra os servidores iniciados pelo helper.

No editor local, o botão de salvar/publicar grava somente arquivos locais. “Visível no site” controla se a notícia entra na geração: desativado mantém um rascunho, ativado permite exibir na prévia. Uma data futura só aparece depois que a data chegar e houver nova geração.

## Escrever uma notícia

1. Entre no editor, escolha Publicações e crie uma publicação. O tipo inicial é Notícias. Preencha título, resumo, área, assuntos, autor e data.
2. Envie uma capa JPG, PNG ou WebP. Informe descrição acessível, legenda quando necessária, autoria, origem e licença ou autorização verificável. Use apenas imagens autorizadas para o contexto. Veja `DIREITOS_DAS_IMAGENS.md`.
3. Adicione as seções com subtítulo e texto. Separe parágrafos com uma linha em branco. HTML e Markdown aparecem como texto. O campo “Imagem desta seção” permite incluir outras imagens com os próprios créditos. A ideia central é opcional no editor: ao salvar, usa o resumo se estiver vazia.
4. Cadastre fontes com instituição/autores, título, ano e URL HTTPS. Se quiser indicar fontes por seção, informe seus números na ordem da lista. Tabelas precisam ter o mesmo número de células e colunas.
5. Em “Método Axys relacionado”, escolha um método apenas quando houver relação com a notícia. A prévia mostra o link para uma página ou seção existente. Escolha “Sem link de método” quando não se aplicar. Uma chamada final de contato também é opcional.
6. Salve com “Visível no site” desativado para manter o rascunho. Confira fatos, texto, imagens, fontes e links na prévia. Marque no máximo uma publicação como destaque. Autor/revisor devem identificar quem realmente participou; não preencha revisão sem confirmação.
7. Para editar, abra a publicação na lista. Para excluir, use o comando de exclusão do editor e confirme somente o conteúdo desejado. A geração remove a página e a retira das listagens e do sitemap. A URL antiga passa a responder 404; planeje redirecionamentos quando substituir conteúdo público.

Os rascunhos não entram no artefato público do site, mas arquivos num repositório GitHub público continuam visíveis no GitHub. Não coloque informação confidencial neles. `rascunho-noticia.json` é um modelo anterior, não uma notícia publicada.

## Conectar o login GitHub em produção

O GitHub Pages não executa o servidor OAuth. É necessário um provedor compatível com o backend GitHub do Decap: serviço OAuth próprio ou uma das alternativas documentadas em https://decapcms.org/docs/github-backend/ . Nenhum serviço externo foi contratado ou criado nesta etapa.

1. Configure a aplicação OAuth e seu provedor para o domínio `https://axysgeosolucoes.com`, seguindo o callback exigido pelo serviço escolhido.
2. Guarde o client secret somente no servidor de autenticação. Nunca coloque segredo, senha ou token em `admin/`.
3. Preencha `oauthBaseUrl` (HTTPS) e `authEndpoint` em `admin/settings.js`. São parâmetros públicos; o editor os aplica ao backend GitHub de `admin/config.yml`. Repositório e branch devem continuar apontando ao destino publicado correto.
4. Verifique login com uma conta GitHub colaboradora com escrita. Teste também a recusa de uma conta sem autorização. A entrada mostra acesso com GitHub quando a URL estiver configurada; isso não substitui verificar o provedor.
5. Teste primeiro com um rascunho. No domínio público, o modo editorial do Decap cria alterações para revisão; a conclusão da publicação integra o conteúdo à `main`. Ativar “Visível no site” sozinho não conclui esse fluxo.

O workflow `.github/workflows/publicar.yml` já valida e publica a `main` pelo GitHub Actions, e pode ser executado manualmente. A rotina diária às 03h15 de Brasília inclui conteúdos agendados, sujeita a atrasos do GitHub. O workflow exclui fontes, ferramentas, mockups e caches locais do artefato. Não há geração de texto por IA no editor.

## Verificações

```powershell
python -X utf8 -m unittest discover -s tools
python -X utf8 tools/gerar_conteudos.py
node --check admin/editor.js
```

Os modelos estão em `tools/templates/`, o estilo público em `assets/css/conteudos.css` e os filtros em `assets/js/conteudos.js`. A versão dos assets editoriais acompanha seu conteúdo. O gerador não depende de bibliotecas externas. A configuração YAML pode ser lida com PyYAML para manutenção, mas ele não é necessário para gerar o site ou usar o editor.

O portal mantém `/conteudos/`, `/conteudos/noticias/` e as coleções por assunto em `/conteudos/temas/<tema>/`. Não use `index`, `noticias`, `temas` ou `politica-editorial` como nome de arquivo de notícia. Preserve o nome do arquivo após publicar. As leituras relacionadas usam os identificadores selecionados no campo `related`; não há preenchimento automático com assuntos aleatórios.

Os destinos das chamadas de contato recebem o identificador do artigo. Para novos assuntos personalizados no formulário público, atualize o mapa de contextos em `assets/js/site.js` e verifique `/tools/verificar_editorial.html`. O campo de métodos leva diretamente a páginas explicativas e não depende desse mapa. Critérios editoriais: `ESTRATEGIA_CONTEUDOS.md` e `/conteudos/politica-editorial/`.
