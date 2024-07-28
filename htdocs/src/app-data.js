//************************************
// Define Application Events
//************************************
export const UpdateMapEvent = new CustomEvent("GeoJSONFileURLChanged", { detail: { AppMapData: {} } });

//************************************
// Define Application Data
//************************************
export const AppUIData = {
    formEl: document.getElementById("uploadForm"),
    dirInputEl: document.getElementById("directory"),
    loadingImageEl: document.getElementById("loading-image"),
    clientSideOnly: true
}

export const AppMapData = {
    map: null,
    imagesLayer: null,
    layerControl: null,
    imageLayerGroup: null,
    droneIcon: L.icon({
        iconUrl: 'images/drone-icon.jpg',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, 175]
    }),
    projectDirectory: "test_drop",
    baseUploadPath: "uploads/",
    geoJSONFileURL: "uploads/test_drop/geo-images.json",
    geoJSONFileName: "geo-images.json",
    geoJSONFileData: null
}
