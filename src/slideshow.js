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

////////////////////////////////////////////////////////////////////////////////////
// SlideShowClass is a re-usable control that uses the exported singleton defined below
// Requires HTML template and slideshow.css file
//
// HTML Template:
//  <dialog id="slide-show-dialog" class="container-popup">
//    <div id="slide-show-container" class="slide-show-container">
//      <div id="slide-show-caption-container" class="slide-show-caption-container">
//        <p id="slide-caption-text" class="slide-caption-text"></p>
//      </div>
//      <a id="slide-show-prev-btn" class="slide-prev">❮❮</a>
//      <a id="slide-show-next-btn" class="slide-next">❯❯</a>
//    </div>
//    <span id="slide-show-close" class="slide-show-close">&times;</span>
//  </dialog>
//
// Example HTML only Usage:
//
//<div class="project-image-caption-slides" data-slide-show-id="my-slides"
//        data-slide-show-slide-images = "./images/slide-image1.webp, ./images/slide-image2.webp"
//        data-slide-show-slide-image-captions = "Slide Caption Text 1, Slide Caption Text 2"
//        onclick="SlideShow.StartSlideShowFromElemEvent(event)">
//  View Slide Show
//</div>
//
//
// Example Code Usage:
//
// let imageNames = new Array("./images/image1.jpg",./images/image2.jpg", ./images/image3.jpg");
// let imageCaptions = new Array("Image Caption 1", "Image Caption 2", "Image Caption 3",);
//
// SlideShow.StartSlideShow(pcimageNames, pcimageCaptions);
//
// Notes:
// User's can close the slideShow dialog by clicking the close button, 
// clicking anywhere else on the page or pressing the Escape key
//
////////////////////////////////////////////////////////////////////////////////////

class SlideShowClass {

  slideIndex = 0;
  slideShowDialog = null;
  slideShowContainer = null;
  slideShowRowContainer = null;
  slideShowNextButton = null;
  slideShowPrevButton = null;
  slideShowCloseButton = null;
  slides = null;
  rowSlides = null;
  captionText = null;
  imageNames = null;
  imageCaptions = null;

  constructor(imageList) {
    console.log("SlideShowClass constructor called");
    this.slideIndex = 0;
    this.slideShowDialog = null;
    this.slideShowContainer = null;
    this.slideShowRowContainer = null;
    this.slideShowNextButton = null;
    this.slideShowPrevButton = null;
    this.slideShowCloseButton = null;
    this.slides = null;
    this.rowSlides = null;
    this.captionText = null;
    this.imageNames = null;
    this.imageCaptions = null;
  }

  StartSlideShowFromElemEvent(evt) {

    let imagesArray = null;
    let imageCaptionArray = null;

    if (!evt || !evt.target || !evt.target.dataset) {
      console.log("Error: StartSlideShowFromElement bad event data: ", evt);
      console.log("evt.target: ", evt.target);
      console.log("evt.target.dataset: ", evt.target.dataset);
    }

    let slideShowElem = evt.target;

    if (!evt.target.dataset.slideShowSlideImages) {
      slideShowElem = document.getElementById(evt.target.dataset.slideShowId);
    }

    if (!slideShowElem) {
      console.log("Error: StartSlideShowFromElement slideShowID: ", evt);
      console.log("evt.target.dataset.slideShowId: ", evt.target.dataset.slideShowId);
      return;
    }

    let imgStrs = slideShowElem.dataset.slideShowSlideImages;

    if (imgStrs) {
      imagesArray = imgStrs.split(',');
    }

    if (slideShowElem.dataset.slideShowSlideImageCaptions) {
      let capStrs = slideShowElem.dataset.slideShowSlideImageCaptions;

      if (capStrs) {
        imageCaptionArray = capStrs.split(',');
      }
    }

    SlideShow.StartSlideShow(imagesArray, imageCaptionArray)
  }

  StartSlideShow(imagesArray, imageCaptionArray) {

    // reset the slideShow
    this.RemoveSlides();

    if (!imagesArray.length) {
      console.log("images Array is empty!");
      return;
    }

    // If no image captions provided, just display the image name as caption

    if (!imageCaptionArray) {
      imageCaptionArray = new Array();
      for (let ii = 0; ii < imagesArray.length; ii++) {
        imageCaptionArray.push(imagesArray[ii])
      }
    }

    this.SetSlideImages(imagesArray);
    this.SetSlideCaptions(imageCaptionArray);

    this.slideShowDialog = document.getElementById("slide-show-dialog");
    this.slideShowNextButton = document.getElementById("slide-show-next-btn");
    this.slideShowPrevButton = document.getElementById("slide-show-prev-btn");
    this.captionText = this.slideShowDialog.getElementsByClassName("slide-caption-text")[0];

    this.slideShowContainer = document.getElementById("slide-show-container");

    this.slideShowRowContainer = document.createElement('div');
    this.slideShowRowContainer.id = "slide-show-row-container";
    this.slideShowRowContainer.classList.add("row");
    this.slideShowRowContainer.classList.add("slide-show-row-container");

    let newSlidesDivElem = document.createElement('div');
    newSlidesDivElem.id = "newSlidesDiv";
    newSlidesDivElem.className = "newSlidesDiv";

    this.AddSlideImages(newSlidesDivElem);

    this.slideShowContainer.appendChild(newSlidesDivElem);
    this.slideShowContainer.appendChild(this.slideShowRowContainer);

    // Hook up event handlers
    this.slideShowCloseButton = document.getElementById("slide-show-close");
    this.slideShowCloseButton.onclick = this.onClose;
    this.slideShowNextButton.onclick = this.plusSlides;
    this.slideShowPrevButton.onclick = this.prevSlides;

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = this.OnWindowClickEvent;
    window.onkeydown = this.OnWindowKeyDownEvent;

    this.showSlides(0);
    this.slideShowDialog.style.display = "flex";
  }

