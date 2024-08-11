
import { AppMapData, GetThumbnailReadyEvent } from "./app-data.js";
import { ImageData } from "./image-data.js"
const ExifReader = await import('./exifreader/src/exif-reader.js')

export async function ProcessImages(FilesDataArray, canvasEl) {

    //  console.log("Worker FilesDataArray = ", FilesDataArray);

    if (!FilesDataArray || !canvasEl) {
        console.log('ProcessImages: invalid data!');
        console.log('FilesDataArray:', FilesDataArray);
        console.log('canvasEl:', canvasEl);
        return null;
    }

    let resultImageDataArr = [];

    for (let ii = 0; ii < FilesDataArray.length; ii++) {
        if (FilesDataArray[ii].name.length > 0) {
            let imageDataMessage = new ImageData();

            imageDataMessage.name = FilesDataArray[ii].name;
            imageDataMessage.imageFileData = FilesDataArray[ii];

            let imageDataResponse = await ReadImageEXIFTags(imageDataMessage);

            if (imageDataResponse) {
                resultImageDataArr.push(imageDataResponse);
            }
        }
    }

    //console.log("Worker process images count: = ", resultImageDataArr.length);

    for (let ii = 0; ii < resultImageDataArr.length; ii++) {
        //       console.log("creating thumbnail : ", resultImageDataArr[ii].name);
        CreateImageThumbnail(resultImageDataArr[ii], canvasEl);
    }

    return resultImageDataArr;
};

async function CreateImageThumbnail(fileImageData, canvasEl) {

    if (!fileImageData || !canvasEl) {
        console.log('CreateImageThumbnail: invalid data!');
        console.log('fileImageData:', fileImageData);
        console.log('canvasEl:', canvasEl);
        return;
    }

    let imageEl = document.createElement('img');
//    let reader = new FileReader();

    if (!imageEl) {
        console.log('CreateImageThumbnail: invalid data!');
        console.log('image Element:', imageEl);
        return;
    }

    imageEl.style.display = 'none';
    imageEl.id = fileImageData.name;

    async function FinalizeThumbnailImage(event) {
        let max_thumb_width = AppMapData.appSettings.imageIcon2DWidth;
        let max_thumb_height = AppMapData.appSettings.imageIcon2DHeight;

        //console.log('Worker FinalizeThumbnailImage called, event = ', event);

        //console.log(`imageEl.size = ${((imageEl.naturalWidth * imageEl.naturalHeight)/1024)*2} kb`);

        let canvasContext = canvasEl.getContext('2d');
        let largeImageRatio = imageEl.naturalHeight / imageEl.naturalWidth;
   
        canvasEl.width = max_thumb_width;
        canvasEl.height = (max_thumb_height * (largeImageRatio));

        if (canvasEl.height > max_thumb_height) {
            canvasEl.width /= largeImageRatio;
            canvasEl.height = max_thumb_height;
        }

        fileImageData.imageHeight = canvasEl.height;
        fileImageData.imageWidth = canvasEl.width;

        fileImageData.imageRatio = fileImageData.imageWidth / fileImageData.imageHeight;

        //console.log(`thumb image H: ${fileImageData.imageHeight}, W: ${fileImageData.imageWidth}`);
        //console.log('fileImageData.imageRatio = ', fileImageData.imageRatio);

        canvasContext.fillStyle = "white";
        canvasContext.fillRect(0, 0, canvasEl.width, canvasEl.height);

        if (fileImageData.cameraDirection != 0) {
            let rotateRads = ((fileImageData.cameraDirection) * Math.PI) / 180;

            canvasContext.translate(canvasEl.width / 2, canvasEl.height / 2);
            canvasContext.rotate(rotateRads);
            canvasContext.translate(-canvasEl.width / 2, -canvasEl.height / 2);
        }

        canvasContext.drawImage(imageEl, 0, 0, canvasEl.width, canvasEl.height);

        // thumbnail_local_file = URLToFile(thumbnail_image_data);
        // thumbnail_local_file_url = URL.createObjectURL(thumbnail_local_file);

        fileImageData.imageURLData = canvasEl.toDataURL(AppMapData.appSettings.imageIcon2DFormat, AppMapData.appSettings.imageIcon2DQuality);
        
       // console.log(`fileImageData.imageURLData.length = ${(fileImageData.imageURLData.length/1024)*2} kb`);

        // remove large data object before creating GeoJSON data
        //console.log('fileImageData.imageFileData = ', fileImageData.imageFileData);
        URL.revokeObjectURL(fileImageData.imageFileData);
        fileImageData.imageFileData = null;
        fileImageData.imageData = null;

        let ThumbnailReadyEvent = GetThumbnailReadyEvent(fileImageData);
        // new CustomEvent(AppUIData.ThumbnailReadyEventStr, { async: true, detail: { ImageData: fileImageData } });

        //console.log('Worker calling ThumbnailReadyEvent');

        imageEl.src = '';
        imageEl = null;

        canvasEl.dispatchEvent(ThumbnailReadyEvent);
    }

    const url = URL.createObjectURL(fileImageData.imageFileData);

    if (url) {
        fileImageData.imageFileData = url;
        imageEl.onload = FinalizeThumbnailImage;
        imageEl.src = url;
    }

}

export async function ReadImageEXIFTags(FileData) {

    //  console.log("Worker FileData = ", FileData);

    if (!FileData) {
        return null;
    }

    try {
        let tags = await ExifReader.load(FileData.imageFileData, { expanded: true });
        if (!tags) {
            return null;
        }

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

            addMe.imageHeight = tags.file['Image Height'].value;
            addMe.imageWidth = tags.file['Image Width'].value;

            addMe.imageRatio = addMe.imageWidth / addMe.imageHeight;
        
            tags = null;
            return addMe;
        }
        tags = null;
    }
    catch (error) {
        console.log(`Error reading EXIF tags filename[${FileData.name}]: ${error}`);
    }

    return null;
}

function URLToFile(imageData) {

    if (!imageData) return null;
    //    console.log('url = ', imageData);

    try {
        let dataArray = imageData.split(',');
        //    console.log('dataArray = ', dataArray);

        if (dataArray.length < 2) return null;

        let mimeType = dataArray[0].match(/:(.*?);/)[1];
        let data = dataArray[1];

        let dataStr = atob(data);
        let count = dataStr.length;

        let imageArray = new Uint8Array(count);
        if (!imageArray) return null;

        while (count--) {
            imageArray[count] = dataStr.charCodeAt(count);
        }

        return new File([imageArray], imageData.name, { type: mimeType })
    }
    catch (error) {
        console.log('URLToFile function eror: ', error);
        console.log('imageData: ', imageData);
    }

}
