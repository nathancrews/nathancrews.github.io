
import { AppMapData, AppUIData } from "./app-data.js";
import { LoadGeoJSONFile } from "./nc_file_upload_client.js";

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

    // let googleHybrid = L.gridLayer
    //     .googleMutant({
    //         type: "hybrid", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    //         maxZoom: 20,
    //     })

    // let googleRoadmap = L.gridLayer
    //     .googleMutant({
    //         type: "roadmap", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    //         maxZoom: 20,
    //     })

    // let googleSatellite = L.gridLayer
    //     .googleMutant({
    //         type: "satellite", // valid values are 'roadmap', 'satellite', 'terrain' and 'hybrid'
    //         maxZoom: 20,
    //     })

    AppMapData.map2D = L.map('map2d', {
        center: [AppMapData.defaultLatitude, AppMapData.defaultLongitude],
        zoom: 18,
        maxZoom: 19,
        layers: [osm, Esri_Imagery /*, googleHybrid, googleRoadmap, googleSatellite */]
    });

    let baseMaps = {
        "  Esri SatImg": Esri_Imagery,
        // " Google Roads": googleRoadmap,
        // "Google SatImg": googleSatellite,
        // "Google Hybrid": googleHybrid,
        "OpenStreetMap": osm
    };

    AppUIData.imageLayerGroup = L.layerGroup().addTo(AppMapData.map2D); // Create empty photos LayerGroup
    AppUIData.layerControl = L.control.layers(baseMaps);
    AppUIData.layerControl.addOverlay(AppUIData.imageLayerGroup, "Uploaded Pics");  // Add empty photos group to layer control
    AppUIData.layerControl.addTo(AppMapData.map2D);
}

export async function UpdateMap2D(geoJSONResults) {

    let localgeoJSONResults = geoJSONResults;
    let fetchDataJSON;
    let retVal = false;

    // console.log("2DMap geoJSONResults=", geoJSONResults);
    // console.log("AppUIData.clientSideOnly=", AppUIData.clientSideOnly);
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
        // console.log("2DMap AppMapData.geoJSONFileData=", AppMapData.geoJSONFileData);
    }

    if (AppMapData.geoJSONFileData) {

        if (AppUIData.imagesLayer) {
            console.log("removing imageLayerGroup");
            AppUIData.imageLayerGroup.removeLayer(AppUIData.imagesLayer);
            AppMapData.map2D.removeLayer(AppUIData.imagesLayer);
            AppUIData.imagesLayer = null;
        }

        AppUIData.imagesLayer = L.geoJSON(AppMapData.geoJSONFileData, {
            pointToLayer: function (point, latlng) {
                //console.log("AppMapData.GetAppSettings().droneIcon = ", AppMapData.GetAppSettings().droneIcon)
                // console.log("point.properties.thumbFileName = ", point.properties.thumbFileName)

                let currentDroneIcon = AppMapData.droneIcon;

                if (AppMapData.GetAppSettings().imageIcon2DType == "thumbnail") {

                    if (point.properties.imageURLData) {
                        let maxIconSize = AppMapData.GetAppSettings().imageIcon3DWidth;
                        let iconWidth = maxIconSize;
                        let iconHeight = maxIconSize;

                        console.log("point.properties.imageRatio = ",point.properties.imageRatio)

                        if (point.properties.imageRatio < 1.0) {
                            iconWidth = maxIconSize / point.properties.imageRatio;
                        }
                        else {
                            iconHeight = maxIconSize * point.properties.imageRatio;
                        }

                        console.log(`icon W: ${iconWidth}, H: ${iconHeight}`)

                        currentDroneIcon = L.icon({
                            iconUrl: point.properties.imageURLData,
                            iconSize: [iconWidth, iconHeight],
                            iconAnchor: [iconWidth / 2, iconHeight / 2],
                            popupAnchor: [0, (AppMapData.GetAppSettings().imageIcon2DHeight / 2)]
                        });

                    }
                }

                return L.marker(latlng, { icon: currentDroneIcon });
            },
        }).bindPopup(function (layer) {
            return "<div style='width:min-content'><p><b>" + layer.feature.properties.name + "</b></p> \
                    <img ' src='" +
                layer.feature.properties.imageURLData + "' class='map-thumb-2d' /></a></div>";
        });

        if (AppUIData.imagesLayer) {
            AppUIData.imageLayerGroup.addLayer(AppUIData.imagesLayer);
            AppMapData.map2D.fitBounds(AppUIData.imagesLayer.getBounds());
            retVal = true;
        }
    }

    return retVal;
}

export async function ResetMap2D() {

    console.log("clearing 2D Map...");

    if (AppUIData.imagesLayer) {
        console.log("removing imageLayerGroup");
        AppUIData.imageLayerGroup.removeLayer(AppUIData.imagesLayer);
        AppMapData.map2D.removeLayer(AppUIData.imagesLayer);
        AppUIData.imagesLayer = null;
    }

    await AppMapData.map2D.setView([AppMapData.defaultLatitude, AppMapData.defaultLongitude], 18);
}

export async function ResetMap2DView() {
    console.log("Re-zooming 2D Map...");
    if (AppUIData.imagesLayer) {
        AppMapData.map2D.fitBounds(AppUIData.imagesLayer.getBounds());
    }
}




