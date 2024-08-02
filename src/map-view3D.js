import { AppMapData, AppUIData, UpdateMapEvent } from "./app-data.js";

export async function InitMap3D() {
    if (!AppMapData.map3D) {
        AppMapData.map3D = await LoadCesium3D(null);
    }
    //console.log("InitMap3D: AppMapData.map3D : ", AppMapData.map3D);
    //console.log("InitMap3D: AppMapData.map3D.camera : ", AppMapData.map3D.camera);
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

    if (AppMapData.map3D && AppMapData.map3D.dataSources && AppMapData.map3D.dataSources.length > 0) {
        let dataSource = AppMapData.map3D.dataSources.get(0);
        //console.log("dataSource...: ", dataSource);
        //console.log("AppMapData.map3D.camera: ", AppMapData.map3D.camera);
        await AppMapData.map3D.flyTo(dataSource, { duration: 2});

        if (dataSource.entities._entities.length < 2) {
            console.log("Zooming single image");
            await AppMapData.map3D.zoomTo(dataSource, new Cesium.HeadingPitchRange(0.0, -0.650, 500.0));
        }
        else{
            console.log("Zooming images");
            await AppMapData.map3D.zoomTo(dataSource);
        }
    }
}

async function LoadCesium3D(viewer3D) {
    let retView = viewer3D;

    if (document.getElementById('map3d')) {
        try {

            Cesium.Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYmVjM2RmMy01MTVmLTQxNTctYjk0OC1jNmM2ZTFmMzkwZDYiLCJpZCI6MTc0MzI1LCJpYXQiOjE2OTgzOTQxNjh9.qw8O6-GM1BxdYdPyUFz7MLKH3KTh52edzeS_K0EmmZQ";

            retView = await new Cesium.Viewer('map3d', {
                terrain: Cesium.Terrain.fromWorldTerrain()
            });

            retView.scene.globe.show = true;

            await retView.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(AppMapData.defaultLongitude, AppMapData.defaultLatitude, 1000.0),
                duration: 1,
            });

            retView.camera.defaultZoomAmount = 50.0;

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

    //console.log("AppUIData.clientSideOnly : ", AppUIData.clientSideOnly);

    if (!view3D || (!fileUrl_OR_Data)) {
        console.log("Error: data not set");
        return;
    }

    if (AppUIData.clientSideOnly == true) {

        console.log("client side processing")

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

                //console.log("entity.properties.thumbFileName : ", entity.properties.thumbFileName);

                entity.billboard.position = entity.position;
                entity.billboard.position._value.z += 75;
                entity.billboard.height = entity.properties.imageHeight;
                entity.billboard.width = 250;
                entity.billboard.image = entity.properties.thumbFileName;
                entity.billboard.scale = 1.0;
                entity.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
                entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BASELINE;
                entity.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
                entity.billboard.scaleByDistance = new Cesium.NearFarScalar(50, 1.0, 500, 0.1)

               //console.log("adding entity.billboard.image", entity.billboard.image);
             }

            await view3D.dataSources.add(newDataSource);
        }
    }
    else { // server side

        console.log("Server side processing")
        //console.log("fileUrl_OR_Data: ", fileUrl_OR_Data);

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

        let entities = newDataSource.entities.values;
        console.log("1 entities", entities);

        //   var center = Cesium.Cartesian3 = dataSource.

        for (let i = 0; i < entities.length; i++) {
            let entity = entities[i];

            //console.log("entity.position",entity.position)
            //console.log("entity.position._value.z",entity.position._value.z)

            entity.billboard.position = entity.position;

            //console.log("entity.billboard.position",entity.billboard.position)

            entity.billboard.position._value.z += 75;

            //console.log("entity.billboard.position",entity.billboard.position)
            // entity.billboard.height = 150;

            entity.billboard.scaleByDistance = new Cesium.NearFarScalar(100, 0.5, 500, 0.1)

            entity.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
            entity.billboard.scale = 1.0;
            entity.billboard.image = entity.properties.thumbFileName;
            entity.billboard.heightReference = Cesium.HeightReference.CLAMP_TO_GROUND;
            entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BASELINE;


        }

        await view3D.dataSources.add(newDataSource);
    }
}