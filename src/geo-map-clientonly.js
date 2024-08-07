import { AppMapData, AppUIData, UpdateMapEvent } from "./app-data.js";

// set AppUIData.clientSideOnly = true for client-side image processing
// set AppUIData.clientSideOnly = false (default) for server-side image uploading and processing
AppUIData.clientSideOnly = true;

import { UpdateMap2D, ResetMap2D, ResetMap2DView } from "./map-view2D.js";
import { UpdateMap3D, ResetMap3D, ResetMap3DView } from "./map-view3D.js";
import { ImageData } from "./image-data.js"
import { nc_IsFileTypeAllowed } from "./nc_file_upload_client.js";
import { ProcessImages } from "./image-processor.js"

const MAP_DATA_SAVE_KEY = "nc_imapper:geoJSON";
const APP_DATA_SAVE_KEY = "nc_imapper:appJSON";

let processingArrayCount = 0;
let resultArray = [];
let canvasEl = document.createElement('canvas');
let ThumbnailReadyArray = [];

const fileUploadForm = document.getElementById("uploadForm");

//console.log("fileUploadForm = ", fileUploadForm)
if (fileUploadForm) {
    fileUploadForm.addEventListener("submit", OnImageDropped);
}

InitAppUI();


function findImageDataInArray(nameStr, imageArray) {
    let existsInArray = false;

    for (let ii = 0; ii < imageArray.length; ii++) {
        if (nameStr === imageArray[ii].name) {
            existsInArray = true;
            break;
        }
    }
    return existsInArray;
}

canvasEl.addEventListener("ThumbnailReadyEvent", (evt) => {

    //  console.log("ThumbnailReadyEvent called: ", evt);

    if (evt.detail.ImageData) {

        //console.log('evt.detail.imageData = ', evt.detail.ImageData);

        if (evt.detail.ImageData) {
            ThumbnailReadyArray.push(evt.detail.ImageData);
        }

        //        console.log(`processingArrayCount: ${processingArrayCount}, ThumbnailReadyArray.length: ${ThumbnailReadyArray.length}`);

        if (processingArrayCount == (ThumbnailReadyArray.length)) {

            //            console.log("Updating Map...")

            AppMapData.imageDataArray = AppMapData.imageDataArray.concat(ThumbnailReadyArray);

            // console.log("AppMapData.imageDataArray =", AppMapData.imageDataArray);

            let geoJSONval = GeoJSON.parse(AppMapData.imageDataArray, { Point: ['lat', 'lng', 'elevation'] });

            //console.log("result geoJSONval = ", geoJSONval)

            AppMapData.geoJSONFileData = geoJSONval;

            let UpdateMapEvent = new CustomEvent("GeoJSONFileURLChanged",
                { detail: { AppMapData: AppMapData } });

            AppUIData.formEl.dispatchEvent(UpdateMapEvent);

            if (AppUIData.loadingImageEl) {
                AppUIData.loadingImageEl.style.display = "none";
            }

            // clear the array and count for the next drop operation
            ThumbnailReadyArray = [];
            processingArrayCount = 0;
        }
        else {
            // console.log("waiting for complete results array.... ")
        }
    }
});

async function OnImageDropped(event) {

    //console.log("OnImageDropped called = ", event)

    if (fileUploadForm && AppUIData.fileInputEl) {
        event.preventDefault();

        if (AppUIData.loadingImageEl) {
            AppUIData.loadingImageEl.style.display = "flex";
        }

        let startTime = performance.now();

        //console.log("AppUIData = ", AppUIData)

        let allowedFiles = AppUIData.fileInputEl.files;
        let files = [];

        // console.log("allowedFiles = ", allowedFiles)

        for (let ii = 0; ii < allowedFiles.length; ii++) {
            if (nc_IsFileTypeAllowed(allowedFiles[ii].name, AppUIData.allowedFileTypes)) {
                // don't allow duplicate file names to be processed
                if (!findImageDataInArray(allowedFiles[ii].name, AppMapData.imageDataArray)) {
                    files.push(allowedFiles[ii]);
                }
            }
        };

        console.log("Allowed image files to process: ", files.length);

        processingArrayCount = files.length;

        if (files.length > 0) {
            resultArray = await ProcessImages(files, canvasEl);
            processingArrayCount = resultArray.length;
        }

        //                console.log("clicked result resultArray = ", resultArray)
        console.log("OnDrop processingArrayCount = ", processingArrayCount)

        let endTime = performance.now();

        console.log(`OnDrop ProcessImages took ${endTime - startTime}ms`)

        if (processingArrayCount == 0) {
            if (AppUIData.loadingImageEl) {
                AppUIData.loadingImageEl.style.display = "none";
            }
            alert("Sorry, no valid image files with GPS data were selected OR duplicate images not procressed!");
        }
    }
}

