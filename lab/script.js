const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

// Ano no rodapé
const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

// Menu do telefone
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-toggle");
const siteNav = document.querySelector("#site-nav");
let menuOpen = false;
const setMenu = (open) => {
  menuOpen = open;
  menuButton.setAttribute("aria-expanded", String(open));
  siteNav.classList.toggle("is-open", open);
  menuButton.textContent = open ? "Fechar" : "Menu";
  document.body.style.overflow = open ? "hidden" : "";
  if (open) header.classList.remove("is-hidden");
};
menuButton.addEventListener("click", () => setMenu(!menuOpen));
siteNav.addEventListener("click", (event) => { if (event.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (event) => { if (event.key === "Escape" && menuOpen) { setMenu(false); menuButton.focus(); } });

// Cabeçalho: transparente sobre o hero; depois sólido, some ao descer e volta ao subir.
(() => {
  const hero = document.querySelector(".hero");
  let lastY = window.scrollY;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    const pastHero = y > hero.offsetHeight - 80;
    header.classList.toggle("is-solid", y > 40);
    if (!menuOpen) header.classList.toggle("is-hidden", pastHero && y > lastY + 4);
    if (y < lastY - 4 || !pastHero) header.classList.remove("is-hidden");
    lastY = y;
  };
  window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();

  // Link da seção atual
  const links = [...siteNav.querySelectorAll('a[href^="#"]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  if (!("IntersectionObserver" in window)) return;
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      links.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === `#${entry.target.id}`));
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => io.observe(s));
})();

// Entradas: uma vez, quando a parte chega à tela; nada fica escondido se o observador falhar.
(() => {
  const targets = document.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) { targets.forEach((el) => el.classList.add("is-in")); return; }
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("is-in");
      io.unobserve(entry.target);
    }
  }, { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
  targets.forEach((el) => io.observe(el));
  window.addEventListener("load", () => setTimeout(() => {
    targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add("is-in");
    });
  }, 2500));
})();

// A faixa do topo: a imagem mais perto do centro acende; arrastar com o mouse rola para o lado.
(() => {
  const strip = document.querySelector("[data-strip]");
  if (!strip) return;
  const frames = [...strip.querySelectorAll(".frame")];
  frames.forEach((frame, i) => frame.style.setProperty("--i", String(Math.min(i, 8))));

  let ticking = false;
  const light = () => {
    ticking = false;
    const center = strip.getBoundingClientRect().left + strip.clientWidth / 2;
    let best = null;
    let bestDistance = Infinity;
    for (const frame of frames) {
      const r = frame.getBoundingClientRect();
      const distance = Math.abs(r.left + r.width / 2 - center);
      if (distance < bestDistance) { bestDistance = distance; best = frame; }
    }
    frames.forEach((frame) => frame.classList.toggle("is-lit", frame === best));
  };
  const queue = () => { if (!ticking) { ticking = true; requestAnimationFrame(light); } };
  const centerOn = (frame, smooth) => {
    strip.scrollTo({ left: frame.offsetLeft + frame.offsetWidth / 2 - strip.clientWidth / 2, behavior: smooth && !reduceMotion ? "smooth" : "auto" });
  };

  // Começa com o mapa magnético no centro: o lugar ao lado da leitura do lugar.
  const start = strip.querySelector(".frame-data") || frames[2];
  if (start) centerOn(start, false);
  light();
  strip.addEventListener("scroll", queue, { passive: true });
  window.addEventListener("resize", queue);

  // Arrasto com o mouse; um gesto rápido avança uma imagem mesmo sem ir longe.
  let startX = 0;
  let startScroll = 0;
  let startTime = 0;
  strip.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    startX = event.clientX;
    startScroll = strip.scrollLeft;
    startTime = performance.now();
    strip.setPointerCapture(event.pointerId);
    strip.classList.add("is-dragging");
  });
  strip.addEventListener("pointermove", (event) => {
    if (!strip.classList.contains("is-dragging")) return;
    strip.scrollLeft = startScroll - (event.clientX - startX);
  });
  const end = (event) => {
    if (!strip.classList.contains("is-dragging")) return;
    strip.classList.remove("is-dragging");
    const dx = event.clientX - startX;
    const velocity = Math.abs(dx) / Math.max(1, performance.now() - startTime);
    const i = frames.findIndex((frame) => frame.classList.contains("is-lit"));
    let target = frames[i];
    if (velocity > 0.4 && Math.abs(dx) < frames[i].offsetWidth / 2) {
      target = frames[Math.max(0, Math.min(frames.length - 1, i + (dx < 0 ? 1 : -1)))];
    }
    if (target && Math.abs(dx) > 3) centerOn(target, true);
  };
  strip.addEventListener("pointerup", end);
  strip.addEventListener("pointercancel", end);

  // Teclado: sem animação, a resposta é imediata.
  strip.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const i = frames.findIndex((frame) => frame.classList.contains("is-lit"));
    const next = frames[Math.max(0, Math.min(frames.length - 1, i + (event.key === "ArrowRight" ? 1 : -1)))];
    centerOn(next, false);
  });
})();

