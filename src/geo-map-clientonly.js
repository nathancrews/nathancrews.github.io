import { AppMapData, AppUIData, GetGeoJSONDataChangedEvent, MAP_DATA_SAVE_KEY, APP_DATA_SAVE_KEY } from "./app-data.js";
import { InitDropElements } from "./map-drop-zone.js";
import { InitMap2D, UpdateMap2D, ResetMap2D, ResetMap2DView } from "./map-view2D.js";
import { InitMap3D, UpdateMap3D, ResetMap3D, ResetMap3DView } from "./map-view3D.js";
import { nc_IsFileTypeAllowed } from "./nc_file_upload_client.js";
import { ProcessImages } from "./image-processor.js"

await InitAppUI();

export async function UpdateMaps(event) {
    console.log("updating maps...");

    let startTime = performance.now();
    await UpdateMap2D(event.detail.AppMapData.geoJSONFileData);
    let endTime = performance.now();
    console.log(`UpdateMap2D duration ${endTime - startTime}ms`)

    startTime = performance.now();
    await UpdateMap3D(event.detail.AppMapData.geoJSONFileData);
    ShowLoadingImage(false);
    endTime = performance.now();
    console.log(`UpdateMap3D duration ${endTime - startTime}ms`)

    event.detail.AppMapData = null;
}


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


async function HandleImagesAddedEvent(event) {

    if (AppUIData.fileInputEl) {
        event.preventDefault();

        ShowLoadingImage(true);

        let startTime = performance.now();

        //console.log("AppUIData = ", AppUIData)

        let allowedFiles = AppUIData.fileInputEl.files;
        let files = [];

        // console.log("allowedFiles = ", allowedFiles)

        for (let ii = 0; ii < allowedFiles.length; ii++) {
            if (nc_IsFileTypeAllowed(allowedFiles[ii].name, AppMapData.appSettings.allowedFileTypes)) {
                // don't allow duplicate file names to be processed
                if (!findImageDataInArray(allowedFiles[ii].name, AppMapData.imageDataArray)) {
                    files.push(allowedFiles[ii]);
                }
            }
        };

        console.log("Allowed image files to process: ", files.length);

        AppUIData.processingArrayCount = files.length;

        if (files.length > 0) {
            AppUIData.resultArray = await ProcessImages(files, AppUIData.canvasEl);
            AppUIData.processingArrayCount = AppUIData.resultArray.length;
        }

        console.log("OnDrop AppUIData.processingArrayCount = ", AppUIData.processingArrayCount)

        let endTime = performance.now();

        console.log(`OnDrop ProcessImages took ${endTime - startTime}ms`)

        if (AppUIData.processingArrayCount == 0) {
            ShowLoadingImage(false);
            alert("Sorry, no valid image files with GPS data were selected OR duplicate images not procressed!");
        }
    }
}

async function HandleThumbnailReadyEvent(evt) {
    //console.log("ThumbnailReadyEvent called: ", evt);
    if (evt.detail.ImageData && AppUIData.ThumbnailReadyArray) {

        //console.log('evt.detail.imageData = ', evt.detail.ImageData);
        AppUIData.ThumbnailReadyArray.push(evt.detail.ImageData);
        // console.log(`processingArrayCount: ${processingArrayCount}, AppUIData.ThumbnailReadyArray.length: ${AppUIData.ThumbnailReadyArray.length}`);

        if (AppUIData.processingArrayCount == (AppUIData.ThumbnailReadyArray.length)) {

            //console.log("AppUIData.ThumbnailReadyArray =", AppUIData.ThumbnailReadyArray);

            AppMapData.imageDataArray = AppMapData.imageDataArray.concat(AppUIData.ThumbnailReadyArray);
            
            //console.log("AppMapData.imageDataArray =", AppMapData.imageDataArray);

            let geoJSONval = GeoJSON.parse(AppMapData.imageDataArray, { Point: ['lat', 'lng', 'elevation'] });
            //console.log("result geoJSONval = ", geoJSONval)

            if (geoJSONval) {
                AppMapData.geoJSONFileData = geoJSONval;

                let UpdateMapEvent = GetGeoJSONDataChangedEvent(AppMapData);

                if (UpdateMapEvent) {
                    AppUIData.submitButton.dispatchEvent(UpdateMapEvent);
                }
            }

            ShowLoadingImage(false);
            // clear the array and count for the next drop operation
            AppUIData.ThumbnailReadyArray = null;
            AppUIData.ThumbnailReadyArray = [];
            AppUIData.resultArray = null;
            AppUIData.resultArray = [];
            AppUIData.processingArrayCount = 0;
        }
        else {
            // console.log("waiting for complete results array.... ")
        }
    }
}

