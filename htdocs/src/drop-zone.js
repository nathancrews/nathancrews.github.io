
var dropElementsOrig = document.querySelectorAll(".drop-zone")

dropElementsOrig.forEach((dropElement) => {
	ProcessDropElement(dropElement);
});

function ProcessDropElement(dropZoneElement) {

	//console.log("setting up drop zone element:", dropZoneElement)

	dropZoneElement.addEventListener("dragover", (e) => {
		e.preventDefault();

		if (!dropZoneElement.classList.contains("drop-zone--over")) {
			//console.log("Adding class: drop-zone--over to ", dropZoneElement)
			dropZoneElement.classList.add("drop-zone--over");
		}
	});

	["dragleave", "dragend"].forEach((type) => {
		dropZoneElement.addEventListener(type, (e) => {
			if (dropZoneElement.classList.contains("drop-zone--over")) {
				//console.log("Removing event: ${type} removing drop-zone--over", dropZoneElement)
				dropZoneElement.classList.remove("drop-zone--over");
			}
		});
	});

	dropZoneElement.addEventListener("drop", (e) => {
		e.preventDefault();

		let inputElement = document.querySelector(".drop-zone__input");
		
		console.log("using inputElement:", inputElement)

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
			else 
			{
				console.log("e.dataTransfer: ", e.dataTransfer);
			}


		}

		dropZoneElement.classList.remove("drop-zone--over");
	});
}
