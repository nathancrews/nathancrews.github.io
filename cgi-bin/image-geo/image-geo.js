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
    ProcessImages(filePath, dirRequestName);
}
else {
    console.log('Error reading file path: ', filePath);
}

return 0;

function ImageData(inName, inThumbFileName, inLat, inLon, inElev, inflightDirection, incameraDirection, incameraPitch) {
    name = inName;
    ThumbFileName = inThumbFileName;
    lat = inLat;
    lng = inLon;
    elevation = inElev;
    flightDirection = inflightDirection;
    cameraDirection = incameraDirection;
    cameraPitch = incameraPitch;
};

async function ProcessImages(imagePath, CGIRealtivePath) {

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

    await ReadImageData(localDir, imageFiles, geoFileName);

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

        WriteHTMLResponse(geoFileNameRelative);
    }
}

function WriteHTMLResponse(geoFileName) {
    var htmlTop = '<html lang="en"> \
    <head> \
        <title>Nathan Crews Node.js Portfolio</title> \
        <meta charset="UTF-8" /> \
        <link rel="icon" type="image/x-icon" href="/images/favicon.ico"> \
        <script src="https://unpkg.com/htmx.org@2.0.0" \
            integrity="sha384-wS5l5IKJBvK6sPTKa2WZ1js3d947pvWXbPJ1OmWfEuxLgeHcEbjUUA5i9V5ZkpCw" crossorigin="anonymous"></script> \
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" \
            integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous" /> \
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" \
            integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script> \
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script> \
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" \
            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" /> \
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" \
            integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script> \
        <link rel="stylesheet" href="../../styles/styles.css" /> \
    </head> \
     <body> \
        <div > \
        <h1 style="color: azure">Application Projects</h1> \
        <nav> \
        <ul> \
            <li><a href="../../index.html">Home</a></li> \
            <li><a href="../../upload.html">Image Generator</a></li> \
            <li><a href="../../mapper/index.html">Memory Mapper</a></li> \
            <li><label for="map-selector" style="color:darkblue; background-color: lightslategray;">Maps >></label><select style="color:darkblue; background-color: lightslategray;" id="map-selector" name="map-selector" title="Mapping Examples"> \
                <option value="">None</option> \
                <option value="../../cgi-bin/image-geo/image-geo.js?dir=uploads/nathan/pics">My Memories</option> \
                <option value="../../cgi-bin/image-geo/image-geo.js?dir=uploads/nathan/germany/">Drone: Germany</option> \
                <option value="../../cgi-bin/image-geo/image-geo.js?dir=uploads/nathan/indiancreek/">Drone: Bridge</option> \
                <option value="../../cgi-bin/image-geo/image-geo.js?dir=uploads/nathan/waterbury/images">Drone: Water</option> \
                <option value="../../cgi-bin/image-geo/image-geo.js?dir=uploads/nathan/sheffield/">Sheffield Map</option> \
                <option value="../../cgi-bin/image-geo/image-geo.js?dir=uploads/nathan/bellus/">Drone: Bellus</option> \
            </select> \
            </li> \
            <li><a href="../../test_node.html">File Listing</a></li> \
        </ul> \
        </nav> \
    </div> \
    <div id="map" class="map"></div>';

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
                       <a href=\'../../"+ layer.feature.properties.name + "\' style=\'width: 100%; height:100%\' target=\'window\'><img style=\'rotate: "+  \
                           Number(layer.feature.properties.cameraDirection) + "deg; width:200px;height:250px; z-index: -100;\' src=\'../../"+ \
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
               maxZoom: 20, \
            }); \
           var Esri_WorldImagery = L.tileLayer(\'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}\', { \
               maxZoom: 20, \
           }); \
           var map = L.map(\'map\', { \
               zoom: 20, \
               layers: [osm, Esri_WorldImagery] \
           });'

    var geoFileNamePart = 'let jsonFileURL = "../../' + geoFileName + '"';

    var lastScriptPart = 'var imagePointLayer = await loadJSONFile(jsonFileURL, map); \
    if (imagePointLayer !== undefined) { \
        map.fitBounds(imagePointLayer.getBounds()); \
    } \
    var baseMaps = { \
        "OpenStreetMap": osm, \
        "Esri_WorldImagery": Esri_WorldImagery \
    }; \
    document.querySelectorAll("[name=map-selector]")[0].addEventListener(\'change\', function () { \
      window.location = this.value; \
    }); \
    var layerControl = L.control.layers(baseMaps); \
    layerControl.addTo(map); \
    } \
    main(); \
    </script>'

    var htmlEnd = '</body></html>';

    //    console.log("Content-type: text/html\n\n")
    console.log(htmlTop);
    console.log(scripts);
    console.log(geoFileNamePart)
    console.log(lastScriptPart)
    console.log(htmlEnd);
}