async function InitAppUI() {

    ShowLoadingImage(false);

    ///////////////////////////////////////////////////////////
    // Set up both drop event and user choosing files manually
    // critial: without these two elements and events, nothing works!
    ///////////////////////////////////////////////////////////

    // This DROP (on class map-drop-zone) message handler calls this 
    // event to load the dropped files.
    AppUIData.submitButton = document.getElementById("submit-button");
    if (AppUIData.submitButton) {
        AppUIData.submitButton.addEventListener("click", HandleImagesAddedEvent);
        AppUIData.submitButton.addEventListener(AppUIData.GeoJSONDataChangedEventStr, UpdateMaps);
    }

    // this element is passed to the image processor and calls the callback when complete
    if (AppUIData.canvasEl) {
        AppUIData.canvasEl.addEventListener(AppUIData.ThumbnailReadyEventStr, HandleThumbnailReadyEvent);
    }

    // This CHANGE message handler loads the user choosen files
    AppUIData.fileInputEl = document.getElementById("upload-files");

    if (AppUIData.fileInputEl) {
        AppUIData.fileInputEl.onchange = function (event) {
            event.preventDefault();

            HandleImagesAddedEvent(event);
        };
    }
    ///////////////////////////////////////////////////////////

    // set up the map drop event elements
    let dropElements = document.querySelectorAll(".map-drop-zone");
    InitDropElements(dropElements);

    // Get the settings open button
    let settingsButton = document.getElementsByClassName("map-settings-button")[0];

    // Setup map menu bar icon commands

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

    let mapMenu = document.getElementById("map-menu");

    if (mapMenu) {
        mapMenu.onclick = function (event) {
            event.preventDefault = true;

            let mapMenuBars = document.getElementsByClassName("map-menu-bar");
            for (let ii = 0; ii < mapMenuBars.length; ii++) {
                if (!mapMenuBars[ii].style.display || mapMenuBars[ii].style.display === "flex") {
                    mapMenuBars[ii].style.display = "none";
                }
                else {
                    mapMenuBars[ii].style.display = "flex";
                }
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

    // Settings dialog UI
    InitAppSettingsUI();

    await InitMap2D();
    await InitMap3D();

    await Show2D(null);
}

function InitAppSettingsUI() {
    // Settings dialog UI

    let settingsDialog = document.getElementsByClassName("settings-modal")[0];
    let settingsButton = document.getElementsByClassName("map-settings-button")[0];
    let mapIconSelector = document.getElementById("map-icon-selector");
    let settingsModalContentIcon = document.getElementById("settings-modal-content-icon2d");
    let settingsIconFieldset = document.getElementById("settings-form-fieldset");
    let settingsIconPreview = document.getElementById("settings-icon-2d");
    let settingsIconLegend = document.getElementById("settings-map-icon2d");

    LoadAppSettings();

    // Get the <span> element that closes settings
    let span = document.getElementsByClassName("settings-close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        settingsDialog.style.display = "none";
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

function ShowLoadingImage(setVisible) {

    if (AppUIData && AppUIData.loadingImageEl) {
        if (setVisible) {
            AppUIData.loadingImageEl.style.display = "block";
        }
        else {
            AppUIData.loadingImageEl.style.display = "none";
        }
    }
}

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

        if (AppUIData) {
            AppUIData.ThumbnailReadyArray = null;
            AppUIData.ThumbnailReadyArray = [];
            AppUIData.resultArray = null;
            AppUIData.resultArray = [];
            AppUIData.processingArrayCount = 0;
        }
    }
}

function SaveAppSettings() {

    if (AppMapData.appSettings) {
        let appJSONStr = JSON.stringify(AppMapData.appSettings);
        if (appJSONStr && appJSONStr.length > 0) {
            window.localStorage.setItem(APP_DATA_SAVE_KEY, appJSONStr);
            //console.log("saved app settings data: ", appJSONStr);
        }
    }
}

function LoadAppSettings() {

    let appJSONStr = window.localStorage.getItem(APP_DATA_SAVE_KEY);

    if (appJSONStr && appJSONStr.length > 0) {
        let localAppSettingsData = JSON.parse(appJSONStr);

        AppMapData.appSettings.droneIconType = localAppSettingsData.droneIconType;
        AppMapData.appSettings.imageIcon2DType = localAppSettingsData.imageIcon2DType;
    }
}


function SaveMap() {
    try {
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

                geoJSONStr = null;
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

        LoadAppSettings();
        InitAppSettingsUI();

        let geoJSONStr = window.localStorage.getItem(MAP_DATA_SAVE_KEY);

        if (geoJSONStr) {

            console.log(`Map load geoJSON size: ${(geoJSONStr.length / 1024) * 2} kb`);

            ResetMap(false);

            AppMapData.geoJSONFileData = JSON.parse(geoJSONStr);

            if (AppMapData.geoJSONFileData && AppUIData.submitButton) {

                ShowLoadingImage(true);

                let UpdateMapEvent = GetGeoJSONDataChangedEvent(AppMapData);

                if (UpdateMapEvent) {
                    AppUIData.submitButton.dispatchEvent(UpdateMapEvent);
                }
            }
            else {
                window.alert("ERROR, loading local map data.");
            }

            geoJSONStr = null;
        }
        else {
            window.alert("Sorry, there is no local map data to load.");
        }
    }
    catch (error) {
        console.log("Error loading map data: ", error);
        window.alert(`:( ${error} unable to load map data`)
    }
}

