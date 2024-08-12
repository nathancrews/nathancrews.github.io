import { AppMapData, AppUIData } from "./app-data.js";

AppMapData.clientSideOnly = false;

import { InitDropElements } from "./map-drop-zone.js";
import { InitMap2D, UpdateMap2D, ResetMap2D, ResetMap2DView } from "./map-view2D.js";
import { InitMap3D, UpdateMap3D, ResetMap3D, ResetMap3DView } from "./map-view3D.js";
import { nc_ChunkFileUploadRequests, nc_IsFileTypeAllowed } from "./nc_file_upload_client.js";


///////////////////////////////////////////////////////////////
//
// Main Image Drop Map Initialization
//
///////////////////////////////////////////////////////////////

InitUI();

await InitMap2D();
await UpdateMap2D(AppMapData.geoJSONFileData);

await InitMap3D();
await UpdateMap3D(AppMapData.geoJSONFileData);

async function Show2D(event) {
    let map2D_div_el = document.getElementById("map2d");
    let map3D_div_el = document.getElementById("map3d");

    if (map3D_div_el) {
        map3D_div_el.style.display = "none";
    }

    if (map2D_div_el) {
        map2D_div_el.style.display = "block";
        await ResetMap2DView();
        console.log("view set to 2D");
    }
}

async function Show3D(event) {
    let map2D_div_el = document.getElementById("map2d");
    let map3D_div_el = document.getElementById("map3d");

    if (map2D_div_el) {
        map2D_div_el.style.display = "none";
    }

    if (map3D_div_el) {
        map3D_div_el.style.display = "block";
        await ResetMap3DView();
        console.log("view set to 3D");
    }
}

export async function UpdateMaps(event) {
    console.log("updating maps...");

    let startTime = performance.now();

    await UpdateMap2D(event.detail.AppMapData.geoJSONFileData);

    let endTime = performance.now();
    console.log(`UpdateMap2D took ${endTime - startTime}ms`)

    startTime = performance.now();

    await UpdateMap3D(event.detail.AppMapData.geoJSONFileData);

    if (AppUIData.loadingImageEl) {
        AppUIData.loadingImageEl.style.display = "none";
    }

    endTime = performance.now();
    console.log(`UpdateMap3D took ${endTime - startTime}ms`)
}

if (AppUIData.formEl) {
    AppUIData.formEl.addEventListener("GeoJSONFileURLChanged", UpdateMaps);
}

//************************************
// Attach event listeners
//************************************
function InitUI() {

    AppUIData.clientSideOnly = false;

    AppUIData.formEl = document.getElementById("uploadForm");
    AppUIData.dirInputEl = document.getElementById("directory");
    AppUIData.loadingImageEl = document.getElementById("loading-image");
    AppUIData.fileInputEl = document.getElementById("file");

    //   console.log("InitMap2D called AppUIData2D.formEl = ", AppUIData.formEl)

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

    let view2D_button_el = document.getElementById("view2d");
    let view3D_button_el = document.getElementById("view3d");

    if (view2D_button_el) {
        view2D_button_el.addEventListener('click', Show2D);
    }
    if (view3D_button_el) {
        view3D_button_el.addEventListener('click', Show3D);
    }

    let resetMap_button_el = document.getElementById("reset-map");
    if (resetMap_button_el) {
        resetMap_button_el.addEventListener('click', ResetMap);
    }

    let dropElements = document.querySelectorAll(".map-drop-zone");
    InitDropElements(dropElements);

    InitAppSettingsUI();
}


async function OnDirChanged(event) {
    console.log("OnDirChanged called")
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
            AppMapData.map2D.removeLayer(imagesLayer);
            AppMapData.imagesLayer = null;
        }

        let newDirectory = "";
        newDirectory = document.getElementById("directory").value;

        AppMapData.projectDirectory = newDirectory;
        AppMapData.geoJSONFileURL = AppMapData.baseUploadPath + newDirectory + "/" + AppMapData.geoJSONFileName;

        let formAction = "cgi-bin/image-geo/image-mapper.js?dir=uploads/" + newDirectory + "/&response_type=json";

        //console.log("formAction = ", formAction);

        let response = await fetch(formAction, { method: "GET" }).catch(error => {
            console.log("Error: refresh image GeoJSON failed.", error);
        });

        //console.log("response.status=", response.status)

        if (response.status == 200) {
            let responseText = "ERROR";
            responseText = await response.text();

            //console.log("responseText=", responseText)

            let stat = responseText.indexOf("ERROR");
            if (stat < 0) {
                AppMapData.geoJSONFileData = await JSON.parse(responseText);
                let UpdateMapEvent = new CustomEvent("GeoJSONFileURLChanged", { detail: { AppMapData: AppMapData } });
                AppUIData.formEl.dispatchEvent(UpdateMapEvent);
            }
        }
    }
    catch (error) {
        console.log("OnDirChanged catch error:", error)
    }

    //console.log("2 AppUIData.loadingImageEl = ", AppUIData.loadingImageEl)

    if (AppUIData.loadingImageEl) {
        AppUIData.loadingImageEl.style.display = "none";
    }
}

