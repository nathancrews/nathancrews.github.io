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

        console.log('evt.detail.imageData = ', evt.detail.ImageData);

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