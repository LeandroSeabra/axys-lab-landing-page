# Primeira seleção editorial — Axys

Data de pesquisa e consulta das fontes: 20/10/2026.

## Objetivo e evidência

A seleção conecta dúvidas de pesquisa a decisões sobre os serviços que o site já apresenta. Foram consultados resultados para “o que é geofísica para que serve”, “geofísica encontrar água subterrânea poço artesiano”, “GPR localizar tubulações profundidade” e “georreferenciamento imóvel rural certificação SIGEF”. Monitoramento de barragens completa a cobertura da área Safe.

Os resultados ajudam a reconhecer linguagem e problemas de contratação. Não foram obtidos volumes de busca, dados do Search Console, taxas de conversão ou posições do site. A prioridade é uma hipótese editorial; não há alegação de que esses sejam os termos mais buscados. O desempenho deve ser avaliado após publicação, por consulta/página e contatos qualificados.

## Mapa de intenção e próximo passo

| Artigo / endereço em `/conteudos/` | Pergunta do leitor | Etapa de decisão | Chamada e destino |
| --- | --- | --- | --- |
| `o-que-e-geofisica/` | O que é geofísica e em que ela pode ajudar? | Descoberta e entendimento | Conhecer aplicações em `/geo/`, sem exigir contato imediato |
| `geofisica-agua-subterranea-poco/` | Um estudo ajuda a escolher onde perfurar? O que ele garante? | Avaliação de solução | Discutir viabilidade e escopo em `/geo/#contato` |
| `gpr-localizar-tubulacoes/` | O radar serve para investigar redes antes de intervir? | Avaliação de solução e contratação | Avaliar levantamento em `/geo/#contato` |
| `georreferenciamento-imovel-rural-sigef/` | Qual a diferença entre medir, certificar e registrar? | Delimitação do serviço | Discutir o escopo com Topo em `/topo/#contato` |
| `monitoramento-geofisico-barragens/` | Como a geofísica complementa o acompanhamento? | Avaliação técnica | Conversar com Safe em `/safe/#contato` |

Cada artigo tem uma chamada contextual após a explicação, antes das referências. Não usa urgência artificial, porcentagens de sucesso, preços sem escopo ou garantia de resultado. O artigo de descoberta oferece uma página de aplicações; os textos de avaliação permitem iniciar uma conversa técnica. As leituras relacionadas conectam o artigo principal às aplicações.

## Critérios editoriais aplicados

- Uma pergunta central por URL e títulos descritivos. “O que é geofísica?” é o destaque da central.
- Resposta direta, seções com hierarquia, resumo inicial, índice, estimativa de leitura e referências navegáveis.
- Síntese original em português; sem copiar resumos científicos, inventar dados, fingir pesquisa inédita ou atribuir experiência de terceiros à Axys.
- Afirmações técnicas acompanhadas de fontes primárias: EPA, USGS, ANA, Incra, repositórios institucionais e artigos com DOI verificável. As referências ao final de cada seção apontam para as fontes que sustentam seus conceitos; os roteiros de contratação são recomendações editoriais.
- Referências de conceitos físicos podem ser anteriores; datas antigas não são apresentadas como legislação atual. O texto rural não fixa prazos legais por tamanho do imóvel.
- Nenhum revisor técnico nominal foi inventado. A autoria organizacional identifica a redação; os artigos são divulgação técnica, não publicação científica revisada por pares.
- Capas didáticas do acervo do site explicitamente identificadas como simulações. Não são casos reais, imóveis certificados ou diagnósticos de estruturas.
- Os exemplos numéricos do GPR são didáticos, com hipóteses e unidades; não são parâmetros prometidos para um cliente.

## Manutenção

Atualize os JSON em `content/posts/` ou os mesmos campos no Decap. Há campos para fontes, números das referências por seção, tabelas, chamada contextual, destaque e leituras relacionadas. O gerador valida referências e destinos e escapa textos, sem executar HTML do editor.

Antes de incorporar um estudo novo, confira autoria, título, ano, DOI/URL, ambiente investigado e o alcance da conclusão. Resultados de laboratório ou de uma barragem estrangeira não devem virar garantia para um projeto local.

O antigo conteúdo `preparar-projeto-para-conversa-com-axys/` foi removido da fonte, da listagem, dos arquivos gerados e do sitemap conforme solicitado. Não foi criado redirecionamento porque era uma página local ainda não publicada nesta sessão.

## Continuidade entre artigo e contato

O botão principal envia `?artigo=<identificador>` à página do serviço. Apenas cinco identificadores conhecidos são aceitos. O assunto e a referência do artigo acompanham o formulário e os links de e-mail; o WhatsApp usa o mesmo contexto quando houver um número configurado. Sem número, o botão flutuante preserva o assunto ao levar à página de contato da área. O contato do cabeçalho dos artigos usa o mesmo caminho.

O formulário apresenta um assunto editável e uma mensagem inicial editável. Nome, e-mail, local, empresa e condições do projeto não são inferidos. O artigo sobre barragens não determina o tipo da estrutura. O simulador de métodos não substitui o alvo do formulário durante a inicialização.

As recomendações são exclusivamente as escolhidas nos arquivos editoriais: o guia de geofísica apresenta água e GPR; estes retornam ao guia. Georreferenciamento e barragens não recebem artigos de outro assunto para preencher espaço. Suas chamadas já conduzem aos serviços Topo e Safe. Não foram criados textos ou alegações para completar recomendações.
