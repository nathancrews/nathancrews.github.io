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

import { Map2D } from "./map-view2D.js";

//************************************
// Define Application Data
//************************************
export class AppUIDataClass {

    constructor() {
        this.submitButton = document.getElementById("submit-button");
        this.loadingImageEl = document.getElementById("loading-image");
        this.fileInputEl = document.getElementById("upload-files");
        this.processingArrayCount = 0;
        this.resultArray = [];
        this.canvasEl = document.createElement('canvas');
        this.ThumbnailReadyArray = [];
        this.dirInputEl = document.getElementById("directory");
        this.clientSideOnly = true;
        this.GeoJSONDataChangedEventStr = "GeoJSONDataChangedEvent";
        this.ThumbnailReadyEventStr = "ThumbnailReadyEvent";
        this.settingsUI = new AppSettingsUIClass();

        console.log("AppUIDataClass constructor called");
    }

    GarbageCollect() {
        this.processingArrayCount = 0;
        this.resultArray = [];
        this.ThumbnailReadyArray = [];
    }

    //************************************
    // Define Application Events
    //************************************

    GetGeoJSONDataChangedEvent(inAppMapData) {
        return new CustomEvent(this.GeoJSONDataChangedEventStr, { detail: { AppMapData: inAppMapData } });
    }

    GetThumbnailReadyEvent(fileImageData) {
        return new CustomEvent(this.ThumbnailReadyEventStr, { async: true, detail: { ImageData: fileImageData } });
    }
}

export class AppSettingsUIClass {

    UpdateMapIcons(event) {
        if (!event) { return }

        //console.log("event.target.value: ", event.target.value);

        let settingsIconPreview = document.getElementById("settings-icon-2d");

        switch (event.target.value) {
            case 'thumbnail':
                settingsIconPreview.src = 'images/image-thumb.png';
                break;
            case 'drone2d':
                settingsIconPreview.src = 'images/drone-icon.jpg';
                break;
        }

        if (event.target.value) {
            AppMapData.GetAppSettings().imageIcon2DType = event.target.value;
        }

        AppMapData.GetAppSettings().Save();
        Map2D.UpdateMap2D(AppMapData.geoJSONFileData);
    }

    // Settings dialog UI
    InitUI() {
        let settingsDialog = document.getElementsByClassName("settings-modal")[0];
        let settingsButton = document.getElementsByClassName("map-settings-button")[0];
        let mapIconSelector = document.getElementById("map-icon-selector");
        let settingsModalContentIcon = document.getElementById("settings-modal-content-icon2d");
        let settingsIconFieldset = document.getElementById("settings-form-fieldset");
        let settingsIconPreview = document.getElementById("settings-icon-2d");
        let settingsIconLegend = document.getElementById("settings-map-icon2d");

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

        // Get the <span> element that closes settings
        let span = document.getElementsByClassName("settings-close")[0];

        // When the user clicks on <span> (x), close the modal
        span.onclick = function () {
            settingsDialog.style.display = "none";
        }

        mapIconSelector.value = AppMapData.GetAppSettings().imageIcon2DType;

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

        mapIconSelector.onchange = this.UpdateMapIcons;
    }

    UpdateUI() {

        let mapIconSelector = document.getElementById("map-icon-selector");
        let settingsIconPreview = document.getElementById("settings-icon-2d");

        mapIconSelector.value = AppMapData.GetAppSettings().imageIcon2DType;

        switch (mapIconSelector.value) {
            case 'thumbnail':
                settingsIconPreview.src = 'images/image-thumb.png';
                break;
            case 'drone2d':
                settingsIconPreview.src = 'images/drone-icon.jpg';
                break;
        }
    }

}

class AppSettingsDataClass {
    //************************************
    // Define Constants
    //************************************
    APP_DATA_SAVE_KEY = "nc_imapper:appJSON";

    constructor() {
        this.imageIcon2DType = "thumbnail";
        this.imageIcon2DWidth = 300;
        this.imageIcon2DHeight = 350;
        this.imageIcon2DQuality = 0.25;
        this.imageIcon2DFormat = 'image/webp';
        this.imageIcon3DWidth = 64;
        this.droneIcon2D = 'images/drone-icon.jpg';
        this.allowedFileTypes = ".jpg,.png,.geojson";
        this.appSettingsUI = new AppSettingsUIClass();
    }

    GetSettingsUI(){
        return this.appSettingsUI;
    }

    Save(localStorageKey) {

        if (!localStorageKey){
            localStorageKey = this.APP_DATA_SAVE_KEY;
        }

        let appJSONStr = JSON.stringify(this);
        if (appJSONStr && appJSONStr.length > 0) {
            window.localStorage.setItem(localStorageKey, appJSONStr);
            // console.log("saved app settings data: ", appJSONStr);
        }
    }

    Load(localStorageKey) {

        if (!localStorageKey){
            localStorageKey = this.APP_DATA_SAVE_KEY;
        }

        let appJSONStr = window.localStorage.getItem(localStorageKey);

        if (appJSONStr && appJSONStr.length > 0) {
            let localAppSettingsData = JSON.parse(appJSONStr);

            this.droneIcon2D = localAppSettingsData.droneIcon2D;
            this.imageIcon2DType = localAppSettingsData.imageIcon2DType;
        }
    }
}

class AppMapDataClass {
    //************************************
    // Define Constants
    //************************************
    MAP_DATA_SAVE_KEY = "nc_imapper:geoJSON";
    MAP_APP_DATA_SAVE_KEY = "nc_imapper:geoJSONSettings";

    constructor() {
        this.appSettings = new AppSettingsDataClass();
        this.geoJSONFileData = null;
        this.defaultLatitude = 56.01877997222222;
        this.defaultLongitude = -3.7548339722222224;
        this.projectDirectory = "test_drop";
        this.baseUploadPath = "uploads/";
        this.geoJSONFileURL = "uploads/test_drop/geo-images.json";
        this.geoJSONFileName = "geo-images.json";
        this.imageDataArray = [];

        console.log("AppMapDataClass constructor called");
    }

    GetAppSettings() {
        return this.appSettings;
    }

    GarbageCollect() {
        this.geoJSONFileData = null;
        this.imageDataArray = null;
        this.imageDataArray = [];
    }
}

export let AppMapData = new AppMapDataClass();
export let AppUIData = new AppUIDataClass();
