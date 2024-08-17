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

export class AppSettingsUIClass {

    _settingsDialog = null;
    _mapIconSelector = null;
    _settingsIconPreview = null;
    _settingsMapName = null;
    _close = null;
    _inParentButton = null;

    constructor() {
        this._settingsDialog = document.getElementsByClassName("settings-modal")[0];
        this._mapIconSelector = document.getElementById("settings-map-icon-selector");
        this._settingsIconPreview = document.getElementById("settings-icon-2d");
        this._settingsMapName = document.getElementById("settings-map-name");
        this._close = document.getElementsByClassName("settings-close")[0];

        console.log("AppSettingsUIClass constructor called");
    }

    UpdateMapIcons(event) {
        if (!event) { return; }

        //console.log("event.target.value: ", event.target.value);

        switch (event.target.value) {
            case 'thumbnail':
                AppSettings.GetSettingsUI()._settingsIconPreview.src = 'images/image-thumb.png';
                break;
            case 'drone2d':
                AppSettings.GetSettingsUI()._settingsIconPreview.src = 'images/drone-icon.jpg';
                break;
        }

        if (event.target.value) {
            AppSettings.imageIcon2DType = event.target.value;
        }

        AppSettings.Save();
        Map2D.RedrawMap2D();
    }

    UpdateMapName(event) {
        // not trapping the enter key causes the page to reload!!!!
        if ((event instanceof KeyboardEvent) && event.key == "Enter" ) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }

        if (event.target && event.target.value) {
            AppSettings.mapName = event.target.value;
        }
    }

    // Settings dialog UI

    CloseDialogEvent(event) {
        AppSettings.GetSettingsUI()._settingsDialog.style.display = "none";
        AppSettings.Save();
    }

    ShowDialog() {
        // console.log("settingsDialog.style.display: ", this._settingsDialog.style.display);

        if (!this._settingsDialog.style.display || this._settingsDialog.style.display == 'none') {
            this._settingsDialog.style.display = "flex";
        }
        else {
            this._settingsDialog.style.display = 'none';
        }

    }

    HideDialog() {
        this._settingsDialog.style.display = 'none';
    }


    InitUI(inParentButton) {

        this._inParentButton = inParentButton;

        AppSettings.Load();

        // When the user clicks on <span> (x), close the modal
        this._close.onclick = this.CloseDialogEvent;

        if (this._settingsMapName){
            this._settingsMapName.value = AppSettings.mapName;
        }
        
        if (this._mapIconSelector){
            this._mapIconSelector.value = AppSettings.imageIcon2DType;
        }
        

        switch (this._mapIconSelector.value) {
            case 'thumbnail':
                this._settingsIconPreview.src = 'images/image-thumb.png';
                break;
            case 'drone2d':
                this._settingsIconPreview.src = 'images/drone-icon.jpg';
                break;
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {
            let settingsFound = false;
            if (event.target.classList) {
                for (let ii=0; ii < event.target.classList.length; ii++){
                    if (event.target.classList[ii].indexOf("setting") != -1){
                        settingsFound = true;
                        break;
                    }
                }
            }

            if (settingsFound == false) {
                AppSettings.GetSettingsUI().HideDialog();
            }
        }

        AppSettings.GetSettingsUI()._mapIconSelector.onchange = this.UpdateMapIcons;
        AppSettings.GetSettingsUI()._settingsMapName.onchange = this.UpdateMapName;
        AppSettings.GetSettingsUI()._settingsMapName.onkeydown = this.UpdateMapName;
    }

    UpdateUI() {

        if (this._settingsMapName){
            this._settingsMapName.value = AppSettings.mapName;
        }
        
        if (this._mapIconSelector){
            this._mapIconSelector.value = AppSettings.imageIcon2DType;
        }
        switch (this._mapIconSelector.value) {
            case 'thumbnail':
                this._settingsIconPreview.src = 'images/image-thumb.png';
                break;
            case 'drone2d':
                this._settingsIconPreview.src = 'images/drone-icon.jpg';
                break;
        }
    }

}

export class AppSettingsDataClass {
    //************************************
    // Define Constants
    //************************************
    APP_DATA_SAVE_KEY = "nc_imapper:appJSON";

    constructor() {
        this.mapName = "PhotoMap";
        this.imageIcon2DType = "thumbnail";
        this.thumbnailImageWidth = 300;
        this.thumbnailImageHeight = 350;
        this.imageIcon2DQuality = 0.5;
        this.imageIcon2DFormat = 'image/webp';
        this.imageIcon3DWidth = 64;
        this.droneIcon2D = 'images/drone-icon.jpg';
        this.allowedFileTypes = ".jpg,.png,.geojson";
        this.appSettingsUI = new AppSettingsUIClass();

        console.log("AppSettingsDataClass constructor called");
    }

    GetSettingsUI() {
        return this.appSettingsUI;
    }

    Save(localStorageKey) {

        if (!localStorageKey) {
            localStorageKey = this.APP_DATA_SAVE_KEY;
        }

        let appJSONStr = JSON.stringify(this);
        if (appJSONStr && appJSONStr.length > 0) {
            window.localStorage.setItem(localStorageKey, appJSONStr);
            // console.log("saved app settings data: ", appJSONStr);
        }
    }

    Load(localStorageKey) {

        if (!localStorageKey) {
            localStorageKey = this.APP_DATA_SAVE_KEY;
        }

        let appJSONStr = window.localStorage.getItem(localStorageKey);

        if (appJSONStr && appJSONStr.length > 0) {
            let localAppSettingsData = JSON.parse(appJSONStr);

            if (localAppSettingsData.mapName && localAppSettingsData.mapName != undefined) {
                this.mapName = localAppSettingsData.mapName;
            }

            this.droneIcon2D = localAppSettingsData.droneIcon2D;
            this.imageIcon2DType = localAppSettingsData.imageIcon2DType;

            //console.log("loaded app settings data: ", this);
        }
    }
}

export let AppSettings = new AppSettingsDataClass();