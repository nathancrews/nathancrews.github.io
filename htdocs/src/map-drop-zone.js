
function InitDropElements(dropElements) {

	dropElements.forEach((dropElement) => {
		ProcessDropElement(dropElement);
	});
}

function ProcessDropElement(dropZoneElement) {

	//console.log("setting up drop zone element:", dropZoneElement)

	dropZoneElement.addEventListener("dragover", (e) => {
		e.preventDefault();

		if (!dropZoneElement.classList.contains("map-drop-zone--over")) {
			//console.log("Adding class: map-drop-zone--over to ", dropZoneElement)
			dropZoneElement.classList.add("map-drop-zone--over");
		}
	});

	["dragleave", "dragend"].forEach((type) => {
		dropZoneElement.addEventListener(type, (e) => {
			if (dropZoneElement.classList.contains("map-drop-zone--over")) {
				//console.log("Removing event: ${type} removing drop-zone--over", dropZoneElement)
				dropZoneElement.classList.remove("map-drop-zone--over");
			}
		});
	});

	dropZoneElement.addEventListener("drop", (e) => {
		e.preventDefault();

		let inputElement = document.querySelector(".map-drop-zone__input");
		//console.log("using inputElement:", inputElement)

		if (inputElement) {

			if (e.dataTransfer.files.length) {
				inputElement.files = e.dataTransfer.files;

				var sb = document.querySelectorAll("[type=submit]")[0];

				//console.log("calling click on:", sb)

				if (sb) {
					//	console.log("calling click on:", sb)
					sb.click();
				}
			}
			else {
				let fileUrl = e.dataTransfer.getData('Text');

//				url2blob(fileUrl);

				console.log("e.dataTransfer.getData('Text'): ", fileUrl);

				var response = fetch(fileUrl, { mode: "no-cors"
				}).then(res => { console.log(res); res.blob() })
					.then(blob => {
						console.log(blob);

						let fileFromUrl = new File([blob], 'image', {type: blob.type});
						console.log(fileFromUrl);

						let resFile = ReadDataFile(fileFromUrl);
						console.log(resFile);

					}).catch(error => {
						console.log("Error: downloading image file: fetch error: ");
						console.log(error);
					});

			}


		}

		dropZoneElement.classList.remove("map-drop-zone--over");
	});
}

function ReadDataFile(urlToRead) {

	const fr = new FileReader();

	fr.addEventListener('load', () => {
		const res = fr.result;
		const resFile = res.blob;

		console.log(resFile);
	});

	console.log(fr.readAsDataURL(urlToRead));
	
}

async function url2blob(url) {
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

export { InitDropElements }