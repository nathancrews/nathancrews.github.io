import { AppMapData, AppUIData, UpdateMapEvent } from "./app-data.js";

export async function InitMap3D() {
    if (!AppMapData.map3D) {
        AppMapData.map3D = await LoadCesium3D(null);
    }
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

    ResetMap3DView();
}

export async function ResetMap3DView() {

    //console.log("AppMapData.map3D : ", AppMapData.map3D);
    console.log("Re-zooming 3D Map...");

    if (AppMapData.map3D && AppMapData.map3D.dataSources && AppMapData.map3D.dataSources.length > 0) {
        let dataSource = AppMapData.map3D.dataSources.get(0);
        //console.log("dataSource...: ", dataSource);
        await AppMapData.map3D.flyTo(dataSource, { duration: 0 });
        await AppMapData.map3D.zoomTo(dataSource);
    }
}

async function LoadCesium3D(viewer3D) {
    let retView = viewer3D;

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

            await ResetMap3DView();

        } catch (error) {
            console.log(error);
            return retView;
        }
    }
    else {
        retView = null;
        return;
    }

    await ResetMap3DView();

    return retView;
}

async function LoadCesiumGeoJSON(view3D, fileUrl_OR_Data) {

    if (!view3D || (!fileUrl_OR_Data)) {
        console.log("Error: data not set");
        return;
    }

    if (view3D.dataSources && view3D.dataSources.length > 0) {
        view3D.dataSources.removeAll();
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

    let newEntities = newDataSource.entities.values;

    if (newEntities) {
        for (let i = 0; i < newEntities.length; i++) {
            let entity = newEntities[i];

            entity.billboard.position = entity.position;
            
            if (entity.properties.elevation != 0)
            {
                entity.billboard.position._value.z += entity.properties.elevation;
            }
            else{
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

            //console.log("entity.properties.thumbFileName : ", entity.properties.thumbFileName);
            //console.log("adding entity.billboard.image", entity.billboard.image);
        }

        await view3D.dataSources.add(newDataSource);
    }
}

export async function ResetMap3D() {
    // console.log("AppMapData.map3D : ", AppMapData.map3D);

    if (!AppMapData.map3D) {
        return;
    }

    if (AppMapData.map3D.dataSources && AppMapData.map3D.dataSources.length > 0) {
        AppMapData.map3D.dataSources.removeAll();
    }

    await AppMapData.map3D.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(AppMapData.defaultLongitude, AppMapData.defaultLatitude, 1000.0),
        duration: 1,
    });

}