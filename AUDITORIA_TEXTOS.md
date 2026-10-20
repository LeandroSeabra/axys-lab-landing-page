# Auditoria de curadoria e clareza — Axys Geo Soluções

Data: 20/10/2026. Base: arquivos locais da main, após o commit 40ce95b. Auditoria editorial; os textos públicos não foram alterados. Não é uma certificação da operação, das atribuições profissionais ou da conformidade jurídica da empresa.

## Escopo e método

Revisadas as páginas inicial, Geofísica, Safe, Topo, Lab, Quem somos, Privacidade e 404; a central e os cinco artigos publicados; as duas versões em inglês; os textos dinâmicos de Geofísica, Safe e contato; as quatro apresentações PDF, tanto seus modelos HTML quanto o texto extraído dos arquivos distribuídos. O painel e os mockups foram considerados materiais auxiliares, não páginas comerciais. Currículos foram considerados na leitura da apresentação dos sócios; diplomas, CATs, registros e fatos biográficos não foram autenticados externamente.

Critérios: resposta à dúvida do visitante, clareza para não especialistas, precisão de linguagem, distinção entre medição e interpretação, estado real da oferta, repetição, coerência entre formatos e utilidade de cada trecho. Questões técnicas foram contrastadas com documentação primária da EPA e fontes institucionais indicadas ao final.

As classificações abaixo distinguem: **contradição verificável no texto**, **afirmação que exige confirmação da empresa** e **melhoria editorial**. Ausência de comprovação no repositório não significa que uma informação seja falsa.

## Parecer

O site tem boa estrutura e uma linguagem majoritariamente direta. A entrada por necessidade e as listas de entregas funcionam bem. O principal problema é a falta de uma régua única de precisão: os artigos reconhecem limites, enquanto algumas simulações e páginas comerciais afirmam resultados de forma categórica.

Os artigos têm outro problema: parte do espaço foi preenchida com recomendações recorrentes sobre propostas, escopo e contratação. Isso é útil uma vez, mas não substitui a explicação do serviço. Há trechos escritos nesta implementação que devem ser enxugados e alguns que revelam o processo interno de produção do texto. A curadoria deve melhorar esse material também.

## Prioridade 1 — precisão e confiança

### 1. Safe: prometer antecipação de risco

- **Onde:** `safe/index.html:79`, `index.html:118` e apresentação Safe.
- **Trecho:** “vemos a água avançar por dentro do maciço antes que ela vire risco”.
- **Problema:** transforma uma contribuição investigativa em promessa de antecipação. O próprio artigo sobre barragens diz que uma anomalia isolada não determina segurança.
- **Sugestão:** “Comparamos campanhas geofísicas para investigar mudanças no maciço e apoiar a avaliação da equipe responsável pela barragem.”
- **Natureza:** incoerência editorial/técnica. O texto não deve afirmar desempenho que não demonstrou.

### 2. Geofísica: detecção universal de tubulações

- **Onde:** `geo/geo.js:40`; texto equivalente em inglês na mesma fonte.
- **Trecho:** “cada tubo, cabo ou laje aparece como um reflexo nítido”.
- **Problema:** promete detecção e nitidez universais. A EPA descreve dependência do contraste, das propriedades do meio e da atenuação. O artigo de GPR explica justamente esses limites.
- **Sugestão:** “O GPR pode ajudar a localizar tubulações e estruturas rasas quando há contraste e condições favoráveis de investigação.”
- **Ação:** corrigir também o texto inicial do HTML quando equivalente, legendas, tradução e PDFs relacionados.

### 3. Simulação: resposta geofísica tratada como diagnóstico

- **Onde:** `geo/geo.js`, especialmente alvos água, argila/contaminação, ferro e alteração; `safe/safe.js`.
- **Problemas:** a queda de resistividade não demonstra, sozinha, água aproveitável; perda do sinal de radar não delimita automaticamente contaminação; nem toda alteração destrói magnetita; respostas de minério de ferro não são uniformes. A forma magnética depende do modelo e não de uma regra geral para todo o Norte.
- **Safe:** percentuais ilustrativos acionam níveis “Normal”, “Atenção” e “Alerta” por limites fixos no script. Há aviso de simulação, mas a interface se parece com uma classificação operacional. O texto também faz a primeira campanha ter variação de −6%, embora a apresente como referência inicial: falta explicar em relação a quê essa variação foi calculada.
- **Ação:** apresentar hipóteses do cenário, chamar níveis de exemplo didático e não sugerir que os limites sejam critério real de segurança. Distinguir “mudança da resposta elétrica” de “infiltração confirmada”.

