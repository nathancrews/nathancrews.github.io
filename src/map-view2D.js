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
import { PhotoMapApp } from "./photomap-app-class.js";

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
    _defaultLatitude = 56.01877997222222;
    _defaultLongitude = -3.7548339722222224;


    //************************************
    // Define Map2D Methods
    //************************************
    async RedrawMap2D() {
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

                onEachFeature: function (feature, layer) {
                    // console.log("feature = ", feature);
                    // console.log("layer = ", layer);

                    layer.on('contextmenu', Map2D.OnContextMenu);
                    layer.on('dragend', Map2D.OnDragEnd);
                },

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
                                popupAnchor: [0, (AppSettings.thumbnailImageHeight / 2)]
                            });

                        }
                    }

                    return L.marker(latlng, { icon: currentDroneIcon, draggable: true, autoPan: true });
                },
            }).bindPopup(function (layer) {
                return "<div><p class='leaflet-div-p font-photo-name' \
                        style='width:fit-content;'>" + layer.feature.properties.name + "</p> \
                   <p class='leaflet-div-p font-photo-hw'>Date: " + layer.feature.properties.date + "</p><img ' src='" +
                    layer.feature.properties.imageURLData + "' class='map-thumb-2d' /></a></div>";
            })

            if (this._imagesLayer) {
                this._imageLayerGroup.addLayer(this._imagesLayer);
                // this._LMap.fitBounds(this._imagesLayer.getBounds());
                retVal = true;
            }
        }

        return retVal;
    }

    OnContextMenu(event) {

        if (event.originalEvent.ctrlKey === true) {

            event.target.removeEventListener('contextmenu', Map2D.OnContextMenu);
            event.target.removeEventListener('dragend', Map2D.OnDragEnd);

            console.log("deleting photo: ", event.target.feature.properties.name);
            PhotoMapApp.RemoveImage(event.target.feature.properties.name);
        }
    }

    OnDragEnd(event) {

        var marker = event.target;
        var position = marker.getLatLng();

        //        console.log("should MOVE: ", event.target.feature.properties.name);
        //        console.log("TO: ", position);
        PhotoMapApp.MoveImage(event.target.feature.properties.name, position.lat.toFixed(8), position.lng.toFixed(8));
    }

    async UpdateMap2D(geoJSONResults, shouldReZoom) {

        //console.log("UpdateMap2D geoJSONResults=", geoJSONResults);

        let localgeoJSONResults = geoJSONResults;

        //console.log("2DMap geoJSONResults=", geoJSONResults);
        //console.log("AppUIData.clientSideOnly = ", AppUIData.clientSideOnly);
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

        await this.RedrawMap2D();
        if (shouldReZoom && shouldReZoom === true) {
            this.ResetMap2DView();
        }
    }

    async ResetMap2D() {

        console.log("clearing 2D Map...");

        let imageMarkers = document.getElementsByClassName("leaflet-marker-icon");

        // remove event listeners
        if (imageMarkers) {
           // console.log("found imageMarkers: ", imageMarkers.length);
            
            for (let ii = 0; ii < imageMarkers.length; ii++) {
                imageMarkers[ii].removeEventListener('contextmenu', Map2D.OnContextMenu);
                imageMarkers[ii].removeEventListener('dragend', Map2D.OnDragEnd);
            }
        }

        if (this._imagesLayer) {
            console.log("removing imageLayerGroup");
            this._imageLayerGroup.removeLayer(this._imagesLayer);
            this._LMap.removeLayer(this._imagesLayer);
            this._imagesLayer = null;
        }

        await this._LMap.setView([this._defaultLatitude, this._defaultLongitude], 18);
    }

    async ResetMap2DView() {
        console.log("Re-zooming 2D Map...");
        if (this._imagesLayer) {
            this._LMap.fitBounds(this._imagesLayer.getBounds());
        }
    }

    async InitMap2D(defaultLatitude, defaultLongitude) {

        this._defaultLatitude = defaultLatitude;
        this._defaultLongitude = defaultLongitude;
        
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
            center: [this._defaultLatitude, this._defaultLongitude],
            zoom: 18,
            maxZoom: 21,
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

        //  this._LMap.on('contextmenu', this.OnContextMenu);

    }

}

export let Map2D = new Map2DClass();


