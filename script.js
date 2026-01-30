// Appel de dépendance
const protocol = new pmtiles.Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

// Configuration de la carte
var map = new maplibregl.Map({
container: 'map',
style: 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json', // Fond de carte
customAttribution : '<a href="https://sites-formations.univ-rennes2.fr/mastersigat/"target="_blank">Master SIGAT</a>',
center: [-1.67, 48.12], // lat/long
zoom: 12, // zoom
minZoom: 11,
pitch: 0, // Inclinaison
bearing: 0 // Rotation
});

// Boutons de navigation
var nav = new maplibregl.NavigationControl();
map.addControl(nav, 'top-left');
// Ajout Echelle cartographique
map.addControl(new maplibregl.ScaleControl({
maxWidth: 120,
unit: 'metric'}));

// Bouton de géolocalisation
map.addControl(new maplibregl.GeolocateControl
({positionOptions: {enableHighAccuracy: true},
trackUserLocation: true,
showUserHeading: true}));


// Appel du flux de données OSM
map.on('load', function () {

  map.addSource("PLU", {
    type: "vector",
    url: "pmtiles://https://raw.githubusercontent.com/UnitaryPage7504/Data/refs/heads/main/Data_RM/PLUIRM.pmtiles"
});

  //Ajout contour des communes
  map.addSource('ADMIN_EXPRESS', {
  type: 'vector',
  url: 'https://data.geopf.fr/tms/1.0.0/ADMIN_EXPRESS/metadata.json',
  minzoom: 0,
  maxzoom: 14
});

map.addLayer({
  id: 'communes',
  type: 'line',
  source: 'ADMIN_EXPRESS',
  'source-layer': 'commune',
  paint: {'line-color': '#000000',
          'line-width': 0.5
  }
});

// Ajout lignes de metros
  map.addSource('lignes', {
    type: 'geojson',
    data: 'https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/metro-du-reseau-star-traces-de-laxe-des-lignes/exports/geojson?lang=fr&timezone=Europe%2FBerlin'
  });
 
  map.addLayer({
    id: 'lignesmetros',
    type: 'line',
    source: 'lignes',
    layout: {'visibility': 'visible'},
    paint: {
      'line-opacity': 1,
      'line-width': 2,
      'line-color': [
        'match',
        ['get', 'ligne'],
        'a', '#FF0000',
        'b', '#3D9400',
        '#ccc'
      ]
    }
  });
 
  // Ajout BDTOPO
  map.addSource('BDTOPO', {
    type: 'vector',
    url: 'https://data.geopf.fr/tms/1.0.0/BDTOPO/metadata.json',
    minzoom: 10,
    maxzoom: 19
  });
 
  // Ajout végétation
  map.addLayer({
    'id': 'vegetation',
    'type': 'fill',
    'source': 'BDTOPO',
     'layout': {'visibility': 'none'},
    'source-layer': 'zone_de_vegetation',
    'paint': {'fill-color': 'green'},
  });
  

  // Bâtiments extrusion
  map.addLayer({
    'id': 'batiments',
    'type': 'fill-extrusion',
    'source': 'BDTOPO',
    'layout': {'visibility': 'none'},
    'source-layer': 'batiment',
    "filter": ['==', 'usage_1', 'Résidentiel'],
    'paint': {
      'fill-extrusion-color': '#A9A9A9',
      'fill-extrusion-height': {'type': 'identity', 'property': 'hauteur'},
      'fill-extrusion-opacity': 1,
      'fill-extrusion-base': 0
 
    }
  });
 
 //couche PLU
map.addSource("PLUsource", {
type: "vector",
url: "pmtiles://https://raw.githubusercontent.com/athenaislebellour-dotcom/data2/main/plui.pmtiles"
});
  
map.addLayer({
id: "PLU",
type: "fill",
source: "PLUsource",
"source-layer": "plui",
'layout': {'visibility': 'none'},
paint: {"fill-color": ['match',['get', 'typezone'],
'U', 'red',
'A', 'yellow',
'N', 'green',
'AH', 'orange',
'#ccc']},
"fill-opacity": 0.35
});
 
//ajout de contour
map.addLayer({
id: "PLUcontour",
type: "line",
source: "PLUsource",
'layout': {'visibility': 'none'},
"source-layer": "plui",
paint: {"line-color": "black","line-width":{'stops': [[12, 0.3], [20, 1]]}}
});


  // AJOUT DU CADASTRE ETALAB
  map.addSource('Cadastre', {
    type: 'vector',
    url: 'https://openmaptiles.geo.data.gouv.fr/data/cadastre.json'
  });
 
  map.addLayer({
    'id': 'Cadastre',
    'type': 'line',
    'source': 'Cadastre',
    'source-layer': 'parcelles',
    'layout': {'visibility': 'visible'},
    'paint': {'line-color': '#000000', 'line-width': 1},
    'minzoom': 17,
    'maxzoom': 20
  });
 
 
 //Ajout des vélostars
  $.getJSON('https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/vls-stations-etat-tr/records?limit=60',
function(data) {var geojsonData4 = {
type: 'FeatureCollection',
features: data.results.map(function(element) {
return {type: 'Feature',
geometry: {type: 'Point',
coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
properties: { name: element.nom,
             nbvelos: element.nombreemplacementsdisponibles,
             nbsocles: element.nombreemplacementsactuels}};
})
};
map.addLayer({ 'id': 'velostar',
'type':'circle',
'source': {'type': 'geojson',
'data': geojsonData4},
'layout': {'visibility': 'none'},
'paint': {'circle-color': 'blue','circle-radius' : 4, 'circle-stroke-width': 1, 'circle-stroke-color' : 'white'}
});
});
 
 //Ajout des parcs relais
  $.getJSON('https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/tco-parcsrelais-star-etat-tr/records?limit=20',
function(data) {var geojsonData4 = {
type: 'FeatureCollection',
features: data.results.map(function(element) {
return {type: 'Feature',
geometry: {type: 'Point',
coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
properties: { name: element.nom,
capacity: element.jrdinfosoliste}};

})
};
map.addLayer({ 'id': 'parcrelais',

'type':'circle',
'source': {'type': 'geojson',
'data': geojsonData4},
'paint': {'circle-color': '#38A0C7', 'circle-radius' : 7, 'circle-stroke-width': 0.8, 'circle-stroke-color' : 'white'}
});
});
 
//Interactivité HOVER
var popup = new maplibregl.Popup({
className: "Mypopup",
closeButton: false,
closeOnClick: false });
map.on('mousemove', function(e) {
var features = map.queryRenderedFeatures(e.point, { layers: ['parcrelais'] });
// Change the cursor style as a UI indicator.
map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
if (!features.length) {
popup.remove();
return; }
var feature = features[0];
popup.setLngLat(feature.geometry.coordinates)
.setHTML(feature.properties.name + '<br>' + feature.properties.capacity)
.addTo(map);
});  
  
//Interactivité CLICK
map.on('click', function (e) {
var features = map.queryRenderedFeatures(e.point, { layers: ['velostar'] });
if (!features.length) {
return;
}
var feature = features[0];
var popup = new maplibregl.Popup({ offset: [0, -15] })
.setLngLat(feature.geometry.coordinates)
.setHTML('<h2>' + feature.properties.name + '</h2>' +'<p>Vélos disponibles : ' + feature.properties.nbvelos + '</p>' +'<p>Socles utilisés : ' + feature.properties.nbsocles + '</p>')
.addTo(map);
});
  
map.on('mousemove', function (e) {
var features = map.queryRenderedFeatures(e.point, { layers: ['velostar'] });
map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
});  
  
//Fin du map.on
  
  
  
//fonction switchlayer
switchlayer = function (lname) {
            if (document.getElementById(lname).checked) {
                map.setLayoutProperty(lname, 'visibility', 'visible');
            } else {
                map.setLayoutProperty(lname, 'visibility', 'none');
           }
        }

    }); 


map.on('zoom', () => {
    let pitch = map.getZoom() > 15 ? 45 : 12;
    if (map.getPitch() !== pitch) {
        map.easeTo({ pitch: pitch, duration: 300 });
    }
});


// Configuration onglets géographiques 

document.getElementById('Rennes').addEventListener('click', function () 
{ map.flyTo({zoom: 12,
           center: [-1.672, 48.1043],
	          pitch: 0,
            bearing:0 });
});

document.getElementById('Gare').addEventListener('click', function () 
{ map.flyTo({zoom: 16,
           center: [-1.672, 48.1043],
	          pitch: 20,
            bearing: -197.6 });
});


document.getElementById('Rennes1').addEventListener('click', function () 
{ map.flyTo({zoom: 16,
           center: [-1.6396, 48.1186],
	          pitch: 20,
            bearing: -197.6 });
});

document.getElementById('Rennes2').addEventListener('click', function () 
{ map.flyTo({zoom: 16,
           center: [-1.7023, 48.1194],
	          pitch: 30,
            bearing: -197.6 });
});