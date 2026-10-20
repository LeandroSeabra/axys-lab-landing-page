const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


// Respostas típicas de cada método a cada alvo.
// amp: intensidade e sinal (resistividade negativa = mais condutor); shape: forma do perfil.
const TARGETS = {
  agua: {
    label: "Água subterrânea",
    res: { amp: -0.9, shape: "peak", text: "A resposta elétrica varia com a água nos poros, os sais e a composição do terreno. Uma zona condutiva, sozinha, não confirma um aquífero produtivo." },
    mag: { amp: 0.04, shape: "peak", text: "A magnetometria investiga contrastes magnéticos das rochas e de outros materiais; não é uma medida direta de água subterrânea." },
    gam: { amp: -0.18, shape: "peak", text: "A radiometria informa sobre materiais próximos à superfície, sem identificar diretamente a água em profundidade." },
    gpr: { amp: 0.55, shape: "step", text: "O nível d’água pode produzir uma reflexão em condições favoráveis. Condutividade, material e configuração limitam a investigação." },
  },
  ferro: {
    label: "Minério de ferro",
    res: { amp: -0.5, shape: "peak", text: "A resposta elétrica depende da composição e da estrutura do minério e das rochas; não identifica por si só o teor de ferro." },
    mag: { amp: 1, shape: "dipole", text: "Minerais magnéticos, como magnetita, podem produzir anomalias. Forma e intensidade dependem da fonte e de sua magnetização." },
    gam: { amp: -0.28, shape: "peak", text: "Variações de potássio, tório e urânio equivalentes podem apoiar o mapeamento superficial; não são medida direta de minério de ferro." },
    gpr: { amp: 0.12, shape: "peak", text: "Materiais condutivos podem limitar a penetração. A adequação do radar depende das condições e da profundidade do alvo." },
  },
  falha: {
    label: "Falha ou contato",
    res: { amp: -0.6, shape: "step", text: "Uma falha ou um contato pode coincidir com contraste elétrico. A interpretação depende dos materiais, fluidos e dados geológicos." },
    mag: { amp: 0.62, shape: "step", text: "Contatos entre materiais com propriedades magnéticas diferentes podem gerar variações do campo. Nem toda falha produz resposta identificável." },
    gam: { amp: 0.45, shape: "step", text: "Pode apoiar a identificação de diferenças entre materiais próximos à superfície, quando houver contraste radiométrico." },
    gpr: { amp: 0.5, shape: "step", text: "Descontinuidades rasas podem gerar reflexões interpretáveis, conforme contraste, geometria e penetração do sinal." },
  },
  argila: {
    label: "Argila e contaminação",
    res: { amp: -0.92, shape: "peak", text: "Argilas e fluidos com sais podem reduzir a resistividade. Distingui-los requer contexto e dados complementares." },
    mag: { amp: 0.05, shape: "peak", text: "A resposta depende dos minerais magnéticos presentes; não demonstra contaminação por si só." },
    gam: { amp: 0.42, shape: "peak", text: "A composição radiométrica pode variar entre solos e rochas; não identifica diretamente a presença de contaminação." },
    gpr: { amp: -0.25, shape: "peak", text: "A atenuação pode limitar a investigação. Perda de sinal não confirma nem delimita, sozinha, uma área contaminada." },
  },
  estruturas: {
    label: "Tubulações e estruturas enterradas",
    res: { amp: -0.25, shape: "spike", text: "Contrastes elétricos podem apoiar a investigação de estruturas, dependendo da escala e do desenho do levantamento." },
    mag: { amp: 0.75, shape: "dipole", text: "Objetos com materiais ferromagnéticos podem gerar anomalias. A resposta não permite mapear qualquer tipo de tubulação." },
    gam: { amp: 0.04, shape: "peak", text: "Não é uma técnica voltada à localização de redes enterradas; sua aplicação principal é investigar a composição superficial." },
    gpr: { amp: 1, shape: "spike", text: "Pode ajudar a localizar estruturas rasas quando há contraste e condições favoráveis. O levantamento não garante a detecção de todos os objetos." },
  },
  alteracao: {
    label: "Alteração hidrotermal",
    res: { amp: -0.42, shape: "peak", text: "A alteração pode modificar a resposta elétrica conforme minerais, porosidade e fluidos. A interpretação exige contexto geológico." },
    mag: { amp: -0.55, shape: "peak", text: "A alteração pode modificar os minerais magnéticos e sua resposta. Uma redução do sinal não é diagnóstico universal de alteração." },
    gam: { amp: 0.92, shape: "peak", text: "Mudanças em potássio, tório e urânio equivalentes podem apoiar estudos de alteração superficial, em conjunto com a geologia." },
    gpr: { amp: 0.08, shape: "peak", text: "A utilidade depende da profundidade e do contraste; o radar não identifica diretamente o processo de alteração hidrotermal." },
  },
};

