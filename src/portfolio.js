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



let landxmlDetailsBtn = document.getElementById('project-landxml-details-btn');

if (landxmlDetailsBtn) {
    landxmlDetailsBtn.onclick = showLandxmlDetails;
}

function showLandxmlDetails(event) {

    let landxmlDetails = document.getElementById('project-landxml-details');
    if (landxmlDetails) {
        MessageUI.ShowMessage("<p>LandXML to GLTF Format Converter & Windows Shell Extension</p>",
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
        MessageUI.ShowMessage("<p>Photo Mapper Browser-only Web Application</p>", pmDetails.innerHTML, null);
    }
}

let pcDetailsBtn = document.getElementById('project-pc-details-btn');
if (pcDetailsBtn) {
    pcDetailsBtn.onclick = showPCDetails;
}

function showPCDetails(event) {

    let pcDetails = document.getElementById('project-pc-details');
    if (pcDetails) {
        MessageUI.ShowMessage("<p>Pointcloud Quickview Windows Shell Extension</p>", pcDetails.innerHTML, null);
    }
}

let glbDetailsBtn = document.getElementById('project-glb-details-btn');
if (glbDetailsBtn) {
    glbDetailsBtn.onclick = showglbDetails;
}

function showglbDetails(event) {

    let glbDetails = document.getElementById('project-glb-details');
    if (glbDetails) {
        MessageUI.ShowMessage("<p>GLTF/GLB Windows Shell Extension</p>", glbDetails.innerHTML, null);
    }
}

let wcDetailsBtn = document.getElementById('project-wc-details-btn');
if (wcDetailsBtn) {
    wcDetailsBtn.onclick = showwcDetails;
}

function showwcDetails(event) {

    let wcDetails = document.getElementById('project-wc-details');
    if (wcDetails) {
        MessageUI.ShowMessage("<p>Web Browser UI Components</p>", wcDetails.innerHTML, null);
    }
}

let pmsrvcDetailsBtn = document.getElementById('project-pmsrv-details-btn');
if (pmsrvcDetailsBtn) {
    pmsrvcDetailsBtn.onclick = showpmsrvDetails;
}

function showpmsrvDetails(event) {

    let pmsrvDetails = document.getElementById('project-pmsrv-details');
    if (pmsrvDetails) {
        MessageUI.ShowMessage("<p>Photo Mapper Client/Server Web Application</p>", pmsrvDetails.innerHTML, null);
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

