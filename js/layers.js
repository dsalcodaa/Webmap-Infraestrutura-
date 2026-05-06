// Configuração das camadas com nomes de arquivos exatos (maiúsculas, acentos e espaços)
const LAYER_CONFIG = [
  {
    id: 'uf_am',
    name: 'Amazonas',
    file: 'data/AM_UF 2022.fgb',
    type: 'polygon',
    color: '#2c7fb8',
    weight: 2,
    fillOpacity: 0.4,
    popupFields: ['NM_UF', 'SIGLA', 'AREA_KM2']
  },
  {
    id: 'municipios',
    name: 'Municípios',
    file: 'data/AM_MUNICÍPIOS 2024.fgb',
    type: 'polygon',
    color: '#3ecf8e',
    weight: 1.2,
    fillOpacity: 0.3,
    popupFields: ['NM_MUN', 'CD_IBGE', 'AREA_KM2']
  },
  {
    id: 'rg_imediatas',
    name: 'Regiões Imediatas',
    file: 'data/AM_RG_IMEDIATAS 2024.fgb',
    type: 'polygon',
    color: '#f9a65a',
    weight: 1.2,
    fillOpacity: 0.25,
    popupFields: ['NM_RG_I', 'CD_RG_I']
  },
  {
    id: 'rg_intermediarias',
    name: 'Regiões Intermediárias',
    file: 'data/AM_RG_INTERMEDIARIAS 2024.fgb',
    type: 'polygon',
    color: '#e07b39',
    weight: 1.5,
    fillOpacity: 0.2,
    popupFields: ['NM_RG_I', 'CD_RG_I']
  },
  {
    id: 'regiao_metropolitana',
    name: 'Região Metropolitana',
    file: 'data/AM_REGIÃO METROPOLITANA.fgb',
    type: 'polygon',
    color: '#9b59b6',
    weight: 1.5,
    fillOpacity: 0.3,
    popupFields: ['NM_RM', 'SIGLA']
  },
  {
    id: 'regional_calhas',
    name: 'Regional Calhas',
    file: 'data/AM_REGIONAL CALHAS.fgb',
    type: 'polygon',
    color: '#1abc9c',
    weight: 1.2,
    fillOpacity: 0.25,
    popupFields: ['NM_REGIAO', 'CD_REGIAO']
  },
  {
    id: 'rios',
    name: 'Rios do Amazonas',
    file: 'data/RIOS DO AMAZONAS.fgb',
    type: 'line',
    color: '#3498db',
    weight: 1.8,
    fillOpacity: 0,
    popupFields: ['NM_RIO', 'LENGTH_KM']
  },
  {
    id: 'hidrovias',
    name: 'Hidrovias',
    file: 'data/HIDROVIAS AM.fgb',
    type: 'line',
    color: '#5dade2',
    weight: 2,
    fillOpacity: 0,
    popupFields: ['NM_HIDROVIA', 'EXTENSAO']
  },
  {
    id: 'rodovias_estaduais',
    name: 'Rodovias Estaduais',
    file: 'data/RODOVIAS ESTADUAIS AM.fgb',
    type: 'line',
    color: '#f1c40f',
    weight: 2,
    fillOpacity: 0,
    popupFields: ['RODOVIA', 'CODIGO', 'EXTENSAO']
  },
  {
    id: 'rodovias_federais',
    name: 'Rodovias Federais',
    file: 'data/RODOVAIS FEDERAIS AM.fgb',
    type: 'line',
    color: '#e67e22',
    weight: 2.2,
    fillOpacity: 0,
    popupFields: ['BR', 'NOME', 'EXTENSAO']
  },
  {
    id: 'estradas_vicinais',
    name: 'Estradas Vicinais',
    file: 'data/ESTRADAS VICINAIS.fgb',
    type: 'line',
    color: '#d35400',
    weight: 1.2,
    fillOpacity: 0,
    popupFields: ['NOME', 'TIPO']
  },
  {
    id: 'marcos_quilometricos',
    name: 'Marcos Quilométricos',
    file: 'data/MARCO QUILOMETRICO RODOVIAS ESTADUAIS.fgb',
    type: 'point',
    color: '#f39c12',
    radius: 5,
    popupFields: ['RODOVIA', 'KM', 'LADO']
  },
  {
    id: 'portos',
    name: 'Portos',
    file: 'data/PORTOS ANTAQ - AM.fgb',
    type: 'point',
    color: '#16a085',
    radius: 6,
    popupFields: ['PORTO', 'MUNICIPIO', 'TIPO']
  },
  {
    id: 'aeroportos',
    name: 'Aeroportos',
    file: 'data/AEROPORTOS E AERODROMOS PUBLICOS AM.fgb',
    type: 'point',
    color: '#e74c3c',
    radius: 5,
    popupFields: ['NOME', 'MUNICIPIO', 'COD_OACI']
  },
  {
    id: 'sedes_municipais',
    name: 'Sedes Municipais',
    file: 'data/AM_SEDES MUNICIPAIS.fgb',
    type: 'point',
    color: '#8e44ad',
    radius: 5,
    popupFields: ['MUNICIPIO', 'POPULACAO', 'LAT', 'LON']
  }
];

