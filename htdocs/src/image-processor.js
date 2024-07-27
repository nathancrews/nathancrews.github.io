
import { ImageData } from "./image-data.js"
const ExifReader = await import('./exifreader/src/exif-reader.js')

export async function ProcessImages(FilesDataArray) {

    //  console.log("Worker FilesDataArray = ", FilesDataArray);

    if (!FilesDataArray) {
        return null;
    }

    let resultArr = [];

    for (let ii = 0; ii < FilesDataArray.length; ii++) {
        if (FilesDataArray[ii].name.length > 0) {
            let imageDataMessage = new ImageData();

            imageDataMessage.name = FilesDataArray[ii].name;
            imageDataMessage.imageFileData = FilesDataArray[ii];

            let imageDataResponse = await ProcessImage(imageDataMessage);

            if (imageDataResponse) {
                resultArr.push(imageDataResponse);
            }
        }
    };

    return resultArr;
}

export async function ProcessImage(FileData) {

    //  console.log("Worker FileData = ", FileData);

    if (!FileData) {
        return null;
    }

    try {
        const tags = await ExifReader.load(FileData.imageFileData, { expanded: true });
        if (!tags) {
            return null;
        }

        //console.log(tags);

        if (tags.gps && tags.gps.Latitude != 0 && tags.gps.Longitude != 0) {
            const addMe = new ImageData();

            addMe.name = FileData.imageFileData.name;
//            addMe.URLName = path.join(imageURL, imageFilename);
            addMe.lat = tags.gps.Latitude;
            addMe.lng = tags.gps.Longitude;
            addMe.elevation = tags.gps.Altitude;

            addMe.imageFileData = FileData.imageFileData;

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
                    console.log("No EXIF XMP data... ");
                    addMe.elevation = 0;
                    addMe.flightDirection = 0;
                    addMe.cameraDirection = 0;
                    addMe.cameraPitch = 90;
                }
            }
            catch (error) {
                console.log(`Error reading EXIF XMP: ${error}`);
                addMe.elevation = 0;
                addMe.flightDirection = 0;
                addMe.cameraDirection = 0;
                addMe.cameraPitch = 90;
            }

            return addMe;
        }
    }
    catch (error) {
        console.log(`Error reading EXIF tags filename[${FileData.name}]: ${error}`);
        return null;
    }

    return null;
}