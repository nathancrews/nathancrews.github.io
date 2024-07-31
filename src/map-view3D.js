import { AppMapData, AppUIData, UpdateMapEvent } from "./app-data.js";

export async function InitMap3D() {
    AppMapData.map3D = await LoadCesium3D(AppMapData.map3D);
}

export async function UpdateMap3D(geoJSONfileURL) {
    if (AppMapData.map3D) {
        try {
            if (geoJSONfileURL) {
                await LoadCesiumGeoJSON(AppMapData.map3D, geoJSONfileURL);
            }
        }
        catch (error) {
            console.log(error);
        }
    }
}

export async function ResetMap3DView() {
    console.log("Re-zooming 3D Map...");
    if (AppMapData.map3D && AppMapData.map3D.dataSources && AppMapData.map3D.dataSources.length > 0) {
        let dataSource = AppMapData.map3D.dataSources.get(0);
        await AppMapData.map3D.flyTo(dataSource);
        await AppMapData.map3D.zoomTo(dataSource);
    }
}

async function LoadCesium3D(viewer3D) {
    let retView = viewer3D;

    if (document.getElementById('map3d')) {
        try {

            Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYmVjM2RmMy01MTVmLTQxNTctYjk0OC1jNmM2ZTFmMzkwZDYiLCJpZCI6MTc0MzI1LCJpYXQiOjE2OTgzOTQxNjh9.qw8O6-GM1BxdYdPyUFz7MLKH3KTh52edzeS_K0EmmZQ";

            if (!viewer3D) {
                retView = new Cesium.Viewer('map3d', {
                    terrain: Cesium.Terrain.fromWorldTerrain()
                });
            }

            retView.scene.globe.show = true;

            await retView.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(AppMapData.defaultLongitude, AppMapData.defaultLatitude, 1000.0),
            });

        } catch (error) {
            console.log(error);
        }
    }
    else {
        retView = null;
    }

    return retView;
}

async function LoadCesiumGeoJSON(view3D, fileUrl_OR_Data) {

    if ((AppUIData.clientSideOnly === false) && view3D.dataSources && view3D.dataSources.length > 0) {
        view3D.dataSources.removeAll()
    }

    console.log(view3D.dataSources)

    if (!view3D || (!fileUrl_OR_Data)) {
        console.log("Error: data not set");
        return;
    }

    let singleDataSource = null;
    let newEntities = null;

    if (view3D.dataSources && view3D.dataSources.length > 0) {
        singleDataSource = view3D.dataSources.get(0);
        console.log("setting singleDataSource : ", singleDataSource);
    }

    const newDataSource = await Cesium.GeoJsonDataSource.load(fileUrl_OR_Data,
        {
            clampToGround: true,
            markerSize: 100
        });

    if (!newDataSource) {
        console.log("No data loaded", fileUrl_OR_Data);
        return;
    }

    newEntities = newDataSource.entities.values;

    console.log("view3D : ", view3D);
    console.log("view3D.dataSources : ", view3D.dataSources);
    console.log("adding newDataSource : ", newDataSource);

    if (!singleDataSource) {
        singleDataSource = await view3D.dataSources.add(newDataSource);
    }

    if (singleDataSource && newEntities) {
        for (let i = 0; i < newEntities.length; i++) {
            let entity = newEntities[i];

            entity.billboard.position = entity.position;
            entity.billboard.position._value.z += 75;

            entity.billboard.scaleByDistance = new Cesium.NearFarScalar(500, 0.5, 1500, 0.1)

            entity.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
            entity.billboard.scale = 1.0;
            entity.billboard.image = entity.properties.thumbFileName;
            entity.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
            entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BASELINE;

            console.log("adding entity", entity);

            singleDataSource.entities.add(entity);
        }

        await view3D.flyTo(singleDataSource);
        await view3D.zoomTo(singleDataSource);
    }


}