async function ReadImageData(imagePath, imageNames, geoFileName) {

    var imageCollection = []

    for (var ii = 0; ii < imageNames.length; ii++) {

        var imageFilename = imageNames[ii];
        var thumbFileName = "";
        var thumbFileNameExt = "";

       // console.log("imageFilename = ", imageFilename);

        imageFilenamePath = path.join(imagePath, imageFilename);

       // console.log("imagePath = ", imagePath);

        const tags = await ExifReader.load(imageFilenamePath, { expanded: true })

        // The MakerNote tag can be really large. Remove it to lower memory
        // usage if you're parsing a lot of files and saving the tags.
        if (tags.exif) {
            delete tags.exif['MakerNote'];
        }

        var addMe = new ImageData();

        // if (tags['gps']['Latitude'].toString().length > 0 &&
        //     tags['gps']['Longitude'].toString().length > 0) {

        var thumbFileName = path.parse(imageFilename).name;

        var thumbFileNameExt = path.format({
            name: thumbFileName + '_thumb',
            ext: '.png'
        });

        addMe.name = path.join(fileURL, imageFilename);
        addMe.thumbFileName = path.join(fileURL, thumbFileNameExt);

        try {
            addMe.lat = Number(tags['gps']['Latitude']);
            addMe.lng = Number(tags['gps']['Longitude']);
        }
        catch (err) {
          //  console.log("error reading GPS data... ");
        }

        try {
            addMe.elevation = Number(tags['xmp']['RelativeAltitude'].description);
            addMe.flightDirection = Number(tags['xmp']['FlightYawDegree'].description);
            addMe.cameraDirection = Number(tags['xmp']['GimbalYawDegree'].description);
            addMe.cameraPitch = Number(tags['xmp']['GimbalPitchDegree'].description);
        }
        catch (err) {
           // console.log("error reading EXIF XMP data... ");

            addMe.elevation = 0.0;
            addMe.flightDirection = 0.0;
            addMe.cameraDirection = 0.0;
            addMe.cameraPitch = 90.0;
        }

        if (addMe.lat != undefined && addMe.lng != undefined && addMe.lat != 0 && addMe.lng != 0) {

           // console.log("lat: ", addMe.lat, " lon: ", addMe.lng);

            // Extract the thumbnail:
            var thumbFileNameExtPath = path.join(imagePath, thumbFileNameExt);

            addMe.thumbFileName = addMe.name;

            fs.access(thumbFileNameExtPath, fs.constants.F_OK, (err) => {
                if (err) {
                    if (tags['Thumbnail'] && tags['Thumbnail'].image) {
                        // console.log("writing thumbnail file = ", thumbFileNameExtPath);
                        fs.writeFileSync(thumbFileNameExtPath, Buffer.from(tags['Thumbnail'].image));
                        addMe.thumbFileName = path.join(fileURL, thumbFileNameExt);
                    }
                 }
            });

            imageCollection.push(addMe)
        }
        else {
          //  console.log("<p>Image GPS lat/lon not valid!</p>")
        }
    }
    // }

 //   console.log(imageCollection);

    if (imageCollection.length > 0) {
        var geoJ = GeoJSON.parse(imageCollection, { Point: ['lat', 'lng', 'elevation'] });

 //       console.log(geoJ);
        fs.writeFileSync(path.join(imagePath, geoFileName), JSON.stringify(geoJ));
    }
    else {
        console.log("<h1>Error: No GPS data found in images to create GeoJSON file!</h1>")
    }



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

function getMpfImagesDescription(images) {
    return images.map(
        (image, index) => `(${index}) ` + Object.keys(image).map((key) => {
            if (key === 'image') {
                return `${key}: <image>`;
            }
            if (key === 'base64') {
                return `${key}: <base64 encoded image>`;
            }
            return `${key}: ${image[key].description}`;
        }).join(', ')
    ).join('; ');
}