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

export class FileUtils {

    static IsFileTypeAllowed(fileName, allowedFileTypes) {
        let ret = false;

        if ((allowedFileTypes == undefined) || (allowedFileTypes.length < 1)
            || (allowedFileTypes == "*") || (allowedFileTypes == "*.*")
            || (allowedFileTypes == ".*")) {
            return true;
        }

        let allowedExts = allowedFileTypes.split(',');
        //console.log("ftypes: ", allowedExts);

        let fext = '.' + fileName.split('.').pop();
        //console.log("file type to upload: ", fext);

        for (let ii = 0; ii < allowedExts.length; ii++) {
            if (allowedExts[ii].toLowerCase() == fext.toLowerCase()) {
                ret = true;
                break;
            }
        }
        return ret;
    }

    static async LoadGeoJSONFile(jsonFileURL) {
        let fetchData = "";

        // console.log("LoadGeoJSONFile: jsonFileURL=", jsonFileURL);

        let fetchResponse = await fetch(jsonFileURL);
        if (fetchResponse.status === 200) {
            fetchData = await fetchResponse.json();
        }
        else {
            console.log("Load GeoJSON file failed: ", jsonFileURL)
        }

        // console.log("LoadGeoJSONFile: fetchData=", fetchData);

        return fetchData;
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