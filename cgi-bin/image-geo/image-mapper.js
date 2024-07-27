#!node.exe

const querystring = require('querystring');
const path = require('path');
const fileSys = require('node:fs');
const fs = require('fs');
const os = require('os');
const GeoJSON = require('geojson');
const ExifReader = require('exifreader');
const exifErrors = ExifReader.errors;
const sharp = require('sharp');


class ImageData {
    name = "";
    URLName = "";
    thumbFileName = "";
    lat = 0.0;
    lng = 0.0;
    elevation = 0.0;
    flightDirection = 0.0;
    cameraDirection = 0.0;
    cameraPitch = 90.0;
    date;
    geoJSONval = null;
    imageFileData = null;
};

const geoFileName = "geo-images.json";
let InCGIMode = true;
let dirRequestName = '';
let fileNameRequest = '';
let responseType = 'html';
let docRoot = '';
let filePath = '';
let fileURL = '';
let maxThreads = process.env.NUMBER_OF_PROCESSORS

if (process.env.QUERY_STRING != null) {

    //console.log('Status: 200 Ok')
    console.log("Content-type: text/html\r\n\r\n")
    //console.log('')

    //    console.log('querystr: ', process.env.QUERY_STRING)
    //    console.log('\n')

    dirRequestName = querystring.parse(process.env.QUERY_STRING).dir
    //    console.log("\n", "dir: ", dirRequestName)

    fileNameRequest = querystring.parse(process.env.QUERY_STRING).filename
    //    console.log("\n", "fileName: ", fileNameRequest)

    let resType = querystring.parse(process.env.QUERY_STRING).response_type
    //console.log("\n1 response_type: ", resType)

    if (resType) {
        responseType = resType
    }

    //console.log("\n2 final response_type: ", resType)

    docRoot = process.env.DOCUMENT_ROOT;

    docRoot = path.normalize(docRoot);

    //   console.log('docRoot: ', docRoot)
    //   console.log('\n')

    let localDir = '';

    if (dirRequestName == undefined || (dirRequestName.length < 2) && (fileNameRequest.length > 2)) {

        dirRequestName = path.parse(fileNameRequest).dir;
        //        console.log("\ndir from file path: ", dirRequestName)
    }

    localDir = path.join(docRoot, dirRequestName);

    fileURL = dirRequestName;
    //   console.log('fileURL: ', fileURL)

    if (fileNameRequest != undefined) {
        localDir = path.join(docRoot, dirRequestName, path.parse(fileNameRequest).base);
        //        console.log("\nlocalDir from fileNameRequest: ", localDir)
    }

    filePath = localDir;
}
else {

    InCGIMode = false;

    console.log("CPU cores = ", maxThreads);

    if (process.argv.length < 3) {
        console.log(`Usage: node ${path.basename(__filename)} <filename>`);
        process.exit();
    }

    filePath = process.argv[2];

    filePath = path.normalize(filePath);
}

//console.log('filePath: ', filePath)


if (fs.existsSync(filePath)) {
    ProcessImages(filePath, fileURL, dirRequestName, responseType);
}
else {
    console.log('ERROR');
}

return 0;



async function ProcessImages(imagePath, imageURL, CGIRealtivePath, responseType) {

    let localDir = "";
    let imageFiles = [];

    if (fileSys.lstatSync(imagePath).isDirectory()) {
        localDir = imagePath
        //       console.log("localDir = ", localDir)

        fileSys.readdirSync(imagePath).map(entryName => {

            innerFilename = path.join(localDir, entryName)
            //            console.log("innerFilename = ", innerFilename)

            if (fileSys.lstatSync(innerFilename).isFile()) {
                let localNamePath = innerFilename

                //console.log("localNamePath=", localNamePath)
                if (path.extname(entryName).toUpperCase() == ".JPG" ||
                    path.extname(entryName).toUpperCase() == ".PNG" ||
                    path.extname(entryName).toUpperCase() == ".TIFF") {

                    if (localNamePath.indexOf("_thumb") < 0) {
                        imageFiles.push(entryName)
                    }
                }
            }
        })

    }
    else if (fileSys.lstatSync(imagePath).isFile()) {
        let localNamePath = imagePath
        localDir = path.parse(imagePath).dir;

        // console.log("localNamePath=", localNamePath)
        if (path.extname(localNamePath).toUpperCase() == ".JPG" ||
            path.extname(localNamePath).toUpperCase() == ".PNG" ||
            path.extname(localNamePath).toUpperCase() == ".TIFF") {

            if (localNamePath.indexOf("_thumb") < 0) {
                imageFiles.push(path.parse(localNamePath).base);
            }
        }
    }

    // console.log("imageFiles = ", imageFiles);
   

    let geoFileData = await ReadImageData(localDir, imageURL, imageFiles, geoFileName);

    if (InCGIMode == true) {

        fs.access(path.join(localDir, geoFileName), fs.constants.F_OK, (err) => {
            if (err) {
                console.log('ERROR');
                return 0;
            }
        });

        if (CGIRealtivePath[CGIRealtivePath.length - 1] != '/') {
            CGIRealtivePath = CGIRealtivePath + '/';
        }

        let geoFileNameRelative = CGIRealtivePath + geoFileName

        if (responseType == 'html') {
            WriteHTMLResponse(geoFileNameRelative);
        }
        else if (responseType == 'json') {
            // console.log("Content-type: application/json")
            console.log(JSON.stringify(geoFileData))
        }
    }

    imageFiles = null;
}


