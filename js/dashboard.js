/* =====================================================
   dashboard.js — Dashboard de KPIs e Gráficos
   WebMap Amazonas
   ===================================================== */

// Instâncias Chart.js (para destruir antes de recriar)
let chartDist = null;
let chartArea = null;

// Paleta escura para gráficos
const CHART_COLORS = ['#5b8dee','#3ecf8e','#f5a623','#4fc3f7','#ff7043','#ab47bc','#ef5350'];
const CHART_GRID   = 'rgba(255,255,255,0.06)';
const CHART_TEXT   = '#8b90a0';

// =====================================================
//  INICIALIZAÇÃO
// =====================================================

function initDashboard() {
  updateDashboard();
}

/**
 * Recalcula e re-renderiza todos os KPIs e gráficos
 * baseado no estado atual das camadas (LOADED_DATA + cfg.visible).
 */
function updateDashboard() {
  const activeLayers = LAYER_CONFIG.filter(cfg => cfg.visible && LOADED_DATA[cfg.id]);

  renderKPIs(activeLayers);
  renderDistChart(activeLayers);
  renderAreaChart(activeLayers);
}

// =====================================================
//  KPI CARDS
// =====================================================

function renderKPIs(activeLayers) {
  const grid = document.getElementById('kpi-grid');

  // KPIs globais fixos
  const totalFeats = activeLayers.reduce((s, cfg) => s + (LOADED_DATA[cfg.id]?.features.length || 0), 0);
  const totalArea  = calcTotalArea();
  const activeN    = activeLayers.length;

  // KPIs dinâmicos por camada ativa
  const kpiCards = [
    {
      icon: '📋',
      label: 'Feições ativas',
      value: totalFeats.toLocaleString('pt-BR'),
      sub: `em ${activeN} camada${activeN !== 1 ? 's' : ''}`
    },
    {
      icon: '🗺️',
      label: 'Camadas ativas',
      value: activeN,
      sub: `de ${LAYER_CONFIG.length} disponíveis`
    },
    {
      icon: '📐',
      label: 'Área total (km²)',
      value: totalArea > 0 ? (totalArea / 1000).toFixed(0) + 'k' : '—',
      sub: 'polígonos visíveis'
    },
    {
      icon: '📍',
      label: 'Municípios AM',
      value: getCount('municipios'),
      sub: 'total carregado'
    }
  ];

  // Cards por camada ativa (máximo 4 adicionais)
  activeLayers.slice(0, 4).forEach((cfg, i) => {
    const data = LOADED_DATA[cfg.id];
    const n    = data?.features.length || 0;
    const area = calcLayerArea(cfg, data);
    kpiCards.push({
      icon: cfg.icon,
      label: cfg.name,
      value: n.toLocaleString('pt-BR'),
      sub: area > 0 ? `${(area).toFixed(0)} km²` : 'feições'
    });
  });

  grid.innerHTML = kpiCards.slice(0, 8).map(k => `
    <div class="kpi-card">
      <div class="kpi-icon">${k.icon}</div>
      <div class="kpi-label">${k.label}</div>
      <div class="kpi-value" style="color:var(--accent)">${k.value}</div>
      <div class="kpi-sub">${k.sub}</div>
    </div>
  `).join('');
}

// =====================================================
//  GRÁFICO: DISTRIBUIÇÃO DE FEIÇÕES
// =====================================================

function renderDistChart(activeLayers) {
  const ctx = document.getElementById('chart-dist');
  if (!ctx) return;

  const labels = activeLayers.map(c => c.name);
  const values = activeLayers.map(c => LOADED_DATA[c.id]?.features.length || 0);
  const colors = activeLayers.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  if (chartDist) { chartDist.destroy(); chartDist = null; }

  if (activeLayers.length === 0) {
    ctx.style.display = 'none';
    return;
  }
  ctx.style.display = 'block';

  chartDist = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors.map(c => c + '99'),
        borderColor: colors,
        borderWidth: 1.5,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: CHART_TEXT,
            font: { size: 11 },
            padding: 8,
            boxWidth: 12
          }
        },
        tooltip: buildTooltip()
      }
    }
  });
}

