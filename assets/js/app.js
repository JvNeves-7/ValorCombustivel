(() => {
  'use strict';

  const $ = (sel) => document.querySelector(sel);
  const form = $('#fuel-form');
  const resultBox = $('#resultado');
  const toast = $('#toast');

  const fields = {
    distancia: $('#distancia'),
    eficiencia: $('#eficiencia'),
    preco: $('#preco'),
    tipo: $('#tipo'),
  };

  const HISTORY_KEY = 'valorCombustivel.historico.v1';
  const THEME_KEY = 'valorCombustivel.tema';

  const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

  /* ---------- Tema ---------- */
  const themeBtn = $('#theme-toggle');
  function applyTheme(theme) {
    document.body.classList.toggle('dark', theme === 'dark');
    themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
  }
  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
  }
  themeBtn.addEventListener('click', () => {
    const next = document.body.classList.contains('dark') ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  /* ---------- Utils ---------- */
  function parseBR(value) {
    if (typeof value !== 'string') return NaN;
    const cleaned = value.trim().replace(/\./g, '').replace(',', '.');
    return Number(cleaned);
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove('show'), 2400);
  }

  function setError(input, msgId, hasError) {
    const err = document.getElementById(msgId);
    input.classList.toggle('invalid', hasError);
    input.setAttribute('aria-invalid', hasError ? 'true' : 'false');
    err?.classList.toggle('show', hasError);
    return !hasError;
  }

  function getValues() {
    return {
      distancia: parseBR(fields.distancia.value),
      eficiencia: parseBR(fields.eficiencia.value),
      preco: parseBR(fields.preco.value),
      tipo: fields.tipo.value,
    };
  }

  function validate(showErrors = true) {
    const v = getValues();
    let ok = true;
    if (showErrors) {
      ok = setError(fields.distancia, 'err-distancia', !(v.distancia > 0)) && ok;
      ok = setError(fields.eficiencia, 'err-eficiencia', !(v.eficiencia > 0)) && ok;
      ok = setError(fields.preco, 'err-preco', !(v.preco > 0)) && ok;
    } else {
      ok = v.distancia > 0 && v.eficiencia > 0 && v.preco > 0;
    }
    return ok ? v : null;
  }

  function calc({ distancia, eficiencia, preco }) {
    const litros = distancia / eficiencia;
    const custo = litros * preco;
    const custoKm = custo / distancia;
    return { litros, custo, custoKm };
  }

  function tipoLabel(tipo) {
    return { gasolina: 'Gasolina', etanol: 'Etanol', diesel: 'Diesel', gnv: 'GNV' }[tipo] || 'Combustível';
  }

  /* ---------- Render ---------- */
  function renderResult(v, r) {
    resultBox.innerHTML = `
      <div class="stats">
        <div class="stat total">
          <small>Custo total</small>
          <strong>${BRL.format(r.custo)}</strong>
        </div>
        <div class="stat">
          <small>Litros necessários</small>
          <strong>${r.litros.toFixed(2)} L</strong>
        </div>
        <div class="stat">
          <small>Custo por km</small>
          <strong>${BRL.format(r.custoKm)}</strong>
        </div>
      </div>
      <div class="breakdown">
        ⛽ ${v.distancia.toLocaleString('pt-BR')} km ÷ ${v.eficiencia.toLocaleString('pt-BR')} km/L × ${BRL.format(v.preco)} (${tipoLabel(v.tipo)})
      </div>
      <div class="result-actions">
        <button type="button" class="btn btn-whatsapp" id="btn-wa">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.4-.7-2.9-1.2-4.7-4.1-4.9-4.3-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5s.8 1.9.8 2c.1.1.1.3 0 .5l-.4.5c-.2.2-.3.4-.1.7.2.3.9 1.5 2 2.4 1.4 1.2 2.5 1.6 2.9 1.8.3.2.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.3 0 .2 0 .6-.3 1.2Z"/></svg>
          WhatsApp
        </button>
        <button type="button" class="btn btn-ghost" id="btn-copy">Copiar resultado</button>
      </div>
    `;

    $('#btn-wa').addEventListener('click', () => shareWhatsApp(v, r));
    $('#btn-copy').addEventListener('click', () => copyResult(v, r));
  }

  function shareWhatsApp(v, r) {
    const msg =
      `⛽ Custo de viagem: ${BRL.format(r.custo)}\n` +
      `📍 Distância: ${v.distancia} km\n` +
      `🚗 Consumo: ${v.eficiencia} km/L (${tipoLabel(v.tipo)})\n` +
      `💰 Preço: ${BRL.format(v.preco)}/L\n` +
      `🧪 Litros: ${r.litros.toFixed(2)} L | Custo/km: ${BRL.format(r.custoKm)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  }

  async function copyResult(v, r) {
    const text = `Custo de viagem: ${BRL.format(r.custo)} (${v.distancia} km, ${v.eficiencia} km/L, ${BRL.format(v.preco)}/L)`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Resultado copiado!');
    } catch {
      showToast('Não foi possível copiar');
    }
  }

  /* ---------- Histórico ---------- */
  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
    catch { return []; }
  }
  function saveHistory(item) {
    const list = [item, ...loadHistory()].slice(0, 8);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    renderHistory();
  }
  function renderHistory() {
    const box = $('#history-list');
    const list = loadHistory();
    if (!list.length) {
      box.innerHTML = `<p class="muted">Nenhum cálculo ainda. Faça o primeiro acima.</p>`;
      return;
    }
    box.innerHTML = list.map((h, i) => `
      <div class="history-item">
        <div>
          <strong>${BRL.format(h.custo)}</strong>
          <div class="muted">${h.distancia} km • ${h.eficiencia} km/L • ${BRL.format(h.preco)}/L</div>
        </div>
        <button class="link-btn" data-reuse="${i}">Reutilizar</button>
      </div>
    `).join('');

    box.querySelectorAll('[data-reuse]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const h = loadHistory()[Number(btn.dataset.reuse)];
        if (!h) return;
        fields.distancia.value = h.distancia;
        fields.eficiencia.value = h.eficiencia;
        fields.preco.value = h.preco;
        fields.tipo.value = h.tipo || 'gasolina';
        showToast('Valores restaurados');
        form.requestSubmit();
      });
    });
  }

  $('#history-clear').addEventListener('click', () => {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
    showToast('Histórico limpo');
  });

  /* ---------- Comparador Etanol x Gasolina ---------- */
  function initCompare() {
    const pg = $('#comp-gasolina');
    const pe = $('#comp-etanol');
    const out = $('#compare-result');
    const btn = $('#compare-btn');
    btn.addEventListener('click', () => {
      const g = parseBR(pg.value);
      const e = parseBR(pe.value);
      if (!(g > 0) || !(e > 0)) {
        out.textContent = 'Informe os dois preços para comparar.';
        out.className = 'compare-result warn';
        return;
      }
      const ratio = e / g;
      if (ratio < 0.7) {
        out.textContent = `✅ Etanol compensa (${(ratio * 100).toFixed(1)}% da gasolina).`;
        out.className = 'compare-result good';
      } else {
        out.textContent = `⛽ Gasolina compensa (${(ratio * 100).toFixed(1)}% — acima de 70%).`;
        out.className = 'compare-result warn';
      }
    });
  }

  /* ---------- Eventos principais ---------- */
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = validate(true);
    if (!v) {
      showToast('Verifique os valores destacados');
      return;
    }
    const r = calc(v);
    renderResult(v, r);
    saveHistory({ ...v, custo: r.custo, litros: r.litros, date: Date.now() });
  });

  $('#limpar').addEventListener('click', () => {
    form.reset();
    Object.values(fields).forEach((el) => el.classList.remove('invalid'));
    document.querySelectorAll('.error').forEach((el) => el.classList.remove('show'));
    resultBox.innerHTML = `
      <div class="result-empty">
        <p><strong>Nenhum cálculo ainda</strong></p>
        <p>Preencha os campos e clique em <strong>Calcular</strong> para ver o custo da viagem.</p>
      </div>`;
  });

  // Validação ao digitar (limpa erro)
  Object.values(fields).forEach((el) => {
    el.addEventListener('input', () => {
      if (el.classList.contains('invalid') && parseBR(el.value) > 0) {
        el.classList.remove('invalid');
        el.closest('.field')?.querySelector('.error')?.classList.remove('show');
      }
    });
  });

  // Enter no comparador
  document.querySelectorAll('#comp-gasolina, #comp-etanol').forEach((el) => {
    el.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter') { ev.preventDefault(); $('#compare-btn').click(); }
    });
  });

  /* ---------- PWA: service worker + instalação ---------- */
  function initPWA() {
    // Registra o service worker (exige http/https ou localhost — não funciona em file://)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {
          /* silencioso: app continua funcionando sem offline */
        });
      });
    }

    const installBtn = $('#install-btn');
    if (!installBtn) return;

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true;

    if (isStandalone) return; // já instalado: sem botão

    if (isIOS) {
      // iOS não dispara beforeinstallprompt — mostra dica manual
      installBtn.hidden = false;
      installBtn.addEventListener('click', () => {
        showToast('No iPhone: Compartilhar → Adicionar à Tela de Início');
      });
      return;
    }

    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      installBtn.hidden = false;
    });

    installBtn.addEventListener('click', async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice.catch(() => {});
      deferredPrompt = null;
      installBtn.hidden = true;
    });

    window.addEventListener('appinstalled', () => {
      installBtn.hidden = true;
      showToast('App instalado com sucesso! 🎉');
    });
  }

  $('#year').textContent = new Date().getFullYear();

  initTheme();
  renderHistory();
  initCompare();
  initPWA();
})();
