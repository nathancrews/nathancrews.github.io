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
import { MessageUI } from "./message-ui.js";



let ncrewsDetailsBtn = document.getElementById('ncrews-details-btn');
if (ncrewsDetailsBtn) {
    ncrewsDetailsBtn.onclick = showncrewsDetails;
}

function showncrewsDetails(event) {

    let ncrewsDetails = document.getElementById('ncrews-details');
    if (ncrewsDetails) {
        MessageUI.ShowMessage("<h3>NCrews Software</h3>",
            ncrewsDetails.innerHTML, null);
    }
}

let carlsonDetailsBtn = document.getElementById('carlson-details-btn');
if (carlsonDetailsBtn) {
    carlsonDetailsBtn.onclick = showncarlsonDetails;
}

function showncarlsonDetails(event) {

    let carlsonDetails = document.getElementById('carlson-details');
    if (carlsonDetails) {
        MessageUI.ShowMessage("<h3>Carlson Software</h3>",
            carlsonDetails.innerHTML, null);
    }
}

let maineDetailsBtn = document.getElementById('maine-details-btn');
if (maineDetailsBtn) {
    maineDetailsBtn.onclick = shownmaineDetails;
}

function shownmaineDetails(event) {

    let maineDetails = document.getElementById('maine-details');
    if (maineDetails) {
        MessageUI.ShowMessage("<h3>Maine Central Power/Itron Systems</h3>",
            maineDetails.innerHTML, null);
    }
}

let logosDetailsBtn = document.getElementById('logos-details-btn');
if (logosDetailsBtn) {
    logosDetailsBtn.onclick = showlogosDetails;
}

function showlogosDetails(event) {

    let maineDetails = document.getElementById('logos-details');
    if (maineDetails) {
        MessageUI.ShowMessage("<h2>Logos Systems</h2>",
            maineDetails.innerHTML, null);
    }
}

let adeskDetailsBtn = document.getElementById('adesk-details-btn');
if (adeskDetailsBtn) {
    adeskDetailsBtn.onclick = showadeskDetails;
}

function showadeskDetails(event) {

    let adeskDetails = document.getElementById('adesk-details');
    if (adeskDetails) {
        MessageUI.ShowMessage("<h3>Autodesk, Inc.</h3>",
            adeskDetails.innerHTML, null);
    }
}




let landxmlDetailsBtn = document.getElementById('project-landxml-details-btn');
if (landxmlDetailsBtn) {
    landxmlDetailsBtn.onclick = showLandxmlDetails;
}

function showLandxmlDetails(event) {

    let landxmlDetails = document.getElementById('project-landxml-details');
    if (landxmlDetails) {
        MessageUI.ShowMessage("<h3>LandXML to GLTF Format Converter & Windows Shell Extension</h3>",
            landxmlDetails.innerHTML, null);
    }
}

let pmDetailsBtn = document.getElementById('project-pm-details-btn');
if (pmDetailsBtn) {
    pmDetailsBtn.onclick = showPMDetails;
}

function showPMDetails(event) {

    let pmDetails = document.getElementById('project-pm-details');
    if (pmDetails) {
        MessageUI.ShowMessage("<h3>Photo Mapper Browser-only Web Application</h3>", pmDetails.innerHTML, null);
    }
}

let p3dDetailsBtn = document.getElementById('project-p3d-details-btn');
if (p3dDetailsBtn) {
    p3dDetailsBtn.onclick = showp3dDetails;
}

function showp3dDetails(event) {

    let p3dDetails = document.getElementById('project-p3d-details');
    if (p3dDetails) {
        MessageUI.ShowMessage("<h3>Point cloud Editing & feature detection</h3>", p3dDetails.innerHTML, null);
    }
}

let p3d2DetailsBtn = document.getElementById('project-p3d2-details-btn');
if (p3d2DetailsBtn) {
    p3d2DetailsBtn.onclick = showp3d2Details;
}

function showp3d2Details(event) {

    let p3d2Details = document.getElementById('project-p3d2-details');
    if (p3d2Details) {
        MessageUI.ShowMessage("<h3>Surface Modeling/Visualization Tools</h3>", p3d2Details.innerHTML, null);
    }
}


let pcDetailsBtn = document.getElementById('project-pc-details-btn');
if (pcDetailsBtn) {
    pcDetailsBtn.onclick = showPCDetails;
}

function showPCDetails(event) {

    let pcDetails = document.getElementById('project-pc-details');
    if (pcDetails) {
        MessageUI.ShowMessage("<h3>Pointcloud Quickview Windows Shell Extension</h3>", pcDetails.innerHTML, null);
    }
}

let glbDetailsBtn = document.getElementById('project-glb-details-btn');
if (glbDetailsBtn) {
    glbDetailsBtn.onclick = showglbDetails;
}

function showglbDetails(event) {

    let glbDetails = document.getElementById('project-glb-details');
    if (glbDetails) {
        MessageUI.ShowMessage("<h3>GLTF/GLB Windows Shell Extension</h3>", glbDetails.innerHTML, null);
    }
}

let wcDetailsBtn = document.getElementById('project-wc-details-btn');
if (wcDetailsBtn) {
    wcDetailsBtn.onclick = showwcDetails;
}

function showwcDetails(event) {

    let wcDetails = document.getElementById('project-wc-details');
    if (wcDetails) {
        MessageUI.ShowMessage("<h3>Web Browser UI Components</h3>", wcDetails.innerHTML, null);
    }
}

let pmsrvcDetailsBtn = document.getElementById('project-pmsrv-details-btn');
if (pmsrvcDetailsBtn) {
    pmsrvcDetailsBtn.onclick = showpmsrvDetails;
}

function showpmsrvDetails(event) {

    let pmsrvDetails = document.getElementById('project-pmsrv-details');
    if (pmsrvDetails) {
        MessageUI.ShowMessage("<h3>Photo Mapper Client/Server Web Application</h3>", pmsrvDetails.innerHTML, null);
    }
}




// function onTabClick(event) {
//     event.preventDefault();

//     event.target.classList.remove("inactive-tab");
//     event.target.classList.add("active-tab");

//     let pages = document.getElementsByClassName('page');
//     if (pages) {
//         for (let ii = 0; ii < pages.length; ii++) {
//             if (pages[ii] != event.target) {
//                 pages[ii].classList.remove("active-page");
//                 pages[ii].classList.add("inactive-page");
//             }
//         };
//     }

//     let tabs = document.getElementsByClassName('tab-button');
//     if (tabs) {
//         for (let ii = 0; ii < tabs.length; ii++) {
//             if (event.target != tabs[ii]) {
//                 tabs[ii].classList.remove("active-tab");
//                 tabs[ii].classList.add("inactive-tab");
//             }
//         };
//     }

//     let pageEl = document.getElementById(event.target.dataset.page);
//     if (pageEl) {
//         pageEl.classList.remove("inactive-page");
//         pageEl.classList.add('active-page');
//     }
// }

// let tabs = document.getElementsByClassName('tab-button');
// if (tabs) {
//     for (let ii = 0; ii < tabs.length; ii++) {
//         tabs[ii].addEventListener('click', onTabClick);
//     };
// }

