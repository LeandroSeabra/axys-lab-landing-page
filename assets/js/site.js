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
    sending: "Sending…", sent: "Message sent.", fail: (to) => `Could not send right now. Write to ${to} or try again.`,
    opening: "Opening your e-mail app with the message ready…", wa: "WhatsApp", waLabel: "Chat on WhatsApp", copied: "Copied", copyFail: "Select and copy",
    menu: "Menu", close: "Close", ph: "To be added", waDefault: "Hello! I found Axys Geo Soluções online.",
  } : {
    sending: "Enviando…", sent: "Mensagem enviada.", fail: (to) => `Não foi possível enviar agora. Escreva para ${to} ou tente de novo.`,
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

  // O endereço carrega apenas um identificador conhecido, nunca dados pessoais ou texto livre.
  const articleContexts = {
    "o-que-e-geofisica": { area: "geofisica", route: "/geo/", subject: "Investigação geofísica" },
    "geofisica-agua-subterranea-poco": { area: "geofisica", route: "/geo/", subject: "Investigação de água subterrânea", field: "alvo", value: "Água subterrânea" },
    "gpr-localizar-tubulacoes": { area: "geofisica", route: "/geo/", subject: "GPR para tubulações e estruturas enterradas", field: "alvo", value: "Tubulações e estruturas enterradas" },
    "georreferenciamento-imovel-rural-sigef": { area: "topo", route: "/topo/", subject: "Georreferenciamento de imóvel rural", field: "imovel", value: "Rural" },
    "monitoramento-geofisico-barragens": { area: "safe", route: "/safe/", subject: "Investigação geofísica de barragens" },
  };
  const articleSlug = new URLSearchParams(location.search).get("artigo") || location.pathname.match(/^\/conteudos\/([^/]+)\//)?.[1];
  const context = Object.hasOwn(articleContexts, articleSlug) ? articleContexts[articleSlug] : null;
  const contextForm = context && document.querySelector(`form[data-area="${context.area}"]`);
  const onArticle = context && location.pathname === `/conteudos/${articleSlug}/`;
  const activeContext = context && (contextForm || onArticle) ? context : null;
  const contextMessage = activeContext ? `Olá! Li o artigo da Axys e gostaria de conversar sobre ${activeContext.subject.toLowerCase()}.` : "";
  const articleUrl = activeContext ? `${location.origin}/conteudos/${articleSlug}/` : "";
  const contextContactUrl = activeContext ? `${activeContext.route}?artigo=${articleSlug}#contato` : "";
  if (activeContext) {
    document.querySelectorAll('a[href="/#contato"], a[href="#contato"]').forEach(link => { link.href = contextContactUrl; });
  }
  if (contextForm) {
    const message = contextForm.elements.namedItem("mensagem");
    if (message && !message.value) { message.value = contextMessage; message.defaultValue = contextMessage; }
    const select = activeContext.field && contextForm.elements.namedItem(activeContext.field);
    if (select && (select.selectedIndex <= 0)) {
      select.value = activeContext.value;
      [...select.options].forEach(option => { option.defaultSelected = option.value === activeContext.value; });
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    const label = document.createElement("label");
    label.className = "full";
    label.append("Assunto do contato");
    const subjectInput = document.createElement("input");
    subjectInput.name = "assunto";
    subjectInput.value = subjectInput.defaultValue = activeContext.subject;
    label.append(subjectInput);
    contextForm.prepend(label);
    const originInput = document.createElement("input");
    originInput.type = "hidden";
    originInput.name = "artigo_origem";
    originInput.value = originInput.defaultValue = articleUrl;
    contextForm.append(originInput);
  }

  // E-mails por área: <a data-mail="safe" data-subject="...">
  document.querySelectorAll("[data-mail]").forEach((a) => {
    const addr = (C.emails && (C.emails[a.dataset.mail] || C.emails.geral)) || "";
    if (!addr) { a.hidden = true; return; }
    const subject = activeContext ? `?subject=${encodeURIComponent(activeContext.subject)}&body=${encodeURIComponent(contextMessage+"\n\nArtigo de origem: "+articleUrl)}` : (a.dataset.subject ? `?subject=${encodeURIComponent(a.dataset.subject)}` : "");
    a.href = `mailto:${addr}${subject}`;
    if (a.hasAttribute("data-mail-text")) a.textContent = addr;
  });

  // WhatsApp
  const waNumber = (C.whatsapp || "").replace(/\D/g, "");
  const waMsg = activeContext ? `${contextMessage}\n\nArtigo de origem: ${articleUrl}` : (document.body.dataset.wa || T.waDefault);
  const waHref = (msg) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg || waMsg)}`;
  document.querySelectorAll("[data-wa-link]").forEach((a) => {
    if (!waNumber) { (a.closest("[data-wa-block]") || a).hidden = true; return; }
    a.href = waHref(activeContext ? waMsg : a.dataset.waLink);
    a.target = "_blank";
    a.rel = "noopener";
  });
  // O botão flutuante aparece sempre. Sem número no config.js, ele leva à seção de contato da página
  // (ou à página principal); com o número, abre o WhatsApp com a mensagem da página.
  if (!document.body.hasAttribute("data-no-wa-float")) {
    const btn = document.createElement("a");
    btn.className = "wa-float";
    if (waNumber) {
      btn.href = waHref();
      btn.target = "_blank";
      btn.rel = "noopener";
    } else {
      btn.href = activeContext ? contextContactUrl : (document.querySelector("#contato") ? "#contato" : "/#contato");
      btn.dataset.waPending = "";
    }
    btn.setAttribute("aria-label", T.waLabel);
    btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.4.4 0 0 0 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"/></svg><span>${T.wa}</span>`;
    if (!waNumber) {
      btn.setAttribute("aria-label", EN ? "Contact Axys" : "Falar com a Axys");
      btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H9l-7 4V5a2 2 0 0 1 2-2Zm0 2v13.5L8.5 16H20V5Z"/></svg><span>' + (EN ? "Contact" : "Contato") + '</span>';
    }
    document.body.appendChild(btn);

    // Pulso: 2 vezes logo depois que o botão entra; depois, 2 vezes de novo quando a pessoa fica
    // 25 s parada (no máximo 3 lembretes por visita). Nunca em laço, nunca com a aba escondida,
    // com o mouse sobre o botão ou com "reduzir movimento" ligado.
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!calm) {
      const IDLE_MS = 25000;
      const MAX_REMINDERS = 3;
      let reminders = 0;
      let idleTimer;
      const pulse = () => {
        if (document.hidden || btn.matches(":hover")) return false;
        btn.classList.remove("is-pulsing");
        void btn.offsetWidth; // reinicia a animação
        btn.classList.add("is-pulsing");
        return true;
      };
      btn.addEventListener("animationend", (e) => { if (e.animationName === "wa-pulse") btn.classList.remove("is-pulsing"); });
      const armIdle = () => {
        clearTimeout(idleTimer);
        if (reminders >= MAX_REMINDERS) return;
        idleTimer = setTimeout(() => { if (pulse()) reminders += 1; armIdle(); }, IDLE_MS);
      };
      ["scroll", "pointermove", "pointerdown", "keydown", "touchstart"].forEach((ev) => addEventListener(ev, armIdle, { passive: true }));
      setTimeout(() => { pulse(); armIdle(); }, 1200);
    }
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
      if (name === "artigo_origem") return "Artigo de origem";
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
      const subject = data.get("assunto") || form.dataset.subject || "Contato pelo site";
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
