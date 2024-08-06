function nc_IsFileTypeAllowed(fileName, allowedFileTypes) {
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
        if (allowedExts[ii] == fext) {
            ret = true;
            break;
        }
    }
    return ret;
}

async function nc_ChunkFileUploadRequests(formEl, fileInputEl) {

    if ((formEl == undefined) || (fileInputEl == undefined)) {
        console.log("Error: NC_ChunkFileUploadRequests: called with undefined argument!")
        console.log("Parameter formEl: ", formEl)
        console.log("Parameter fileInputEl: ", fileInputEl)
        return;
    }

    //console.log(formEl);

    let formAction = formEl.getAttribute("action");
    let allowedFileTypes = fileInputEl.getAttribute("accept");
    let doAction = false;

    if (formAction == undefined) {
        console.log("Error: nc_ChunkFileUploadRequests: invalid Form 'action' attribute value!")
        return;
    }
    if (formAction) {

        let formData = new FormData(formEl);
        let filesArray = [];
        let redirectCGIKey = "redirectCGI";
        let redirectCGIValue = formData.get(redirectCGIKey);

        let maxFilesPerRequest = Number(formData.get("maxFilesPerRequest"));

        if (maxFilesPerRequest == 0) {
            maxFilesPerRequest = 50;
        }

        let fileEntries = formData.getAll("file");

        //console.log(fileEntries);

        fileEntries.forEach((fileEntry) => {
            if (nc_IsFileTypeAllowed(fileEntry.name, allowedFileTypes)) {
                filesArray.push(fileEntry);
            }
        });

        // console.log("files array now stored: ", filesArray);

        let maxRequestCount = Math.ceil(filesArray.length / maxFilesPerRequest);
        let requestCount = 1;

        //console.log("maxRequest number : ", maxRequestCount);

        if (maxRequestCount > 1) {
            formData.delete(redirectCGIKey)
        }

        for (let ii = 0; ii < (filesArray.length); ii += maxFilesPerRequest) {
            formData.getAll("file").forEach((fileEntry) => { formData.delete("file"); })
            //console.log("TOP of loop, files array removed from form: ", formData.getAll("file"));

            for (let yy = 0; yy < (maxFilesPerRequest); yy++) {
                //console.log('ii= ', ii, ' yy= ', yy);

                if (ii + yy < filesArray.length) {
                    //console.log('adding file : ', filesArray[ii + yy].name);
                    formData.append("file", filesArray[ii + yy])
                }
            }

            if (requestCount == maxRequestCount) {
                doAction = true;
                formData.append(redirectCGIKey, redirectCGIValue);
            }

            //console.log("sending request # ", requestCount, " of ", maxRequestCount);

            let response = await fetch(formAction, {
                method: "POST",
                body: formData
            }).catch(error => {
                console.log("Error: nc_ChunkFileUploadRequests: fetch error: ");
                console.log(error);
                return;
            });

            if (doAction === true && response && response.status >= 200 && response.status < 300) {

                let responseRes = await response.text();
                console.log("responseRes=", responseRes)
                return responseRes;
            }

            requestCount++;
        }
    }

    return;
}

export { nc_IsFileTypeAllowed, nc_ChunkFileUploadRequests }