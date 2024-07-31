    let droneIcon = L.icon({
        iconUrl: 'images/drone-icon.jpg',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, 95]
    });

    let AppMapData = {
        map: null,
        imagesLayer: null,
        layerControl: null,
        imageLayerGroup: null,
        mapIcon: new droneIcon()
    }


const formEl = document.getElementById("uploadForm");
    if(formEl) {
        formEl.addEventListener("submit", submitClicked);
    }

const dirInputEl = document.getElementById("directory");
    if(dirInputEl) {
        dirInputEl.addEventListener("change", onDirChanged);
    }

var loadingImageEl = document.getElementById("loading-image");
    if(loadingImageEl) {
        loadingImageEl.style.display = "none";
    }



async function onDirChanged(event) {
        console.log("clearing image layer")

if (loadingImageEl) {
    loadingImageEl.style.display = "flex";
}

if (imagesLayer) {
    imageLayerGroup.removeLayer(imagesLayer);
    map.removeLayer(imagesLayer);
    imagesLayer = null;
}
let newDirectory = event.target.value;
let formAction = "cgi-bin/image-geo/image-mapper.js?dir=uploads/" + newDirectory + "/&response_type=json";

// console.log("formAction = ", formAction);

var response = await fetch(formAction, {
    method: "GET"
}).catch(error => {
    console.log("Error: refresh image GeoJSON falied.", error);
});

if (response && response.status >= 200 && response.status < 300) {

    var responseRes = await response.text();
    //console.log("responseRes=", responseRes)
    await UpdateMap(responseRes)
}

if (loadingImageEl) {
    loadingImageEl.style.display = "none";
}
}

async function submitClicked(event) {
    if (formEl) {
        event.preventDefault();

        var filesEl = document.getElementById("file")
        var mapDivEl = document.getElementById("map")

        if (loadingImageEl) {
            loadingImageEl.style.display = "flex";
        }

        const uploadActionResults = await nc_ChunkFileUploadRequests(formEl, filesEl);

        await UpdateMap(uploadActionResults);

        if (loadingImageEl) {
            loadingImageEl.style.display = "none";
        }

        let newFileInputEl = document.createElement("input");
        if (newFileInputEl) {
            newFileInputEl.setAttribute('type', 'file');
            newFileInputEl.setAttribute('id', 'file');
            newFileInputEl.setAttribute('name', 'file');
            newFileInputEl.setAttribute('class', 'drop-zone__input');
            newFileInputEl.setAttribute('multiple', 'true');
            newFileInputEl.setAttribute('accept', '.jpg,.png,.JPG,.PNG');
            newFileInputEl.setAttribute('hidden', 'true');

            formEl.replaceChild(newFileInputEl, filesEl);
        }

    }

}

async function UpdateMap(geoJSONResults) {

    let fetchDataJSON;

    if (geoJSONResults) {
        try {
            fetchDataJSON = JSON.parse(geoJSONResults);

            // console.log(fetchDataJSON);
        } catch (error) {
            console.log(error);
            //fetchDataJSON = null;
        }
    }

    if (fetchDataJSON) {

        if (imagesLayer) {
            imageLayerGroup.removeLayer(imagesLayer);
            map.removeLayer(imagesLayer);
            imagesLayer = null;
        }

        imagesLayer = L.geoJSON(fetchDataJSON, {
            pointToLayer: function (point, latlng) {
                // console.log("point = ", point)
                // console.log("point.properties.thumbFileName = ", point.properties.thumbFileName)

                let currentDroneIcon = droneIcon;

                // if (point.properties.thumbFileName) {
                //     currentDroneIcon = L.icon({
                //         iconUrl: point.properties.thumbFileName,
                //         iconSize: [48, 48],
                //         iconAnchor: [24, 24],
                //         popupAnchor: [0, 112]
                //     });
                // }

                return L.marker(latlng, { icon: currentDroneIcon });
            },
        }).bindPopup(function (layer) {
            return "<div style='margin:0px; padding:0px;'><p><b>" + layer.feature.properties.name + "</b></p> \
<a href='" + layer.feature.properties.name + "' target='window'><img style=max-width: 250px; max-height:300px;' src='" +
                layer.feature.properties.thumbFileName + "' /></a></div>";
        });

        if (imagesLayer) {
            imageLayerGroup.addLayer(imagesLayer);
            map.fitBounds(imagesLayer.getBounds());
        }
    }

}

async function main() {

    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    });

    var Esri_Imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20,
    });

    map = L.map('map', {
        center: [56.01877997222222, -3.7548339722222224],
        zoom: 14,
        maxZoom: 19,
        layers: [osm, Esri_Imagery]
    });

    var baseMaps = {
        "Street Map": osm,
        "Esri Imagery": Esri_Imagery
    };

    imageLayerGroup = L.layerGroup().addTo(map); // Create empty photos LayerGroup
    layerControl = L.control.layers(baseMaps);
    layerControl.addOverlay(imageLayerGroup, "Uploaded Pics");  // Add empty photos group to layer control
    layerControl.addTo(map);
}

async function loadJSONFile(jsonFileURL, map) {
    var imagesMap;
    var fetchJson = await fetch(jsonFileURL);
    if (fetchJson.status === 200) {
        var fetchData = await fetchJson.json();
        if (fetchData) {

            imagesMap = L.geoJSON(fetchData, {
                pointToLayer: function (point, latlng) {
                    return L.marker(latlng, { icon: droneIcon });
                },
            }).bindPopup(function (layer) {
                return "<div style='margin:0px; padding:0px;'><p style='z-index: -1;'><b>" + layer.feature.properties.name + "</b></p> \
                <a href='" + layer.feature.properties.name + "' style='z-index:100;' target='window'><img style='rotate: " +
                    Number(layer.feature.properties.cameraDirection) + "deg; max-width: 325px; max-height:225px;' src='" +
                    layer.feature.properties.thumbFileName + "' /></a></div>";
            }).addTo(map);
        }
        else {
            console.log("Parsing GeoJSON file failed: ", jsonFileURL)
        }
    }
    else {
        console.log("Load GeoJSON file failed: ", jsonFileURL)
    }
    return imagesMap;
}

