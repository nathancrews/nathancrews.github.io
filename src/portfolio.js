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

import { SlideShow } from "./slideshow.js";

// let projectGlb = document.getElementById("project-glb");

// if (projectGlb) {
//     projectGlb.addEventListener('click', StartSlideShow);
// }

// let projectLandxml = document.getElementById("project-landxml");
// if (projectLandxml) {
//     projectLandxml.addEventListener('click', StartSlideShow);
// }

// let projectPC = document.getElementById("project-pc");
// if (projectPC) {
//     projectPC.addEventListener('click', StartSlideShow);
// }

let imageClickCaptions = document.getElementsByClassName("project-image-caption-slides");

for (let ii=0; ii < imageClickCaptions.length; ii++){
    imageClickCaptions[ii].addEventListener('click', StartSlideShow);
}


function StartSlideShow(event) {
    let slideShowDialog = document.getElementById(event.target.dataset.slideShowId);

    switch (event.target.dataset.slideShowId) {
        case 'project-glb-slides':
            let imageNames = new Array("./images/projects/shell_extensions/GLB_Thumbnail.webp",
                "./images/projects/shell_extensions/GLTF_Preview_Image.webp",
                "./images/projects/shell_extensions/GLBWindowsShellExtension.webp",
                "./images/projects/shell_extensions/GLTF_Preview_Options.webp",
                "./images/projects/shell_extensions/GLTF_Preview_Image_Directory.webp");

            let imageCaptions = new Array("Automatic .GLB Thumbnails", "By File(s): Generate preview image for selected .GLTF file(s)",
                "By File(s): Generate preview image for selected .GLTF file(s)",
                "Options for .GLTF preview image size and format", "By Directory: Generate All preview images for .GLTF files in directory");

            SlideShow.StartSlideShow(imageNames, imageCaptions);
            break;
        case 'project-landxml-slides':
            let lximageNames = new Array("./images/projects/shell_extensions/LandXML2glTFSample2.webp",
                "./images/projects/shell_extensions/LandXML2glTFMenu.webp");

            let lximageCaptions = new Array("Generates 3D GLTF File", "By File(s): Generate GLTF for selected LandXML file(s)");

            SlideShow.StartSlideShow(lximageNames, lximageCaptions);
            break;

        case 'project-pc-slides':
            let pcimageNames = new Array("./images/projects/shell_extensions/PointCloudWindowsShellExtension.webp",
                "./images/projects/shell_extensions/Pointcloud_Preview_Image_Merging.webp",
                "./images/projects/shell_extensions/Pointcloud_Preview_Image_Viewing.webp", 
                "./images/projects/shell_extensions/Pointcloud_Preview_Image_Directory.webp", "./images/projects/shell_extensions/Pointcloud_Preview_Options.webp");

            let pcimageCaptions = new Array("By File(s): Generate a 3D preview image for .LAS/.LAZ file(s)", "Generate a MERGED preview image for selected .LAS/.LAZ file(s)",
                                            "Sample merged 3D preview image for 15 .LAZ files", "By Directory: Generate All preview images for .LAS/.LAZ files in directory",
                                        "Options for .LAS/.LAZ preview image size and format");

            SlideShow.StartSlideShow(pcimageNames, pcimageCaptions);
            break;
    }
}