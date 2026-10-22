// A rota e a chave de contato "topo" são mantidas por compatibilidade com links existentes.
(() => {
  const form = document.querySelector('form[data-area="topo"]');
  if (!form) return;
  const direct = Boolean(window.AXYS?.formularioChave);
  form.querySelector('[type="submit"]').textContent = direct ? 'Enviar solicitação' : 'Preparar e-mail';
  document.getElementById('terra-form-help').textContent = direct
    ? 'Envie os dados para solicitar uma avaliação técnica da sua demanda.'
    : 'Ao continuar, seu aplicativo de e-mail será aberto com os dados preenchidos. Conclua o envio nele.';
})();
// Interacao original de vertices e memorial.
(() => {

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

  const initial = pts.map(p => [...p]);

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
    g.setAttribute("aria-valuemin", "30");
    g.setAttribute("aria-valuemax", "1170");
    g.setAttribute("aria-describedby", "map-help");
    g.setAttribute("aria-label", `Vértice V${i + 1}: use as setas para mover`);
    g.innerHTML = `<circle class="hit" r="44"></circle><circle class="dot" r="14"></circle><text x="22" y="-18">V${i + 1}</text>`;
    layer.appendChild(g);
    return g;
  });

  const render = () => {
    poly.setAttribute("points", pts.map((p) => p.join(",")).join(" "));
    handles.forEach((g, i) => {
      const [e, n] = toUTM(pts[i]);
      g.setAttribute("transform", `translate(${pts[i][0]} ${pts[i][1]})`);
      g.setAttribute("aria-valuenow", pts[i][0]);
      g.setAttribute("aria-valuetext", `E ${fmt(e)} metros; N ${fmt(n)} metros`);
    });
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

  map.querySelector('[data-map-reset]').addEventListener('click', () => {
    pts.splice(0, pts.length, ...initial.map(p => [...p]));
    render();
  });
  render();
})();


})();

// Explorador ambiental: perguntas de planejamento, sem classificacao ou decisao automatica.
(() => {
  const explorer = document.querySelector('[data-env]');
  if (!explorer) return;
  const select = explorer.querySelector('[data-env-scenario]');
  const checks = [...explorer.querySelectorAll('[data-env-layer]')];
  const scenes = {
    rural: {
      name: 'Imóvel rural',
      heading: 'Uma leitura inicial do imóvel rural',
      question: 'Qual é o uso atual do imóvel e o que se pretende regularizar?',
      documents: ['Localização, mapas ou croquis disponíveis.', 'Descrição do uso atual e da demanda.', 'Documentos e registros ambientais existentes, se houver.'],
    },
    industria: {
      name: 'Indústria ou fábrica',
      heading: 'Uma leitura inicial da atividade industrial',
      question: 'Qual é a atividade, como funciona o processo e o que se pretende implantar ou alterar?',
      documents: ['Localização e descrição do processo produtivo.', 'Plantas, relatórios e informações já disponíveis.', 'Licenças, comunicações e condicionantes existentes, se houver.'],
    },
    mineracao: {
      name: 'Extração mineral',
      heading: 'Uma leitura inicial da extração mineral',
      question: 'Qual é a operação, onde se localiza e quais etapas da atividade precisam ser avaliadas?',
      documents: ['Localização e descrição da operação.', 'Mapas e estudos técnicos já disponíveis.', 'Licenças, autorizações e comunicações existentes, se houver.'],
    },
  };
  const topics = {
    agua: { name: 'Água e drenagem', question: 'Como a atividade se relaciona com a água, a drenagem e o destino dos efluentes?' },
    vegetacao: { name: 'Vegetação', question: 'Que cobertura vegetal existe e há previsão de alteração da área ocupada?' },
    entorno: { name: 'Uso do entorno', question: 'Quais ocupações, acessos e usos vizinhos precisam ser considerados na avaliação?' },
  };
  const selected = () => checks.filter(input => input.checked).map(input => input.dataset.envLayer);
  const current = () => scenes[select.value] || scenes.rural;
  const fillList = (target, texts) => {
    target.replaceChildren(...texts.map(text => {
      const li = document.createElement('li');
      li.textContent = text;
      return li;
    }));
  };
  const render = () => {
    const scenario = current();
    const active = selected();
    explorer.querySelectorAll('[data-env-visual]').forEach(group => group.toggleAttribute('hidden', !active.includes(group.dataset.envVisual)));
    explorer.querySelectorAll('[data-env-scene]').forEach(group => group.toggleAttribute('hidden', group.dataset.envScene !== select.value));
    explorer.querySelector('[data-env-heading]').textContent = scenario.heading;
    explorer.querySelector('[data-env-summary]').textContent = active.length
      ? `${active.length} camada${active.length > 1 ? 's' : ''} em foco`
      : 'Ative uma camada para explorar';
    fillList(explorer.querySelector('[data-env-questions]'), [scenario.question, ...active.map(key => topics[key].question)]);
    fillList(explorer.querySelector('[data-env-documents]'), scenario.documents);
    explorer.querySelector('[data-env-status]').textContent = '';
  };
  select.addEventListener('change', render);
  checks.forEach(input => input.addEventListener('change', render));
  explorer.querySelector('[data-env-reset]').addEventListener('click', () => {
    select.value = 'rural';
    checks.forEach(input => { input.checked = true; });
    render();
  });
  let lastSuggestion = '';
  explorer.querySelector('[data-env-contact]').addEventListener('click', () => {
    const form = document.querySelector('form[data-area="topo"]');
    const message = form.elements.mensagem;
    const active = selected();
    const suggestion = `Tenho interesse em uma avaliação ambiental pela AXYS TERRA.\nCenário para conversar: ${current().name}.\nTemas em foco: ${active.length ? active.map(key => topics[key].name).join(', ') : 'a definir na avaliação técnica'}.\nGostaria de discutir a situação real e os documentos disponíveis.`;
    if (lastSuggestion && message.value.includes(lastSuggestion)) {
      message.value = message.value.replace(lastSuggestion, suggestion);
    } else if (!message.value.includes(suggestion)) {
      message.value = message.value.trim() ? `${message.value.trim()}\n\n${suggestion}` : suggestion;
    }
    lastSuggestion = suggestion;
    form.elements.servico.value = 'Regularização ambiental';
    if (form.elements.assunto) form.elements.assunto.value = 'Avaliação ambiental — AXYS TERRA';
    message.dispatchEvent(new Event('input', { bubbles: true }));
    explorer.querySelector('[data-env-status]').textContent = 'Cenário incluído no formulário. Revise e complete sua demanda antes de enviar.';
    document.getElementById('contato').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    message.focus({ preventScroll: true });
  });
  render();
})();