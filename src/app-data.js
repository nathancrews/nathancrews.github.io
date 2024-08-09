//************************************
// Define Application Constants
//************************************
export const MAP_DATA_SAVE_KEY = "nc_imapper:geoJSON";
export const APP_DATA_SAVE_KEY = "nc_imapper:appJSON";

//************************************
// Define Application Events
//************************************
export const UpdateMapEvent = new CustomEvent("GeoJSONFileURLChanged", { detail: { AppMapData: {} } });

//************************************
// Define Application Data
//************************************
export let AppUIData = {
    submitButton: document.getElementById("submit-button"),
    loadingImageEl: document.getElementById("loading-image"),
    fileInputEl: document.getElementById("upload-files"),
    processingArrayCount: 0,
    resultArray: [],
    canvasEl: document.createElement('canvas'),
    ThumbnailReadyArray: [], 
    dirInputEl: document.getElementById("directory"),
    clientSideOnly: true
}

class AppSettingsData {
    constructor() {
        this.imageIcon2D = "thumbnail";
        this.imageIcon2DWidth = 300;
        this.imageIcon3DWidth = 64;
        this.droneIcon2D = 'images/drone-icon.jpg';
        this.allowedFileTypes = ".jpg,.png,.jfif,.tif,.geojson";
    }
}

export let AppMapData = {
    map2D: null,
    map3D: null,
    imagesLayer: null,
    layerControl: null,
    imageLayerGroup: null,
    appSettings : new AppSettingsData(),
    droneIcon: L.icon({
        iconUrl: 'images/drone-icon.jpg',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, 175]
    }),
    geoJSONFileData: null,
    defaultLatitude: 56.01877997222222,
    defaultLongitude: -3.7548339722222224,
    projectDirectory: "test_drop",
    baseUploadPath: "uploads/",
    geoJSONFileURL: "uploads/test_drop/geo-images.json",
    geoJSONFileName: "geo-images.json",
    imageDataArray: [],
}

