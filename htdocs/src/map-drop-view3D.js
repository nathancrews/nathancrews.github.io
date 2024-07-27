let view3D = null;

export async function InitMap3D() {
    view3D = await LoadCesium3D(view3D);
}

export async function UpdateMap3D(geoJSONfileURL) {
    if (view3D) {
        try {
            await LoadCesiumGeoJSON(view3D, geoJSONfileURL);
        }
        catch (error) {
            console.log(error);
        }
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

                // const tileset = await Cesium.Cesium3DTileset.fromUrl("https://tile.googleapis.com/v1/3dtiles/root.json?key=AIzaSyDu4Sd_RLN2sRAhS3YIDAH1WPi5dDtNbP8");
                // retView.scene.primitives.add(tileset);
            }

            retView.scene.globe.show = true;

        } catch (error) {
            console.log(error);
        }
    }
    else {
        retView = null;
    }

    return retView;
}

async function LoadCesiumGeoJSON(view3D, fileURL) {

    // console.log(view3D.dataSources)

    if (view3D.dataSources.length > 0) {
        view3D.dataSources.removeAll()
    }
    // console.log(view3D.dataSources)

    if (!view3D || (!fileURL)) {
        console.log("Error: data not set");
        return;
    }

    const dataSource = await Cesium.GeoJsonDataSource.load(fileURL,
        {
            clampToGround: true,
            markerSize: 100
        });

    if (!dataSource) {
        return;
    }

    let entities = dataSource.entities.values;

    //            console.log("1 entities", entities);

    for (let i = 0; i < entities.length; i++) {
        let entity = entities[i];
        //                console.log("entity.billboard",entity.billboard);

        //                console.log('entity.properties.thumbFileName', entity.properties.thumbFileName)

        entity.billboard.scale = 0.25;
        //                entity.billboard.scaleByDistance = true;

        entity.billboard.image = entity.properties.thumbFileName;
        entity.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;

        // entity.point = new Cesium.PointGraphics({
        //     color: Cesium.Color.fromRandom(),
        //     pixelSize: 100
        // });

        // console.log("entity.position", entity.position);
    }

    //            console.log("2 dataSource.entities", entities);

    view3D.dataSources.add(dataSource);
    await view3D.zoomTo(dataSource);
}
