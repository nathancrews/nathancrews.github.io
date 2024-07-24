
import { nc_ChunkFileUploadRequests, nc_IsFileTypeAllowed } from "./nc_file_upload_client.js";
import { InitDropElements } from "./map-drop-zone.js";


//************************************
// Define Application Data
//************************************
export let AppUIData2D = {
    formEl: document.getElementById("uploadForm"),
    dirInputEl: document.getElementById("directory"),
    loadingImageEl: document.getElementById("loading-image")
}

export let AppMapData2D = {
    map: null,
    imagesLayer: null,
    layerControl: null,
    imageLayerGroup: null,
    droneIcon: L.icon({
        iconUrl: 'images/drone-icon.jpg',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, 95]
    }),
    projectDirectory: "test_drop",
    baseUploadPath: "uploads/",
    geoJSONFileURL: "uploads/test_drop/geo-images.json",
    geoJSONFileName: "geo-images.json",
    geoJSONFileData: null
}

//************************************
// Define Application Methods
//************************************
export async function InitMap2D() {

    //************************************
    // Attach event listeners
    //************************************

    AppUIData2D.formEl = document.getElementById("uploadForm");
    AppUIData2D.dirInputEl = document.getElementById("directory");
    AppUIData2D.loadingImageEl = document.getElementById("loading-image");

    console.log("InitMap2D called AppUIData2D.formEl = ", AppUIData2D.formEl)

    if (AppUIData2D.formEl) {
        AppUIData2D.formEl.addEventListener("submit", SubmitClicked);
    }

    if (AppUIData2D.dirInputEl) {
        AppUIData2D.dirInputEl.addEventListener("change", OnDirChanged);
        AppUIData2D.dirInputEl.addEventListener("keydown", OnDirChanged);
    }

    if (AppUIData2D.loadingImageEl) {
        AppUIData2D.loadingImageEl.style.display = "none";
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
            maxZoom: 20,
        })

    let googleRoadmap = L.gridLayer
        .googleMutant({
            type: "roadmap", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
            maxZoom: 20,
        })

    let googleSatellite = L.gridLayer
        .googleMutant({
            type: "satellite", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
            maxZoom: 20,
        })

    AppUIData2D.map = L.map('map2d', {
        center: [56.01877997222222, -3.7548339722222224],
        zoom: 18,
        maxZoom: 20,
        layers: [osm, Esri_Imagery, bingLayer, googleHybrid, googleRoadmap, googleSatellite]
    });

    let baseMaps = {
        "OpenStreetMap": osm,
        " Esri Imagery": Esri_Imagery,
        " Bing Imagery": bingLayer,
        " Google Roads": googleRoadmap,
        "Google Imagery": googleSatellite,
        " Google Hybrid": googleHybrid,
    };

    AppUIData2D.imageLayerGroup = L.layerGroup().addTo(AppUIData2D.map); // Create empty photos LayerGroup
    AppUIData2D.layerControl = L.control.layers(baseMaps);
    AppUIData2D.layerControl.addOverlay(AppUIData2D.imageLayerGroup, "Uploaded Pics");  // Add empty photos group to layer control
    AppUIData2D.layerControl.addTo(AppUIData2D.map);

}

