/*
 * Comportamentos comuns a todas as páginas. Lê os dados de window.AXYS (config.js).
 * - preenche dados da empresa ([data-cfg]) e marca o que falta;
 * - links de e-mail e WhatsApp por área;
 * - formulários que enviam de verdade (Web3Forms) ou abrem o e-mail;
 * - botão flutuante de WhatsApp;
 * - entradas das seções ([data-reveal]) e o ano no rodapé.
 */
(() => {
  const C = window.AXYS || {};
  const root = document.documentElement;
  const showPh = C.mostrarEspacosReservados !== false;
  root.classList.toggle("ph-on", showPh);
  root.classList.toggle("ph-off", !showPh);

  // Textos da interface em português e inglês (as páginas em inglês têm <html lang="en">).
  const EN = (document.documentElement.lang || "").startsWith("en");
  const T = EN ? {
    sending: "Sending…", sent: "Message sent. We reply within 2 business days.", fail: (to) => `Could not send right now. Write to ${to} or try again.`,
    opening: "Opening your e-mail app with the message ready…", wa: "WhatsApp", waLabel: "Chat on WhatsApp", copied: "Copied", copyFail: "Select and copy",
    menu: "Menu", close: "Close", ph: "To be added", waDefault: "Hello! I found Axys Geo Soluções online.",
  } : {
    sending: "Enviando…", sent: "Mensagem enviada. Respondemos em até 2 dias úteis.", fail: (to) => `Não foi possível enviar agora. Escreva para ${to} ou tente de novo.`,
    opening: "Abrindo o seu programa de e-mail com a mensagem pronta…", wa: "WhatsApp", waLabel: "Conversar pelo WhatsApp", copied: "Copiado", copyFail: "Selecione e copie",
    menu: "Menu", close: "Fechar", ph: "A preencher", waDefault: "Olá! Vim pelo site da Axys Geo Soluções.",
  };

  const get = (path) => path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : ""), C);

  // Ano
  document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Cabeçalho: sólido depois de rolar, some ao descer e volta ao subir; menu do telefone.
  // (O Axys Lab tem script próprio para isso e marca o cabeçalho com data-header.)
  const header = document.querySelector(".site-header:not([data-header])");
  if (header) {
    const toggle = header.querySelector(".menu-toggle");
    const nav = header.querySelector(".site-nav");
    let open = false;
    const setMenu = (v) => {
      open = v;
      if (!toggle || !nav) return;
      toggle.setAttribute("aria-expanded", String(v));
      toggle.textContent = v ? toggle.dataset.close || T.close : toggle.dataset.open || T.menu;
      nav.classList.toggle("is-open", v);
      document.body.style.overflow = v ? "hidden" : "";
      if (v) header.classList.remove("is-hidden");
    };
    if (toggle && nav) {
      toggle.addEventListener("click", () => setMenu(!open));
      nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
      document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) { setMenu(false); toggle.focus(); } });
    }
    let lastY = scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = scrollY;
      header.classList.toggle("is-solid", y > 40);
      if (!open) header.classList.toggle("is-hidden", y > innerHeight * 0.8 && y > lastY + 4);
      if (y < lastY - 4) header.classList.remove("is-hidden");
      lastY = y;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // Dados da empresa: <span data-cfg="empresa.cnpj" data-ph="CNPJ a preencher"></span>
  document.querySelectorAll("[data-cfg]").forEach((el) => {
    const v = get(el.dataset.cfg);
    if (v) { el.textContent = v; return; }
    const block = el.closest("[data-cfg-block]");
    if (showPh) { el.textContent = el.dataset.ph || T.ph; el.classList.add("is-placeholder"); }
    else if (block) block.hidden = true;
    else el.hidden = true;
  });

  // E-mails por área: <a data-mail="safe" data-subject="...">
  document.querySelectorAll("[data-mail]").forEach((a) => {
    const addr = (C.emails && (C.emails[a.dataset.mail] || C.emails.geral)) || "";
    if (!addr) { a.hidden = true; return; }
    const subject = a.dataset.subject ? `?subject=${encodeURIComponent(a.dataset.subject)}` : "";
    a.href = `mailto:${addr}${subject}`;
    if (a.hasAttribute("data-mail-text")) a.textContent = addr;
  });

  // WhatsApp
  const waNumber = (C.whatsapp || "").replace(/\D/g, "");
  const waMsg = document.body.dataset.wa || T.waDefault;
  const waHref = (msg) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg || waMsg)}`;
  document.querySelectorAll("[data-wa-link]").forEach((a) => {
    if (!waNumber) { (a.closest("[data-wa-block]") || a).hidden = true; return; }
    a.href = waHref(a.dataset.waLink);
    a.target = "_blank";
    a.rel = "noopener";
  });
  if (waNumber && !document.body.hasAttribute("data-no-wa-float")) {
    const btn = document.createElement("a");
    btn.className = "wa-float";
    btn.href = waHref();
    btn.target = "_blank";
    btn.rel = "noopener";
    btn.setAttribute("aria-label", T.waLabel);
    btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg><span>${T.wa}</span>`;
    document.body.appendChild(btn);
    // Aparece depois de rolar 60% da primeira tela; some enquanto o contato (que já tem o link) está visível.
    const contact = document.querySelector("#contato");
    let contactOnScreen = false;
    const place = () => btn.classList.toggle("is-visible", scrollY > innerHeight * 0.6 && !contactOnScreen);
    if (contact && "IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { contactOnScreen = e.isIntersecting; place(); }, { threshold: 0.15 }).observe(contact);
    }
    addEventListener("scroll", place, { passive: true });
    place();
  }

  // Copiar
  document.querySelectorAll("[data-copy]").forEach((b) => {
    if (!navigator.clipboard) { b.hidden = true; return; }
    const label = b.querySelector("[data-copy-label]") || b;
    const original = label.textContent;
    let t;
    b.addEventListener("click", async () => {
      const value = b.dataset.copy || (C.emails && C.emails[b.dataset.copyMail]) || "";
      try {
        await navigator.clipboard.writeText(value);
        b.setAttribute("data-copied", "");
        label.textContent = T.copied;
        clearTimeout(t);
        t = setTimeout(() => { b.removeAttribute("data-copied"); label.textContent = original; }, 2000);
      } catch { label.textContent = T.copyFail; }
    });
  });

  // Formulários: <form data-form data-area="safe" data-subject="...">
  document.querySelectorAll("form[data-form]").forEach((form) => {
    const status = form.querySelector("[data-form-status]");
    const area = form.dataset.area || "geral";
    const to = (C.emails && (C.emails[area] || C.emails.geral)) || "";
    const say = (msg, kind) => { if (status) { status.textContent = msg; status.dataset.kind = kind || ""; } };
    const fieldLabel = (name) => {
      const el = form.elements[name];
      const label = el && el.closest("label");
      return label ? label.firstChild.textContent.trim() : name;
    };
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      if (data.get("botcheck")) return;
      data.delete("botcheck");
      const subject = form.dataset.subject || "Contato pelo site";
      const lines = [];
      for (const [k, v] of data.entries()) if (k !== "mensagem") lines.push(`${fieldLabel(k)}: ${v || "—"}`);
      const body = `${lines.join("\n")}\n\n${data.get("mensagem") || ""}`;

      if (C.formularioChave) {
        const button = form.querySelector('[type="submit"]');
        button.disabled = true;
        say(T.sending);
        try {
          const payload = { access_key: C.formularioChave, subject, from_name: EN ? "Axys Geo Soluções website (EN)" : "Site Axys Geo Soluções", area, ...Object.fromEntries(data.entries()) };
          const res = await fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) });
          const json = await res.json().catch(() => ({}));
          if (!res.ok || json.success === false) throw new Error(json.message || res.statusText);
          form.reset();
          say(T.sent, "ok");
        } catch {
          say(T.fail(to), "error");
        } finally {
          button.disabled = false;
        }
        return;
      }
      say(T.opening);
      location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  });

  // Entradas: as páginas marcam elementos com data-reveal; aqui eles sobem uma vez ao entrar na tela.
  const startReveal = () => {
    const targets = [...document.querySelectorAll("[data-reveal]:not(.is-in)")];
    if (!targets.length) return;
    if (!("IntersectionObserver" in window)) { targets.forEach((el) => el.classList.add("is-in")); return; }
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    targets.forEach((el) => io.observe(el));
    addEventListener("load", () => setTimeout(() => targets.forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) el.classList.add("is-in");
    }), 2500));
  };
  // Marca automaticamente os filhos de [data-reveal-children], escalonados.
  document.querySelectorAll("[data-reveal-children]").forEach((parent) => {
    [...parent.children].forEach((el, i) => {
      if (!el.hasAttribute("data-reveal")) { el.setAttribute("data-reveal", ""); el.style.setProperty("--d", String(Math.min(i, 6))); }
    });
  });
  // Com defer, este arquivo roda antes dos scripts de cada página; espera-se o DOMContentLoaded
  // para pegar também os elementos que eles marcarem.
  if (document.readyState === "complete") startReveal();
  else document.addEventListener("DOMContentLoaded", startReveal);
})();
