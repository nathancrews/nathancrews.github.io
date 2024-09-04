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
import { AppMapData } from "./app-data.js";
import { PhotoMapApp } from "./photomap-app-class.js";

export class MapBoxClass {
    #mbgl = "";

    constructor() {
        this._csMap = null;
        this._csMapElement = null;
        this._csMapBounds = [[999, 999], [-999, -999]];
        this._defaultLatitude = 56.01877997222222;
        this._defaultLongitude = -3.7548339722222224;
        this._csMarkers = [];
    }

    GetMap() {
        return this._csMap;
    }

    async InitMap(defaultLatitude, defaultLongitude) {
        this.#mbgl = await AppMapData.Getmbp();

        this._defaultLatitude = defaultLatitude;
        this._defaultLongitude = defaultLongitude;

        if (!this._csMap) {
            await this.LoadMap(this.#mbgl);
        }
    }

    async UpdateMap(geoJSONfileURL, shouldReZoom) {

        // console.log("UpdateMap3D : ", geoJSONfileURL);

        if (this._csMap) {
            try {
                if (geoJSONfileURL) {
                    await this.ResetMap();
                    await this.LoadGeoJSON(this._csMap, geoJSONfileURL);
                }
            }
            catch (error) {
                console.log(error);
            }
        }

        if (shouldReZoom == true) {
            this.ResetMapView();
        }
    }

    async ResetMapView() {

        //console.log("this._csMap : ", this._csMap);
        console.log("Re-zooming 3D Map...");

        //console.log("this._csMapBounds[1][0] + this._csMapBounds[0][0]) = ", (this._csMapBounds[1][0] + this._csMapBounds[0][0]));

        if ((this._csMapBounds[1][0] + this._csMapBounds[0][0]) == 0) {

            this._csMap.flyTo({
                center: [this._defaultLongitude, this._defaultLatitude],
                zoom: 15,
                speed: 10,
                curve: 1,
            });
        }
        else {
            this._csMap.fitBounds(this._csMapBounds, { animate: false });
        }

    }

    async LoadGeoJSON(view3D, fileUrl_OR_Data) {

        if (!view3D || (!fileUrl_OR_Data)) {
            console.log("Error: data not set");
            return;
        }

        let minLat = 999;
        let minLon = 999;
        let maxLat = -999;
        let maxLon = -999;

        for (const marker of fileUrl_OR_Data.features) {
            // Create a DOM element for each marker.
            const el = document.createElement('div');
            const width = marker.properties.imageWidth / 3;
            const height = marker.properties.imageHeight / 3;
            el.className = 'marker';
            el.style.backgroundImage = `url(${marker.properties.imageURLData})`;
            el.style.border = `3px solid white`;
            el.style.width = `${width}px`;
            el.style.height = `${height}px`;
            el.style.backgroundSize = '100%';
            el.style.cursor = 'pointer';


            let lon = marker.geometry.coordinates[0];
            let lat = marker.geometry.coordinates[1];

            if (lon > maxLon) {
                maxLon = lon + 0.01;
            }
            if (lon < minLon) {
                minLon = lon - 0.01;
            }
            if (lat < minLat) {
                minLat = lat - 0.01;
            }
            if (lat > maxLat) {
                maxLat = lat + 0.01;
            }

            el.feature = marker;

            // Add markers to the map.
            let nm = new mapboxgl.Marker(el, { draggable: true })
                .on('dragend', this.OnDragEnd)
                .setLngLat(marker.geometry.coordinates)
                

            nm.feature = marker;
            nm.getElement().addEventListener('contextmenu', this.OnContextMenu);
            nm.getElement().addEventListener('click', this.OnShowPopup);

            nm.addTo(view3D);

            this._csMarkers.push(nm);
        }

        this._csMapBounds[0] = [minLon, minLat];
        this._csMapBounds[1] = [maxLon, maxLat];

        //console.log("this._csMapBounds: ", this._csMapBounds);
    }

    OnShowPopup(event) {
        event.preventDefault(true);
        event.stopPropagation(true);

        let marker = event.target;

        //console.log("event.target.feature: ", event.target.feature);

        let newp = new mapboxgl.Popup({ offset: [0, -marker.feature.properties.imageHeight/2] });

        newp.setLngLat(marker.feature.geometry.coordinates)
        newp.setHTML(
          `<div><p class='leaflet-div-p font-photo-name'>${marker.feature.properties.name}</p><p class='leaflet-div-p font-photo-hw'>${marker.feature.properties.date}</p>
           <img src='${marker.feature.properties.imageURLData}'/></div>`)

         // console.log("newp: ", newp);

        newp.addTo(MapBox._csMap);
    }

    OnContextMenu(event) {

        // console.log("event: ", event);

        if (event.ctrlKey === true) {

            event.target.removeEventListener('contextmenu', MapBox.OnContextMenu);
            event.target.removeEventListener('click', MapBox.OnShowPopup);

            console.log("deleting photo: ", event.target.feature.properties.name);
            PhotoMapApp.RemoveImage(event.target.feature.properties.name);
        }
    }

    OnDragEnd(event) {
        var marker = event.target;
        var position = marker.getLngLat();

        //console.log("should MOVE: ", marker.feature.properties.name);
        //console.log("TO: ", position);
        PhotoMapApp.MoveImage(marker.feature.properties.name, position.lat.toFixed(8), position.lng.toFixed(8));
    }

    async ResetMap() {
        //console.log("this._csMap : ", this._csMap);

        if (!this._csMap) {
            return;
        }

        for (let ii = 0; ii < this._csMarkers.length; ii++) {
            this._csMarkers[ii].remove();
            this._csMarkers[ii].getElement().removeEventListener('contextmenu', MapBox.OnContextMenu);
            this._csMarkers[ii].getElement().removeEventListener('click', MapBox.OnShowPopup);
            this._csMarkers[ii].off('dragend', MapBox.OnDragEnd);
        }

        this._csMarkers = [];
        this._csMapBounds = [[999, 999], [-999, -999]];
    }

    async LoadMap(mbname) {

        this._csMapElement = document.getElementById('map3d');

        if (!this._csMapElement) {
            console.log("No 'map3d' MapBox element id found");
            return;
        }

        try {
            
            mapboxgl.accessToken = `${mbname}`;

            this._csMap = new mapboxgl.Map({
                container: 'map3d',
                style: 'mapbox://styles/mapbox/satellite-streets-v12',
                projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
                zoom: 15,
                center: [this._defaultLongitude, this._defaultLatitude],
                boxZoom: true,
            });

            this._csMap.addControl(new mapboxgl.NavigationControl());
            this._csMap.scrollZoom.enable();

            this._csMap.on('style.load', () => {
                // Custom atmosphere styling
                this._csMap.setFog({
                    'color': 'rgb(220, 159, 159)', // Pink fog / lower atmosphere
                    'high-color': 'rgb(36, 92, 223)', // Blue sky / upper atmosphere
                    'horizon-blend': 0.4 // Exaggerate atmosphere (default is .1)
                });

                this._csMap.addSource('mapbox-dem', {
                    'type': 'raster-dem',
                    'url': 'mapbox://mapbox.terrain-rgb'
                });

                this._csMap.setTerrain({
                    'source': 'mapbox-dem',
                    'exaggeration': 1.0
                });
            });

            await this.ResetMapView();

        } catch (error) {
            console.log(error);
        }
    }

}

export let MapBox = new MapBoxClass();