document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

// O lote: vértices em pixels do mapa (1200 × 800); 1 px = 0,5 m. Coordenadas UTM ilustrativas.
const SCALE = 0.5;
const E0 = 780120;
const N0 = 9839880;
const fmt = (v, d = 2) => v.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });
const toUTM = ([x, y]) => [E0 + x * SCALE, N0 - y * SCALE];
const azimuth = (a, b) => {
  const [e1, n1] = toUTM(a);
  const [e2, n2] = toUTM(b);
  let az = (Math.atan2(e2 - e1, n2 - n1) * 180) / Math.PI;
  if (az < 0) az += 360;
  const d = Math.floor(az);
  const mFloat = (az - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60);
  return `${d}°${String(m).padStart(2, "0")}'${String(s === 60 ? 59 : s).padStart(2, "0")}"`;
};
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]) * SCALE;

(() => {
  const map = document.querySelector("[data-map]");
  if (!map) return;
  const svg = map.querySelector("svg");
  const poly = map.querySelector("[data-lot]");
  const layer = map.querySelector("[data-vertices]");
  const pts = poly.getAttribute("points").trim().split(/\s+/).map((p) => p.split(",").map(Number));

  const els = {
    area: document.querySelector("[data-area]"),
    perimeter: document.querySelector("[data-perimeter]"),
    docArea: document.querySelector("[data-doc-area]"),
    docPerimeter: document.querySelector("[data-doc-perimeter]"),
    docText: document.querySelector("[data-doc-text]"),
    docRows: document.querySelector("[data-doc-rows]"),
  };

  const NS = "http://www.w3.org/2000/svg";
  const handles = pts.map((p, i) => {
    const g = document.createElementNS(NS, "g");
    g.setAttribute("class", "t-vertex");
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "slider");
    g.setAttribute("aria-label", `Vértice V${i + 1}: use as setas para mover`);
    g.innerHTML = `<circle class="hit" r="44"></circle><circle class="dot" r="14"></circle><text x="22" y="-18">V${i + 1}</text>`;
    layer.appendChild(g);
    return g;
  });

  const render = () => {
    poly.setAttribute("points", pts.map((p) => p.join(",")).join(" "));
    handles.forEach((g, i) => g.setAttribute("transform", `translate(${pts[i][0]} ${pts[i][1]})`));
    let a2 = 0;
    let per = 0;
    pts.forEach((p, i) => {
      const q = pts[(i + 1) % pts.length];
      a2 += p[0] * q[1] - q[0] * p[1];
      per += dist(p, q);
    });
    const area = (Math.abs(a2) / 2) * SCALE * SCALE;
    const areaTxt = area >= 10000 ? `${fmt(area / 10000, 4)} ha` : `${fmt(area)} m²`;
    els.area.textContent = areaTxt;
    els.perimeter.textContent = `${fmt(per)} m`;
    els.docArea.textContent = `${areaTxt} (${fmt(area)} m²)`;
    els.docPerimeter.textContent = `${fmt(per)} m`;

    const parts = pts.map((p, i) => {
      const q = pts[(i + 1) % pts.length];
      const next = i + 1 < pts.length ? `o vértice V${i + 2}` : "o vértice V1, ponto inicial da descrição deste perímetro";
      return `deste, segue com azimute de ${azimuth(p, q)} e distância de ${fmt(dist(p, q))} m até ${next}`;
    });
    const [e1, n1] = toUTM(pts[0]);
    els.docText.textContent = `Inicia-se a descrição deste perímetro no vértice V1, de coordenadas N ${fmt(n1)} m e E ${fmt(e1)} m; ${parts.join("; ")}.`;
    els.docRows.innerHTML = pts.map((p, i) => {
      const q = pts[(i + 1) % pts.length];
      const [e, n] = toUTM(p);
      return `<tr><td data-label="Vértice">V${i + 1}</td><td data-label="N (m)">${fmt(n)}</td><td data-label="E (m)">${fmt(e)}</td><td data-label="Azimute">${azimuth(p, q)}</td><td data-label="Distância">${fmt(dist(p, q))} m</td></tr>`;
    }).join("");
  };

  const toMap = (event) => {
    const pt = svg.createSVGPoint();
    pt.x = event.clientX;
    pt.y = event.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return [Math.round(Math.max(30, Math.min(1170, p.x))), Math.round(Math.max(30, Math.min(770, p.y)))];
  };

  handles.forEach((g, i) => {
    g.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      g.setPointerCapture(event.pointerId);
      g.classList.add("is-dragging");
    });
    g.addEventListener("pointermove", (event) => {
      if (!g.classList.contains("is-dragging")) return;
      pts[i] = toMap(event);
      render();
    });
    const end = () => g.classList.remove("is-dragging");
    g.addEventListener("pointerup", end);
    g.addEventListener("pointercancel", end);
    // Teclado: cada toque move 10 px (5 m), com Shift 40 px; sem animação.
    g.addEventListener("keydown", (event) => {
      const step = event.shiftKey ? 40 : 10;
      const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key];
      if (!d) return;
      event.preventDefault();
      pts[i] = [Math.max(30, Math.min(1170, pts[i][0] + d[0])), Math.max(30, Math.min(770, pts[i][1] + d[1]))];
      render();
    });
  });

  render();
})();

// Entradas das seções: uma vez, com fallback.
(() => {
  const sel = [".section-title", ".t-memorial-intro > p", ".t-doc", ".t-col", ".t-also p", ".t-band figure", ".t-steps li", ".t-contact-side > *", ".t-form"];
  const targets = [];
  sel.forEach((s) => document.querySelectorAll(s).forEach((el) => {
    el.setAttribute("data-reveal", "");
    el.style.setProperty("--d", String(Math.min([...el.parentElement.children].indexOf(el), 6)));
    targets.push(el);
  }));
  if (!("IntersectionObserver" in window)) { targets.forEach((el) => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
  targets.forEach((el) => io.observe(el));
  addEventListener("load", () => setTimeout(() => targets.forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight && r.bottom > 0) el.classList.add("is-in");
  }), 2500));
})();

// Formulário que monta o e-mail.
(() => {
  const form = document.querySelector("[data-mailto]");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const lines = [];
    for (const [k, v] of data.entries()) if (k !== "mensagem") lines.push(`${form.querySelector(`[name="${k}"]`).closest("label").firstChild.textContent.trim()}: ${v || "—"}`);
    location.href = `mailto:lab@axysgeosolucoes.com?subject=${encodeURIComponent(form.dataset.subject)}&body=${encodeURIComponent(`${lines.join("\n")}\n\n${data.get("mensagem") || ""}`)}`;
  });
})();
