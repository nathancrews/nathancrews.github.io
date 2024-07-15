#!node.exe

const querystring = require('querystring');
const path = require('path');
var fileSys = require('node:fs');
const fs = require('fs');
const os = require('os');
var GeoJSON = require('geojson');
const ExifReader = require('exifreader');
const exifErrors = ExifReader.errors;

var InCGIMode = true;
var dirRequestName = '';
var fileNameRequest = '';
var responseType = 'html';
var docRoot = '';
var filePath = '';
var fileURL = '';

if (process.env.QUERY_STRING != null) {

    // console.log('Status: 200 Ok')
    console.log("Content-type: text/html\r\n\r\n")
    //console.log('')

    //    console.log('querystr: ', process.env.QUERY_STRING)
    //    console.log('\n')

    dirRequestName = querystring.parse(process.env.QUERY_STRING).dir
    //    console.log("\n", "dir: ", dirRequestName)

    fileNameRequest = querystring.parse(process.env.QUERY_STRING).filename
    //    console.log("\n", "fileName: ", fileNameRequest)

    var resType = querystring.parse(process.env.QUERY_STRING).response_type
    //console.log("\n1 response_type: ", resType)

    if (resType){
        responseType = resType
    }

    //console.log("\n2 final response_type: ", resType)

    docRoot = process.env.DOCUMENT_ROOT;

    docRoot = path.normalize(docRoot);

    //   console.log('docRoot: ', docRoot)
    //   console.log('\n')

    var localDir = '';

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

    if (process.argv.length < 3) {
        console.log(`Usage: node ${path.basename(__filename)} <filename>`);
        process.exit();
    }

    filePath = process.argv[2];
}

//console.log('filePath: ', filePath)


if (fs.existsSync(filePath)) {
    ProcessImages(filePath, dirRequestName, responseType);
}
else {
    console.log('Error reading file path: ', filePath);
}

return 0;

function ImageData(inName, inThumbFileName, inLat, inLon, inElev, inflightDirection, incameraDirection, incameraPitch, inDate) {
    name = inName;
    ThumbFileName = inThumbFileName;
    lat = inLat;
    lng = inLon;
    elevation = inElev;
    flightDirection = inflightDirection;
    cameraDirection = incameraDirection;
    cameraPitch = incameraPitch;
    date = inDate;
};

async function ProcessImages(imagePath, CGIRealtivePath, responseType) {

    var localDir = "";
    var imageFiles = [];

    if (fileSys.lstatSync(imagePath).isDirectory()) {
        localDir = imagePath
        // console.log("localDir = ", localDir)

        fileSys.readdirSync(imagePath).map(entryName => {
            innerFilename = path.join(localDir, entryName)

            //    console.log("innerFilename = ", innerFilename)

            if (fileSys.lstatSync(innerFilename).isFile()) {
                var localNamePath = innerFilename

                //    console.log("localNamePath=", localNamePath)
                if (path.extname(entryName) == ".jpg" || path.extname(entryName) == ".JPG" ||
                    //    path.extname(entryName) === ".png" || path.extname(entryName) === ".PNG" ||
                    path.extname(entryName) == ".tiff" || path.extname(entryName) == ".TIFF") {

                    imageFiles.push(entryName)
                }
            }
        })

    }
    else if (fileSys.lstatSync(filePath).isFile()) {
        var localNamePath = filePath
        localDir = path.parse(filePath).dir;

        //console.log("localDir=", localDir)
        if (path.extname(localNamePath) === ".jpg" || path.extname(localNamePath) === ".JPG" ||
            path.extname(localNamePath) === ".png" || path.extname(localNamePath) === ".PNG" ||
            path.extname(localNamePath) === ".tiff" || path.extname(localNamePath) === ".TIFF") {

            imageFiles.push(path.parse(localNamePath).base);
        }
    }

    // console.log("Number of imageFiles = ", imageFiles.length);
    var geoFileName = "geo-images.json";

    var geoFileData = await ReadImageData(localDir, imageFiles, geoFileName);

    if (InCGIMode == true) {

        fs.access(path.join(localDir, geoFileName), fs.constants.F_OK, (err) => {
            if (err) {
                console.log("<p>No image GeoJSON file generated!</p>");
                return 0;
            }
        });

        if (CGIRealtivePath[CGIRealtivePath.length - 1] != '/') {
            CGIRealtivePath = CGIRealtivePath + '/';
        }

        var geoFileNameRelative = CGIRealtivePath + geoFileName

        if (responseType == 'html') {
            WriteHTMLResponse(geoFileNameRelative);
        }
        else if (responseType == 'json'){
           // console.log("Content-type: application/json")
            console.log(JSON.stringify(geoFileData))
        }

    }
}