// Altura de voo: anomalia de campo total de uma esfera magnetizada por indução, perfil norte-sul.
(() => {
  const root = document.querySelector("[data-altitude]");
  if (!root) return;
  const range = root.querySelector("#alt-range");
  const out = root.querySelector("#alt-out");
  const curve = root.querySelector("[data-curve]");
  const drone = root.querySelector("[data-drone]");
  const amp = root.querySelector("[data-amp]");

  const DEPTH = 40;                      // m, do terreno ao centro da esfera
  const INC = (-5 * Math.PI) / 180;      // inclinação do campo em baixa latitude magnética
  const fx = Math.cos(INC);
  const fz = Math.sin(INC);
  const K = 3.6e7;                       // escala para valores em nT plausíveis
  const SPAN = 300;                      // m para cada lado do corpo

  // Painel do perfil: x de -300 a 300 m vira 0..800; 0 nT em y = 70; 0,5 px por nT (eixo fixo).
  const toX = (x) => 400 + (x / SPAN) * 400;
  const ZERO = 70;
  const SCALE = 0.5;
  // Painel do corte: a copa fica em y ≈ 404; 10 m acima dela em y = 392, 150 m em y = 292.
  const altToY = (h) => 398 - ((h - 10) / 140) * 106;

  const anomaly = (x, h) => {
    const H = DEPTH + h;
    const r = Math.hypot(x, H);
    const d = (fx * x + fz * -H) / r;
    return (K * (3 * d * d - 1)) / r ** 3;
  };

  const render = (h) => {
    let d = "";
    let min = Infinity;
    let max = -Infinity;
    for (let x = -SPAN; x <= SPAN; x += 4) {
      const t = anomaly(x, h);
      min = Math.min(min, t);
      max = Math.max(max, t);
      d += `${d ? "L" : "M"}${toX(x).toFixed(1)} ${(ZERO - t * SCALE).toFixed(1)}`;
    }
    curve.setAttribute("d", d);
    drone.setAttribute("transform", `translate(0 ${altToY(h).toFixed(1)})`);
    out.textContent = `${h} m`;
    amp.textContent = `${Math.round(max - min).toLocaleString("pt-BR")} nT`;
  };

  range.addEventListener("input", () => render(Number(range.value)));
  render(Number(range.value));
})();

// Aplicações: a linha ativa troca a imagem. No telefone, por toque; no desktop, também pela rolagem.
(() => {
  const uses = [...document.querySelectorAll("[data-use]")];
  const imgs = [...document.querySelectorAll("[data-use-img]")];
  if (!uses.length) return;
  const activate = (index) => {
    uses.forEach((use, i) => {
      const on = i === index;
      use.classList.toggle("is-active", on);
      use.querySelector("button").setAttribute("aria-expanded", String(on));
    });
    imgs.forEach((img, i) => img.classList.toggle("is-active", i === index));
  };
  uses.forEach((use, i) => {
    const button = use.querySelector("button");
    button.addEventListener("click", () => activate(i));
    button.addEventListener("focus", () => activate(i));
    if (finePointer) use.addEventListener("pointerenter", () => activate(i));
  });

  if (!("IntersectionObserver" in window) || !window.matchMedia("(min-width: 761px)").matches) return;
  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) if (entry.isIntersecting) activate(uses.indexOf(entry.target));
  }, { rootMargin: "-45% 0px -45% 0px" });
  uses.forEach((use) => io.observe(use));
})();

// O vídeo só roda quando está na tela.
(() => {
  const video = document.querySelector(".intro video");
  if (!video) return;
  if (reduceMotion) { video.removeAttribute("autoplay"); video.pause(); return; }
  if (!("IntersectionObserver" in window)) return;
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) video.play().catch(() => {});
    else video.pause();
  }, { rootMargin: "200px 0px" }).observe(video);
})();

// Contato: copiar o e-mail, e o formulário que escreve a mensagem no programa de e-mail.
(() => {
  const copy = document.querySelector("[data-copy]");
  if (copy && navigator.clipboard) {
    const label = copy.querySelector("[data-copy-label]");
    let timer;
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(copy.dataset.copy);
        copy.setAttribute("data-copied", "");
        label.textContent = "E-mail copiado";
        clearTimeout(timer);
        timer = setTimeout(() => { copy.removeAttribute("data-copied"); label.textContent = "Copiar e-mail"; }, 2200);
      } catch { label.textContent = "Selecione e copie o endereço acima"; }
    });
  } else if (copy) {
    copy.hidden = true;
  }

  const form = document.querySelector("[data-mailto]");
  if (!form) return;
  const select = form.querySelector("[data-equip-select]");
  document.querySelectorAll("[data-equip]").forEach((link) => {
    link.addEventListener("click", () => { select.value = link.dataset.equip; });
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `${data.get("equipamento")} — contato pelo site Axys Lab`;
    const body = [
      `Nome: ${data.get("nome")}`,
      `Empresa ou instituição: ${data.get("empresa") || "—"}`,
      `Equipamento de interesse: ${data.get("equipamento")}`,
      `Aplicação: ${data.get("aplicacao")}`,
      "",
      data.get("mensagem") || "",
    ].join("\n");
    window.location.href = `mailto:lab@axysgeosolucoes.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