### 4. Operação da barragem: resposta absoluta

- **Onde:** FAQ Safe e PDF: “Não. Os eletrodos são instalados [...] sem interferir na operação.”
- **Problema:** a possibilidade depende do local, acesso, atividades e planejamento da estrutura. O site não fundamenta uma garantia para qualquer caso.
- **Sugestão:** “A necessidade de restrições de acesso ou ajustes na operação é avaliada com a equipe responsável durante o planejamento.”

### 5. Provas de experiência ainda marcadas como pendentes

- **Onde:** Quem somos, experiência Safe e Topo e `assets/js/config.js`.
- **Exemplos:** “A experiência dos sócios está registrada em Certidões de Acervo Técnico (CAT)” ao lado de “Confirmar”; credenciamento no Incra “Confirmar”; CNPJ e responsável técnico em branco.
- **Problema:** uma frase afirmativa e um aviso de confirmação convivem na mesma apresentação. Não é possível validar esses fatos só pelos textos.
- **Ação:** confirmar com documentos e publicar apenas o que estiver estabelecido. Não criar número, registro, credenciamento, CAT ou profissional responsável para preencher a página.
- **Cuidado:** ocultar “Confirmar” sem resolver a afirmação não corrige a curadoria.

### 6. Lab: distinguir desenvolvimento, intenção e oferta em andamento

- **Onde:** programa piloto, FAQ e processo do Lab; PDF do Lab.
- **Exemplos:** “Estamos selecionando” e benefícios definidos convivem com “Proposta: confirmar condições”; o PDF diz que instituições “testam” protótipos, enquanto outras partes dizem que os testes ainda ocorrerão.
- **Problema:** não fica claro o que já existe. “Prioridade”, manutenção, calibração, entrega de dados e comparação com equipamento consolidado são compromissos que exigem confirmação.
- **Ação:** separar estágio atual comprovado, próximos passos planejados e condições comerciais já aprovadas. Se ainda é levantamento de interesse, usar essa descrição. Não afirmar que o piloto ocorre nem que os testes já foram executados sem confirmação.

### 7. O mesmo radargrama recebe descrições incompatíveis

- **Onde:** `geo/index.html:185` em diante e `content/posts/gpr-localizar-tubulacoes.json`, campo `caption`.
- **Constatação:** ambos usam `assets/dados/gpr-radargrama.jpg`. A página de serviço o associa a trabalho anterior de um sócio, em 2023, com vala de verificação. O artigo o apresenta como ilustrativo e afirma que não é resultado de investigação contratada.
- **Ação:** confirmar a origem e padronizar legenda, texto alternativo, contexto e autorização de uso. Se real, informar corretamente a condição de trabalho anterior; se simulado, não vinculá-lo a um caso real. Revisar também o crédito genérico do rodapé que chama as seções de simulações.

### 8. Normas não devem ser uma lista estática de autoridade

- **Onde:** quadros de normas das páginas e PDFs, especialmente Safe e Topo.
- **Constatação verificada:** a ANM informou atualização da Resolução 95/2022 pela Resolução 220/2025. A página cita 95/2022 sem contexto de atualização.
- **Ação:** revisar atos aplicáveis, alterações e situação vigente antes de publicar a referência como orientação atual. Não presumir a aplicabilidade de uma resolução a qualquer barragem.
- **Topo:** “Lei 13.465/2017 — Regularização fundiária urbana e rural (REURB)” mistura o alcance da lei com a denominação da Reurb. Separar conceitos; também restringir a frase genérica sobre obrigatoriedade em alterações de matrícula às hipóteses aplicáveis, sem inventar um calendário.

## Prioridade 2 — clareza e utilidade por página

### Página inicial

**Manter:** seletor “O que você precisa?”, quatro áreas e descrição da base em Belém.

**Melhorar:**
- “Do subsolo ao registro” é uma assinatura de marca razoável, mas não identifica os serviços sozinha. Manter se o subtítulo continuar imediato e concreto.
- “Cada área tem equipe [...] própria” precisa de confirmação. A estrutura apresentada está concentrada nos sócios; quatro áreas não demonstram quatro equipes independentes. “Cada necessidade leva à área correspondente” resolve a navegação sem essa alegação.
- “Em terra e com drone” pode ser lido como disponibilidade das duas plataformas para todos os métodos. Especificar quais serviços usam cada plataforma.
- “Onde atuamos” mistura estados apresentados com um aviso para confirmá-los. Publicar a cobertura real ou informar que a logística é avaliada conforme o projeto.
- “Quem assina, vai a campo” é uma promessa objetiva: manter apenas se for prática assumida para todos os trabalhos anunciados.
- Retirar a seção vazia “Em números” enquanto não houver números confirmados. Não substituí-la por estimativas.