// Variável global para armazenar as camadas carregadas
let loadedLayers = {};

// Função para carregar uma camada FlatGeobuf
async function loadFlatGeobufLayer(config, isVisible) {
  const url = config.file;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const arrayBuffer = await response.arrayBuffer();
    const geojson = flatgeobuf.deserialize(arrayBuffer);
    
    let layer;
    if (config.type === 'polygon') {
      layer = L.geoJSON(geojson, {
        style: {
          color: config.color,
          weight: config.weight,
          fillOpacity: config.fillOpacity,
          fillColor: config.color
        },
        onEachFeature: (feature, layer) => {
          if (config.popupFields && feature.properties) {
            let popupContent = `<div class="popup-title">${config.name}</div>`;
            config.popupFields.forEach(field => {
              const val = feature.properties[field] || '—';
              popupContent += `<div class="popup-row"><span class="popup-key">${field}:</span><span class="popup-val">${val}</span></div>`;
            });
            layer.bindPopup(popupContent);
          }
        }
      });
    } else if (config.type === 'line') {
      layer = L.geoJSON(geojson, {
        style: {
          color: config.color,
          weight: config.weight
        },
        onEachFeature: (feature, layer) => {
          if (config.popupFields && feature.properties) {
            let popupContent = `<div class="popup-title">${config.name}</div>`;
            config.popupFields.forEach(field => {
              const val = feature.properties[field] || '—';
              popupContent += `<div class="popup-row"><span class="popup-key">${field}:</span><span class="popup-val">${val}</span></div>`;
            });
            layer.bindPopup(popupContent);
          }
        }
      });
    } else if (config.type === 'point') {
      layer = L.geoJSON(geojson, {
        pointToLayer: (feature, latlng) => {
          return L.circleMarker(latlng, {
            radius: config.radius || 5,
            fillColor: config.color,
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
          });
        },
        onEachFeature: (feature, layer) => {
          if (config.popupFields && feature.properties) {
            let popupContent = `<div class="popup-title">${config.name}</div>`;
            config.popupFields.forEach(field => {
              const val = feature.properties[field] || '—';
              popupContent += `<div class="popup-row"><span class="popup-key">${field}:</span><span class="popup-val">${val}</span></div>`;
            });
            layer.bindPopup(popupContent);
          }
        }
      });
    }
    
    loadedLayers[config.id] = layer;
    if (isVisible) layer.addTo(map);
    return layer;
  } catch (error) {
    console.error(`Erro ao carregar ${config.name}:`, error);
    return null;
  }
}

// Função para inicializar todas as camadas
async function initLayers() {
  const layerControlsDiv = document.getElementById('layer-controls');
  if (!layerControlsDiv) return;
  
  // Gerar os controles (checkboxes) na sidebar
  layerControlsDiv.innerHTML = LAYER_CONFIG.map(layer => `
    <div class="layer-item">
      <input type="checkbox" class="layer-toggle" id="toggle-${layer.id}" data-id="${layer.id}">
      <div class="layer-dot" style="background-color: ${layer.color};"></div>
      <span class="layer-name">${layer.name}</span>
      <span class="layer-count">0</span>
    </div>
  `).join('');
  
  // Carregar cada camada (inicialmente invisível, exceto UF?)
  for (const config of LAYER_CONFIG) {
    // A UF pode vir visível por padrão, se quiser
    const defaultVisible = (config.id === 'uf_am');
    const layer = await loadFlatGeobufLayer(config, defaultVisible);
    if (layer && config.id === 'uf_am') {
      map.fitBounds(layer.getBounds());
    }
    // Atualizar contador de features depois de carregar
    if (layer) {
      updateLayerCount(config.id, layer);
    }
  }
  
  // Adicionar eventos aos checkboxes após carregar
  document.querySelectorAll('.layer-toggle').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const layerId = checkbox.dataset.id;
      const layer = loadedLayers[layerId];
      if (layer) {
        if (checkbox.checked) {
          layer.addTo(map);
          updateDashboard(); // atualiza dashboard quando camada é adicionada
        } else {
          map.removeLayer(layer);
          updateDashboard();
        }
      }
    });
  });
}

// Atualiza o contador de features (exibido ao lado do nome da camada)
function updateLayerCount(layerId, layer) {
  const countSpan = document.querySelector(`#toggle-${layerId}`)?.closest('.layer-item')?.querySelector('.layer-count');
  if (countSpan && layer) {
    let count = 0;
    layer.eachLayer(() => count++);
    countSpan.textContent = count;
  }
}

// Chamar initLayers quando o mapa estiver pronto
if (typeof map !== 'undefined') {
  // Aguarda o mapa ser inicializado em map.js
  document.addEventListener('DOMContentLoaded', () => {
    // Pequeno delay para garantir que o mapa global existe
    setTimeout(() => {
      if (window.map) initLayers();
      else console.warn('Mapa não encontrado');
    }, 200);
  });
}