// =====================================================
//  GRÁFICO: ÁREA POR CATEGORIA (barra horizontal)
// =====================================================

function renderAreaChart(activeLayers) {
  const ctx = document.getElementById('chart-area');
  if (!ctx) return;

  // Agrega por categoria de cada camada ativa com campo de área
  const rows = [];
  activeLayers.forEach((cfg, ci) => {
    const data = LOADED_DATA[cfg.id];
    if (!data || !cfg.kpi.areaField) return;

    const groups = {};
    data.features.forEach(f => {
      const cat  = f.properties[cfg.kpi.categoryField] || 'Outros';
      const area = parseFloat(f.properties[cfg.kpi.areaField]) || 0;
      groups[cat] = (groups[cat] || 0) + area;
    });

    Object.entries(groups).slice(0, 5).forEach(([cat, area]) => {
      rows.push({
        label: cat.length > 20 ? cat.substring(0, 18) + '…' : cat,
        value: cfg.kpi.areaField === 'AREA_HA' ? +(area / 10000).toFixed(1) : +(area).toFixed(1),
        color: CHART_COLORS[ci % CHART_COLORS.length]
      });
    });
  });

  if (chartArea) { chartArea.destroy(); chartArea = null; }

  if (rows.length === 0) {
    ctx.style.display = 'none';
    return;
  }
  ctx.style.display = 'block';

  // Ordena pelo maior valor
  rows.sort((a, b) => b.value - a.value);
  const top = rows.slice(0, 8);

  chartArea = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: top.map(r => r.label),
      datasets: [{
        data: top.map(r => r.value),
        backgroundColor: top.map(r => r.color + 'aa'),
        borderColor:     top.map(r => r.color),
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: buildTooltip('km²')
      },
      scales: {
        x: {
          grid: { color: CHART_GRID },
          ticks: { color: CHART_TEXT, font: { size: 10 } }
        },
        y: {
          grid: { color: CHART_GRID },
          ticks: { color: CHART_TEXT, font: { size: 10 } }
        }
      }
    }
  });
}

// =====================================================
//  UTILITÁRIOS
// =====================================================

function buildTooltip(unit = '') {
  return {
    backgroundColor: '#1e2330',
    titleColor: '#e8eaf0',
    bodyColor: '#8b90a0',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    padding: 10,
    callbacks: {
      label: ctx => {
        const v = typeof ctx.parsed === 'object' ? (ctx.parsed.x ?? ctx.parsed.y ?? ctx.raw) : ctx.raw;
        return `  ${Number(v).toLocaleString('pt-BR')} ${unit}`;
      }
    }
  };
}

function calcTotalArea() {
  let total = 0;
  LAYER_CONFIG.filter(c => c.visible).forEach(cfg => {
    total += calcLayerArea(cfg, LOADED_DATA[cfg.id]);
  });
  return total;
}

function calcLayerArea(cfg, data) {
  if (!data || !cfg.kpi.areaField) return 0;
  return data.features.reduce((s, f) => s + (parseFloat(f.properties[cfg.kpi.areaField]) || 0), 0);
}

function getCount(layerId) {
  const data = LOADED_DATA[layerId];
  return data ? data.features.length.toLocaleString('pt-BR') : '—';
}

// =====================================================
//  TOGGLE DO PAINEL
// =====================================================

function toggleDashboard() {
  const dash = document.getElementById('dashboard');
  const btn  = document.getElementById('dash-open-btn');
  dash.style.display = 'none';
  btn.style.display  = 'flex';
}

function openDashboard() {
  const dash = document.getElementById('dashboard');
  const btn  = document.getElementById('dash-open-btn');
  dash.style.display = 'flex';
  btn.style.display  = 'none';
}