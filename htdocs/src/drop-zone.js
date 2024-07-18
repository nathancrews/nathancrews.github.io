var inputElement = document.querySelector(".drop-zone__input");

var dropElementsOrig = document.querySelectorAll(".drop-zone")

dropElementsOrig.forEach((dropElement) => {
	ProcessDropElement(dropElement);
});

var dropElements = document.querySelectorAll(".map-drop-zone")

dropElements.forEach((dropElement) => {
	ProcessDropElement(dropElement);
});

function ProcessDropElement(dropZoneElement){

	//console.log("setting up drop zone element:", dropZoneElement)

	dropZoneElement.addEventListener("dragover", (e) => {
		e.preventDefault();
		dropZoneElement.classList.add("drop-zone--over");
	});

	["dragleave", "dragend"].forEach((type) => {
		dropZoneElement.addEventListener(type, (e) => {
			dropZoneElement.classList.remove("drop-zone--over");
		});
	});

	dropZoneElement.addEventListener("drop", (e) => {
		e.preventDefault();

		//console.log("using inputElement:", inputElement)

		if (inputElement) {

			if (e.dataTransfer.files.length) {
				inputElement.files = e.dataTransfer.files;

				//console.log("inputElement.files.length:", inputElement.files.length)
				var sb = document.querySelectorAll("[type=submit]")[0];

				//console.log("calling click on:", sb)

				if (sb) {
					//	console.log("calling click on:", sb)
					sb.click();
				}
			}
		}

		dropZoneElement.classList.remove("drop-zone--over");
	});
}
