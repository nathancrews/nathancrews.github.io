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

export class Map3DClass {

    _csMap = null;
    _csMapElement = null;

    GetMap3D() {
        return this._csMap;
    }

    async InitMap3D() {
        if (!this._csMap) {
            this._csMap = await this.LoadCesium3D();
        }
    }

    async UpdateMap3D(geoJSONfileURL) {

        // console.log("UpdateMap3D : ", geoJSONfileURL);

        if (this._csMap) {
            try {
                if (geoJSONfileURL) {
                    await this.LoadCesiumGeoJSON(this._csMap, geoJSONfileURL);
                }
            }
            catch (error) {
                console.log(error);
            }
        }

        this.ResetMap3DView();
    }

    async ResetMap3DView() {

        //console.log("this._csMap : ", this._csMap);
        console.log("Re-zooming 3D Map...");

        if (this._csMap && this._csMap.dataSources && this._csMap.dataSources.length > 0) {
            let dataSource = this._csMap.dataSources.get(0);
            //console.log("dataSource...: ", dataSource);
            await this._csMap.flyTo(dataSource, { duration: 0 });
            await this._csMap.zoomTo(dataSource);
        }
    }

    async LoadCesiumGeoJSON(view3D, fileUrl_OR_Data) {

        if (!view3D || (!fileUrl_OR_Data)) {
            console.log("Error: data not set");
            return;
        }

        if (view3D.dataSources && view3D.dataSources.length > 0) {
            view3D.dataSources.removeAll();
        }

        //console.log("fileUrl_OR_Data: ", fileUrl_OR_Data);

        const newDataSource = await Cesium.GeoJsonDataSource.load(fileUrl_OR_Data,
            {
                clampToGround: true,
                markerSize: 100
            });

        if (!newDataSource) {
            console.log("No data loaded", fileUrl_OR_Data);
            return;
        }

        let newEntities = newDataSource.entities.values;

        if (newEntities) {
            for (let i = 0; i < newEntities.length; i++) {
                let entity = newEntities[i];

                entity.billboard.position = entity.position;

                if (entity.properties.elevation != 0) {
                    entity.billboard.position._value.z += entity.properties.elevation;
                }
                else {
                    entity.billboard.position._value.z += 75;
                }

                entity.billboard.height = entity.properties.imageHeight;
                entity.billboard.width = entity.properties.imageWidth;
                entity.billboard.image = entity.properties.imageURLData;

                entity.billboard.scale = 1.0;
                entity.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BASELINE;
                entity.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
                entity.billboard.scaleByDistance = new Cesium.NearFarScalar(50, 1.0, 500, 0.1)

                // console.log("entity.properties.thumbFileName : ", entity.properties.thumbFileName);
                // console.log("adding entity.billboard.image", entity.billboard.image);
            }

            await view3D.dataSources.add(newDataSource);
        }
    }

    async ResetMap3D() {
        // console.log("this._csMap : ", this._csMap);

        if (!this._csMap) {
            return;
        }

        if (this._csMap.dataSources && this._csMap.dataSources.length > 0) {
            this._csMap.dataSources.removeAll();
        }

        await this._csMap.camera.flyTo({
            destination: Cesium.Cartesian3.fromDegrees(AppMapData.defaultLongitude, AppMapData.defaultLatitude, 1000.0),
            duration: 1,
        });
    }

    async LoadCesium3D() {
        let retView = null;

        if (document.getElementById('map3d')) {
            try {

                Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYmVjM2RmMy01MTVmLTQxNTctYjk0OC1jNmM2ZTFmMzkwZDYiLCJpZCI6MTc0MzI1LCJpYXQiOjE2OTgzOTQxNjh9.qw8O6-GM1BxdYdPyUFz7MLKH3KTh52edzeS_K0EmmZQ";

                retView = await new Cesium.Viewer('map3d', {
                    imageryProvider: false,
                    baseLayerPicker: false,
                    homeButton: false,
                    skyAtmosphere: new Cesium.SkyAtmosphere(),
                    terrain: Cesium.Terrain.fromWorldTerrain()
                });

                const imageryLayer = retView.imageryLayers.addImageryProvider(
                    await Cesium.IonImageryProvider.fromAssetId(3),
                );
                //  await retView.zoomTo(imageryLayer);            

                retView.scene.globe.show = true;

                await retView.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(AppMapData.defaultLongitude, AppMapData.defaultLatitude, 1000.0),
                    duration: 0,
                });

                retView.camera.defaultZoomAmount = 50.0;

                await this.ResetMap3DView();

            } catch (error) {
                console.log(error);
                return retView;
            }
        }
        else {
            retView = null;
            return;
        }

        return retView;
    }

}

export let Map3D = new Map3DClass();