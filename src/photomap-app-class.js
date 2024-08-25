import { AppMapData, AppUIData } from "./app-data.js";
import { AppSettings } from "./app-settings.js";
import { MessageUI } from "./message-ui.js";
import { DropHandler } from "./map-drop-zone.js";
import { Map2D } from "./map-view2D.js";
import { Map3D } from "./map-view3D.js";
import { FileUtils } from "./file-utils.js";
import { ImageProcessor } from "./image-processor.js"

class PhotoMapAppClass {

    _geoJSONDataChangedEventStr = "GeoJSONDataChangedEvent";

    constructor() {
        console.log("PhotoMapAppClass constructor called");
    }

    GetAppMapData() {
        return AppMapData;
    }

    GetAppUIData() {
        return AppUIData;
    }

    GetAppSettingsData() {
        return AppSettings;
    }

    /** UpdateMaps: 
     * updates both the 2d and 3d maps after 
     * an image load or drop event is processed */
    async UpdateMaps(event) {

        let localgeoJSONFileData = event.detail.geoJSONFileData;

        if (!localgeoJSONFileData) {
            console.log("UpdateMaps: invalid geoJSON data!");
        }

        console.log("updating maps...:");

        let startTime = performance.now();
        await Map2D.UpdateMap2D(localgeoJSONFileData);
        let endTime = performance.now();
        console.log(`UpdateMap2D duration ${endTime - startTime}ms`)

        startTime = performance.now();
        await Map3D.UpdateMap3D(localgeoJSONFileData);
        PhotoMapApp.ShowLoadingImage(false);
        endTime = performance.now();
        console.log(`UpdateMap3D duration ${endTime - startTime}ms`)
    }

    /** FindImageNameInArray: 
     * Helper function to detect duplicate files */
    FindImageNameInArray(nameStr, imageArray) {
        let existsInArray = false;

        for (let ii = 0; ii < imageArray.length; ii++) {
            if (nameStr === imageArray[ii].name) {
                existsInArray = true;
                break;
            }
        }
        return existsInArray;
    }

    GetGeoJSONDataChangedEvent(ingeoJSONFileData) {
        return new CustomEvent(this._geoJSONDataChangedEventStr, { detail: { geoJSONFileData: ingeoJSONFileData } });
    }

    /** Primary function for files dropped or choosen by user */
    async HandleImagesAddedEvent(event) {

        if (AppUIData.fileInputEl) {
            event.preventDefault();

            PhotoMapApp.ShowLoadingImage(true);

            let allowedFiles = AppUIData.fileInputEl.files;
            let files = [];
            //console.log("allowedFiles = ", allowedFiles)

            for (let ii = 0; ii < allowedFiles.length; ii++) {
                if (FileUtils.IsFileTypeAllowed(allowedFiles[ii].name, AppSettings.allowedFileTypes)) {
                    // don't allow duplicate file names to be processed

                    if (allowedFiles[ii].name.indexOf('.geojson') > 0) {
                        // console.log("geojson found, ", allowedFiles[ii])
                        let geoJSONStr;
                        let fr = new FileReader();

                        fr.addEventListener('load', () => {
                            //console.log(fr.result);
                            if (fr.result) {
                                let geoJSONObj = null;

                                try {
                                    geoJSONObj = JSON.parse(fr.result);
                                }
                                catch (error) {
                                    MessageUI.ShowMessage("<h3>Photo Mapper</h3>", `Error loading file: ${allowedFiles[ii].name}`, null);
                                    geoJSONObj = null;
                                }

                                let UpdateMapEvent = PhotoMapApp.GetGeoJSONDataChangedEvent(geoJSONObj);

                                if (UpdateMapEvent) {
                                    AppUIData.submitButton.dispatchEvent(UpdateMapEvent);
                                }
                            }
                        });

                        fr.readAsText(allowedFiles[ii]);
                        return;
                    }

                    else if (!PhotoMapApp.FindImageNameInArray(allowedFiles[ii].name, AppMapData.imageDataArray)) {
                        files.push(allowedFiles[ii]);
                    }
                }
            };

            AppUIData.processingArrayCount = files.length;

            if (files.length > 0) {
                AppUIData.resultArray = await ImageProcessor.ProcessImages(files, AppUIData.canvasEl,
                    AppSettings.thumbnailImageWidth, AppSettings.thumbnailImageHeight,
                    AppSettings.imageIcon2DFormat, AppSettings.imageIcon2DQuality);
                AppUIData.processingArrayCount = AppUIData.resultArray.length;
            }
            //console.log("OnDrop AppUIData.processingArrayCount = ", AppUIData.processingArrayCount)

            if (AppUIData.processingArrayCount == 0) {
                PhotoMapApp.ShowLoadingImage(false);
                MessageUI.ShowMessage("Photo Map", "Sorry, no valid image files with GPS data were selected OR duplicate images not procressed!", null);
            }
        }
    }

