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

AppMapData.clientSideOnly = false;

import { DropHandler } from "./map-drop-zone.js";
import { Map2D } from "./map-view2D.js";
import { Map3D } from "./map-view3D.js";
import { ChunkFileUploadRequests } from "./file_upload_client.js";


///////////////////////////////////////////////////////////////
//
// Main Image Drop Map Initialization
//
///////////////////////////////////////////////////////////////

await InitUI();

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

export async function UpdateMaps(event) {
    console.log("updating maps...");

    let startTime = performance.now();

    await Map2D.UpdateMap2D(event.detail.AppMapData.geoJSONFileData);

    let endTime = performance.now();
    console.log(`UpdateMap2D took ${endTime - startTime}ms`)

    startTime = performance.now();

    await Map3D.UpdateMap3D(event.detail.AppMapData.geoJSONFileData);

    if (AppUIData.loadingImageEl) {
        AppUIData.loadingImageEl.style.display = "none";
    }

    endTime = performance.now();
    console.log(`UpdateMap3D took ${endTime - startTime}ms`)
}

//************************************
// Attach event listeners
//************************************
async function InitUI() {

    AppUIData.clientSideOnly = false;

    AppUIData.formEl = document.getElementById("uploadForm");
    AppUIData.dirInputEl = document.getElementById("directory");
    AppUIData.loadingImageEl = document.getElementById("loading-image");
    AppUIData.fileInputEl = document.getElementById("file");

    //   console.log("InitMap2D called AppUIData2D.formEl = ", AppUIData.formEl)

    if (AppUIData.formEl) {
        AppUIData.formEl.addEventListener("GeoJSONFileURLChanged", UpdateMaps);
    }

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
    DropHandler.InitDropElements(dropElements);

    AppMapData.GetAppSettings().Load();
    AppMapData.GetAppSettings().GetSettingsUI().InitUI();

    await Map2D.InitMap2D();
    await Map2D.UpdateMap2D(AppMapData.geoJSONFileData);

    await Map3D.InitMap3D();
    await Map3D.UpdateMap3D(AppMapData.geoJSONFileData);

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

            let responseText = await ChunkFileUploadRequests(AppUIData.formEl, AppUIData.fileInputEl);

            // console.log("1 responseText : ", responseText)

            let endTime = performance.now();

            console.log(`ChunkFileUploadRequests Images took ${endTime - startTime}ms`)

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


function SaveAppSettings() {
    let appJSONStr = window.localStorage.getItem("server_imapper:appJSON");

    AppMapData.GetAppSettings().Save(appJSONStr);

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

    AppMapData.GetAppSettings().Load(appJSONStr);

    // if (appJSONStr && appJSONStr.length > 0) {
    //     let localAppSettingsData = JSON.parse(appJSONStr);

    //     AppMapData.appSettings.droneIconType = localAppSettingsData.droneIconType;
    //     AppMapData.appSettings.imageIcon2DType = localAppSettingsData.imageIcon2DType;
    // }
}

function ResetMap(showUserConfirm) {

    let userConfirmed = true;

    if (showUserConfirm) {
        userConfirmed = window.confirm("Do you really want to erase ALL photos from the Map?");
    }

    if (userConfirmed) {
        Map2D.ResetMap2D();
        Map3D.ResetMap3D();

        AppMapData.GarbageCollect();
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

