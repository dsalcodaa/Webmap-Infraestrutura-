/* =====================================================
   layers.js — Leaflet + FlatGeobuf
   WebMap Amazonas
   ===================================================== */

// =====================================================
// CONFIGURAÇÃO DAS CAMADAS
// =====================================================

const LAYER_CONFIG = [

  // =====================================================
  // LIMITES
  // =====================================================

  {
    id: 'uf_am',
    name: 'Amazonas',
    file: 'data/am_uf_2022.fgb',
    type: 'fill',
    color: '#1e88e5',
    opacity: 0.08,
    outlineColor: '#1e88e5',
    outlineWidth: 2,
    visible: true,
    icon: '🗺️',
    popupFields: ['NM_UF']
  },

  {
    id: 'municipios',
    name: 'Municípios',
    file: 'data/am_municipios_2024.fgb',
    type: 'fill',
    color: '#42a5f5',
    opacity: 0.12,
    outlineColor: '#1565c0',
    outlineWidth: 1,
    visible: true,
    icon: '🏙️',
    popupFields: ['NM_MUN', 'CD_MUN']
  },

  {
    id: 'regioes_imediatas',
    name: 'Regiões Imediatas',
    file: 'data/am_rg_imediatas_2024.fgb',
    type: 'fill',
    color: '#7e57c2',
    opacity: 0.08,
    outlineColor: '#5e35b1',
    outlineWidth: 1,
    visible: false,
    icon: '📍',
    popupFields: ['NM_RGI']
  },

  {
    id: 'regioes_intermediarias',
    name: 'Regiões Intermediárias',
    file: 'data/am_rg_intermediarias_2024.fgb',
    type: 'fill',
    color: '#8e24aa',
    opacity: 0.08,
    outlineColor: '#6a1b9a',
    outlineWidth: 1,
    visible: false,
    icon: '🌐',
    popupFields: ['NM_RGI']
  },

  {
    id: 'regiao_metropolitana',
    name: 'Região Metropolitana',
    file: 'data/am_regiao_metropolitana.fgb',
    type: 'fill',
    color: '#ef5350',
    opacity: 0.12,
    outlineColor: '#c62828',
    outlineWidth: 2,
    visible: false,
    icon: '🏢',
    popupFields: ['NOME']
  },

  {
    id: 'regional_calhas',
    name: 'Regional Calhas',
    file: 'data/am_regional_calhas.fgb',
    type: 'fill',
    color: '#26a69a',
    opacity: 0.10,
    outlineColor: '#00897b',
    outlineWidth: 1,
    visible: false,
    icon: '🌎',
    popupFields: ['NOME']
  },

  // =====================================================
  // HIDROGRAFIA
  // =====================================================

  {
    id: 'rios',
    name: 'Rios do Amazonas',
    file: 'data/rios_do_amazonas.fgb',
    type: 'line',
    color: '#29b6f6',
    opacity: 0.9,
    lineWidth: 1.2,
    visible: true,
    icon: '🌊',
    popupFields: ['NOME']
  },

  {
    id: 'hidrovias',
    name: 'Hidrovias',
    file: 'data/hidrovias_am.fgb',
    type: 'line',
    color: '#00acc1',
    opacity: 0.9,
    lineWidth: 2,
    visible: false,
    icon: '🚢',
    popupFields: ['NOME']
  },

  // =====================================================
  // RODOVIAS
  // =====================================================

  {
    id: 'rodovias_estaduais',
    name: 'Rodovias Estaduais',
    file: 'data/rodovias_estaduais_am.fgb',
    type: 'line',
    color: '#fb8c00',
    opacity: 0.95,
    lineWidth: 2,
    visible: true,
    icon: '🛣️',
    popupFields: ['RODOVIA', 'SITUACAO']
  },

  {
    id: 'rodovias_federais',
    name: 'Rodovias Federais',
    file: 'data/rodovias_federais_am.fgb',
    type: 'line',
    color: '#e53935',
    opacity: 0.95,
    lineWidth: 2.5,
    visible: true,
    icon: '🚧',
    popupFields: ['BR']
  },

  {
    id: 'estradas_vicinais',
    name: 'Estradas Vicinais',
    file: 'data/estradas_vicinais.fgb',
    type: 'line',
    color: '#8d6e63',
    opacity: 0.8,
    lineWidth: 1,
    visible: false,
    icon: '🛤️',
    popupFields: ['NOME']
  },

  {
    id: 'marcos_km',
    name: 'Marcos Quilométricos',
    file: 'data/marco_quilometrico_rodovias_estaduais.fgb',
    type: 'circle',
    color: '#ffeb3b',
    opacity: 0.9,
    visible: false,
    icon: '📍',
    popupFields: ['RODOVIA', 'KM']
  },

  // =====================================================
  // LOGÍSTICA
  // =====================================================

  {
    id: 'portos',
    name: 'Portos',
    file: 'data/portos_antaq_am.fgb',
    type: 'circle',
    color: '#3949ab',
    opacity: 0.9,
    visible: true,
    icon: '⚓',
    popupFields: ['NOME']
  },

  {
    id: 'aeroportos',
    name: 'Aeroportos',
    file: 'data/aeroportos_e_aerodromos_publicos_am.fgb',
    type: 'circle',
    color: '#43a047',
    opacity: 0.9,
    visible: true,
    icon: '✈️',
    popupFields: ['NOME']
  },

  {
    id: 'sedes_municipais',
    name: 'Sedes Municipais',
    file: 'data/am_sedes_municipais.fgb',
    type: 'circle',
    color: '#f4511e',
    opacity: 0.95,
    visible: true,
    icon: '🏠',
    popupFields: ['NM_MUN']
  }

];

