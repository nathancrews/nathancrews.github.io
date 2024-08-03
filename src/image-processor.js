
import { ImageData } from "./image-data.js"
const ExifReader = await import('./exifreader/src/exif-reader.js')

export async function ProcessImages(FilesDataArray, canvasEl) {

    //  console.log("Worker FilesDataArray = ", FilesDataArray);

    if (!FilesDataArray) {
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

    console.log("Worker process images count: = ", resultImageDataArr.length);

    for (let ii = 0; ii < resultImageDataArr.length; ii++) {
        //       console.log("creating thumbnail : ", resultImageDataArr[ii].name);
        CreateImageThumbnail(resultImageDataArr[ii], canvasEl);
    }

    return resultImageDataArr;
};

async function CreateImageThumbnail(fileImageData, canvasEl) {

    let imageEl = document.createElement('img');
    let reader = new FileReader();

    imageEl.style.display = 'none';
    imageEl.id = fileImageData.name;

    async function FinalizeThumbnailImage(event) {
        let thumbnail_local_file_url = '';
        let thumbnail_local_file;
        let max_thumb_width = 250;
        let max_thumb_height = 300;
        let thumbnail_image_data;

        //    console.log('Worker FinalizeThumbnailImage called, event = ', event);

        let canvasContext = canvasEl.getContext('2d');
        let largeImageRatio = imageEl.naturalHeight / imageEl.naturalWidth;
        let imageRatio = max_thumb_width / max_thumb_height;

        canvasEl.width = max_thumb_width;
        canvasEl.height = (max_thumb_height * (largeImageRatio));

        if (canvasEl.height > max_thumb_height){
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
        //        console.log('fileImageData = ', fileImageData);
        thumbnail_image_data = canvasEl.toDataURL('image/jpeg', 50);

        thumbnail_local_file = URLToFile(thumbnail_image_data);
        thumbnail_local_file_url = URL.createObjectURL(thumbnail_local_file);

        fileImageData.thumbFileName = thumbnail_local_file_url;
        //        console.log('fileImageData.thumbFileName = ', fileImageData.thumbFileName);


        let ThumbnailReadyEvent = new CustomEvent("ThumbnailReadyEvent", { async: true, detail: { ImageData: fileImageData } });

        console.log('Worker calling ThumbnailReadyEvent');

        canvasEl.dispatchEvent(ThumbnailReadyEvent);
    }

    imageEl.onload = FinalizeThumbnailImage;

    const file = fileImageData.imageFileData;
    const url = URL.createObjectURL(file);

    fileImageData.URLName = url;

    imageEl.src = "";
    imageEl.src = url;
}

function URLToFile(imageData) {

    if (!imageData) return null;

    //    console.log('url = ', imageData);

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

    let ret_file = new File([imageArray], "thumb.jpg", { type: mimeType })

    return ret_file;
}

export async function ReadImageEXIFTags(FileData) {

    //  console.log("Worker FileData = ", FileData);

    if (!FileData) {
        return null;
    }

    try {
        const tags = await ExifReader.load(FileData.imageFileData, { expanded: true });
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

            addMe.imageRatio = addMe.imageWidth/addMe.imageHeight;

            return addMe;
        }
    }
    catch (error) {
        console.log(`Error reading EXIF tags filename[${FileData.name}]: ${error}`);
        return null;
    }

    return null;
}

