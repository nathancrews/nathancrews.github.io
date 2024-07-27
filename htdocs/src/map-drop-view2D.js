
import { AppMapData, AppUIData, UpdateMapEvent } from "./app-data.js";
import { LoadGeoJSONFile } from "./geo-map.js";

//************************************
// Define Application Methods
//************************************
export async function InitMap2D() {

    // <div class="cesium-infoBox cesium-infoBox-visible" data-bind="css: { &quot;cesium-infoBox-visible&quot; : showInfo, &quot;cesium-infoBox-bodyless&quot; : _bodyless }"><div class="cesium-infoBox-title" data-bind="text: titleText"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">Toyama Yasuaki</font></font></div><button type="button" class="cesium-button cesium-infoBox-camera" data-bind="attr: { title: &quot;Focus camera on object&quot; },click: function () { cameraClicked.raiseEvent(this); },enable: enableCamera,cesiumSvgPath: { path: cameraIconPath, width: 32, height: 32 }" title="Focus camera on object"><svg:svg class="cesium-svgPath-svg" width="32" height="32" viewBox="0 0 32 32"><path d="M 13.84375 7.03125 C 11.412798 7.03125 9.46875 8.975298 9.46875 11.40625 L 9.46875 11.59375 L 2.53125 7.21875 L 2.53125 24.0625 L 9.46875 19.6875 C 9.4853444 22.104033 11.423165 24.0625 13.84375 24.0625 L 25.875 24.0625 C 28.305952 24.0625 30.28125 22.087202 30.28125 19.65625 L 30.28125 11.40625 C 30.28125 8.975298 28.305952 7.03125 25.875 7.03125 L 13.84375 7.03125 z"></path></svg:svg></button><button type="button" class="cesium-infoBox-close" data-bind="click: function () { closeClicked.raiseEvent(this); }"><font style="vertical-align: inherit;"><font style="vertical-align: inherit;">×</font></font></button><iframe class="cesium-infoBox-iframe" sandbox="allow-scripts allow-presentation allow-same-origin allow-popups allow-forms" data-bind="style : { maxHeight : maxHeightOffset(40) }" allowfullscreen="true" src="about:blank" style="max-height: 751px; height: 382.963px;"></iframe></div>
    let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 21,
    });

    let Esri_Imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
    });

    // let BING_KEY = 'AuhiCJHlGzhg93IqUH_oCpl_-ZUrIE6SPftlyGYUvr9Amx5nzA-WqGcPquyFZl4L'
    // let bingLayer = L.tileLayer.bing(BING_KEY);

    let googleHybrid = L.gridLayer
        .googleMutant({
            type: "hybrid", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
            maxZoom: 20,
        })

    let googleRoadmap = L.gridLayer
        .googleMutant({
            type: "roadmap", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
            maxZoom: 20,
        })

    let googleSatellite = L.gridLayer
        .googleMutant({
            type: "satellite", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
            maxZoom: 20,
        })

    AppUIData.map = L.map('map2d', {
        center: [56.01877997222222, -3.7548339722222224],
        zoom: 18,
        maxZoom: 19,
        layers: [osm, Esri_Imagery, googleHybrid, googleRoadmap, googleSatellite]
    });

    let baseMaps = {
        "OpenStreetMap": osm,
        " Esri Imagery": Esri_Imagery,
        " Google Roads": googleRoadmap,
        "Google Imagery": googleSatellite,
        " Google Hybrid": googleHybrid,
    };

    AppUIData.imageLayerGroup = L.layerGroup().addTo(AppUIData.map); // Create empty photos LayerGroup
    AppUIData.layerControl = L.control.layers(baseMaps);
    AppUIData.layerControl.addOverlay(AppUIData.imageLayerGroup, "Uploaded Pics");  // Add empty photos group to layer control
    AppUIData.layerControl.addTo(AppUIData.map);

}

export async function UpdateMap2D(geoJSONResults) {

    let localgeoJSONResults = geoJSONResults;
    let fetchDataJSON;
    let retVal = false;
    //    console.log("localgeoJSONResults = ", localgeoJSONResults);
    //    console.log("AppMapData.geoJSONFileURL = ", AppMapData.geoJSONFileURL);

    if (!localgeoJSONResults && AppMapData.geoJSONFileURL && AppUIData.clientSideOnly == false) {
        try {

            localgeoJSONResults = await LoadGeoJSONFile(AppMapData.geoJSONFileURL);
        }
        catch (error) {
            console.log(error);
        }
    }

    if (localgeoJSONResults) {
        AppMapData.geoJSONFileData = localgeoJSONResults;
                console.log("AppMapData.geoJSONFileData=", AppMapData.geoJSONFileData);
    }

    if (AppMapData.geoJSONFileData) {

        if (AppUIData.imagesLayer && AppUIData.clientSideOnly == false) {
            AppUIData.imageLayerGroup.removeLayer(AppUIData.imagesLayer);
            AppUIData.map.removeLayer(AppUIData.imagesLayer);
            AppUIData.imagesLayer = null;
        }

        AppUIData.imagesLayer = L.geoJSON(AppMapData.geoJSONFileData, {
            pointToLayer: function (point, latlng) {
                // console.log("point = ", point)
                // console.log("point.properties.thumbFileName = ", point.properties.thumbFileName)

                let currentDroneIcon = AppMapData.droneIcon;

                // if (point.properties.thumbFileName) {
                //     currentDroneIcon = L.icon({
                //         iconUrl: point.properties.thumbFileName,
                //         iconSize: [48, 48],
                //         iconAnchor: [24, 24],
                //         popupAnchor: [0, 112]
                //     });
                // }

                return L.marker(latlng, { icon: currentDroneIcon });
            },
        }).bindPopup(function (layer) {
            return "<div style='width:max-contents;margin:0px; padding:0px;'><p><b>" + layer.feature.properties.name + "</b></p> \
        <a href='" + layer.feature.properties.URLName + "' target='window'><img style=max-width: 250px; max-height:300px;' src='" +
                layer.feature.properties.thumbFileName + "' /></a></div>";
        });

        if (AppUIData.imagesLayer) {
            AppUIData.imageLayerGroup.addLayer(AppUIData.imagesLayer);
            AppUIData.map.fitBounds(AppUIData.imagesLayer.getBounds());
            retVal = true;
        }
    }

    return retVal;
}






