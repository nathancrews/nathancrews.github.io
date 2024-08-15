////////////////////////////////////////////////////////////////////////////////////
// Copyright 2023-2024 Nathan C. Crews IV
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its
//    contributors may be used to endorse or promote products derived from
//    this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
////////////////////////////////////////////////////////////////////////////////////

import { AppMapData, AppUIData } from "./app-data.js";
import { AppSettings } from "./app-settings.js";
import { MessageUI } from "./message-ui.js";
import { DropHandler } from "./map-drop-zone.js";
import { Map2D } from "./map-view2D.js";
import { Map3D } from "./map-view3D.js";
import { FileUtils } from "./file-utils.js";
import { ImageProcessor } from "./image-processor.js"

await InitAppUI();

export async function UpdateMaps(event) {
    console.log("updating maps...");

    let startTime = performance.now();
    await Map2D.UpdateMap2D(event.detail.AppMapData.geoJSONFileData);
    let endTime = performance.now();
    console.log(`UpdateMap2D duration ${endTime - startTime}ms`)

    startTime = performance.now();
    await Map3D.UpdateMap3D(event.detail.AppMapData.geoJSONFileData);
    ShowLoadingImage(false);
    endTime = performance.now();
    console.log(`UpdateMap3D duration ${endTime - startTime}ms`)

    event.detail.AppMapData = null;
}


function FindImageNameInArray(nameStr, imageArray) {
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

        //console.log("AppUIData = ", AppUIData)

        let allowedFiles = AppUIData.fileInputEl.files;
        let files = [];

        // console.log("allowedFiles = ", allowedFiles)

        for (let ii = 0; ii < allowedFiles.length; ii++) {
            if (FileUtils.IsFileTypeAllowed(allowedFiles[ii].name, AppSettings.allowedFileTypes)) {
                // don't allow duplicate file names to be processed
                if (!FindImageNameInArray(allowedFiles[ii].name, AppMapData.imageDataArray)) {
                    files.push(allowedFiles[ii]);
                }
            }
        };

        //console.log("Allowed image files to process: ", files.length);

        AppUIData.processingArrayCount = files.length;

        if (files.length > 0) {
            AppUIData.resultArray = await ImageProcessor.ProcessImages(files, AppUIData.canvasEl);
            AppUIData.processingArrayCount = AppUIData.resultArray.length;
        }

        //console.log("OnDrop AppUIData.processingArrayCount = ", AppUIData.processingArrayCount)

        if (AppUIData.processingArrayCount == 0) {
            ShowLoadingImage(false);
            alert("Sorry, no valid image files with GPS data were selected OR duplicate images not procressed!");
        }
    }
}

async function HandleThumbnailReadyEvent(evt) {
    //console.log("ThumbnailReadyEvent called: ", evt);
    if (evt.detail.ImageData && AppUIData.thumbnailReadyArray) {

        AppUIData.thumbnailReadyArray.push(evt.detail.ImageData);

        if (AppUIData.processingArrayCount == (AppUIData.thumbnailReadyArray.length)) {

            AppMapData.imageDataArray = AppMapData.imageDataArray.concat(AppUIData.thumbnailReadyArray);

            let geoJSONval = GeoJSON.parse(AppMapData.imageDataArray, { Point: ['lat', 'lng', 'elevation'] });

            if (geoJSONval) {
                AppMapData.geoJSONFileData = geoJSONval;

                let UpdateMapEvent = AppUIData.GetGeoJSONDataChangedEvent(AppMapData);

                if (UpdateMapEvent) {
                    AppUIData.submitButton.dispatchEvent(UpdateMapEvent);
                }
            }

            ShowLoadingImage(false);
            // clear the array and count for the next drop operation
            AppUIData.GarbageCollect();
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

    let fileInputButtonClass = 'map-drop-zone__input';
    let submitButtonClass = 'map-drop-submit-button';

    // This DROP (on class map-drop-zone) message handler calls this 
    // event to load the dropped files.
    AppUIData.submitButton = document.getElementsByClassName(submitButtonClass)[0];
    if (AppUIData.submitButton) {
        AppUIData.submitButton.addEventListener("click", HandleImagesAddedEvent);
        AppUIData.submitButton.addEventListener(AppUIData.GeoJSONDataChangedEventStr, UpdateMaps);
    }

    // this element is passed to the image processor and calls the callback when complete
    if (AppUIData.canvasEl) {
        AppUIData.canvasEl.addEventListener(AppUIData.ThumbnailReadyEventStr, HandleThumbnailReadyEvent);
    }

    // This CHANGE message handler loads the user choosen files
    AppUIData.fileInputEl = document.getElementsByClassName(fileInputButtonClass)[0];

    if (AppUIData.fileInputEl) {
        AppUIData.fileInputEl.onchange = function (event) {
            event.preventDefault();
            HandleImagesAddedEvent(event);
        };
    }

    ///////////////////////////////////////////////////////////

    // setup the map drop event elements
    DropHandler.SetDropOnElementClass('map-drop-zone');
    DropHandler.SetDropOverEventClass('map-drop-zone--over');
    DropHandler.SetFileInputButtonClass(fileInputButtonClass);
    DropHandler.SetSubmitButtonClass(submitButtonClass);
    DropHandler.InitDropHandler();

    // Get the settings open button
    let settingsButton = document.getElementsByClassName('map-settings-button')[0];

    // Settings dialog UI, send the parent button for NON-click handling
    AppSettings.GetSettingsUI().InitUI(settingsButton);

    // Setup map menu bar icon commands

    function SettingsButtonClickEvent(event) {
        event.preventDefault = true;
        AppSettings.GetSettingsUI().ShowDialog();
    }

    settingsButton.onclick = SettingsButtonClickEvent;

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
        resetMapButton.addEventListener('click', OnResetMapButtonClick);
    }

    await Map2D.InitMap2D();
    await Map3D.InitMap3D();

    await Show2D(null);
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
        await Map2D.ResetMap2DView();
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
        await Map3D.ResetMap3DView();
        console.log("view set to 3D");
    }
}

