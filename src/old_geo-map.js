import { AppMapData, AppUIData, UpdateMapEvent } from "./app-data.js";
import { InitDropElements } from "./map-drop-zone.js";
import { InitMap2D, UpdateMap2D } from "./map-view2D.js";
import { InitMap3D, UpdateMap3D } from "./map-view3D.js";
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

    AppUIData.formEl = document.getElementById("uploadForm");
    AppUIData.dirInputEl = document.getElementById("directory");
    AppUIData.loadingImageEl = document.getElementById("loading-image");
    AppUIData.fileInputEl = document.getElementById("upload-files");

    console.log("InitMap2D called AppUIData2D.formEl = ", AppUIData.formEl)

    if (AppUIData.formEl && AppUIData.clientSideOnly == false) {
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

            const responseText = await nc_ChunkFileUploadRequests(AppUIData.formEl, AppUIData.fileInputEl);

            let endTime = performance.now();

            console.log(`nc_ChunkFileUploadRequests Images took ${endTime - startTime}ms`)

            if (responseText) {
                startTime = performance.now();

                AppMapData.geoJSONFileData = await JSON.parse(responseText);
                
                endTime = performance.now();

                console.log(`JSON.parse(responseText) took ${endTime - startTime}ms`)

                let UpdateMapEvent = new CustomEvent("GeoJSONFileURLChanged",
                    { detail: { AppMapData: AppMapData } });

                if (AppUIData.clientSideOnly == false) {
                    ResetFileInputElement(AppUIData.fileInputEl);
                }

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

function ResetFileInputElement(existingFileInputEl) {
    if (!AppUIData.formEl) return;

    let newFileInputEl = document.createElement("input");

    if (newFileInputEl) {
        newFileInputEl.setAttribute('type', 'file');
        newFileInputEl.setAttribute('id', 'upload-files');
        newFileInputEl.setAttribute('name', 'file');
        newFileInputEl.setAttribute('class', 'map-drop-zone__input');
        newFileInputEl.setAttribute('multiple', 'true');
        newFileInputEl.setAttribute('accept', '.jpg,.png,.JPG,.PNG');
        newFileInputEl.setAttribute('hidden', 'true');

        AppUIData.formEl.replaceChild(newFileInputEl, existingFileInputEl);
        existingFileInputEl = newFileInputEl;
    }
}

export async function LoadGeoJSONFile(jsonFileURL) {
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