function InitAppUI() {

    // var loadingImageEl = document.getElementById("loading-image");
    if (AppUIData.loadingImageEl) {
        AppUIData.loadingImageEl.style.display = "none";
    }

    ///////////////////////////////////////////////////////////////////
    // Set up the settings button and dialog
    ///////////////////////////////////////////////////////////////////
    let settingsDialog = document.getElementById("settings-modal");
    // Get the settings open button
    let settingsButton = document.getElementById("settings-button");
    // Get the <span> element that closes settings
    let span = document.getElementsByClassName("settings-close")[0];

    // Setup map menu bar icon commands

    settingsButton.onclick = function (event) {
        event.preventDefault = true;
        settingsDialog.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        settingsDialog.style.display = "none";
    }

    let mapMenu = document.getElementById("map-menu");
    let mapMenuBar = document.getElementById("map-menu-bar");

    if (mapMenu && mapMenuBar) {
        mapMenu.onclick = function (event) {
            event.preventDefault = true;

            if (!mapMenuBar.style.display || mapMenuBar.style.display === "flex") {
                mapMenuBar.style.display = "none";
            }
            else {
                mapMenuBar.style.display = "flex";
            }
        }
    }

    const saveMapButton = document.getElementById("save-map");
    const loadMapButton = document.getElementById("load-map");

    if (saveMapButton) {
        saveMapButton.addEventListener("click", SaveMap);
    }

    if (loadMapButton) {
        loadMapButton.addEventListener("click", LoadMap);
    }

    let view2D_button_el = document.getElementById("view2d");
    let view3D_button_el = document.getElementById("view3d");

    if (view2D_button_el) {
        view2D_button_el.addEventListener('click', Show2D);
    }
    if (view3D_button_el) {
        view3D_button_el.addEventListener('click', Show3D);
    }

    const resetMapButton = document.getElementById("reset-map");
    if (resetMapButton) {
        resetMapButton.addEventListener('click', ResetMap);
    }

    AppUIData.fileInputEl = document.getElementById("upload-files");

    AppUIData.fileInputEl.onchange = function (event) {
        event.preventDefault();

        OnImageDropped(event);
    };

    // Settings dialog UI
    InitAppSettingsUI();

    Show2D(null);
}