async function ReadExitTags(imageFilenamePath, imageURL, imageFilename) {

    let addMe;

    const tags = await ExifReader.load(imageFilenamePath, { expanded: true })

    if (tags.gps && tags.gps.Latitude != 0 && tags.gps.Longitude != 0) {
        addMe = new ImageData();

        addMe.URLName = path.join(imageURL, imageFilename);
        addMe.name = imageFilename;
        addMe.lat = tags.gps.Latitude;
        addMe.lng = tags.gps.Longitude;
        addMe.elevation = tags.gps.Altitude;

        let FileNameOnly = path.parse(imageFilename).name;

        if (tags.exif.DateTime) {
            addMe.date = tags.exif.DateTime.description;
        }

        try {
            if (tags.xmp) {
                addMe.elevation = Number(tags.xmp.RelativeAltitude.value);
                addMe.flightDirection = Number(tags.xmp.FlightYawDegree.value);
                addMe.cameraDirection = Number(tags.xmp.GimbalYawDegree.value);
                addMe.cameraPitch = Number(tags.xmp.GimbalPitchDegree.value);
            }
            else {
                // console.log("error reading EXIF XMP data... ");
                addMe.elevation = 0;
                addMe.flightDirection = 0;
                addMe.cameraDirection = 0;
                addMe.cameraPitch = 90;
            }
        }
        catch (error) {
            addMe.elevation = 0;
            addMe.flightDirection = 0;
            addMe.cameraDirection = 0;
            addMe.cameraPitch = 90;
        }
    }

    return addMe;
}

async function ReadImageData(imagePath, imageURL, imageNames, geoFileName) {

    let imageCollection = []

    for (let ii = 0; ii < imageNames.length; ii++) {

        let imageFilename = imageNames[ii];

        //console.log("imageFilename = ", imageFilename);

        let imageFilenamePath = path.join(imagePath, imageFilename);

        //console.log("imagePath = ", imagePath);

        let toAdd = await ReadExitTags(imageFilenamePath, imageURL, imageFilename);

        if (toAdd) {

            let statOk = await CreateImageThumb(imagePath, imageFilenamePath, imageFilename, imageURL, toAdd);

            if (statOk > 0) {
                imageCollection.push(toAdd)
            }
        }
        else {
            // console.log("<p>Image GPS lat/lon not found!</p>")
        }
    }

    let geoJ;

    if (imageCollection.length > 0) {
        geoJ = GeoJSON.parse(imageCollection, { Point: ['lat', 'lng', 'elevation'] });
        //       console.log(geoJ);
        fs.writeFileSync(path.join(imagePath, geoFileName), JSON.stringify(geoJ));
    }
    else {
        console.log("ERROR")
    }

    imageCollection = null;

    return geoJ;
}

async function CreateImageThumb(imagePath, imageFilenamePath, imageFilename, imageURL, toAdd) {

    let FileNameOnly = path.parse(imageFilename).name;
    // Try to extract the thumbnail:
    let thumbFileNameExt = path.format({
        name: FileNameOnly + '_thumb',
        ext: '.png'
    });

    let thumbFileNameExtPath = path.join(imagePath, thumbFileNameExt);

    toAdd.thumbFileName = path.join(imageURL, thumbFileNameExt);

    fs.access(thumbFileNameExtPath, fs.constants.F_OK, (err) => {
        if (err) {
            try {
                //  console.log("imageFilenamePath", imageFilenamePath);
                //  console.log("thumbFileNameExtPath", thumbFileNameExtPath);

                let thumbWidth = 250;

                if (toAdd.cameraDirection != 0) {

                    sharp(imageFilenamePath).rotate(toAdd.cameraDirection, { background: 'white' }).resize(thumbWidth).toFile(thumbFileNameExtPath, null);
                }
                else {

                    sharp(imageFilenamePath).rotate().resize(thumbWidth).toFile(thumbFileNameExtPath, null);
                }
            }
            catch (error) {
                toAdd.thumbFileName = toAdd.URLName;
                //console.log("Catch Error[", error, "] writing thumbFileName = ", thumbFileNameExtPath);
                ThumbError(error);
            }
        }
    });

    function ThumbError(err) {
        // console.log("Sharp Error[", err, "] writing thumbFileName = ", thumbFileNameExtPath);
        toAdd.thumbFileName = toAdd.URLName;
        return 0;
    }

    return 1;
}


