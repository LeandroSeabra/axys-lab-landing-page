
// Campanhas: data, variação de resistividade na zona monitorada e nível. Valores ilustrativos.
const CAMPANHAS = [
  {
    "date": "março de 2025",
    "delta": 0,
    "note": "Campanha inicial usada como referência nesta simulação. A variação foi definida como zero."
  },
  {
    "date": "junho de 2025",
    "delta": -9,
    "note": "Neste exemplo, a resposta elétrica difere da referência. A interpretação exige contexto de aquisição e operação."
  },
  {
    "date": "setembro de 2025",
    "delta": -15,
    "note": "A diferença permanece no cenário ilustrativo. Porcentagens, sozinhas, não definem condição de segurança."
  },
  {
    "date": "dezembro de 2025",
    "delta": -24,
    "note": "A comparação deve considerar qualidade dos dados, geometria, condições ambientais e registros da estrutura."
  },
  {
    "date": "março de 2026",
    "delta": -33,
    "note": "O cenário representa uma mudança elétrica, sem confirmar infiltração, causa ou estabilidade."
  },
  {
    "date": "junho de 2026",
    "delta": -42,
    "note": "A análise integrada pode indicar a necessidade de investigação complementar, conforme avaliação da equipe responsável."
  }
];

(() => {
  const root = document.querySelector("[data-monitor]");
  if (!root) return;
  const range = root.querySelector("#campanha");
  const frames = [...root.querySelectorAll("[data-frame]")];
  const date = root.querySelector("[data-date]");
  const delta = root.querySelector("[data-delta]");
  const lvl = root.querySelector(".s-level");
  const note = root.querySelector("[data-note]");
  const show = (i) => {
    const c = CAMPANHAS[i];
    frames.forEach((f, k) => f.classList.toggle("is-active", k === i));
    date.textContent = c.date;
    delta.textContent = `${c.delta < 0 ? "−" : "+"}${Math.abs(c.delta)}%`;
    lvl.dataset.level = "0";
    lvl.textContent = i === 0 ? "Referência" : "Comparação";
    note.textContent = c.note;
    range.setAttribute("aria-valuetext", `${c.date}, variação de ${c.delta}%, exemplo ilustrativo`);
  };
  range.addEventListener("input", () => show(Number(range.value)));
  show(Number(range.value));
})();

// Elementos que entram ao rolar (a animação fica em assets/js/site.js).
(() => {
  const sel = [".section-title", ".s-row", ".s-levels-intro", ".s-band", ".s-mosaic figure", ".s-cycle-text p", ".s-contact-side > *", ".s-form"];
  const targets = [];
  sel.forEach((s) => document.querySelectorAll(s).forEach((el) => {
    el.setAttribute("data-reveal", "");
    el.style.setProperty("--d", String(Math.min([...el.parentElement.children].indexOf(el), 6)));
    targets.push(el);
  }));
})();