function InitAppSettingsUI() {
    // Settings dialog UI

    let settingsDialog = document.getElementById("settings-modal");
    let settingsButton = document.getElementById("settings-button");
    let mapIconSelector = document.getElementById("map-icon-selector");
    let settingsModalContent = document.getElementById("settings-modal-content");
    let settingsModalContentIcon = document.getElementById("settings-modal-content-icon2d");
    let settingsIconFieldset = document.getElementById("settings-form-fieldset");
    let settingsIconPreview = document.getElementById("settings-icon-2d");
    let settingsIconLegend = document.getElementById("settings-map-icon2d");

    LoadAppSettings();

    mapIconSelector.value = AppMapData.appSettings.imageIcon2D;

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

        if (settingsDialog.style.display == 'block') {
            if ((event.target != settingsDialog) && (event.target != mapIconSelector) &&
                (event.target != settingsIconPreview) && (event.target != settingsModalContent) &&
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

        AppMapData.appSettings.imageIcon2D = event.target.value;

        SaveAppSettings();

        UpdateMap2D(AppMapData.geoJSONFileData);
    }
}

function Show2D(event) {
    let map2D_div_el = document.getElementById("map2d");
    let map3D_div_el = document.getElementById("map3d");

    if (map2D_div_el && map3D_div_el) {
        map3D_div_el.style.display = "none";
        map2D_div_el.style.display = "block";
        ResetMap2DView();
        console.log("view set to 2D");
    }
}

function Show3D(event) {
    let map2D_div_el = document.getElementById("map2d");
    let map3D_div_el = document.getElementById("map3d");

    if (map2D_div_el && map3D_div_el) {
        map2D_div_el.style.display = "none";
        map3D_div_el.style.display = "block";
        ResetMap3DView();
        console.log("view set to 3D");
    }
}

async function ResetMap() {

    if (window.confirm("Do you really want to erase ALL photos from the Map?")) {

        await ResetMap2D();
        await ResetMap3D();

        AppMapData.geoJSONFileData = null;
        AppMapData.imageDataArray = [];

        if (AppUIData.fileInputEl) {

        }
    }

}

function SaveAppSettings() {
    if (AppMapData.appSettings) {
        let appJSONStr = JSON.stringify(AppMapData.appSettings);
        if (appJSONStr && appJSONStr.length > 0) {
            window.localStorage.setItem(APP_DATA_SAVE_KEY, appJSONStr);
            console.log("saved app settings data: ", appJSONStr);
        }
    }
}

function LoadAppSettings() {
    let appJSONStr = window.localStorage.getItem(APP_DATA_SAVE_KEY);

    if (appJSONStr && appJSONStr.length > 0) {
        let localAppSettingsData = JSON.parse(appJSONStr);

        AppMapData.appSettings.droneIcon = localAppSettingsData.droneIcon;
        AppMapData.appSettings.imageIcon2D = localAppSettingsData.imageIcon2D;
    }
}


function SaveMap() {
    try {
        //        console.log("AppMapData.geoJSONFileData = ", AppMapData.geoJSONFileData);
        let maxSingleLength = 5200000 - 1;

        SaveAppSettings();

        if (AppMapData.geoJSONFileData) {
            const geoJSONStr = JSON.stringify(AppMapData.geoJSONFileData);

            if (geoJSONStr) {

                let saveLength = geoJSONStr.length;
                console.log(`Map save geoJSON size: ${(saveLength / 1024 * 2)} kb`);

                if (saveLength > maxSingleLength) {
                    window.alert(":( Map size too large to save locally, try reducing the number of photos.")
                }
                else {
                    window.localStorage.setItem(MAP_DATA_SAVE_KEY, geoJSONStr);
                    window.alert("SUCCESS, Map data saved locally");
                }
            }
            else {
                window.alert("Sorry, there was no map data saved.");
            }
        }
        else {
            window.alert("Sorry, there is no map data to save. Try adding another photo.");
        }

    }
    catch (error) {
        console.log("Error map data to large to save: ", error);
        window.alert(":( ERROR map data to large to save: ", error);
    }
}

function LoadMap() {
    try {
        let maxSingleLength = 5200000 - 1;
        let maxLocalStr = "";

        LoadAppSettings();
        InitAppSettingsUI();

        let geoJSONStr = window.localStorage.getItem(MAP_DATA_SAVE_KEY);

        if (geoJSONStr) {

            console.log(`Map load geoJSON size: ${(geoJSONStr.length / 1024) * 2} kb`);

            AppMapData.geoJSONFileData = JSON.parse(geoJSONStr);

            if (AppMapData.geoJSONFileData) {
                if (AppUIData.formEl) {
                    let UpdateMapEvent = new CustomEvent("GeoJSONFileURLChanged",
                        { detail: { AppMapData: AppMapData } });

                    if (AppUIData.loadingImageEl) {
                        AppUIData.loadingImageEl.style.display = "block";
                    }

                    if (UpdateMapEvent) {
                        AppUIData.formEl.dispatchEvent(UpdateMapEvent);
                    }
                }
            }
        }
        else {
            window.alert("Sorry, there is no local map data to load");
        }

    }
    catch (error) {
        console.log("Error loading map data: ", error);
        window.alert(`:( ${error} unable to load map data`)
    }
}

