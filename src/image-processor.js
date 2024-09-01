////////////////////////////////////////////////////////////////////////////////////
// Copyright 2023-2024 Nathan C. Crews IV
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
//
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.
//
// 3. Neither the name of the copyright holder nor the names of its
//    contributors may be used to endorse or promote products derived from
//    this software without specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
// FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
// DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
// SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
// CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
// OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
////////////////////////////////////////////////////////////////////////////////////

import { ImageData } from "./image-data.js"
const ExifReader = await import('./exifreader/src/exif-reader.js');

export class ImageProcessorClass {

    _ThumbnailReadyEventStr = "ThumbnailReadyEvent";
    _max_thumb_width = 800;
    _max_thumb_height = 950;
    _imageIcon2DFormat = 'image/webp';
    _imageIcon2DQuality = 0.85;

    async ProcessImages(FilesDataArray, canvasEl, imageIcon2DWidth, imageIcon2DHeight, imageIcon2DFormat, imageIcon2DQuality) {
        //  console.log("Worker FilesDataArray = ", FilesDataArray);

        if (!FilesDataArray || !canvasEl) {
            console.log('ProcessImages: invalid data!');
            console.log('FilesDataArray:', FilesDataArray);
            console.log('canvasEl:', canvasEl);
            return null;
        }
    
        if (imageIcon2DWidth){ this._max_thumb_width = imageIcon2DWidth;}
        if (imageIcon2DHeight){ this._max_thumb_height = imageIcon2DHeight;}
        if (imageIcon2DFormat){ this._imageIcon2DFormat = imageIcon2DFormat;}
        if (imageIcon2DQuality){ this._imageIcon2DQuality = imageIcon2DQuality;}

        let resultImageDataArr = [];
        let startTime = performance.now();

        for (let ii = 0; ii < FilesDataArray.length; ii++) {
            if (FilesDataArray[ii].name.length > 0) {
                let imageDataMessage = new ImageData();
    
                imageDataMessage.name = FilesDataArray[ii].name;
                imageDataMessage.imageFileData = FilesDataArray[ii];
    
                let imageDataResponse = await this.ReadImageEXIFTags(imageDataMessage);
    
                if (imageDataResponse) {
                    resultImageDataArr.push(imageDataResponse);
                }
            }
        }
    
        //console.log("Worker process images count: = ", resultImageDataArr.length);
    
        for (let ii = 0; ii < resultImageDataArr.length; ii++) {
            //       console.log("creating thumbnail : ", resultImageDataArr[ii].name);
            await this.CreateImageThumbnail(resultImageDataArr[ii], canvasEl);
        }
    
        let endTime = performance.now();
        console.log(`Inner ProcessImages duration ${endTime - startTime}ms`)
        
        return resultImageDataArr;
    };
    
    async CreateImageThumbnail(fileImageData, canvasEl) {
    
        if (!fileImageData || !canvasEl) {
            console.log('CreateImageThumbnail: invalid data!');
            console.log('fileImageData:', fileImageData);
            console.log('canvasEl:', canvasEl);
            return;
        }
    
        let loadingImage = new Image();

        if (!loadingImage) {
            console.log('CreateImageThumbnail: invalid data!');
            console.log('image Element:', loadingImage);
            return;
        }

        loadingImage.style.display = 'none';
    
        let max_thumb_width = this._max_thumb_width;
        let max_thumb_height = this._max_thumb_height;
        let imageIcon2DFormat = this._imageIcon2DFormat;
        let imageIcon2DQuality = this._imageIcon2DQuality;

        async function FinalizeThumbnailImage(event) {

            let largeImageRatio = loadingImage.naturalWidth / loadingImage.naturalHeight;
            //console.log('Worker FinalizeThumbnailImage called, event = ', event);
            //console.log(`loadingImage.size = ${((loadingImage.naturalWidth * loadingImage.naturalHeight)/1024)*2} kb`);
    
            let canvasContext = canvasEl.getContext('2d');
    
            canvasEl.width = max_thumb_width;
            canvasEl.height = (max_thumb_height / (largeImageRatio));
    
           // console.log('canvasEl.width = ', canvasEl.height);
           // console.log('canvasEl.height = ', canvasEl.height);
    
            if (canvasEl.height > max_thumb_height) {
                canvasEl.width *= largeImageRatio;
             //   console.log('new canvasEl.width = ', canvasEl.width);
    
                canvasEl.height = max_thumb_height;
            }
    
            fileImageData.imageHeight = canvasEl.height;
            fileImageData.imageWidth = canvasEl.width;
            fileImageData.imageRatio = fileImageData.imageHeight / fileImageData.imageWidth;
    
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
    
            canvasContext.drawImage(loadingImage, 0, 0, canvasEl.width, canvasEl.height);
            // thumbnail_local_file = URLToFile(thumbnail_image_data);
            // thumbnail_local_file_url = URL.createObjectURL(thumbnail_local_file);
            fileImageData.imageURLData = canvasEl.toDataURL(imageIcon2DFormat, imageIcon2DQuality);
           // console.log(`fileImageData.imageURLData.length = ${(fileImageData.imageURLData.length/1024)*2} kb`);
   
            // remove large data object before creating GeoJSON data
            //console.log('fileImageData.imageFileData = ', fileImageData.imageFileData);
            URL.revokeObjectURL(fileImageData.imageFileData);
            fileImageData.imageFileData = null;

            //console.log('Worker calling ThumbnailReadyEvent');
            let ThumbnailReadyEvent = new CustomEvent(this._ThumbnailReadyEventStr, { async: true, detail: { ImageData: fileImageData } });

            loadingImage.src = '';
            loadingImage = null;

            canvasEl.dispatchEvent(ThumbnailReadyEvent);
        }
    
        const url = URL.createObjectURL(fileImageData.imageFileData);
    
        if (url) {
//            fileImageData.imageFileData = url;
            loadingImage.onload = FinalizeThumbnailImage;
            loadingImage.src = url;
        }
    }
    
    async ReadImageEXIFTags(FileData) {
        //  console.log("Worker FileData = ", FileData);
    
        if (!FileData) {
            return null;
        }
    
        try {
            let tags = await ExifReader.load(FileData.imageFileData, { expanded: true });
            if (!tags) {
                return null;
            }
    
            //console.log("tags = ", tags);
    
            if (tags.gps && tags.gps.Latitude != 0 && tags.gps.Longitude != 0) {
                const addMe = new ImageData();
    
                addMe.name = FileData.imageFileData.name;
                addMe.lat = tags.gps.Latitude;
                addMe.lng = tags.gps.Longitude;
                addMe.elevation = tags.gps.Altitude;
                addMe.imageHeight = tags.file['Image Height'].value;
                addMe.imageWidth = tags.file['Image Width'].value;
                addMe.imageRatio = addMe.imageWidth / addMe.imageHeight;
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
                       // console.log("No EXIF XMP data... ");
                        addMe.flightDirection = 0;
                        addMe.cameraDirection = 0;
                        addMe.cameraPitch = 90;
                    }
                }
                catch (error) {
                    console.log(`Error reading EXIF XMP: ${error}`);
                    addMe.flightDirection = 0;
                    addMe.cameraDirection = 0;
                    addMe.cameraPitch = 90;
                }
    
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
    
    GetThumbnailReadyEvent(fileImageData) {
        return new CustomEvent(this._ThumbnailReadyEventStr, { async: true, detail: { ImageData: fileImageData } });
    }

    URLToFile(imageData) {
    
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
}

export let ImageProcessor = new ImageProcessorClass();
