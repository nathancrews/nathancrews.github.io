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


// function test(){
//     MessageUI.ShowMessage("<p>Portfolio aldkjsajdlsajdlsdj jdsljdlsajdskjasl jsakdjlasjdlkasjd</p>", 
//                                 "<p>source code</p> \
//                                 <img src='images/settings.png' style='width:400px'/>", null);
// }

// test();



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

