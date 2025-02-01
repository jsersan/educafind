var features = [];
var pines;
let mimapa;
var mapLat = 42.8467;
var mapLng = -2.67164;
var mapDefaultZoom = 9.5
var markers;

let provincias = new Array();
document.getElementById("provincia").addEventListener("change", actualizarMunicipios);
document.getElementById("municipio").addEventListener("change", actualizarMapa);
document.getElementById("tipocentro").addEventListener("change", actualizarMapa);
document.getElementById("modulo").addEventListener("change", actualizarMapa);

window.onload = function () {
    centros.forEach(centro => {
        if (provincias[centro.DTERRC] == undefined) {
            provincias[centro.DTERRC.toUpperCase()] = new Array();
        }
        if (!provincias[centro.DTERRC.toUpperCase()].includes(centro.DMUNIC)) {
            provincias[centro.DTERRC.toUpperCase()].push(centro.DMUNIC)
        }

    });

    for (const provincia in provincias) {
        let x = document.getElementById("provincia");
        let option = document.createElement("option");
        option.text = provincia;
        x.add(option)
    }

    for (const ciclo in ciclos) {
        let x = document.getElementById("modulo");
        let option = document.createElement("option");
        option.text = ciclos[ciclo].nom;
        option.setAttribute("value", ciclos[ciclo].codcicl);
        x.add(option)
    }
    sessionStorage.setItem("zoom", 12);
    initialize_map();
}

function actualizarMunicipios() {

    if (document.getElementById("municipio").disabled) {
        document.getElementById("municipio").removeAttribute("disabled")
    }

    let seleccionado = document.getElementById("provincia").value;
    let x = document.getElementById("municipio");
    x.innerHTML = "";
    let option = document.createElement("option");
    option.setAttribute("value", "");
    option.text = "Seleccione municipio";
    x.add(option);
    for (const municipio in provincias[seleccionado]) {
        option = document.createElement("option");
        option.text = provincias[seleccionado][municipio];
        x.add(option)

    }
    actualizarMapa()
}

function actualizarMapa() {
    $(document.getElementById('popup')).popover('dispose');

    features = [];
    mimapa.removeLayer(pines);

    //console.log("borrado");
    let aInsertar = new Array();

    provincia = document.getElementById("provincia").value;
    municipio = document.getElementById("municipio").value;
    tipoCentro = document.getElementById("tipocentro").value;
    modulo = document.getElementById("modulo").value;
    var loscentros;
    for (const ciclodeciclos of ciclos) {
        if (ciclodeciclos.codcicl == modulo) {
            loscentros = ciclodeciclos.centros
        }

    }
    centros.forEach(centro => {

        var insertar = true;
        if (provincia != "" && provincia != centro.DTERRC) {
            insertar = false
        }
        if (municipio != "" && centro.DMUNIC != municipio) {
            insertar = false
        }
        if (tipoCentro != "" && centro.DGENRC != tipoCentro) {
            insertar = false
        }
        if (modulo != "" && !(loscentros.includes(centro.CCEN))) {
            insertar = false
        }
        if (insertar) {
            aInsertar.push(centro)
        }
    });
    aniadirMarkers(aInsertar)
}