async function SubmitClicked(event) {

    event.preventDefault();
    console.log("submit button clicked....")

    if (AppUIData.formEl) {

        try {
            if (AppUIData.loadingImageEl) {
                AppUIData.loadingImageEl.style.display = "flex";
            }

            let startTime = performance.now();

            //console.log("sending request : ", AppUIData.formEl);

            let responseText = await nc_ChunkFileUploadRequests(AppUIData.formEl, AppUIData.fileInputEl);

            // console.log("1 responseText : ", responseText)

            let endTime = performance.now();

            console.log(`nc_ChunkFileUploadRequests Images took ${endTime - startTime}ms`)

            if (responseText) {
                startTime = performance.now();

                //console.log("responseText : ", responseText)

                AppMapData.geoJSONFileData = await JSON.parse(responseText);

                endTime = performance.now();

                console.log(`JSON.parse(responseText) took ${endTime - startTime}ms`)

                let UpdateMapEvent = new CustomEvent("GeoJSONFileURLChanged",
                    { detail: { AppMapData: AppMapData } });

                // ResetFileInputElement(AppUIData.fileInputEl);

                AppUIData.formEl.dispatchEvent(UpdateMapEvent);
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

function InitAppSettingsUI() {
    // Settings dialog UI

    console.log("initializing setting UI");

    LoadAppSettings();

    let settingsDialog = document.getElementsByClassName("settings-modal")[0];
    let settingsButton = document.getElementsByClassName("map-settings-button")[0];
    let mapIconSelector = document.getElementById("map-icon-selector");
    let settingsModalContentIcon = document.getElementById("settings-modal-content-icon2d");
    let settingsIconFieldset = document.getElementById("settings-form-fieldset");
    let settingsIconPreview = document.getElementById("settings-icon-2d");
    let settingsIconLegend = document.getElementById("settings-map-icon2d");
    // Get the <span> element that closes settings
    let span = document.getElementsByClassName("settings-close")[0];

    // Setup map menu bar icon commands

    if (settingsButton) {
        settingsButton.onclick = function (event) {
            event.preventDefault = true;
            let settingsDialog = document.getElementsByClassName("settings-modal")[0];
            if (!settingsDialog.style.display || settingsDialog.style.display == 'none') {
                settingsDialog.style.display = "flex";
            }
            else {
                settingsDialog.style.display = 'none';
            }
        }
    }

    // When the user clicks on <span> (x), close the modal
    if (span) {
        span.onclick = function () {
            settingsDialog.style.display = "none";
        }
    }

    mapIconSelector.value = AppMapData.appSettings.imageIcon2DType;

    switch (mapIconSelector.value) {
        case 'thumbnail':
            settingsIconPreview.src = 'images/image-thumb.png';
            break;
        case 'drone2d':
            settingsIconPreview.src = 'images/drone-icon.jpg';
            break;
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == settingsButton) { return; }

        if (settingsDialog.style.display == 'flex') {
            if ((event.target != settingsDialog) && (event.target != mapIconSelector) &&
                (event.target != settingsIconPreview) &&
                (event.target != settingsModalContentIcon) &&
                (event.target != settingsIconFieldset) &&
                (event.target != settingsIconPreview) &&
                (event.target != settingsIconLegend)) {
                settingsDialog.style.display = 'none';
            }
        }
    }

    mapIconSelector.onchange = function (event) {
        // console.log("event.target.value: ", event.target.value)

        switch (event.target.value) {
            case 'thumbnail':
                settingsIconPreview.src = 'images/image-thumb.png';
                break;
            case 'drone2d':
                settingsIconPreview.src = 'images/drone-icon.jpg';
                break;
        }

        AppMapData.appSettings.imageIcon2DType = event.target.value;

        SaveAppSettings();

        UpdateMap2D(AppMapData.geoJSONFileData);
    }
}

function SaveAppSettings() {

    if (AppMapData.appSettings) {
        let appJSONStr = JSON.stringify(AppMapData.appSettings);
        if (appJSONStr && appJSONStr.length > 0) {
            window.localStorage.setItem("server_imapper:appJSON", appJSONStr);
            //console.log("saved app settings data: ", appJSONStr);
        }
    }
}

function LoadAppSettings() {

    let appJSONStr = window.localStorage.getItem("server_imapper:appJSON");

    if (appJSONStr && appJSONStr.length > 0) {
        let localAppSettingsData = JSON.parse(appJSONStr);

        AppMapData.appSettings.droneIconType = localAppSettingsData.droneIconType;
        AppMapData.appSettings.imageIcon2DType = localAppSettingsData.imageIcon2DType;
    }
}

function ResetMap(showUserConfirm) {

    let userConfirmed = true;

    if (showUserConfirm) {
        userConfirmed = window.confirm("Do you really want to erase ALL photos from the Map?");
    }

    if (userConfirmed) {
        ResetMap2D();
        ResetMap3D();

        AppMapData.geoJSONFileData = null;
        AppMapData.imageDataArray = null;
        AppMapData.imageDataArray = [];
    }
}

function ResetFileInputElement(existingFileInputEl) {
    if (!AppUIData.formEl) return;

    let newFileInputEl = document.createElement("input");

    if (newFileInputEl) {
        newFileInputEl.setAttribute('type', 'file');
        newFileInputEl.setAttribute('id', 'file');
        newFileInputEl.setAttribute('name', 'file');
        newFileInputEl.setAttribute('class', 'map-drop-zone__input');
        newFileInputEl.setAttribute('multiple', 'true');
        newFileInputEl.setAttribute('accept', '.jpg,.png,.JPG,.PNG');
        newFileInputEl.setAttribute('hidden', 'true');

        document.replaceChild(newFileInputEl, existingFileInputEl);
        existingFileInputEl = newFileInputEl;
    }
}

