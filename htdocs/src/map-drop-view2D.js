
import { nc_ChunkFileUploadRequests, nc_IsFileTypeAllowed } from "./nc_file_upload_client.js";
import { InitDropElements } from "./map-drop-zone.js";


//************************************
// Define Application Data
//************************************
let AppUIData = {
    formEl: document.getElementById("uploadForm"),
    dirInputEl: document.getElementById("directory"),
    loadingImageEl: document.getElementById("loading-image")
}

let AppMapData = {
    map: null,
    imagesLayer: null,
    layerControl: null,
    imageLayerGroup: null,
    droneIcon: L.icon({
        iconUrl: 'images/drone-icon.jpg',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, 95]
    })
}

//************************************
// Define Application Methods
//************************************
export async function InitMap2D() {

    //************************************
    // Attach event listeners
    //************************************

 //   console.log("InitMap2D called AppUIData.formEl = ", AppUIData.formEl)

    if (AppUIData.formEl) {
        AppUIData.formEl.addEventListener("submit", SubmitClicked);
    }

    if (AppUIData.dirInputEl) {
        AppUIData.dirInputEl.addEventListener("change", OnDirChanged);
        AppUIData.dirInputEl.addEventListener("keydown", OnDirChanged);
    }

    if (AppUIData.loadingImageEl) {
        AppUIData.loadingImageEl.style.display = "none";
    }

    let dropElements = document.querySelectorAll(".map-drop-zone");

    InitDropElements(dropElements);


    let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 24,
    });

    let Esri_Imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20,
    });

    let BING_KEY = 'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L'
    let bingLayer = L.tileLayer.bing(BING_KEY);

    let googleHybrid = L.gridLayer
        .googleMutant({
            type: "hybrid", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
            maxZoom: 21,
        })

    let googleRoadmap = L.gridLayer
        .googleMutant({
            type: "roadmap", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
            maxZoom: 21,
        })

    let googleSatellite = L.gridLayer
        .googleMutant({
            type: "satellite", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
            maxZoom: 21,
        })

    AppUIData.map = L.map('map', {
        center: [56.01877997222222, -3.7548339722222224],
        zoom: 18,
        maxZoom: 21,
        layers: [osm, Esri_Imagery, bingLayer, googleHybrid, googleRoadmap, googleSatellite]
    });

    let baseMaps = {
        "OpenStreetMap": osm,
        " Esri Imagery": Esri_Imagery,
        " Bing Imagery": bingLayer,
        "Google Roads": googleRoadmap,
        "Google Imagery": googleSatellite,
        "Google Hybrid": googleHybrid,
    };

    AppUIData.imageLayerGroup = L.layerGroup().addTo(AppUIData.map); // Create empty photos LayerGroup
    AppUIData.layerControl = L.control.layers(baseMaps);
    AppUIData.layerControl.addOverlay(AppUIData.imageLayerGroup, "Uploaded Pics");  // Add empty photos group to layer control
    AppUIData.layerControl.addTo(AppUIData.map);
}


async function OnDirChanged(event) {

    //console.log("OnDirChanged called")

    if ((event instanceof KeyboardEvent) && event.key != "Enter") {
        return;
    }

    event.preventDefault();

    //console.log("1 AppUIData.loadingImageEl = ", AppUIData.loadingImageEl)

    if (AppUIData.loadingImageEl) {
        AppUIData.loadingImageEl.style.display = "flex";
    }

    try {
        if (AppMapData.imagesLayer) {
            AppMapData.imageLayerGroup.removeLayer(imagesLayer);
            AppMapData.map.removeLayer(imagesLayer);
            AppMapData.imagesLayer = null;
        }

        let newDirectory = "";
        newDirectory = document.getElementById("directory").value;

        let formAction = "cgi-bin/image-geo/image-mapper.js?dir=uploads/" + newDirectory + "/&response_type=json";

        //console.log("formAction = ", formAction);

        let response = await fetch(formAction, { method: "GET" }).catch(error => {
            console.log("Error: refresh image GeoJSON failed.", error);
        });

        //console.log("response.status=", response.status)

        if (response.status == 200) {
            let responseText = "ERROR";
            responseText = await response.text();

            let stat = responseText.indexOf("ERROR");
            if (stat < 0) {
                await UpdateMap(responseText)
            }
        }
    }
    catch (error) {
        console.log("catch error:", error)
    }

    //console.log("2 AppUIData.loadingImageEl = ", AppUIData.loadingImageEl)

    if (AppUIData.loadingImageEl) {
        AppUIData.loadingImageEl.style.display = "none";
    }
}