### Axys Geofísica

**Manter:** pergunta pelo alvo, etapas de trabalho e entregas.

**Melhorar:**
- Trocar o título de coluna “Até onde vê” por “Profundidade de investigação”; comunicar dependência das condições sem transformar cada célula em uma garantia.
- Explicar uma vez eletrorresistividade (“como o terreno responde à passagem de corrente”), inversão (“cálculo de modelos compatíveis com as medidas”) e contraste (“diferença de propriedades que permite investigar um alvo”).
- “Geologia lida nos dados” e “mapas confiáveis” são vagos. Descrever interpretação integrada aos dados existentes e indicação de limitações.
- “Do raso ao profundo” praticamente não ajuda o contratante. Explicar o que determina alcance e o que será definido no escopo.
- Preservar o caso concreto de GPR se sua origem estiver confirmada. Dewow e ganho SEC2 podem ficar em uma nota técnica; não precisam interromper a explicação principal ao cliente.
- Não tratar todos os trabalhos em áreas remotas como solucionáveis por drone. Separar logística e viabilidade do método.

### Axys Safe

**Manter:** explicação de acompanhamento ao longo do tempo e integração com instrumentação.

**Melhorar:**
- “O que medimos” lista umidade, espessura e profundidade como medidas diretas. Preferir “O que investigamos” para essas interpretações; identificar a grandeza física medida quando necessário.
- Definir maciço, percolação e linha de base na primeira ocorrência.
- Explicar qual produto a equipe entrega: seção/modelo, comparação de campanhas, interpretações e pontos a avaliar. Evitar prometer um diagnóstico completo apenas com o levantamento.
- Evitar “o que fazer” sem definir que recomendações competem a esse escopo e quais decisões cabem à equipe responsável pela estrutura.

### Axys Topo

**Manter:** organização rural/urbano e demonstração de planta/memorial.

**Melhorar:**
- A seção “O memorial” exige que o visitante já saiba para que ele serve. Abrir com sua função: descrever os limites do imóvel em texto e medidas.
- Explicar desmembramento, remembramento e planialtimétrico em linguagem cotidiana.
- Desenvolver GNSS, SIGEF, ART, APP, CCIR e CAR na primeira ocorrência relevante; não concentrar um glossário inteiro na abertura.
- “Até o registro” e “acompanhamos [...] até a conclusão” devem refletir o serviço realmente contratado. O artigo distingue etapas corretamente; a página comercial deve fazer a mesma distinção.
- A afirmação “cada vértice vem de [...] GNSS” é restritiva como explicação de todo levantamento: revisar com o responsável conforme técnicas admitidas e usadas. Não acrescentar equipamentos ou atribuições que a empresa não confirmou.

### Axys Lab

**Manter:** informação de que os instrumentos estão em desenvolvimento e a relação com necessidades de campo.

**Melhorar:**
- Dizer claramente o que o visitante pode fazer agora: receber atualizações, apresentar uma aplicação ou participar de um piloto já confirmado. Isso deve vir antes da longa explicação do desenvolvimento.
- A simulação “Mais alto, mais fraco” é didática; vincular a forma da curva ao modelo de esfera, inclinação e hipóteses usadas. Não generalizar a curva para todo corpo magnético do Norte.
- “Cada versão é testada [...] como estes perfis simulados” confunde validação do software/modelo com calibração e validação do instrumento físico. Explicar separadamente o que foi efetivamente testado.
- Uma tabela inteira “a definir” não é uma ficha técnica útil. Ocultar até existirem especificações ou substituí-la por uma nota curta de estágio, sem inventar parâmetros.
- Evitar descrição de aplicação que soe como detecção direta e universal de ouro, aquíferos ou contaminação. Relacionar aplicações a contrastes e métodos efetivamente previstos.

### Quem somos e currículos

**Manter:** nomes, funções, trajetória e distinção entre experiência dos profissionais e projetos da empresa.

