// =====================================================
// CONFIGURAÇÃO DAS CAMADAS
// =====================================================

const LAYER_CONFIG = [
  {
    id: 'uf_am',
    name: 'Amazonas',
    file: 'data/AM_UF_2022.geojson',
    type: 'polygon',
    color: '#2c7fb8',
    weight: 2,
    fillOpacity: 0.4,
    visible: true,
    popupFields: ['NM_UF', 'SIGLA', 'AREA_KM2']
  },

  {
    id: 'municipios',
    name: 'Municípios',
    file: 'data/AM_MUNICIPIOS_2024.geojson',
    type: 'polygon',
    color: '#3ecf8e',
    weight: 1.2,
    fillOpacity: 0.3,
    visible: false,
    popupFields: ['NM_MUN', 'CD_IBGE', 'AREA_KM2']
  },

  {
    id: 'rios',
    name: 'Rios',
    file: 'data/RIOS_AMAZONAS.geojson',
    type: 'line',
    color: '#3498db',
    weight: 1.8,
    visible: false,
    popupFields: ['NM_RIO', 'LENGTH_KM']
  },

  {
    id: 'rodovias_estaduais',
    name: 'Rodovias Estaduais',
    file: 'data/RODOVIAS_ESTADUAIS.geojson',
    type: 'line',
    color: '#f1c40f',
    weight: 2,
    visible: false,
    popupFields: ['RODOVIA', 'CODIGO', 'EXTENSAO']
  },

  {
    id: 'aeroportos',
    name: 'Aeroportos',
    file: 'data/AEROPORTOS.geojson',
    type: 'point',
    color: '#e74c3c',
    radius: 5,
    visible: false,
    popupFields: ['NOME', 'MUNICIPIO']
  }
];

// =====================================================
// VARIÁVEIS GLOBAIS
// =====================================================

let loadedLayers = {};
let LOADED_DATA = {};

// =====================================================
// POPUP
// =====================================================

function buildPopup(config, properties) {

  let html = `<div class="popup-title">${config.name}</div>`;

  config.popupFields.forEach(field => {

    const value = properties[field] ?? '—';

    html += `
      <div class="popup-row">
        <span class="popup-key">${field}:</span>
        <span class="popup-val">${value}</span>
      </div>
    `;

  });

  return html;
}

// =====================================================
// CARREGAR GEOJSON
// =====================================================

async function loadGeoJSONLayer(config) {

  try {

    const response = await fetch(config.file);

    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const geojson = await response.json();

    LOADED_DATA[config.id] = geojson;

    let layer;

    // =========================
    // POLÍGONOS
    // =========================

    if (config.type === 'polygon') {

      layer = L.geoJSON(geojson, {

        style: {
          color: config.color,
          weight: config.weight,
          fillColor: config.color,
          fillOpacity: config.fillOpacity
        },

        onEachFeature: (feature, layer) => {

          if (feature.properties) {

            layer.bindPopup(
              buildPopup(config, feature.properties)
            );

          }

        }

      });

    }

    // =========================
    // LINHAS
    // =========================

    else if (config.type === 'line') {

      layer = L.geoJSON(geojson, {

        style: {
          color: config.color,
          weight: config.weight
        },

        onEachFeature: (feature, layer) => {

          if (feature.properties) {

            layer.bindPopup(
              buildPopup(config, feature.properties)
            );

          }

        }

      });

    }

    // =========================
    // PONTOS
    // =========================

    else if (config.type === 'point') {

      layer = L.geoJSON(geojson, {

        pointToLayer: (feature, latlng) => {

          return L.circleMarker(latlng, {

            radius: config.radius || 5,
            fillColor: config.color,
            color: '#ffffff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.9

          });

        },

        onEachFeature: (feature, layer) => {

          if (feature.properties) {

            layer.bindPopup(
              buildPopup(config, feature.properties)
            );

          }

        }

      });

    }

    loadedLayers[config.id] = layer;

    if (config.visible) {

      layer.addTo(map);

    }

    updateLayerCount(config.id, layer);

    return layer;

  } catch (err) {

    console.error(`Erro ao carregar ${config.name}`, err);

  }

}

// =====================================================
// INICIALIZAR CAMADAS
// =====================================================

async function initLayers() {

  const container = document.getElementById('layer-controls');

  // cria interface
  container.innerHTML = LAYER_CONFIG.map(cfg => `

    <div class="layer-item">

      <input
        type="checkbox"
        class="layer-toggle"
        id="toggle-${cfg.id}"
        data-id="${cfg.id}"
        ${cfg.visible ? 'checked' : ''}
      >

      <div
        class="layer-dot"
        style="background:${cfg.color}"
      ></div>

      <span class="layer-name">${cfg.name}</span>

      <span class="layer-count">0</span>

    </div>

  `).join('');

  // carrega camadas
  for (const cfg of LAYER_CONFIG) {

    const layer = await loadGeoJSONLayer(cfg);

    if (cfg.id === 'uf_am' && layer) {

      map.fitBounds(layer.getBounds());

    }

  }

  // eventos
  document.querySelectorAll('.layer-toggle')
    .forEach(toggle => {

      toggle.addEventListener('change', e => {

        const id = e.target.dataset.id;

        const layer = loadedLayers[id];

        const cfg = LAYER_CONFIG.find(l => l.id === id);

        cfg.visible = e.target.checked;

        if (!layer) return;

        if (e.target.checked) {

          map.addLayer(layer);

        } else {

          map.removeLayer(layer);

        }

        updateDashboard();

      });

    });

}

// =====================================================
// CONTADOR
// =====================================================

function updateLayerCount(layerId, layer) {

  const el = document.querySelector(
    `#toggle-${layerId}`
  )?.closest('.layer-item')
   ?.querySelector('.layer-count');

  if (!el || !layer) return;

  let count = 0;

  layer.eachLayer(() => count++);

  el.textContent = count.toLocaleString('pt-BR');

}