    /** Secondary helper function to complete thumbnail images
     *  for files dropped or choosen by user */
    async HandleThumbnailReadyEvent(evt) {
        //console.log("ThumbnailReadyEvent called: ", evt);
        if (evt.detail.ImageData && AppUIData.thumbnailReadyArray) {

            AppUIData.thumbnailReadyArray.push(evt.detail.ImageData);

            if (AppUIData.processingArrayCount == (AppUIData.thumbnailReadyArray.length)) {

                AppMapData.imageDataArray = AppMapData.imageDataArray.concat(AppUIData.thumbnailReadyArray);

                let geoJSONval = GeoJSON.parse(AppMapData.imageDataArray, { Point: ['lat', 'lng', 'elevation'] });

                if (geoJSONval) {

                    let UpdateMapEvent = PhotoMapApp.GetGeoJSONDataChangedEvent(geoJSONval);

                    if (UpdateMapEvent) {
                        AppUIData.submitButton.dispatchEvent(UpdateMapEvent);
                    }
                }

                PhotoMapApp.ShowLoadingImage(false);
                // clear the array and count for the next drop operation
                AppUIData.GarbageCollect();
            }
            else {
                // console.log("waiting for complete results array.... ")
            }
        }
    }

    /////////////////////////////////////////////////
    /** Initialize APP UI includes:
     * Input handlers,
     * Drag/Drop handlers,
     * App menu bar,
     * App Settings dialog                 
     */
    /////////////////////////////////////////////////
    async RunApp() {

        this.ShowLoadingImage(false);

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
            AppUIData.submitButton.addEventListener("click", this.HandleImagesAddedEvent);
            AppUIData.submitButton.addEventListener(this._geoJSONDataChangedEventStr, this.UpdateMaps);
        }

        // this element is passed to the image processor and calls the callback when complete
        if (AppUIData.canvasEl) {
            AppUIData.canvasEl.addEventListener(AppUIData.ThumbnailReadyEventStr, this.HandleThumbnailReadyEvent);
        }

        // This CHANGE message handler loads the user choosen files
        AppUIData.fileInputEl = document.getElementsByClassName(fileInputButtonClass)[0];