**Melhorar:**
- “Empresa nova, equipe experiente” aparece em várias páginas e por vezes se repete na própria seção. Uma explicação institucional e evidências objetivas são suficientes; nas páginas de serviço, destacar a experiência pertinente.
- “O que os clientes da região mais pedem” parece conclusão de pesquisa comercial. Remover essa comparação se não existir evidência; basta dizer quais áreas a empresa reúne.
- “Transforma física em software” pode ser uma frase de apoio, desde que seguida da descrição objetiva já existente.
- MCSEM, elementos finitos e COMSOL fazem sentido no currículo detalhado. Na apresentação curta, priorizar o problema que essa experiência ajuda a resolver.
- Informações de formação e registro precisam de atualização periódica; esta auditoria não comprova diplomas ou atribuições.

### Privacidade e mensagens de contato

**Manter:** linguagem curta, canal de contato e explicação da finalidade.

**Melhorar:**
- “Somente o que você escreve” não descreve todo o formulário atual: agora há assunto sugerido e referência do artigo acrescentados pelo site. Informar esses dados e sua finalidade de contexto do atendimento.
- A frase dos formulários diz “só para responder”, enquanto a política inclui preparar propostas e conversar sobre o projeto. Harmonizar o resumo com a finalidade efetivamente usada.
- Não classificar indistintamente serviços e programas de e-mail como “apenas operadores” sem conferir os papéis e condições reais.
- Rever a descrição das bases legais e dos prazos com quem responde pelo tratamento de dados. Não usar um prazo único como explicação de todos os direitos sem essa validação.
- O JavaScript promete resposta em dois dias úteis após envio. É um compromisso de atendimento que precisa ser aprovado pela empresa.
- O botão “WhatsApp” permanece com nome e ícone de WhatsApp mesmo quando o número está vazio e o destino é um formulário. O texto deve refletir o canal real.

### Central, 404 e materiais auxiliares

A central de conteúdos e a 404 têm textos diretos e adequados. “Caderno de campo” pode continuar como nome editorial, mas não deve induzir a pensar que todos os artigos relatam campanhas próprias. O painel sinaliza honestamente a autenticação pendente. Mockups e rascunhos devem continuar fora da apresentação comercial principal.

## Os cinco artigos — onde cortar e onde explicar melhor

Os artigos não precisam ser artificialmente longos para parecer profissionais. Fontes identificadas, limites claros e exemplos pertinentes são mais úteis que repetir a recomendação de pedir uma proposta.

| Artigo | Parte útil a preservar | Reorganização proposta |
| --- | --- | --- |
| O que é geofísica? | Separação medir/modelar/interpretar e tabela de métodos | Aproximar a resposta inicial de exemplos de aplicação; transferir ou condensar as três últimas seções de contratação em um único bloco final. A sísmica pode ser exemplo de família de métodos, sem parecer um serviço já anunciado pela Axys. |
| Água subterrânea | Resistividade não é confirmação de água, vazão ou qualidade | Unir fluxo de decisão, critérios de proposta e conversa com a equipe; acrescentar explicação simples da diferença entre identificar um alvo e verificar o desempenho do poço. |
| GPR | Funcionamento, limitações, exemplo de tempo/profundidade | Unir cobertura, entrega, orçamento e contato em um roteiro curto. Condensar o estudo de vazamento em nota de pesquisa ou removê-lo: vazamento não é a pergunta central de localizar interferências. |
| Georreferenciamento | Separação entre levantamento, certificação e registro | Unir os blocos de documentos, orçamento e início do serviço. O título promete explicar como funciona: mostrar uma sequência concreta com quem executa cada etapa, limitada ao que puder ser verificado. |
| Barragens | Complementaridade e contexto de campanhas | Consolidar as três últimas seções. Explicar melhor como relacionar observações e por que mudança de resistividade não é mudança confirmada de estabilidade. |

### Frases que revelam o processo interno e devem sair do artigo público

Exemplos presentes no texto de GPR e em outros artigos:

- “sem anunciar que a Axys realizou o estudo”; a atribuição correta ao autor já resolve isso.
- “não é evidência de que o mesmo desenho produzirá a mesma resposta”; pode ser reduzido à limitação específica do estudo.
- “não deve ser apresentado como experiência da Axys”; orientação útil à redação, desnecessária na leitura pública quando o caso já está identificado.
- “Este artigo não apresenta tabela de preços”; explicar os fatores de orçamento é mais útil que anunciar uma ausência.

Uma nota editorial discreta pode informar a natureza de divulgação técnica. Repetir defesas e negativas no corpo do artigo dificulta a leitura e tira espaço de explicações.

## Inglês e PDFs