export async function UpdateMap2D(geoJSONResults) {

    let localgeoJSONResults = geoJSONResults;
    let fetchDataJSON;
    let retVal = false;
    //console.log("localgeoJSONResults = ", localgeoJSONResults);
    //console.log("AppMapData2D.geoJSONFileURL = ", AppMapData2D.geoJSONFileURL);

    if (!localgeoJSONResults && AppMapData2D.geoJSONFileURL) {
        localgeoJSONResults = await LoadGeoJSONFile(AppMapData2D.geoJSONFileURL);
    }

    if (localgeoJSONResults) {

        AppMapData2D.geoJSONFileData = localgeoJSONResults;
    //    console.log("AppMapData2D.geoJSONFileData=", AppMapData2D.geoJSONFileData);

        // try {
        //    // fetchDataJSON = JSON.parse(AppMapData2D.geoJSONFileData);
        //     console.log("fetchDataJSON=",fetchDataJSON);
        // } catch (error) {
        //     console.log(error);
        //     return retVal;
        // }
    }

    if (AppMapData2D.geoJSONFileData) {

        if (AppUIData2D.imagesLayer) {
            AppUIData2D.imageLayerGroup.removeLayer(AppUIData2D.imagesLayer);
            AppUIData2D.map.removeLayer(AppUIData2D.imagesLayer);
            AppUIData2D.imagesLayer = null;
        }

        AppUIData2D.imagesLayer = L.geoJSON(AppMapData2D.geoJSONFileData, {
            pointToLayer: function (point, latlng) {
                // console.log("point = ", point)
                // console.log("point.properties.thumbFileName = ", point.properties.thumbFileName)

                let currentDroneIcon = AppMapData2D.droneIcon;

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

        if (AppUIData2D.imagesLayer) {
            AppUIData2D.imageLayerGroup.addLayer(AppUIData2D.imagesLayer);
            AppUIData2D.map.fitBounds(AppUIData2D.imagesLayer.getBounds());
            retVal = true;
        }
    }

    return retVal;
}


async function OnDirChanged(event) {
    //console.log("OnDirChanged called")
    if ((event instanceof KeyboardEvent) && event.key != "Enter") {
        return;
    }

    event.preventDefault();

    //console.log("1 AppUIData.loadingImageEl = ", AppUIData.loadingImageEl)

    if (AppUIData2D.loadingImageEl) {
        AppUIData2D.loadingImageEl.style.display = "flex";
    }

    try {
        if (AppMapData2D.imagesLayer) {
            AppMapData2D.imageLayerGroup.removeLayer(imagesLayer);
            AppMapData2D.map.removeLayer(imagesLayer);
            AppMapData2D.imagesLayer = null;
        }

        let newDirectory = "";
        newDirectory = document.getElementById("directory").value;

        AppMapData2D.projectDirectory = newDirectory;
        AppMapData2D.geoJSONFileURL = AppMapData2D.baseUploadPath + newDirectory + "/" + AppMapData2D.geoJSONFileName;

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
                AppMapData2D.geoJSONFileData = await JSON.parse(responseText);
                let UpdateMapEvent = new CustomEvent("GeoJSONFileURLChanged", { detail: { AppMapData: AppMapData2D } });
                AppUIData2D.formEl.dispatchEvent(UpdateMapEvent);
            }
        }
    }
    catch (error) {
        console.log("OnDirChanged catch error:", error)
    }

    //console.log("2 AppUIData.loadingImageEl = ", AppUIData.loadingImageEl)

    if (AppUIData2D.loadingImageEl) {
        AppUIData2D.loadingImageEl.style.display = "none";
    }
}

async function SubmitClicked(event) {

    event.preventDefault();
    //console.log("submit button clicked....")

    if (AppUIData2D.formEl) {

        try {
            let filesEl = document.getElementById("file")

            if (AppUIData2D.loadingImageEl) {
                AppUIData2D.loadingImageEl.style.display = "flex";
            }

            const responseText = await nc_ChunkFileUploadRequests(AppUIData2D.formEl, filesEl);

            if (responseText) {
                AppMapData2D.geoJSONFileData = await JSON.parse(responseText);

                let UpdateMapEvent = new CustomEvent("GeoJSONFileURLChanged",
                    { detail: { AppMapData: AppMapData2D } });

                ResetFileInputElement(filesEl);
                AppUIData2D.formEl.dispatchEvent(UpdateMapEvent);
            }

        }
        catch (error) {
            console.log("catch error:", error)
        }

        if (AppUIData2D.loadingImageEl) {
            AppUIData2D.loadingImageEl.style.display = "none";
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

        AppUIData2D.formEl.replaceChild(newFileInputEl, existingFileInputEl);
        existingFileInputEl = newFileInputEl;
    }
}

async function LoadGeoJSONFile(jsonFileURL) {
    let fetchData = "";

    console.log("LoadGeoJSONFile: jsonFileURL=", jsonFileURL);

    let fetchResponse = await fetch(jsonFileURL);
    if (fetchResponse.status === 200) {
        fetchData = await fetchResponse.json();
    }
    else {
        console.log("Load GeoJSON file failed: ", jsonFileURL)
    }

   // console.log("LoadGeoJSONFile: fetchData=", fetchData);

    return fetchData;
}