function WriteHTMLResponse(geoFileName) {
    let htmlTop = '<head> \
        <title>Nathan Crews Node.js Portfolio</title> \
        <meta charset="UTF-8" /> \
        <link rel="icon" type="image/x-icon" href="../../images/favicon.ico"> \
        <script src="https://unpkg.com/htmx.org@2.0.0" \
            integrity="sha384-wS5l5IKJBvK6sPTKa2WZ1js3d947pvWXbPJ1OmWfEuxLgeHcEbjUUA5i9V5ZkpCw" crossorigin="anonymous"></script> \
            <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" \
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" /> \
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" \
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script> \
        <link rel="stylesheet" href="../../styles/styles.css" /> \
        <link rel="stylesheet" href="../../styles/nc-map.css" /> \
    </head><body><div id="map" name="map"</div>';

    let scripts = '<script type="text/javascript"> \
       async function loadJSONFile(jsonFileURL, map) { \
       const droneIcon = L.icon({ \
           iconUrl: \'../../images/drone-icon.jpg\', \
           iconSize: [24, 24], \
           iconAnchor: [12, 12], \
           popupAnchor: [0, 112] \
       }); \
           let imagesMap; \
           let fetchJson = await fetch(jsonFileURL); \
           if (fetchJson.status === 200) { \
               let fetchData = await fetchJson.json(); \
               if (fetchData) { \
                   imagesMap = L.geoJSON(fetchData, { \
                       pointToLayer: function (point, latlng) { \
                           return L.marker(latlng, { icon: droneIcon }); \
                       }, \
                   }).bindPopup(function (layer) { \
                       return "<div style=\'width: 250px;height: 250px;\'><p><b>"+ layer.feature.properties.name + "</b></p> \
                       <a href=\'../../"+ layer.feature.properties.URLName + "\' target=\'window\'><img style=\'max-width: 250px; max-height:250px; z-index: 100;\' src=\'../../"+ \
                           layer.feature.properties.thumbFileName + "\' /></a></div>"; \
                   }).addTo(map); \
               } \
               else { \
                   console.log("Parsing GeoJSON file failed: ", jsonFileURL) \
               } \
           } \
           else { \
               console.log("Load GeoJSON file failed: ", jsonFileURL) \
           } \
           return imagesMap; \
       } \
       async function main() { \
           let osm = L.tileLayer(\'https://tile.openstreetmap.org/{z}/{x}/{y}.png\', { \
               maxZoom: 19, \
            }); \
           let Esri_WorldImagery = L.tileLayer(\'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}\', { \
               maxZoom: 19, \
           }); \
           let map = L.map(\'map\', { \
               zoom: 10, \
               layers: [osm, Esri_WorldImagery] \
           });'

    let geoFileNamePart = 'let jsonFileURL = "../../' + geoFileName + '"';

    let lastScriptPart = 'document.getElementById(\'map\').style.height = "80vh"; \
           document.getElementById(\'map\').style.width = "100%"; \
           let imagePointLayer = await loadJSONFile(jsonFileURL, map); \
    if (imagePointLayer !== undefined) { \
        map.fitBounds(imagePointLayer.getBounds()); \
    } \
    let baseMaps = { \
        "OpenStreetMap": osm, \
        "Esri_Imagery": Esri_WorldImagery \
    }; \
    let layerControl = L.control.layers(baseMaps); \
    layerControl.addTo(map); \
    } \
    main(); \
    </script>'

    let htmlEnd = '</body>';

    //    console.log("Content-type: text/html\n\n")
    console.log(htmlTop);
    console.log(scripts);
    console.log(geoFileNamePart)
    console.log(lastScriptPart)
    console.log(htmlEnd);
}

function listTags(tags) {
    for (const group in tags) {
        for (const name in tags[group]) {
            if (group === 'gps') {
                console.log(`${group}:${name}: ${tags[group][name]}`);
                // } else if ((group === 'Thumbnail') && (name === 'type')) {
                //     console.log(`${group}:${name}: ${tags[group][name]}`);
                // } else if ((group === 'Thumbnail') && (name === 'image')) {
                //     console.log(`${group}:${name}: <image>`);
                // } else if ((group === 'Thumbnail') && (name === 'base64')) {
                //     console.log(`${group}:${name}: <base64 encoded image>`);
                // } else if ((group === 'mpf') && (name === 'Images')) {
                //     console.log(`${group}:${name}: ${getMpfImagesDescription(tags[group][name])}`);
            } else if ((group === 'xmp') && (name === '_raw')) {
                console.log(`${group}:${name}: <XMP data string>`);
            } else if ((group === 'exif') && (name === 'ImageSourceData')) {
                console.log(`${group}:${name}: <Adobe data>`);
            }
            // } else if (Array.isArray(tags[group][name])) {
            //     console.log(`${group}:${name}: ${tags[group][name].map((item) => item.description).join(', ')}`);
            // } else {
            //     console.log(`${group}:${name}: ${typeof tags[group][name].description === 'string' ? tags[group][name].description.trim() : tags[group][name].description}`);
            // }
        }
    }
}


