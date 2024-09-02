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


import { PhotoMapApp } from "./photomap-app-class.js"
import { MessageUI } from "./message-ui.js";

function ShowHelp(event) {
    event.preventDefault(true);

    MessageUI.ShowMessage("<h2>Photo Map Creator Help Video</h2>",
                          '<iframe width="400" height="300" src="https://www.youtube.com/embed/E0HH1-r0-5Y?autoplay=1&mute=1"></iframe>', null);
}

let helpBtn = document.getElementById("help-btn");

if (helpBtn) {
    helpBtn.onclick = ShowHelp;
}

await PhotoMapApp.RunApp();

let jsonFileURLEl = document.getElementById("jsonFileURL");

if (jsonFileURLEl) {

    console.log("jsonFileURLEl.innerHTML: ", jsonFileURLEl.innerHTML)

    PhotoMapApp.ShowLoadingImage(true);

    await PhotoMapApp.LoadMapFromURL(jsonFileURLEl.innerHTML);


}