function aniadirMarkers(centros) {
    var zoomActual = sessionStorage.getItem("zoom");
    mimapa.getView().setZoom(zoomActual);

    mimapa.getView().setCenter(ol.proj.fromLonLat([-2.4587807, 43.1145541]));

    for (i = 0; i < centros.length; i++) {
        let utm = "+proj=utm +zone=30";
        let wgs84 = "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs";
        let convertido = proj4(utm, wgs84, [centros[i].COOR_X, centros[i].COOR_Y]);
        let lat = convertido[0];
        let long = convertido[1];

        var iconFeature;

        if (centros[i].PAGINA != " ") {
            iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([lat, long], 'EPSG:4326', 'EPSG:3857')),
                name: '' + centros[i].NOM,
                contenido: '<p id="firstHeading" class="firstHeading fw-bold">' + centros[i].DGENRC + " " + centros[i].NOM + " " + centros[i].DGENRE + '</p><div id="bodyContent">' +
                    "Dirección/Helbidea: " + centros[i].DOMI + "<br/>" +
                    "Municipio/Udalerria: " + centros[i].DMUNIC + "/" + centros[i].DMUNIE + "<br/>" +
                    "Provincia/Probintzia: " + centros[i].DTERRC + "/" + centros[i].DTERRE + "<br/>" +
                    "Teléfono: " + centros[i].TEL1 + "<br/>" +
                    "Fax: " + centros[i].TFAX + "<br/>" +
                    "Email: <a href='mailto:" + centros[i].EMAIL + "'>" + centros[i].EMAIL + "</a><br/>" +
                    "<a href='" + centros[i].PAGINA + "' target='_blank'>Visitar sitio web</a>" +
                    '</div>'
            });
        } else {
            iconFeature = new ol.Feature({
                geometry: new ol.geom.Point(ol.proj.transform([lat, long], 'EPSG:4326', 'EPSG:3857')),
                name: '' + centros[i].NOM,
                contenido: '<p id="firstHeading" class="firstHeading fw-bold">' + centros[i].NOM + '</p><div id="bodyContent">' +
                    "Dirección/Helbidea: " + centros[i].DOMI + "<br/>" +
                    "Municipio/Udalerria: " + centros[i].DMUNIC + "/" + centros[i].DMUNIE + "<br/>" +
                    "Provincia/Probintzia: " + centros[i].DTERRC + "/" + centros[i].DTERRE + "<br/>" +
                    "Teléfono: " + centros[i].TEL1 + "<br/>" +
                    "Fax: " + centros[i].TFAX + "<br/>" +
                    "Email: <a href='mailto:" + centros[i].EMAIL + "'>" + centros[i].EMAIL + "</a><br/>" +
                    '</div>'
            });
        }
        switch (centros[i].DGENRC) {
            case "CIFP":
                icono = "images/cifp.png";
                scale = 0.15;
                break;
            case "CPFPB":
                icono = "images/cpfpb.png";
                scale = 0.15;
                break;
            case "CPES":
                icono = "images/cpes.png";
                scale = 0.15;
                break;
            case "CPEIPS":
                icono = "images/cpeips.png";
                scale = 0.15;
                break;
            case "IES":
                icono = "images/ies.png";
                scale = 0.15;
                break;
            case "IMFPB":
                icono = "images/imfpb.png";
                scale = 0.15;
                break;
            default:
                icono = "images/otro.png";
                scale = 0.15;
                break;
        }
        switch (document.getElementById('modulo').value) {
            // 
            case "10001":
                icono = "images/smi.png";
                scale = 0.15;
                break;
            case "10002":
                icono = "images/admredes.png";
                scale = 0.15;
                break;
            case "10003":
                icono = "images/dam.png";
                scale = 0.15;
                break;
            case "10004":
                icono = "images/daw.png";
                scale = 0.15;
                break;
            case "10005":
                icono = "images/marketing.png";
                scale = 0.15;
                break;
            case "10006":
                icono = "images/comercio.png";
                scale = 0.15;
                break;

        }
        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon(({
                anchor: [0.5, 1],
                scale: scale,
                src: icono
            }))
        });

        iconFeature.setStyle(iconStyle);
        features.push(iconFeature);
    }
    var vectorSource = new ol.source.Vector({
        features: features
    });

    pines = new ol.layer.Vector({
        source: vectorSource
    });
    mimapa.addLayer(pines);
}

function initialize_map() {
    mimapa = new ol.Map({
        target: document.getElementById('map'),
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM({
                    url: "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
                })
            })
        ],

        view: new ol.View({
            center: ol.proj.fromLonLat([mapLng, mapLat]),
            zoom: mapDefaultZoom
        })
        
    });
    var element = document.getElementById('popup');

    var popup = new ol.Overlay({
        element: element,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -50]
    });
    mimapa.addOverlay(popup);
    sessionStorage.setItem("latitud", mapLat);
    sessionStorage.setItem("longitud", mapLng);

    // display popup on click
    mimapa.on('click', function (evt) {
        var feature = mimapa.forEachFeatureAtPixel(evt.pixel,
            function (feature) {
                return feature;
            });

        if (feature) {
            $(element).popover('dispose');

            var coordinates = feature.getGeometry().getCoordinates();
            popup.setPosition(coordinates);
            $(element).popover({
                placement: 'top',
                html: true,
                animation: false,
                content: feature.get('contenido')
            });
            $(element).popover('show');
        } else {
            $(element).popover('dispose');
        }
    });

    // change mouse cursor when over marker
    mimapa.on('pointermove', function (e) {
        if (e.dragging) {
            $(element).popover('dispose');
            return;
        }
        var pixel = mimapa.getEventPixel(e.originalEvent);
        var hit = mimapa.hasFeatureAtPixel(pixel);
        mimapa.getTarget().style.cursor = hit ? 'pointer' : '';
    });

    mimapa.on('moveend', function (e) {
        var currZoom = mimapa.getView().getZoom();
        console.log("Zoom actual:" + currZoom);
        sessionStorage.setItem("zoom", currZoom);

    });
}