// =====================================================
// ESTADO GLOBAL
// =====================================================

const LOADED_DATA = {};
const MAP_LAYERS = {};

let firstLayerLoaded = false;

// =====================================================
// INICIALIZAÇÃO
// =====================================================

function initLayers() {

  buildLayerControls();

  LAYER_CONFIG.forEach(cfg => {
    loadFgb(cfg);
  });

}

// =====================================================
// CONTROLES
// =====================================================

function buildLayerControls() {

  const container =
    document.getElementById('layer-controls');

  if (!container) return;

  container.innerHTML = '';

  LAYER_CONFIG.forEach(cfg => {

    const item = document.createElement('div');

    item.className = 'layer-item';

    item.innerHTML = `
      <input
        type="checkbox"
        class="layer-toggle"
        ${cfg.visible ? 'checked' : ''}
      />

      <div
        class="layer-dot"
        style="background:${cfg.color}"
      ></div>

      <div class="layer-name">
        ${cfg.icon} ${cfg.name}
      </div>
    `;

    const checkbox =
      item.querySelector('input');

    checkbox.addEventListener('change', e => {

      toggleLayer(
        cfg.id,
        e.target.checked
      );

    });

    container.appendChild(item);

  });

}

// =====================================================
// TOGGLE
// =====================================================

function toggleLayer(id, visible) {

  const layer = MAP_LAYERS[id];

  if (!layer) return;

  if (visible) {

    if (!map.hasLayer(layer)) {

      map.addLayer(layer);

    }

  } else {

    if (map.hasLayer(layer)) {

      map.removeLayer(layer);

    }

  }

  const cfg =
    LAYER_CONFIG.find(c => c.id === id);

  if (cfg) {

    cfg.visible = visible;

  }

  if (typeof updateDashboard === 'function') {

    updateDashboard();

  }

}

// =====================================================
// CARREGAMENTO FGB
// =====================================================

