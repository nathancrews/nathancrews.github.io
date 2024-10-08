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

//************************************
// Define Application Data
//************************************
export class AppUIDataClass {

    constructor() {
        this.submitButton = document.getElementById("submit-button");
        this.loadingImageEl = document.getElementById("loading-image");
        this.fileInputEl = document.getElementById("upload-files");
        this.processingArrayCount = 0;
        this.resultArray = [];
        this.canvasEl = document.createElement('canvas');
        this.thumbnailReadyArray = [];
        this.dirInputEl = document.getElementById("directory");
        this.clientSideOnly = true;

        console.log("AppUIDataClass constructor called");
    }

    GarbageCollect() {
        this.processingArrayCount = 0;
        this.resultArray = [];
        this.thumbnailReadyArray = [];
    }
}


export class AppMapDataClass {
    #mbp = "";
    #csp = "";
    #gp = "";
    //************************************
    // Define Constants
    //************************************
    MAP_DATA_SAVE_KEY = "nc_imapper:geoJSON";
    MAP_APP_DATA_SAVE_KEY = "nc_imapper:geoJSONSettings";

    geoJSONFileData = null;
    defaultLatitude = 56.01877997222222;
    defaultLongitude = -3.7548339722222224;
    projectDirectory = "test_drop";
    baseUploadPath = "uploads/";
    geoJSONFileURL = "uploads/test_drop/geo-images.json";
    geoJSONFileName = "geo-images.json";
    imageDataArray = [];
    remoteServerURL = "";

    constructor() {
        this.#mbp = "";
        this.#csp = "";
        this.#gp = "";
        this.geoJSONFileData = null;
        this.defaultLatitude = 56.01877997222222;
        this.defaultLongitude = -3.7548339722222224;
        this.projectDirectory = "test_drop";
        this.baseUploadPath = "uploads/";
        this.geoJSONFileURL = "uploads/test_drop/geo-images.json";
        this.geoJSONFileName = "geo-images.json";
        this.imageDataArray = [];
        this.remoteServerURL = "https://photomap.nathancrews.com/"; // "http://localhost/";
        console.log("AppMapDataClass constructor called");
    }

    async Getmbp() {
        if (this.#mbp.length < 1) {
            this.#mbp = await this.InitTextures(this.remoteServerURL + "template/.textures.plx");
        }
        return this.#mbp;
    }

    async Getcsp() {
        if (this.#csp.length < 1) {
            this.#csp = await this.InitTextures(this.remoteServerURL + "template/.textures.cs.plx");
        }
        return this.#csp;
    }

    async Getgp() {
        if (this.#gp.length < 1) {
            this.#gp = await this.InitTextures(this.remoteServerURL + "template/.textures.g.plx");
        }
        return this.#gp;
    }

    GarbageCollect() {
        console.log("AppMapDataClass GarbageCollect() called");
        this.imageDataArray = null;
        this.imageDataArray = [];

        //console.log("AppMapData geoJSONFileData: ", this.geoJSONFileData);
    }

    async InitTextures(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            let tx = await response.text();
            tx = tx.trim();

            return tx;
        } catch (error) {
            console.error(error.message);
        }
    }
}

export let AppMapData = new AppMapDataClass();
export let AppUIData = new AppUIDataClass();