async function SubmitClicked(event) {

    event.preventDefault();
    //console.log("submit button clicked....")

    if (AppUIData.formEl) {

        try {
            let filesEl = document.getElementById("file")

            if (AppUIData.loadingImageEl) {
                AppUIData.loadingImageEl.style.display = "flex";
            }

            const uploadActionResults = await nc_ChunkFileUploadRequests(AppUIData.formEl, filesEl);

            if (uploadActionResults) {
                if (await UpdateMap(uploadActionResults)) {
                    ResetFileInputElement(filesEl);
                }
            }

        }
        catch (error) {
            console.log("catch error:", error)
        }

        if (AppUIData.loadingImageEl) {
            AppUIData.loadingImageEl.style.display = "none";
        }
    }
}

function ResetFileInputElement(existingFileInputEl) {
    let newFileInputEl = document.createElement("input");

    if (newFileInputEl) {
        newFileInputEl.setAttribute('type', 'file');
        newFileInputEl.setAttribute('id', 'file');
        newFileInputEl.setAttribute('name', 'file');
        newFileInputEl.setAttribute('class', 'map-drop-zone__input');
        newFileInputEl.setAttribute('multiple', 'true');
        newFileInputEl.setAttribute('accept', '.jpg,.png,.JPG,.PNG');
        newFileInputEl.setAttribute('hidden', 'true');

        AppUIData.formEl.replaceChild(newFileInputEl, existingFileInputEl);
        existingFileInputEl = newFileInputEl;
    }
}

async function UpdateMap(geoJSONResults) {

    let fetchDataJSON;
    let retVal = false;

    if (geoJSONResults) {
        try {
            fetchDataJSON = JSON.parse(geoJSONResults);
            // console.log(fetchDataJSON);
        } catch (error) {
            console.log(error);
            return retVal;
        }
    }

    if (fetchDataJSON) {

        if (AppUIData.imagesLayer) {
            AppUIData.imageLayerGroup.removeLayer(AppUIData.imagesLayer);
            AppUIData.map.removeLayer(AppUIData.imagesLayer);
            AppUIData.imagesLayer = null;
        }

        AppUIData.imagesLayer = L.geoJSON(fetchDataJSON, {
            pointToLayer: function (point, latlng) {
                // console.log("point = ", point)
                // console.log("point.properties.thumbFileName = ", point.properties.thumbFileName)

                let currentDroneIcon = AppMapData.droneIcon;

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
            return "<div style='width:max-contents;margin:0px; padding:0px;'><p><b>" + layer.feature.properties.name + "</b></p> \
        <a href='" + layer.feature.properties.URLName + "' target='window'><img style=max-width: 250px; max-height:300px;' src='" +
                layer.feature.properties.thumbFileName + "' /></a></div>";
        });

        if (AppUIData.imagesLayer) {
            AppUIData.imageLayerGroup.addLayer(AppUIData.imagesLayer);
            AppUIData.map.fitBounds(AppUIData.imagesLayer.getBounds());
            retVal = true;
        }
    }

    return retVal;
}

async function LoadGeoJSONFile(jsonFileURL, map) {
    let imagesMap;
    let fetchJson = await fetch(jsonFileURL);
    if (fetchJson.status === 200) {
        let fetchData = await fetchJson.json();
        if (fetchData) {

            imagesMap = L.geoJSON(fetchData, {
                pointToLayer: function (point, latlng) {
                    return L.marker(latlng, { icon: AppMapData.droneIcon });
                },
            }).bindPopup(function (layer) {
                return "<div style='margin:0px; padding:0px;'><span><b>" + layer.feature.properties.name + "</b></span> \
                        <a href='" + layer.feature.properties.URLName + "'target='window'><img style='max-width: 325px; max-height:225px;' src='" +
                    layer.feature.properties.thumbFileName + "'/></a></div>";
            }).addTo(AppMapData.map);
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




