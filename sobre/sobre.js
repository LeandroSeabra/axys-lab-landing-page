// Quem somos: "voltar" para a página de onde a pessoa veio e janelas de currículo dos sócios.

// 1) Voltar: as páginas linkam para "sobre/?de=geo" (ou safe, topo, lab, inicio).
//    Sem o parâmetro, usa a página anterior do próprio site; sem nada, volta à página inicial.
(() => {
  const ORIGENS = {
    inicio: ["../", "página inicial"],
    geo: ["../geo/", "Axys Geofísica"],
    safe: ["../safe/", "Axys Safe"],
    topo: ["../topo/", "Axys Topo"],
    lab: ["../lab/", "Axys Lab"],
    "en-geo": ["../en/geo/", "Axys Geofísica (English)"],
    "en-lab": ["../en/lab/", "Axys Lab (English)"],
  };
  let key = new URLSearchParams(location.search).get("de");
  if (!key && document.referrer) {
    try {
      const ref = new URL(document.referrer);
      if (ref.origin === location.origin) {
        const parts = ref.pathname.split("/").filter(Boolean);
        const first = parts[0] === "en" && parts[1] ? `en-${parts[1]}` : parts[0] || "inicio";
        if (ORIGENS[first]) key = first;
      }
    } catch {}
  }
  try {
    if (key && ORIGENS[key]) sessionStorage.setItem("axys-origem", key);
    else key = sessionStorage.getItem("axys-origem");
  } catch {}
  const [href, nome] = ORIGENS[key] || ORIGENS.inicio;
  document.querySelectorAll("[data-back]").forEach((a) => {
    a.href = href;
    a.textContent = `← Voltar para ${nome}`;
  });
})();

// 2) Currículos: abrem por cima da página (<dialog>), fecham no botão, no Esc ou clicando fora.
//    Cada um tem endereço próprio (#cv-socio-1), que pode ser enviado a um cliente.
(() => {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const open = (dialog) => {
    if (!dialog || dialog.open) return;
    dialog.showModal();
    root.classList.add("cv-open");
    history.replaceState(null, "", `#${dialog.id}`);
  };
  const close = (dialog, then) => {
    if (!dialog || !dialog.open) return;
    const finish = () => {
      dialog.classList.remove("is-closing");
      dialog.close();
      root.classList.remove("cv-open");
      history.replaceState(null, "", location.pathname + location.search);
      if (then) then();
    };
    if (reduce) { finish(); return; }
    dialog.classList.add("is-closing");
    setTimeout(finish, 160);
  };

  document.querySelectorAll("[data-cv]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      open(document.getElementById(trigger.dataset.cv));
    });
  });

  document.querySelectorAll("dialog.cv").forEach((dialog) => {
    dialog.addEventListener("cancel", (event) => { event.preventDefault(); close(dialog); });
    dialog.addEventListener("click", (event) => { if (event.target === dialog) close(dialog); });
    dialog.querySelectorAll("[data-cv-close]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const target = btn.getAttribute("href");
        event.preventDefault();
        close(dialog, target && target.startsWith("#") ? () => document.querySelector(target)?.scrollIntoView() : null);
      });
    });
  });

  // Endereço direto para um currículo
  const fromHash = () => {
    const el = location.hash && document.querySelector(location.hash);
    if (el && el.matches("dialog.cv")) open(el);
  };
  fromHash();
  addEventListener("hashchange", fromHash);
})();
