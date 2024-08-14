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
export class DropHandlerClass {

	_dropElements = null;
	_fileInputButtonClass = '';
	_submitButtonClass = '';
	_dropOnElementClass = '';
	_dropOverEventClass = '';

	SetFileInputButtonClass(iClass){this._fileInputButtonClass = iClass;}
	SetSubmitButtonClass(iClass){this._submitButtonClass = iClass;}
	SetDropOnElementClass(iClass){this._dropOnElementClass = iClass;}
	SetDropOverEventClass(iClass){this._dropOverEventClass = iClass;}

	InitDropHandler() {

		this._dropElements = document.getElementsByClassName(this._dropOnElementClass);

		for (let ii=0; ii < this._dropElements.length; ii++){
			this.ProcessDropElement(this._dropElements[ii]);
		}
	}

	ProcessDropElement(dropZoneElement) {

		//console.log("setting up drop zone element:", dropZoneElement)
		let fileInputElement = document.getElementsByClassName(this._fileInputButtonClass)[0];
		let submitButtonElement = document.getElementsByClassName(this._submitButtonClass)[0];

		if (fileInputElement && submitButtonElement) {

			fileInputElement.onchange = function (event) {
				submitButtonElement.click();
			};

			dropZoneElement.addEventListener("dragover", (e) => {
				e.preventDefault();

				if (!dropZoneElement.classList.contains(this._dropOverEventClass)) {
					//console.log("Adding class: map-drop-zone--over to ", dropZoneElement)
					dropZoneElement.classList.add(this._dropOverEventClass);
				}
			});

			["dragleave", "dragend"].forEach((type) => {
				dropZoneElement.addEventListener(type, (e) => {
					if (dropZoneElement.classList.contains(this._dropOverEventClass)) {
						//console.log("Removing event: ${type} removing drop-zone--over", dropZoneElement)
						dropZoneElement.classList.remove(this._dropOverEventClass);
					}
				});
			});

			dropZoneElement.addEventListener("drop", (e) => {
				e.preventDefault();
				//console.log("inputElement drop:", inputElement);
				//console.log("e.dataTransfer:", e.dataTransfer);
					if (e.dataTransfer.files.length) {

						fileInputElement.files = e.dataTransfer.files;
						//console.log("inputElement.files:", inputElement.files);
						submitButtonElement.click();
					}

				dropZoneElement.classList.remove(this._dropOverEventClass);
			});
		}
	}

	ReadDataFile(urlToRead) {

		const fr = new FileReader();

		fr.addEventListener('load', () => {
			const res = fr.result;
			const resFile = res.blob;

			console.log(resFile);
		});

		console.log(fr.readAsDataURL(urlToRead));

	}

	async url2blob(url) {
		try {
			const data = await fetch(url /*, {mode: 'no-cors'}*/);
			const blob = await data.blob();

			console.log(blob);
			let objectURL = URL.createObjectURL(blob);
			console.log(objectURL);

			await navigator.clipboard.write([
				new ClipboardItem({
					[blob.type]: blob
				})
			]);
			console.log("Success.");
		} catch (err) {
			console.error(err.name, err.message);
		}
	}

}

export let DropHandler = new DropHandlerClass();