        if (AppUIData.fileInputEl) {
            AppUIData.fileInputEl.onchange = function (event) {
                event.preventDefault();
                this.HandleImagesAddedEvent(event);
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
        let menuButtonSettings = document.getElementById('settings-button');

        // Settings dialog UI, send the parent button for NON-click handling
        AppSettings.GetSettingsUI().InitUI(menuButtonSettings);

        this.InitMenuBar();

        await Map2D.InitMap2D(AppMapData.defaultLatitude, AppMapData.defaultLongitude);
        await Map3D.InitMap3D(AppMapData.defaultLatitude, AppMapData.defaultLongitude);

        await this.Show2DMap(null);
    }

    /** Produces a downloadable map GeoJSON file */
    DownloadMap(event) {
        if (!event) { return; }

        event.preventDefault = true;
        //console.log("AppMapData.geoJSONFileData: ", AppMapData.geoJSONFileData);
        if (AppMapData.geoJSONFileData) {

            let localGeoJSONStr = JSON.stringify(AppMapData.geoJSONFileData);
            let downloadURL = FileUtils.CreateDownloadURL(localGeoJSONStr);

            //console.log("downloadURL: ", downloadURL);
            if (downloadURL) {
                let downloadMap = document.getElementById("download-map-a");
                if (downloadMap) {
                    downloadMap.href = downloadURL;
                    downloadMap.download = AppSettings.mapName + ".geojson";

                    MessageUI.ShowMessage("<h3>Photo Mapper</h3>", `Success!<br/>Downloaded file: ${downloadMap.download}`, null);
                }
            }
        }
        else {
            MessageUI.ShowMessage("<h3>Photo Mapper</h3>", "Sorry, there is no map data to download.", null);
        }
    }

    MenuButtonSettingsOnClick(event) {
        event.preventDefault = true;
        AppSettings.GetSettingsUI().ShowDialog();
    }

    /////////////////////////////////////////////////
    /**  Setup map menu bar icon commands   */
    /////////////////////////////////////////////////
    InitMenuBar() {
        let menuButtonSettings = document.getElementById('settings-button');
        let menuButtonHome = document.getElementById("menu-button-home");

        if (menuButtonHome) {
            menuButtonHome.onclick = function (event) {
                event.preventDefault = true;

                let menuBars = document.getElementsByClassName("menu-bar");
                for (let ii = 0; ii < menuBars.length; ii++) {
                    if (!menuBars[ii].style.display || menuBars[ii].style.display === "flex") {
                        menuBars[ii].style.display = "none";
                    }
                    else {
                        menuBars[ii].style.display = "flex";
                    }
                }
            }
        }

        if (menuButtonSettings) {
            menuButtonSettings.addEventListener("click", this.MenuButtonSettingsOnClick);
        }

        let menuButtonShow2DMap = document.getElementById("show-2d-map");
        if (menuButtonShow2DMap) {
            menuButtonShow2DMap.addEventListener('click', this.Show2DMap);
        }

        let menuButtonShow3DMap = document.getElementById("show-3d-map");
        if (menuButtonShow3DMap) {
            menuButtonShow3DMap.addEventListener('click', this.Show3DMap);
        }

        let menuButtonResetMap = document.getElementById("reset-map");
        if (menuButtonResetMap) {
            menuButtonResetMap.addEventListener('click', this.ResetMaps);
        }

        let menuButtonSaveMap = document.getElementById("save-map");
        if (menuButtonSaveMap) {
            menuButtonSaveMap.addEventListener("click", this.SaveMapToLocalStorage);
        }

        let menuButtonLoadMap = document.getElementById("load-map");
        if (menuButtonLoadMap) {
            menuButtonLoadMap.addEventListener("click", this.LoadMapFromLocalStorage);
        }

        let menuButtonDownloadMap = document.getElementById("download-map");
        if (menuButtonDownloadMap) {
            menuButtonDownloadMap.addEventListener("click", this.DownloadMap);
        }

    }

    /** Helper function to show or hide the loading/processing image */
    ShowLoadingImage(setVisible) {

        if (AppUIData && AppUIData.loadingImageEl) {
            if (setVisible) {
                AppUIData.loadingImageEl.style.display = "block";
            }
            else {
                AppUIData.loadingImageEl.style.display = "none";
            }
        }
    }

    /** Sets the 2D map visible and zooms to user images */
    async Show2DMap(event) {
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

    /** Sets the 3D map visible and zooms to user images */
    async Show3DMap(event) {
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

    /** Erases all images from map and resets 2D and 3D map views */
    ResetMaps() {
        MessageUI.ShowMessage("<h3>Photo Mapper</h3>", "Do you really want to erase ALL photos from the Map?", PhotoMapApp.ResetMap);
    }

    async ResetMap() {

        //    console.log("ResetMap() called");

        AppMapData.geoJSONFileData = null;

        await Map2D.ResetMap2D();
        await Map3D.ResetMap3D();

        AppMapData.GarbageCollect();
        AppUIData.GarbageCollect();
    }

    /////////////////////////////////////////////////
    /**  Saves map data to localStorage */
    /////////////////////////////////////////////////
    SaveMapToLocalStorage() {
        try {
            let maxSingleLength = 5200000 - 1;

            AppSettings.Save(AppMapData.MAP_APP_DATA_SAVE_KEY);

            if (AppMapData.geoJSONFileData) {
                let geoJSONStr = JSON.stringify(AppMapData.geoJSONFileData);

                if (geoJSONStr) {

                    let saveLength = geoJSONStr.length;
                    console.log(`Map save geoJSON size: ${(saveLength / 1024 * 2)} kb`);

                    if (saveLength > maxSingleLength) {
                        MessageUI.ShowMessage("<h3>Photo Mapper</h3>", ":( Map size too large to save locally, try reducing the number of photos.", null);
                        // window.alert(":( Map size too large to save locally, try reducing the number of photos.")
                    }
                    else {
                        window.localStorage.setItem(AppMapData.MAP_DATA_SAVE_KEY, geoJSONStr);

                        MessageUI.ShowMessage("<h3>Photo Mapper</h3>", "SUCCESS, Map data saved locally", null);
                        //window.alert("SUCCESS, Map data saved locally");
                    }

                    geoJSONStr = null;
                }
                else {
                    // window.alert("Sorry, there was no map data saved.");
                    MessageUI.ShowMessage("<h3>Photo Mapper</h3>", "Sorry, there was no map data saved.", null);
                }
            }
            else {
                MessageUI.ShowMessage("<h3>Photo Mapper</h3>", "Sorry, there is no map data to save. Try adding another photo.", null);
                //window.alert("Sorry, there is no map data to save. Try adding another photo.");
            }
        }
        catch (error) {
            console.log("Error map data to large to save: ", error);
            MessageUI.ShowMessage("<h3>Photo Mapper</h3>", ":( ERROR map data to large to save: ", null);
            //window.alert(":( ERROR map data to large to save: ", error);
        }
    }

    /////////////////////////////////////////////////
    /** Loads map data from localStorage */
    /////////////////////////////////////////////////
    LoadMapFromLocalStorage() {

        try {
            // load specially saved app settings for map
            AppSettings.Load(AppMapData.MAP_APP_DATA_SAVE_KEY);
            AppSettings.Save();
            AppSettings.GetSettingsUI().UpdateUI();

            let geoJSONStr = window.localStorage.getItem(AppMapData.MAP_DATA_SAVE_KEY);

            if (geoJSONStr) {

                console.log(`Map load geoJSON size: ${(geoJSONStr.length / 1024) * 2} kb`);

                this.ResetMap();

                let geoJSONObj = null;

                try {
                    geoJSONObj = JSON.parse(fr.result);
                }
                catch (error) {
                    geoJSONObj = null;
                }

                if (geoJSON && AppUIData.submitButton) {

                    this.ShowLoadingImage(true);

                    let UpdateMapEvent = this.GetGeoJSONDataChangedEvent(geoJSON);

                    if (UpdateMapEvent) {
                        AppUIData.submitButton.dispatchEvent(UpdateMapEvent);
                    }
                }
                else {
                    //window.alert("ERROR, loading local map data.");
                    MessageUI.ShowMessage("<h3>Photo Mapper</h3>", "ERROR, loading local map data.", null);
                }

            }
            else {
                // window.alert("Sorry, there is no local map data to load.");
                MessageUI.ShowMessage("<h3>Photo Mapper</h3>", "Sorry, there is no local map data to load.", null);
            }
        }
        catch (error) {
            console.log("Error loading map data: ", error);
            MessageUI.ShowMessage("<h3>Photo Mapper</h3>", `:( ${error} unable to load map data`, null);
            // window.alert(`:( ${error} unable to load map data`)
        }
    }


}// end class

export let PhotoMapApp = new PhotoMapAppClass();
