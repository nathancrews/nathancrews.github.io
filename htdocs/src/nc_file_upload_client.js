function nc_IsFileTypeAllowed(fileName, allowedFileTypes) {
    var ret = false;

    if ((allowedFileTypes == undefined) || (allowedFileTypes.length < 1)
        || (allowedFileTypes == "*") || (allowedFileTypes == "*.*")
        || (allowedFileTypes == ".*")) {
        return true;
    }

    var allowedExts = allowedFileTypes.split(',');
    //console.log("ftypes: ", allowedExts);

    var fext = '.' + fileName.split('.').pop();
    //console.log("file type to upload: ", fext);

    for (var ii = 0; ii < allowedExts.length; ii++) {
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

    var formAction = formEl.getAttribute("action");
    var allowedFileTypes = fileInputEl.getAttribute("accept");
    var doAction = false;

    if (formAction == undefined) {
        console.log("Error: nc_ChunkFileUploadRequests: invalid Form 'action' attribute value!")
        return;
    }
    if (formAction) {

        var formData = new FormData(formEl);
        var filesArray = [];
        var redirectCGIKey = "redirectCGI";
        var redirectCGIValue = formData.get(redirectCGIKey);

        var maxFilesPerRequest = Number(formData.get("maxFilesPerRequest"));

        if (maxFilesPerRequest == 0) {
            maxFilesPerRequest = 50;
        }

        var fileEntries = formData.getAll("file");

        //console.log(fileEntries);

        fileEntries.forEach((fileEntry) => {
            if (nc_IsFileTypeAllowed(fileEntry.name, allowedFileTypes)) {
                filesArray.push(fileEntry);
            }
        });

        // console.log("files array now stored: ", filesArray);

        var maxRequestCount = Math.ceil(filesArray.length / maxFilesPerRequest);
        var requestCount = 1;

        //console.log("maxRequest number : ", maxRequestCount);

        if (maxRequestCount > 1) {
            formData.delete(redirectCGIKey)
        }

        for (var ii = 0; ii < (filesArray.length); ii += maxFilesPerRequest) {
            formData.getAll("file").forEach((fileEntry) => { formData.delete("file"); })
            //console.log("TOP of loop, files array removed from form: ", formData.getAll("file"));

            for (var yy = 0; yy < (maxFilesPerRequest); yy++) {
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

            var response = await fetch(formAction, {
                method: "POST",
                body: formData
            }).catch(error => {
                console.log("Error: nc_ChunkFileUploadRequests: fetch error: ");
                console.log(error);
            });

            if (doAction === true && response && response.status >= 200 && response.status < 300) {

                var responseRes = await response.text();
                   //console.log("responseRes=", responseRes)
                return responseRes;
            }

            requestCount++;
        }
    }
}

export { nc_IsFileTypeAllowed, nc_ChunkFileUploadRequests }