async function loadFgb(cfg) {

  try {

    console.log('Carregando:', cfg.file);

    const response =
      await fetch(cfg.file);

    if (!response.ok) {

      throw new Error(
        `Erro HTTP ${response.status}`
      );

    }

    const arrayBuffer =
      await response.arrayBuffer();

    const features = [];

    // =====================================================
    // FlatGeobuf
    // =====================================================

    for await (
      const feature of flatgeobuf.deserialize(arrayBuffer)
    ) {

      if (!feature?.geometry) continue;

      features.push({
        type: 'Feature',
        geometry: feature.geometry,
        properties: feature.properties || {}
      });

    }

    console.log(
      `${cfg.name}:`,
      features.length,
      'feições'
    );

    // DEBUG

    if (features.length > 0) {

      console.log(
        'Primeira feição:',
        features[0]
      );

    }

    const geojson = {

      type: 'FeatureCollection',

      features

    };

    LOADED_DATA[cfg.id] = geojson;

    addLayerToMap(cfg, geojson);

    if (typeof updateDashboard === 'function') {

      updateDashboard();

    }

  } catch (err) {

    console.error(
      `Erro ao carregar ${cfg.name}:`,
      err
    );

  }

}

// =====================================================
// ADICIONAR AO MAPA
// =====================================================

function addLayerToMap(cfg, geojson) {

  const layer = L.geoJSON(geojson, {

    // =====================================================
    // ESTILOS
    // =====================================================

    style: function(feature) {

      const geom =
        feature.geometry.type;

      // POLÍGONOS

      if (
        geom === 'Polygon' ||
        geom === 'MultiPolygon'
      ) {

        return {

          color:
            cfg.outlineColor || cfg.color,

          weight:
            cfg.outlineWidth || 1,

          fillColor:
            cfg.color,

          fillOpacity:
            cfg.opacity || 0.3

        };

      }

      // LINHAS

      return {

        color: cfg.color,

        weight:
          cfg.lineWidth || 2,

        opacity:
          cfg.opacity || 1

      };

    },

    // =====================================================
    // PONTOS
    // =====================================================

    pointToLayer:
      function(feature, latlng) {

      return L.circleMarker(latlng, {

        radius: 5,

        fillColor: cfg.color,

        color: '#ffffff',

        weight: 1,

        opacity: 1,

        fillOpacity:
          cfg.opacity || 1

      });

    },

    // =====================================================
    // EVENTOS
    // =====================================================

    onEachFeature:
      function(feature, layer) {

      bindLayerEvents(
        cfg,
        feature,
        layer
      );

    }

  });

  MAP_LAYERS[cfg.id] = layer;

  // =====================================================
  // ADICIONA AO MAPA
  // =====================================================

  if (cfg.visible) {

    layer.addTo(map);

    // =====================================================
    // ZOOM AUTOMÁTICO
    // =====================================================

    try {

      const bounds =
        layer.getBounds();

      if (
        bounds &&
        bounds.isValid() &&
        !firstLayerLoaded
      ) {

        firstLayerLoaded = true;

        map.fitBounds(bounds);

      }

    } catch (err) {

      console.warn(
        'Erro bounds:',
        err
      );

    }

  }

}

// =====================================================
// POPUPS
// =====================================================

function bindLayerEvents(
  cfg,
  feature,
  layer
) {

  const props =
    feature.properties || {};

  let html = `
    <div class="popup-title">
      ${cfg.icon} ${cfg.name}
    </div>
  `;

  cfg.popupFields.forEach(field => {

    if (
      props[field] !== undefined &&
      props[field] !== null
    ) {

      html += `
        <div class="popup-row">

          <div class="popup-key">
            ${formatKey(field)}
          </div>

          <div class="popup-val">
            ${props[field]}
          </div>

        </div>
      `;

    }

  });

  layer.bindPopup(html);

  layer.on('mouseover', () => {

    map.getContainer().style.cursor =
      'pointer';

  });

  layer.on('mouseout', () => {

    map.getContainer().style.cursor =
      '';

  });

}

// =====================================================
// FORMATADOR
// =====================================================

function formatKey(key) {

  return key

    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g,
      l => l.toUpperCase()
    );

}