  OnWindowClickEvent(event) {
    if (SlideShow.slideShowDialog && SlideShow.slideShowDialog.style.display != 'none') {

      let slidesFound = false;
      if (event.target.classList) {
        for (let ii = 0; ii < event.target.classList.length; ii++) {
          if ((event.target.classList[ii].indexOf("slide") != -1) ||
          (event.target.classList[ii].indexOf("project-image") != -1)) {
            slidesFound = true;
            break;
          }
        }
      }

      if (!slidesFound) {
        SlideShow.onClose();
      }
    }
  }

  OnWindowKeyDownEvent(event) {
    if (SlideShow.slideShowDialog.style.display != 'none') {
      event.preventDefault = true;
      if ((event.keyCode === 27) || event.key === "Escape") {
        SlideShow.onClose();
      }
    }
  }

  RemoveSlides() {

    // clean-up event handlers

    window.removeEventListener('click', this.OnWindowClickEvent);
    window.removeEventListener('keydown', this.OnWindowKeyDownEvent);

    if (this.slideShowCloseButton) {
      this.slideShowCloseButton.removeEventListener('click', this.onClose);
    }
    if (this.slideShowNextButton) {
      this.slideShowNextButton.removeEventListener('click', this.plusSlides);
    }
    if (this.slideShowPrevButton) {
      this.slideShowPrevButton.removeEventListener('click', this.prevSlides);
    }

    this.slideIndex = 0;
    this.slideShowRowContainer = null;
    this.slideShowDialog = null;
    this.slideShowContainer = null;
    this.slideShowRowContainer = null;
    this.slideShowNextButton = null;
    this.slideShowPrevButton = null;
    this.slideShowCloseButton = null;
    this.slides = null;
    this.rowSlides = null;
    this.captionText = null;
    this.imageNames = null;
    this.imageCaptions = null;

    // clean-up dynamic elements
    let localSlidesDiv = document.getElementById("newSlidesDiv");

    if (localSlidesDiv) {
      localSlidesDiv.remove();
    }

    let localSlideShowRowContainer = document.getElementsByClassName("slide-show-row-container")[0];
    if (localSlideShowRowContainer) {
      localSlideShowRowContainer.remove();
    }

  }

  SetSlideImages(imageNames) {
    this.imageNames = imageNames;
  }

  SetSlideCaptions(imageCaptions) {
    this.imageCaptions = imageCaptions;
  }

  AddSlideImages(newSlidesDivElem) {
    for (let ii = 0; ii < this.imageNames.length; ii++) {

      // Add the slide image
      let newSlide = document.createElement('div');
      newSlide.classList.add("slide-show-slides");
      newSlide.style.display = "none";

      let newSlideImage = document.createElement('img');
      newSlideImage.classList.add("slide-show-slides-img");
      newSlideImage.src = this.imageNames[ii];

      newSlide.appendChild(newSlideImage);
      newSlidesDivElem.appendChild(newSlide);

      // Add the cursor image row
      let newSlideRow = document.createElement("div");
      newSlideRow.classList.add("slide-column");

      let newSlideRowImage = document.createElement("img");
      newSlideRowImage.classList.add("slide-img", "slide-opacity", "slide-cursor", "slide-row-image");
      newSlideRowImage.src = this.imageNames[ii];
      newSlideRowImage.slideIndex = ii;

      newSlideRowImage.onclick = this.SetCurrentSlide;

      newSlideRow.appendChild(newSlideRowImage);
      this.slideShowRowContainer.appendChild(newSlideRow);
    }

    this.slides = this.slideShowContainer.getElementsByClassName("slide-show-slides");
    this.rowSlides = this.slideShowRowContainer.getElementsByClassName("slide-row-image");
  }

  showSlides(slideNumber) {
    if (slideNumber > this.slides.length - 1) { this.slideIndex = 0 }
    if (slideNumber < 0) { this.slideIndex = this.slides.length - 1 }

    for (let ii = 0; ii < this.slides.length; ii++) {
      if (this.slides[ii]) {
        this.slides[ii].style.display = "none";
      }
    }

    this.slides[this.slideIndex].style.display = "block";

    if (this.rowSlides) {
      for (let ii = 0; ii < this.rowSlides.length; ii++) {
        if (this.rowSlides[ii]) {
          this.rowSlides[ii].className = this.rowSlides[ii].className.replace(" slide-active", "");
        }
      }
    }

    if (this.rowSlides && this.rowSlides[this.slideIndex]) {
      this.rowSlides[this.slideIndex].className += " slide-active";
    }

    this.captionText.innerHTML = this.imageCaptions[this.slideIndex];
  }

  ///////////////////////////////////////////////////////////
  // Start Event Handlers

  onClose(event) {
    console.log("closing SlideShow");

    let localSlideShowDialog = document.getElementById("slide-show-dialog");

    localSlideShowDialog.style.display = "none";

    SlideShow.RemoveSlides();
  }

  plusSlides(event) {
    SlideShow.showSlides(SlideShow.slideIndex += 1);
  }

  prevSlides(event) {
    SlideShow.showSlides(SlideShow.slideIndex -= 1);
  }

  SetCurrentSlide(event) {
    let n = event.target.slideIndex;
    SlideShow.showSlides(SlideShow.slideIndex = n);
  }

  currentSlide(n) {
    SlideShow.showSlides(SlideShow.slideIndex = n);
  }

  // End Event Handlers
  ///////////////////////////////////////////////////////////

}

let SlideShow = new SlideShowClass();

