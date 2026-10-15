
// Campanhas: data, variação de resistividade na zona monitorada e nível. Valores ilustrativos.
const CAMPANHAS = [
  { date: "março de 2025", delta: -6, note: "A primeira campanha é a linha de base: tudo o que vier depois é comparado com ela." },
  { date: "junho de 2025", delta: -9, note: "Pequena queda, compatível com o período chuvoso. Segue o calendário." },
  { date: "setembro de 2025", delta: -15, note: "A faixa condutora ficou mais nítida mesmo na seca. A próxima campanha é antecipada." },
  { date: "dezembro de 2025", delta: -24, note: "A mudança se concentra na mesma zona e cresce. Cruzamos com os piezômetros." },
  { date: "março de 2026", delta: -33, note: "A infiltração atravessa o maciço até a fundação. Relatório imediato ao responsável." },
  { date: "junho de 2026", delta: -42, note: "A zona continua crescendo. Recomendação de inspeção e intervenção no trecho." },
];
const level = (d) => (Math.abs(d) >= 30 ? 2 : Math.abs(d) >= 12 ? 1 : 0);
const LEVEL_NAME = ["Normal", "Atenção", "Alerta"];

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
    const l = level(c.delta);
    lvl.dataset.level = String(l);
    lvl.textContent = LEVEL_NAME[l];
    note.textContent = c.note;
    range.setAttribute("aria-valuetext", `${c.date}, variação de ${c.delta}%, nível ${LEVEL_NAME[l]}`);
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
