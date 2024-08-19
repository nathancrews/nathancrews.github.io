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
// Requires and HTML template and slideshow.css file
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
// Example Usage:
//
// let imageNames = new Array("./images/image1.jpg",./images/image2.jpg", ./images/image3.jpg");
// let imageCaptions = new Array("Image Caption 1", "Image Caption 2", "Image Caption 3",);
//
// SlideShow.StartSlideShow(pcimageNames, pcimageCaptions);
//
////////////////////////////////////////////////////////////////////////////////////
export class SlideShowClass {

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

  RemoveSlides() {

    if (this.slideShowCloseButton) {
      this.slideShowCloseButton.removeEventListener('click', this.onClose);
    }
    if (this.slideShowNextButton) {
      this.slideShowNextButton.removeEventListener('click', this.onClose);
    }
    if (this.slideShowPrevButton) {
      this.slideShowPrevButton.removeEventListener('click', this.onClose);
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

  StartSlideShow(imagesArray, imageCaptionArray) {

    if (!imagesArray.length) {
      console.log("images Array is empty!");
      return;
    }

    if (!imageCaptionArray.length) {
      for (let ii = 0; ii < imagesArray.length; ii++) {
        imageCaptionArray.add(this.imagesArray[ii])
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

    let newSlidesDiv = document.createElement('div');
    newSlidesDiv.id = "newSlidesDiv";
    newSlidesDiv.className = "newSlidesDiv";

    for (let ii = 0; ii < this.imageNames.length; ii++) {

      let newSlide = document.createElement('div');
      newSlide.classList.add("slide-show-slides");
      newSlide.style.display = "none";

      let newSlideImage = document.createElement('img');
      newSlideImage.classList.add("slide-show-slides-img");
      newSlideImage.src = this.imageNames[ii];

      newSlide.appendChild(newSlideImage);
      newSlidesDiv.appendChild(newSlide);

      let newSlideRow = document.createElement("div");
      newSlideRow.classList.add("column");

      let newSlideRowImage = document.createElement("img");
      newSlideRowImage.classList.add("slide-opacity", "cursor", "row-image");
      newSlideRowImage.src = this.imageNames[ii];
      newSlideRowImage.slideIndex = ii;

      newSlideRowImage.onclick = this.SetCurrentSlide;

      newSlideRow.appendChild(newSlideRowImage);
      this.slideShowRowContainer.appendChild(newSlideRow);
    }

    this.slideShowContainer.appendChild(newSlidesDiv);
    this.slideShowContainer.appendChild(this.slideShowRowContainer);

    this.slideShowCloseButton = document.getElementById("slide-show-close");
    this.slideShowCloseButton.onclick = this.onClose;
    this.slideShowNextButton.onclick = this.plusSlides;
    this.slideShowPrevButton.onclick = this.prevSlides;

    this.slides = this.slideShowContainer.getElementsByClassName("slide-show-slides");
    this.rowSlides = this.slideShowRowContainer.getElementsByClassName("row-image");

    this.showSlides(0);
    this.slideShowDialog.style.display = "flex";
  }

  onClose(event) {
    console.log("close clicked");

    let localSlideShowDialog = document.getElementById("slide-show-dialog");

    localSlideShowDialog.style.display = "none";

    SlideShow.RemoveSlides();
  }

  plusSlides(event) {
    SlideShow.showSlides(SlideShow.slideIndex += 1);
    //console.log("next clicked, index : ", SlideShow.slideIndex);
  }

  prevSlides(event) {
    SlideShow.showSlides(SlideShow.slideIndex -= 1);
    //console.log("prev clicked, index : ", SlideShow.slideIndex);
  }

  SetCurrentSlide(event) {
    //console.log("event.target.slideIndex  : ", event.target.slideIndex);
    let n = event.target.slideIndex;
    SlideShow.showSlides(SlideShow.slideIndex = n);
  }

  currentSlide(n) {
    SlideShow.showSlides(SlideShow.slideIndex = n);
  }

  showSlides(n) {
    if (n > this.slides.length - 1) { this.slideIndex = 0 }
    if (n < 0) { this.slideIndex = this.slides.length - 1 }

    //console.log("this.slideIndex", this.slideIndex);
    //console.log("this.slides", this.slides);
    for (let i = 0; i < this.slides.length; i++) {

      if (this.slides[i]) {
        this.slides[i].style.display = "none";
      }
    }

    //console.log("this.slides[this.slideIndex], this.slideIndex=", this.slides[this.slideIndex], this.slideIndex);
    this.slides[this.slideIndex].style.display = "block";

    if (this.rowSlides) {
      for (let i = 0; i < this.rowSlides.length; i++) {
        if (this.rowSlides[i]) {
          this.rowSlides[i].className = this.rowSlides[i].className.replace(" active", "");
        }
      }
    }

    if (this.rowSlides && this.rowSlides[this.slideIndex]) {
      this.rowSlides[this.slideIndex].className += " active";
    }

    this.captionText.innerHTML = this.imageCaptions[this.slideIndex];
  }

}

export let SlideShow = new SlideShowClass();
