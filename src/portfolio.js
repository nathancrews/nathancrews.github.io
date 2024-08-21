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

////////////////////////////////////////////////////////////
// Helper JS for porfolio page behaviors.
//
// -- Handle Nav Menu tabs
//
// -- Setup and view project slide shows
//
////////////////////////////////////////////////////////////

let imageClickCaptions = document.getElementsByClassName("project-image-caption-slides");

for (let ii = 0; ii < imageClickCaptions.length; ii++) {
    imageClickCaptions[ii].addEventListener('click', StartSlideShow);
}

function StartSlideShow(event) {
    let slideShowDialog = document.getElementById(event.target.dataset.slideShowId);

    switch (event.target.dataset.slideShowId) {
        case 'project-wc-slides':
            let wcimageNames = new Array("./images/projects/webapps/map_controls.webp",
                "./images/projects/webapps/slideshow_component.webp");

            let wcimageCaptions = new Array("Easy to add toolbar commands and custom messages", "Simple to use and supports many per page (You are using it now...)");

            SlideShow.StartSlideShow(wcimageNames, wcimageCaptions);
            break;

        case 'project-pmc-slides':
            let pmimageNames = new Array("./images/projects/webapps/photomap.webp",
                "./images/projects/webapps/photomapper-2D.webp", "./images/projects/webapps/photomapper-3D.webp",
                "./images/projects/webapps/photomapper-settings.webp");

            let pmimageCaptions = new Array("Drag & Drop Photos on 2D or 3D Map", "Photos with GPS data in 2D Map", "Photos with GPS data in 3D Map",
                "Photo Mapper Settings Options");

            SlideShow.StartSlideShow(pmimageNames, pmimageCaptions);
            break;
        case 'project-pmsrv-slides':
            let pmsrvimageNames = new Array("./images/projects/webapps/photomapper-Drone.webp",
                "./images/projects/webapps/photomapper-Drone-settings.webp",
                "./images/projects/webapps/photomapsrv.webp");

            let pmsrvimageCaptions = new Array("Aerial Drone Photos on 2D Map", "Photo Mapper Settings Options", "Drag & Drop Photos on 2D or 3D Map");

            SlideShow.StartSlideShow(pmsrvimageNames, pmsrvimageCaptions);
            break;
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

function onTabClick(event) {
    event.preventDefault();

    event.target.classList.remove("inactive-tab");
    event.target.classList.add("active-tab");

    let pages = document.getElementsByClassName('page');
    if (pages) {
        for (let ii = 0; ii < pages.length; ii++) {
            if (pages[ii] != event.target) {
                pages[ii].classList.remove("active-page");
                pages[ii].classList.add("inactive-page");
            }
        };
    }

    let tabs = document.getElementsByClassName('tab-button');
    if (tabs) {
        for (let ii = 0; ii < tabs.length; ii++) {
            if (event.target != tabs[ii]) {
                tabs[ii].classList.remove("active-tab");
                tabs[ii].classList.add("inactive-tab");
            }
        };
    }

    let pageEl = document.getElementById(event.target.dataset.page);
    if (pageEl) {
        pageEl.classList.remove("inactive-page");
        pageEl.classList.add('active-page');
    }
}

let tabs = document.getElementsByClassName('tab-button');
if (tabs) {
    for (let ii = 0; ii < tabs.length; ii++) {
        tabs[ii].addEventListener('click', onTabClick);
    };
}


