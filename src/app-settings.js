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
    _settingsModalContentIcon = null;
    _settingsIconFieldset = null;
    _settingsIconPreview = null;
    _settingsIconLegend = null;
    _span = null;
    _inParentButton = null;

    constructor() {
        this._settingsDialog = document.getElementsByClassName("settings-modal")[0];
        this._mapIconSelector = document.getElementById("map-icon-selector");
        this._settingsModalContentIcon = document.getElementById("settings-modal-content-icon2d");
        this._settingsIconFieldset = document.getElementById("settings-form-fieldset");
        this._settingsIconPreview = document.getElementById("settings-icon-2d");
        this._settingsIconLegend = document.getElementById("settings-map-icon2d");
        this._span = document.getElementsByClassName("settings-close")[0];

        console.log("AppSettingsUIClass constructor called");
    }

    UpdateMapIcons(event) {
        if (!event) { return }

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

    // Settings dialog UI

    CloseDialogEvent(event) {
        AppSettings.GetSettingsUI()._settingsDialog.style.display = "none";
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
        this._span.onclick = this.CloseDialogEvent;

        this._mapIconSelector.value = AppSettings.imageIcon2DType;

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
            if ((event.target != AppSettings.GetSettingsUI()._inParentButton) &&
                (event.target != AppSettings.GetSettingsUI()._settingsDialog) &&
                (event.target != AppSettings.GetSettingsUI()._mapIconSelector) &&
                (event.target != AppSettings.GetSettingsUI()._settingsIconPreview) &&
                (event.target != AppSettings.GetSettingsUI()._settingsModalContentIcon) &&
                (event.target != AppSettings.GetSettingsUI()._settingsIconFieldset) &&
                (event.target != AppSettings.GetSettingsUI()._settingsIconPreview) &&
                (event.target != AppSettings.GetSettingsUI()._settingsIconLegend)) {

                AppSettings.GetSettingsUI().HideDialog();
            }
        }

        AppSettings.GetSettingsUI()._mapIconSelector.onchange = this.UpdateMapIcons;
    }

    UpdateUI() {

        this._mapIconSelector.value = AppSettings.imageIcon2DType;

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

            this.droneIcon2D = localAppSettingsData.droneIcon2D;
            this.imageIcon2DType = localAppSettingsData.imageIcon2DType;

            //console.log("loaded app settings data: ", this);
        }
    }
}

export let AppSettings = new AppSettingsDataClass();