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

import { AppMapData, AppUIData } from "./app-data.js";
import { AppSettings } from "./app-settings.js";
import { FileUtils } from "./file-utils.js";

export class Map2DClass {

    _LMap = null;
    _LMapElement = null;
    _imagesLayer = null;
    _layerControl = null;
    _imageLayerGroup = null;
    _droneIcon = L.icon({
        iconUrl: 'images/drone-icon.jpg',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, 175]
    });

    //************************************
    // Define Map2D Methods
    //************************************
    async RedrawMap2D(){
        let retVal = false;

       //console.log("2DMap AppMapData.geoJSONFileData=", AppMapData.geoJSONFileData);

        if (AppMapData.geoJSONFileData) {

            if (this._imagesLayer) {
                console.log("removing imageLayerGroup");
                this._imageLayerGroup.removeLayer(this._imagesLayer);
                this._LMap.removeLayer(this._imagesLayer);
                this._imagesLayer = null;
            }

            let currentDroneIcon = this._droneIcon;
            //console.log("_droneIcon = ", this._droneIcon)

            this._imagesLayer = L.geoJSON(AppMapData.geoJSONFileData, {

                pointToLayer: function (point, latlng) {
                    // console.log("point.properties.thumbFileName = ", point.properties.thumbFileName)

                    if (AppSettings.imageIcon2DType == "thumbnail") {

                        if (point.properties.imageURLData) {
                            let maxIconSize = AppSettings.imageIcon3DWidth;
                            let iconWidth = maxIconSize;
                            let iconHeight = maxIconSize;

                            //console.log("point.properties.imageRatio = ", point.properties.imageRatio)

                            if (point.properties.imageRatio < 1.0) {
                                iconWidth = maxIconSize / point.properties.imageRatio;
                            }
                            else {
                                iconHeight = maxIconSize * point.properties.imageRatio;
                            }

                            //console.log(`icon W: ${iconWidth}, H: ${iconHeight}`)

                            currentDroneIcon = L.icon({
                                iconUrl: point.properties.imageURLData,
                                iconSize: [iconWidth, iconHeight],
                                iconAnchor: [iconWidth / 2, iconHeight / 2],
                                popupAnchor: [0, (AppSettings.imageIcon2DHeight / 2)]
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

            if (this._imagesLayer) {
                this._imageLayerGroup.addLayer(this._imagesLayer);
                this._LMap.fitBounds(this._imagesLayer.getBounds());
                retVal = true;
            }
        }

        return retVal;
    }

    async UpdateMap2D(geoJSONResults) {

        let localgeoJSONResults = geoJSONResults;

        //console.log("2DMap geoJSONResults=", geoJSONResults);
        // console.log("AppUIData.clientSideOnly=", AppUIData.clientSideOnly);
        if (AppUIData.clientSideOnly == false && !localgeoJSONResults && AppMapData.geoJSONFileURL) {
            try {

                localgeoJSONResults = await FileUtils.LoadGeoJSONFile(AppMapData.geoJSONFileURL);
            }
            catch (error) {
                console.log(error);
            }
        }

        if (localgeoJSONResults) {
            AppMapData.geoJSONFileData = localgeoJSONResults;
        }

        return this.RedrawMap2D();
    }

    async ResetMap2D() {

        console.log("clearing 2D Map...");

        if (this._imagesLayer) {
            console.log("removing imageLayerGroup");
            this._imageLayerGroup.removeLayer(this._imagesLayer);
            this._LMap.removeLayer(this._imagesLayer);
            this._imagesLayer = null;
        }

        await this._LMap.setView([AppMapData.defaultLatitude, AppMapData.defaultLongitude], 18);
    }

    async ResetMap2DView() {
        console.log("Re-zooming 2D Map...");
        if (this._imagesLayer) {
            this._LMap.fitBounds(this._imagesLayer.getBounds());
        }
    }

    async InitMap2D() {

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

        this._LMap = L.map('map2d', {
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

        this._imageLayerGroup = L.layerGroup().addTo(this._LMap); // Create empty photos LayerGroup
        this._layerControl = L.control.layers(baseMaps);
        this._layerControl.addOverlay(this._imageLayerGroup, "Uploaded Pics");  // Add empty photos group to layer control
        this._layerControl.addTo(this._LMap);
    }


}

export let Map2D = new Map2DClass();


