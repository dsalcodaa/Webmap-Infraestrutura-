/* =====================================================
   map.js — Leaflet
   ===================================================== */

let map;

let currentBasemap;

// =====================================================
// BASEMAPS
// =====================================================

const BASEMAPS = {

  streets: L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; OpenStreetMap'
    }
  ),

  satellite: L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '&copy; Esri'
    }
  ),

  dark: L.tileLayer(
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png',
    {
      attribution: '&copy; Stadia Maps'
    }
  )

};

// =====================================================
// INICIALIZAÇÃO
// =====================================================

function initMap() {

  map = L.map('map', {

    center: [-4.5, -64.5],
    zoom: 5,

    zoomControl: true

  });

  currentBasemap = BASEMAPS.streets;

  currentBasemap.addTo(map);

  // escala
  L.control.scale({

    imperial: false

  }).addTo(map);

  // geolocalização
  map.locate({

    setView: false

  });

  // inicializa
  initLayers();

  initDashboard();

}

// =====================================================
// TROCAR BASEMAP
// =====================================================

function setBasemap(style, btn) {

  if (currentBasemap) {

    map.removeLayer(currentBasemap);

  }

  currentBasemap = BASEMAPS[style];

  currentBasemap.addTo(map);

  document.querySelectorAll('.basemap-btn')
    .forEach(b => b.classList.remove('active'));

  btn.classList.add('active');

}

// =====================================================

window.addEventListener(
  'DOMContentLoaded',
  initMap
);