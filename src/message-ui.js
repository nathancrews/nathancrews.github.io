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
// MessageUIClass is a re-usable control that uses the exported singleton defined below
//
// Requires HTML template below and message.css style file
//
// HTML Template:
//
// <!-- Modal message dialog -->
// <dialog class="message-modal message-modal-hide">
// <form class="message-dialog">
//       <div class="message-text"></div>
//       <div class="message-div"></div>
// </form>
// <div class="message-button-bar">
//   <button id="ok" class="message-button-ok" type="button">Ok</button>
//   <button id="cancel" class="message-button-cancel" type="button">Cancel</button>
// </div>
// </dialog>
//
//
// Primary Method: MessageUI.ShowMessage({Dialog Title Text}, {Dialog Message Text}, {Action callback for OK});
//
// Example:
//
// MessageUI.ShowMessage("Photo Mapper", "Do you really want to erase ALL photos from the Map?", PhotoMapApp.ResetMap);
//
// SlideShow.StartSlideShow(pcimageNames, pcimageCaptions);
//
////////////////////////////////////////////////////////////////////////////////////

/** MessageUI.ShowMessage({Dialog Title Text}, {Dialog Message Text}, {Action callback for OK}); */
export class MessageUIClass {

    _messageDialog = null;
    _messageTitleText = null;
    _messageDivNode = null;
    _messageOkButton = null;
    _messageCancelButton = null;
    _okAction = null;
    _returnStatus = false;

    constructor() {

        this._messageDialog = document.getElementsByClassName("message-modal")[0];
        this._messageTitleText = this._messageDialog.getElementsByClassName("message-text")[0];
        this._messageDivNode = this._messageDialog.getElementsByClassName("message-div")[0];
        this._messageOkButton = this._messageDialog.getElementsByClassName("message-button-ok")[0];
        this._messageCancelButton = this._messageDialog.getElementsByClassName("message-button-cancel")[0];
        console.log("MessageUIClass constructor called");
    }

    // message dialog UI

    OkButtonClickEvent(event) {
        event.preventDefault = true;

        this._returnStatus = true;
        MessageUI.HideMessage();
        if (MessageUI._okAction) {
            //console.log("Ok, calling: ", MessageUI._okAction);
            MessageUI._okAction();
        }
    }

    CancelButtonClickEvent(event) {
        event.preventDefault = true;

        this._returnStatus = false;
        console.log("MessageBox Cancelled");
        MessageUI.HideMessage();
    }

    ShowMessage(inTitle, inMessage, inAction) {
        //console.log("messageDialog.style.display: ", this._messageDialog.style.display);

        if (!this._messageDialog || !this._messageTitleText || !this._messageDivNode) {
            console.log("messageDialog HTML not found!");
            return this._returnStatus;
        }

        this._messageTitleText.innerHTML = '';
        this._messageDivNode.innerHTML = '';

        this._messageTitleText.innerHTML = inTitle;
        this._messageDivNode.innerHTML = inMessage;

        this._okAction = inAction;
        this._messageOkButton.onclick = this.OkButtonClickEvent;
        this._messageCancelButton.onclick = this.CancelButtonClickEvent;

        if (!inAction || inAction === undefined) {
            this._messageOkButton.innerText = 'Done';
            this._messageCancelButton.style.display = 'none';
        }
        else {
            this._messageOkButton.innerText = 'Ok';
            this._messageCancelButton.style.display = 'flex';
        }

        if (!this._messageDialog.style.display || this._messageDialog.style.display == 'none') {
            this._messageDialog.style.display = "flex";
        }

        this._messageDialog.showModal();
    }

    HideMessage() {

        this._messageDialog.close();

        this._messageDialog.style.display = 'none';

        if (this._messageDivNode) {
            this._messageTitleText.innerHTML = '';
            this._messageDivNode.innerHTML = '';
        }

    }
}

export let MessageUI = new MessageUIClass();