async function ReadImageData(imagePath, imageNames, geoFileName) {

    var imageCollection = []

    for (var ii = 0; ii < imageNames.length; ii++) {

        var imageFilename = imageNames[ii];

        // console.log("imageFilename = ", imageFilename);

        var imageFilenamePath = path.join(imagePath, imageFilename);

        // console.log("imagePath = ", imagePath);

        const tags = await ExifReader.load(imageFilenamePath, { expanded: true })

        if (tags.gps && tags.gps.Latitude != 0 && tags.gps.Longitude != 0) {
            var addMe = new ImageData();

            addMe.lat = tags.gps.Latitude;
            addMe.lng = tags.gps.Longitude;
            addMe.elevation = tags.gps.Altitude;

            if (tags.exif.DateTime) {
                addMe.date = tags.exif.DateTime.description;
            }

            if (tags.xmp) {
                addMe.elevation = tags.xmp.RelativeAltitude.value;
                addMe.flightDirection = tags.xmp.FlightYawDegree.value;
                addMe.cameraDirection = tags.xmp.GimbalYawDegree.value;
                addMe.cameraPitch = tags.xmp.GimbalPitchDegree.value;
            }
            else {
                // console.log("error reading EXIF XMP data... ");
                addMe.elevation = 0;
                addMe.flightDirection = 0;
                addMe.cameraDirection = 0;
                addMe.cameraPitch = 90;
            }

            addMe.name = path.join(fileURL, imageFilename);

            var FileNameOnly = path.parse(imageFilename).name;

            var thumbFileNameExt = path.format({
                name: FileNameOnly + '_thumb',
                ext: '.png'
            });

            addMe.thumbFileName = addMe.name;

            // Try to extract the thumbnail:
            var thumbFileNameExtPath = path.join(imagePath, thumbFileNameExt);

            fs.access(thumbFileNameExtPath, fs.constants.F_OK, (err) => {
                if (err) {
                    if (tags['Thumbnail'] && tags['Thumbnail'].image) {
                        addMe.thumbFileName = path.join(fileURL, thumbFileNameExt);
                        fs.writeFileSync(thumbFileNameExtPath, Buffer.from(tags['Thumbnail'].image));
                        //console.log("\nwriting file, addMe.thumbFileName = ", addMe.thumbFileName);
                    }
                }
                else {
                    addMe.thumbFileName = path.join(fileURL, thumbFileNameExt);
                    //console.log("reading file, addMe.thumbFileName = ", addMe.thumbFileName);
                }
            });

            imageCollection.push(addMe)
        }
        else {
            // console.log("<p>Image GPS lat/lon not found!</p>")
        }
    }

    var geoJ;

    if (imageCollection.length > 0) {
        geoJ = GeoJSON.parse(imageCollection, { Point: ['lat', 'lng', 'elevation'] });

        //       console.log(geoJ);
        fs.writeFileSync(path.join(imagePath, geoFileName), JSON.stringify(geoJ));
    }
    else {
        console.log("<h1>Error: No GPS data found in images to create GeoJSON file!</h1>")
    }

    return geoJ;
}

function WriteHTMLResponse(geoFileName) {
    var htmlTop = '\
    <head> \
        <title>Nathan Crews Node.js Portfolio</title> \
        <meta charset="UTF-8" /> \
        <link rel="icon" type="image/x-icon" href="/images/favicon.ico"> \
        <script src="https://unpkg.com/htmx.org@2.0.0" \
            integrity="sha384-wS5l5IKJBvK6sPTKa2WZ1js3d947pvWXbPJ1OmWfEuxLgeHcEbjUUA5i9V5ZkpCw" crossorigin="anonymous"></script> \
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" \
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" /> \
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" \
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script> \
        <link rel="stylesheet" href="../styles/styles.css" /> \
    </head> \
     <body> \
    <div id="map" name="map"</div>';

    var scripts = '<script type="text/javascript"> \
       var droneIcon = L.icon({ \
           iconUrl: \'../../images/drone-icon.jpg\', \
           iconSize: [24, 24], \
           iconAnchor: [12, 12], \
           popupAnchor: [0, 112] \
       }); \
       async function loadJSONFile(jsonFileURL, map) { \
           var imagesMap; \
           var fetchJson = await fetch(jsonFileURL); \
           if (fetchJson.status === 200) { \
               var fetchData = await fetchJson.json(); \
               if (fetchData) { \
                   imagesMap = L.geoJSON(fetchData, { \
                       pointToLayer: function (point, latlng) { \
                           return L.marker(latlng, { icon: droneIcon }); \
                       }, \
                   }).bindPopup(function (layer) { \
                       return "<div><p><b>"+ layer.feature.properties.name + "</b></p> \
                       <a href=\'../../"+ layer.feature.properties.name + "\' target=\'window\'><img style=\'rotate: "+  \
                           Number(layer.feature.properties.cameraDirection) + "deg; max-width: 300px; max-height:200px; z-index: 100;\' src=\'../../"+ \
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
           var osm = L.tileLayer(\'https://tile.openstreetmap.org/{z}/{x}/{y}.png\', { \
               maxZoom: 19, \
            }); \
           var Esri_WorldImagery = L.tileLayer(\'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}\', { \
               maxZoom: 19, \
           }); \
           var map = L.map(\'map\', { \
               zoom: 10, \
               layers: [osm, Esri_WorldImagery] \
           });'

    var geoFileNamePart = 'let jsonFileURL = "../../' + geoFileName + '"';

    var lastScriptPart = 'document.getElementById(\'map\').style.height = "80vh"; \
           document.getElementById(\'map\').style.width = "100%"; \
           var imagePointLayer = await loadJSONFile(jsonFileURL, map); \
    if (imagePointLayer !== undefined) { \
        map.fitBounds(imagePointLayer.getBounds()); \
    } \
    var baseMaps = { \
        "OpenStreetMap": osm, \
        "Esri_WorldImagery": Esri_WorldImagery \
    }; \
    var layerControl = L.control.layers(baseMaps); \
    layerControl.addTo(map); \
    } \
    main(); \
    </script>'

    var htmlEnd = '</body>';

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
