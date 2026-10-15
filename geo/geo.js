const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;


// Respostas típicas de cada método a cada alvo.
// amp: intensidade e sinal (resistividade negativa = mais condutor); shape: forma do perfil.
const TARGETS = {
  agua: {
    label: "Água subterrânea",
    res: { amp: -0.9, shape: "peak", text: "A água deixa o terreno mais condutor: a resistividade cai onde ela está." },
    mag: { amp: 0.04, shape: "peak", text: "Água não é magnética; o campo não muda." },
    gam: { amp: -0.18, shape: "peak", text: "Só lê a superfície; percebe a água apenas se ela mudar o solo de cima." },
  },
  ferro: {
    label: "Minério de ferro",
    res: { amp: -0.5, shape: "peak", text: "Minério maciço costuma ser mais condutor que a rocha ao redor." },
    mag: { amp: 1, shape: "dipole", text: "A magnetita do minério altera o campo; perto do equador magnético aparece como um baixo com dois altos." },
    gam: { amp: -0.28, shape: "peak", text: "Formações ferríferas têm pouca radioatividade; a resposta é um leve baixo." },
  },
  falha: {
    label: "Falha ou contato",
    res: { amp: -0.6, shape: "step", text: "A falha separa materiais diferentes e muitas vezes conduz água: a resistividade muda de um lado para o outro." },
    mag: { amp: 0.62, shape: "step", text: "Rochas com magnetização diferente dos dois lados criam um degrau no campo." },
    gam: { amp: 0.45, shape: "step", text: "Se o contato separa rochas diferentes na superfície, a radiometria também muda." },
  },
  argila: {
    label: "Argila e contaminação",
    res: { amp: -0.92, shape: "peak", text: "Argila e plumas com sais são muito condutoras: o método mais direto para este alvo." },
    mag: { amp: 0.05, shape: "peak", text: "Sem minerais magnéticos, o campo praticamente não muda." },
    gam: { amp: 0.42, shape: "peak", text: "Argilas retêm potássio e tório; a radiometria sobe onde elas afloram." },
  },
  alteracao: {
    label: "Alteração hidrotermal",
    res: { amp: -0.42, shape: "peak", text: "Zonas alteradas e fraturadas tendem a ser um pouco mais condutoras." },
    mag: { amp: -0.55, shape: "peak", text: "A alteração destrói a magnetita: aparece um baixo magnético sobre a zona." },
    gam: { amp: 0.92, shape: "peak", text: "A alteração potássica enriquece o solo em potássio: o sinal mais claro deste alvo." },
  },
};

// Versão em inglês (página en/geo): mesmos valores, outros textos.
const EN = (document.documentElement.lang || "").startsWith("en");
if (EN) {
  const T = {
    agua: ["Groundwater", "Water makes the ground more conductive: resistivity drops where it is.", "Water is not magnetic; the field does not change.", "It reads only the surface; it notices water only if it changes the topsoil."],
    ferro: ["Iron ore", "Massive ore tends to be more conductive than the host rock.", "Magnetite in the ore distorts the field; near the magnetic equator it shows as a low flanked by two highs.", "Iron formations carry little radioactivity; the response is a slight low."],
    falha: ["Fault or contact", "A fault separates different materials and often carries water: resistivity changes from one side to the other.", "Rocks with different magnetisation on each side create a step in the field.", "If the contact separates different rocks at surface, radiometrics changes too."],
    argila: ["Clay and contamination", "Clay and saline plumes are highly conductive: the most direct method for this target.", "Without magnetic minerals, the field barely changes.", "Clays hold potassium and thorium; radiometrics rises where they crop out."],
    alteracao: ["Hydrothermal alteration", "Altered, fractured zones tend to be somewhat more conductive.", "Alteration destroys magnetite: a magnetic low appears over the zone.", "Potassic alteration enriches the soil in potassium: the clearest signal for this target."],
  };
  Object.entries(T).forEach(([k, [label, res, mag, gam]]) => {
    TARGETS[k].label = label;
    TARGETS[k].res.text = res;
    TARGETS[k].mag.text = mag;
    TARGETS[k].gam.text = gam;
  });
}

const level = (amp) => { const a = Math.abs(amp); return a > 0.7 ? 3 : a > 0.3 ? 2 : a > 0.12 ? 1 : 0; };
const VERDICT = EN ? ["No response", "Weak response", "Responds", "Strong response"] : ["Não responde", "Responde pouco", "Responde", "Responde forte"];

// Perfil em 600 × 120; o eixo fica em y = 60 e a amplitude máxima ocupa 48 px.
const profile = ({ amp, shape }) => {
  const pts = [];
  for (let x = 0; x <= 600; x += 6) {
    const u = (x - 300) / 70;
    let v;
    if (shape === "dipole") v = -Math.exp(-u * u) * 1 + 0.45 * (Math.exp(-((u - 1.6) ** 2) * 1.2) + Math.exp(-((u + 1.6) ** 2) * 1.2));
    else if (shape === "step") v = Math.tanh(u * 1.4);
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
    if (select) select.value = t.label;
    rows.forEach((row) => {
      const m = t[row.dataset.method];
      const lv = level(m.amp);
      row.dataset.level = String(lv);
      row.querySelector("[data-verdict]").textContent = VERDICT[lv];
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