// Versão em inglês (página en/geo): mesmos valores, outros textos.
const EN = (document.documentElement.lang || "").startsWith("en");
if (EN) {
  const descriptions = {
  "agua": [
    "Electrical response varies with pore water, dissolved salts and ground composition. A conductive zone alone does not confirm a productive aquifer.",
    "Magnetics investigates magnetic contrasts in rocks and other materials; it does not directly measure groundwater.",
    "Radiometrics provides information about near-surface materials, not a direct identification of water at depth.",
    "The water table may produce a reflection under favourable conditions. Conductivity, material and survey configuration constrain the investigation."
  ],
  "ferro": [
    "Electrical response depends on ore and host-rock composition and structure; it does not directly determine iron grade.",
    "Magnetic minerals such as magnetite may produce anomalies. Shape and strength depend on the source and its magnetisation.",
    "Potassium, equivalent thorium and equivalent uranium variations may support surface mapping; they are not a direct measure of iron ore.",
    "Conductive materials may limit penetration. Radar suitability depends on site conditions and target depth."
  ],
  "falha": [
    "A fault or contact may coincide with an electrical contrast. Interpretation depends on materials, fluids and geological information.",
    "Contacts between magnetically contrasting materials may produce field variations. Not every fault yields a recognisable response.",
    "Radiometrics may help distinguish near-surface materials where radiometric contrasts exist.",
    "Shallow discontinuities may produce interpretable reflections, depending on contrast, geometry and signal penetration."
  ],
  "argila": [
    "Clays and saline fluids may lower resistivity. Distinguishing them requires context and additional evidence.",
    "Response depends on magnetic minerals; it does not establish contamination by itself.",
    "Radiometric composition may vary between soils and rocks; it does not directly establish contamination.",
    "Attenuation may limit investigation. Signal loss alone neither confirms nor delineates a contaminated area."
  ],
  "estruturas": [
    "Electrical contrasts may support investigation of structures, depending on scale and survey design.",
    "Objects containing ferromagnetic materials may generate anomalies. Response does not provide a map of every utility type.",
    "Radiometrics is not intended for locating buried utility networks; it primarily investigates near-surface composition.",
    "GPR may help locate shallow structures where contrast and site conditions are favourable. It does not guarantee detection of every object."
  ],
  "alteracao": [
    "Alteration may change electrical response depending on minerals, porosity and fluids. Interpretation requires geological context.",
    "Alteration may change magnetic minerals and their response. A magnetic low is not a universal indication of alteration.",
    "Potassium, equivalent thorium and equivalent uranium variations may support studies of surface alteration alongside geology.",
    "Usefulness depends on depth and contrast; radar does not directly identify hydrothermal alteration processes."
  ]
};
  const labels = {"agua": "Groundwater", "ferro": "Iron ore", "falha": "Fault or contact", "argila": "Clay and contamination", "estruturas": "Buried utilities and structures", "alteracao": "Hydrothermal alteration"};
  Object.entries(descriptions).forEach(([key, texts]) => {
    TARGETS[key].label = labels[key];
    ["res", "mag", "gam", "gpr"].forEach((method, index) => { TARGETS[key][method].text = texts[index]; });
  });
}

const VERDICT = EN ? "Illustrative example" : "Exemplo ilustrativo";

// Perfil em 600 × 120; o eixo fica em y = 60 e a amplitude máxima ocupa 48 px.
const profile = ({ amp, shape }) => {
  const pts = [];
  for (let x = 0; x <= 600; x += 6) {
    const u = (x - 300) / 70;
    let v;
    if (shape === "dipole") v = -Math.exp(-u * u) * 1 + 0.45 * (Math.exp(-((u - 1.6) ** 2) * 1.2) + Math.exp(-((u + 1.6) ** 2) * 1.2));
    else if (shape === "step") v = Math.tanh(u * 1.4);
    else if (shape === "spike") v = Math.exp(-((u * 2.4) ** 2));
    else v = Math.exp(-u * u);
    const noise = Math.sin(x * 0.21) * 0.025 + Math.sin(x * 0.07 + 1) * 0.02;
    pts.push(60 - (amp * v + noise) * 48);
  }
  return pts;
};
const toPath = (pts) => pts.map((y, i) => `${i ? "L" : "M"}${i * 6} ${y.toFixed(1)}`).join("");

(() => {
  const buttons = [...document.querySelectorAll("[data-target]")];
  const rows = [...document.querySelectorAll("[data-method]")];
  const select = document.querySelector("[data-target-select]");
  const current = new Map(rows.map((row) => [row, profile({ amp: 0, shape: "peak" })]));

  const show = (key, animate) => {
    const t = TARGETS[key];
    buttons.forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.target === key)));
    // A demonstração inicial não deve substituir o interesse trazido por um artigo.
    if (select && animate) select.value = t.label;
    rows.forEach((row) => {
      const m = t[row.dataset.method];
      // Sem dados para este método (por exemplo, script e página de versões diferentes): esconde o cartão em vez de travar.
      row.hidden = !m;
      if (!m) return;
      row.dataset.level = "0";
      row.querySelector("[data-verdict]").textContent = VERDICT;
      row.querySelector("[data-text]").textContent = m.text;
      const path = row.querySelector("[data-curve]");
      const from = current.get(row);
      const to = profile(m);
      current.set(row, to);
      if (!animate || reduceMotion) { path.setAttribute("d", toPath(to)); return; }
      const start = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - start) / 320);
        const e = 1 - (1 - k) ** 3;
        path.setAttribute("d", toPath(from.map((y, i) => y + (to[i] - y) * e)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };

  buttons.forEach((b) => b.addEventListener("click", () => show(b.dataset.target, true)));
  show("agua", false);
})();

// Elementos que entram ao rolar (a animação fica em assets/js/site.js).
(() => {
  const sel = [".section-title", ".g-target-intro > p", ".g-response", ".g-table-wrap", ".g-flow-row li", ".g-deliver figure", ".g-deliver dl > div", ".g-contact-side > *", ".g-form"];
  const targets = [];
  sel.forEach((s) => document.querySelectorAll(s).forEach((el) => {
    el.setAttribute("data-reveal", "");
    el.style.setProperty("--d", String(Math.min([...el.parentElement.children].indexOf(el), 6)));
    targets.push(el);
  }));
})();
