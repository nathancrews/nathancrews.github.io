//************************************
// Define Application Events
//************************************
export const UpdateMapEvent = new CustomEvent("GeoJSONFileURLChanged", { detail: { AppMapData: {} } });

//************************************
// Define Application Data
//************************************
export let AppUIData = {
    formEl: document.getElementById("uploadForm"),
    dirInputEl: document.getElementById("directory"),
    loadingImageEl: document.getElementById("loading-image"),
    fileInputEl: document.getElementById("upload-files"),
    clientSideOnly: true
}

function AppSettingsData() {
    this.imageIcon2D = "thumbnail";
    this.imageIcon2DWidth = 350;
    this.imageIcon3DWidth = 64;
    this.droneIcon2D = 'images/drone-icon.jpg';
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

