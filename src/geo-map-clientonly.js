import { AppMapData, AppUIData, UpdateMapEvent } from "./app-data.js";

// set AppUIData.clientSideOnly = true for client-side image processing
// set AppUIData.clientSideOnly = false (default) for server-side image uploading and processing
AppUIData.clientSideOnly = true;

import { InitMap2D, UpdateMap2D } from "./map-view2D.js";
import { ImageData } from "./image-data.js"
import { nc_IsFileTypeAllowed } from "./nc_file_upload_client.js";
import { ProcessImages } from "./image-processor.js"

let processingArrayCount = 0;
let resultArray = [];

const fileUploadForm = document.getElementById("uploadForm");

//console.log("fileUploadForm = ", fileUploadForm)
if (fileUploadForm) {
    fileUploadForm.addEventListener("submit", OnImageDropped);
}

// var loadingImageEl = document.getElementById("loading-image");
if (AppUIData.loadingImageEl) {
    AppUIData.loadingImageEl.style.display = "none";
}

InitSettingsUI();

const saveMapButton = document.getElementById("save-map");
const loadMapButton = document.getElementById("load-map");

if (saveMapButton) {
    saveMapButton.addEventListener("click", SaveMap);
}

if (loadMapButton) {
    loadMapButton.addEventListener("click", LoadMap);
}

function SaveMap() {
    const geoJSON = JSON.stringify(AppMapData.geoJSONFileData);
    window.localStorage.setItem("imapper:geoJSON", geoJSON);
    console.log("saved: ", geoJSON);
}

function LoadMap() {
    let geoJSON = window.localStorage.getItem("imapper:geoJSON");
    AppMapData.geoJSONFileData = JSON.parse(geoJSON);
    console.log("loaded: ", AppMapData.geoJSONFileData);

    if (AppUIData.formEl) {
        let UpdateMapEvent = new CustomEvent("GeoJSONFileURLChanged",
            { detail: { AppMapData: AppMapData } });

        if (AppUIData.loadingImageEl) {
            AppUIData.loadingImageEl.style.display = "block";
        }

        AppUIData.formEl.dispatchEvent(UpdateMapEvent);
    }
}

let canvasEl = document.createElement('canvas');
let ThumbnailReadyArray = [];

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

        console.log(`processingArrayCount: ${processingArrayCount}, ThumbnailReadyArray.length: ${ThumbnailReadyArray.length}`);

        if (processingArrayCount == (ThumbnailReadyArray.length)) {

            console.log("Updating Map...")

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
            console.log("waiting for complete results array.... ")
        }
    }
});

async function OnImageDropped(event) {

    //console.log("OnImageDropped called = ", event)

    if (fileUploadForm) {
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

function InitSettingsUI() {
    ///////////////////////////////////////////////////////////////////
    // Set up the settings button and dialog
    ///////////////////////////////////////////////////////////////////
    let settingsDialog = document.getElementById("settings-modal");
    // Get the settings open button
    let settingsButton = document.getElementById("settings-button");
    // Get the <span> element that closes settings
    let span = document.getElementsByClassName("settings-close")[0];
    let mapIconSelector = document.getElementById("map-icon-selector");
    let settingsModalContent = document.getElementById("settings-modal-content");
    let settingsModalContentIcon = document.getElementById("settings-modal-content-icon2d");
    let settingsIconFieldset = document.getElementById("settings-form-fieldset");
    let settingsIconPreview = document.getElementById("settings-icon-2d");
    let settingsIconLegend = document.getElementById("settings-map-icon2d");


    mapIconSelector.value = AppMapData.imageIcon2D;

    let settingsIcon2d = document.getElementById("settings-icon-2d");

    settingsButton.onclick = function (event) {
        event.preventDefault = true;
        settingsDialog.style.display = "block";
    }

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        settingsDialog.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == settingsButton) { return; }

        if (settingsDialog.style.display == 'block') {
            if ((event.target != settingsDialog) && (event.target != mapIconSelector) &&
                (event.target != settingsIcon2d) && (event.target != settingsModalContent) &&
                (event.target != settingsModalContentIcon) &&
                (event.target != settingsIconFieldset) &&
                (event.target != settingsIconPreview) &&
                (event.target != settingsIconLegend)) {
                settingsDialog.style.display = 'none';
            }
        }
    }

    mapIconSelector.onchange = function (event) {
        console.log("event.target.value: ", event.target.value)

        switch (event.target.value) {
            case 'thumbnail':
                settingsIcon2d.src = 'images/image-thumb.png';
                break;
            case 'drone2d':
                settingsIcon2d.src = 'images/drone-icon.jpg';
                break;
        }

        AppMapData.imageIcon2D = event.target.value;

        UpdateMap2D(AppMapData.geoJSONFileData);
    }

    ///////////////////////////////////////////////////////////////////
    // End of settings UI
    ///////////////////////////////////////////////////////////////////

}