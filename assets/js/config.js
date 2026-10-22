/*
 * Axys Geo Soluções — dados da empresa usados em todas as páginas.
 *
 * ESTE É O ÚNICO ARQUIVO QUE PRECISA SER EDITADO PARA ATUALIZAR CONTATOS E DADOS.
 * Campos vazios ("") ficam escondidos ou aparecem como espaço reservado
 * enquanto `mostrarEspacosReservados` for true.
 */
window.AXYS = {
  // Enquanto true, os espaços reservados (equipe, CNPJ, números, estudos de caso)
  // aparecem marcados para preenchimento. Antes de publicar sem esses dados, mude para false:
  // os blocos sem dados somem da página.
  mostrarEspacosReservados: false,

  empresa: {
    nome: "Axys Geo Soluções",
    razaoSocial: "",          // ex.: "Axys Geo Soluções Ltda."
    cnpj: "",                 // ex.: "00.000.000/0001-00"
    endereco: "",             // ex.: "Av. Exemplo, 123, Umarizal"
    cidade: "Belém",
    estado: "PA",
    cep: "",
    responsavelTecnico: "",   // ex.: "Nome do engenheiro"
    crea: "",                 // ex.: "CREA-PA 000000000-0"
  },

  // WhatsApp com DDI e DDD, só números. Ex.: "5591999999999". Vazio esconde o botão.
  whatsapp: "",

  telefone: "",               // ex.: "(91) 0000-0000"

  // E-mail de cada área. Se ainda não existirem, todos podem apontar para o mesmo endereço.
  emails: {
    geral: "lab@axysgeosolucoes.com",
    geofisica: "lab@axysgeosolucoes.com",
    safe: "lab@axysgeosolucoes.com",
    topo: "lab@axysgeosolucoes.com", // AXYS TERRA: chave legada preservada.
    lab: "lab@axysgeosolucoes.com",
  },

  // Envio real dos formulários (Web3Forms, gratuito): crie uma chave em https://web3forms.com
  // com o e-mail que deve receber as mensagens e cole aqui. Vazio = o formulário abre o e-mail.
  formularioChave: "",

  redes: {
    linkedin: "",
    instagram: "",
  },
};