- As duas páginas inglesas reproduzem as afirmações técnicas problemáticas. Não basta corrigir o português; corrigir a fonte dinâmica e a tradução equivalente.
- Nas traduções, preservar o grau de certeza: “can”, “may”, “planned” e “in development” não são equivalentes a capacidade garantida ou oferta disponível.
- As quatro apresentações PDF distribuídas contêm “WhatsApp: a preencher”, CNPJ e responsável técnico “a preencher”. Isso foi confirmado por extração do texto dos binários, não apenas pela inspeção de modelos.
- O PDF Safe repete a promessa de antecipação de risco e de não interferência na operação.
- O PDF Lab usa o presente para os testes com instituições, em contraste com os testes futuros do site.
- PDFs precisam ser regenerados após revisão; mudar só o HTML da página não corrige o material que o visitante baixa.

## Ordem recomendada de trabalho

1. Corrigir as promessas técnicas absolutas e a interpretação das simulações; alinhar páginas, artigos, inglês e PDFs.
2. Confirmar CATs, credenciamento, responsável técnico, cobertura, capacidade operacional e estágio do Lab. Publicar apenas fatos estabelecidos.
3. Resolver a origem do radargrama e as legendas conflitantes.
4. Reorganizar os artigos para priorizar explicação e manter um bloco de contratação útil, sem duplicações.
5. Explicar siglas e termos no ponto de uso; substituir frases vagas por produtos e etapas reais.
6. Revisar privacidade e textos dos canais segundo o comportamento atual.
7. Publicar novamente PDFs e conferir as traduções e mensagens dinâmicas.

Critério de conclusão: cada frase deve informar uma necessidade, explicar um conceito, descrever uma entrega real, mostrar evidência ou orientar uma ação pertinente. Se apenas reforça uma impressão de competência sem acrescentar informação, pode sair.

## Fontes primárias consultadas

- EPA. Electrical Resistivity: https://www.epa.gov/environmental-geophysics/electrical-resistivity
- EPA. Ground Penetrating Radar (GPR): https://www.epa.gov/environmental-geophysics/ground-penetrating-radar-gpr
- EPA. Magnetic Method: https://www.epa.gov/environmental-geophysics/magnetic-method
- EPA. Electrical Methods: https://www.epa.gov/environmental-geophysics/electrical-methods
- ANA. Manual de Segurança e Inspeção de Barragens: https://www.ana.gov.br/arquivos/cadastros/barragens/inspecao/ManualdeSegurancaeInspecaodeBarragens.pdf
- ANM. Nova resolução reforça segurança de barragens no país (atualização 95/2022 e 220/2025): https://www.gov.br/anm/pt-br/assuntos/noticias/nova-resolucao-reforca-seguranca-de-barragens-no-pais/
- Incra. Índice de Legislação Agrária, seção de georreferenciamento e certificação: https://www.gov.br/incra/pt-br/centrais-de-conteudos/legislacao/indice_legislacao_agraria.pdf

Não foram usados dados de tráfego, entrevistas com usuários, verificação de contratos ou medição formal de compreensão. As avaliações de clareza são juízos editoriais apoiados em trechos concretos; as afirmações operacionais pendentes foram identificadas para confirmação, não declaradas falsas.


## Revisão aplicada em 20/10/2026

Foram revisados os textos de serviços e institucionais, as versões em inglês, os artigos e os modelos e arquivos PDF. As demonstrações agora apresentam respostas ilustrativas sem classificação de segurança ou promessa de detecção. A campanha inicial Safe tem variação zero. Foram retiradas as afirmações de CAT e credenciamento que estavam marcadas como pendentes, os números não preenchidos e a ficha técnica sem medições publicadas. O Lab apresenta desenvolvimento e discussão de aplicações, sem benefícios de piloto ou prioridade comercial ainda não definidos.

As orientações repetidas de contratação dos artigos foram consolidadas. A legenda do artigo de GPR identifica sua relação com o exemplo da página de Geofísica, sem classificá-lo contraditoriamente como simulação ou garantir desempenho em outro local. Os textos de privacidade e contato refletem o contexto dos artigos e o envio por e-mail configurado; o botão sem número de WhatsApp se chama Contato. Os quatro PDFs foram regenerados, omitindo campos cadastrais não preenchidos.

Dados biográficos e registros que já estavam identificados no site foram preservados; esta revisão não os autentica. Informações operacionais ou cadastrais ausentes não foram inventadas. Essas informações precisam ser confirmadas pela empresa antes de uma eventual inclusão. Mockups continuam como referências de design, fora da navegação comercial e do pacote de publicação configurado.