function OnResetMapButtonClick() {
    MessageUI.ShowMessage("Photo Mapper", "Do you really want to erase ALL photos from the Map?", ResetMap);
}

async function ResetMap() {

    await Map2D.ResetMap2D();
    await Map3D.ResetMap3D();

    AppMapData.GarbageCollect();
    AppUIData.GarbageCollect();
}

function SaveMap() {
    try {
        let maxSingleLength = 5200000 - 1;

        AppSettings.Save(AppMapData.MAP_APP_DATA_SAVE_KEY);

        if (AppMapData.geoJSONFileData) {
            let geoJSONStr = JSON.stringify(AppMapData.geoJSONFileData);

            if (geoJSONStr) {

                let saveLength = geoJSONStr.length;
                console.log(`Map save geoJSON size: ${(saveLength / 1024 * 2)} kb`);

                if (saveLength > maxSingleLength) {
                    MessageUI.ShowMessage("Photo Mapper", ":( Map size too large to save locally, try reducing the number of photos.", null);
                    // window.alert(":( Map size too large to save locally, try reducing the number of photos.")
                }
                else {
                    window.localStorage.setItem(AppMapData.MAP_DATA_SAVE_KEY, geoJSONStr);

                    MessageUI.ShowMessage("Photo Mapper", "SUCCESS, Map data saved locally", null);
                    //window.alert("SUCCESS, Map data saved locally");
                }

                geoJSONStr = null;
            }
            else {
               // window.alert("Sorry, there was no map data saved.");
                MessageUI.ShowMessage("Photo Mapper", "Sorry, there was no map data saved.", null);
            }
        }
        else {
            MessageUI.ShowMessage("Photo Mapper", "Sorry, there is no map data to save. Try adding another photo.", null);
            //window.alert("Sorry, there is no map data to save. Try adding another photo.");
        }
    }
    catch (error) {
        console.log("Error map data to large to save: ", error);
        MessageUI.ShowMessage("Photo Mapper", ":( ERROR map data to large to save: ", null);
        //window.alert(":( ERROR map data to large to save: ", error);
    }
}

function LoadMap() {

    try {

        // load specially saved app settings for map
        AppSettings.Load(AppMapData.MAP_APP_DATA_SAVE_KEY);
        AppSettings.Save();

        AppSettings.GetSettingsUI().UpdateUI();

        let geoJSONStr = window.localStorage.getItem(AppMapData.MAP_DATA_SAVE_KEY);

        if (geoJSONStr) {

            console.log(`Map load geoJSON size: ${(geoJSONStr.length / 1024) * 2} kb`);

            ResetMap(false);

            AppMapData.geoJSONFileData = JSON.parse(geoJSONStr);

            if (AppMapData.geoJSONFileData && AppUIData.submitButton) {

                ShowLoadingImage(true);

                let UpdateMapEvent = AppUIData.GetGeoJSONDataChangedEvent(AppMapData);

                if (UpdateMapEvent) {
                    AppUIData.submitButton.dispatchEvent(UpdateMapEvent);
                }
            }
            else {
                //window.alert("ERROR, loading local map data.");
                MessageUI.ShowMessage("Photo Mapper", "ERROR, loading local map data.", null);
            }

            geoJSONStr = null;
        }
        else {
           // window.alert("Sorry, there is no local map data to load.");
            MessageUI.ShowMessage("Photo Mapper", "Sorry, there is no local map data to load.", null);
        }
    }
    catch (error) {
        console.log("Error loading map data: ", error);
        MessageUI.ShowMessage("Photo Mapper", `:( ${error} unable to load map data`, null);
       // window.alert(`:( ${error} unable to load map data`)
    }
}

