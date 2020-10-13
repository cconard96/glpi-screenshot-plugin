/*
 -------------------------------------------------------------------------
 Screenshot
 Copyright (C) 2020 by Curtis Conard
 https://github.com/cconard96/glpi-screenshot-plugin
 -------------------------------------------------------------------------
 LICENSE
 This file is part of Screenshot.
 Screenshot is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 (at your option) any later version.
 Screenshot is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.
 You should have received a copy of the GNU General Public License
 along with Screenshot. If not, see <http://www.gnu.org/licenses/>.
 --------------------------------------------------------------------------
 */

/* global CFG_GLPI */
/* global GLPI_PLUGINS_PATH */
window.GLPIMediaCapture = new function() {

   /**
    * Array storing the size used for the preview canvas in the format [width, height].
    * @type {number[]}
    */
   const preview_size = [200, 180];

   /**
    * Check if the browser supports this feature. If not, this will hide the timeline button.
    */
   this.evalTimelineAction = function() {
      if (typeof ImageCapture === "undefined") {
         $('#attach_screenshot_timeline').hide();
         $('#attach_screenrecording_timeline').hide();
      }
   }

   /**
    * Update a preview and full-size canvas based on the supplied image.
    * Each canvas parameter is optional and can be skipped by setting it to null.
    *
    * @param {ImageBitmap} img The image.
    * @param {HTMLCanvasElement} preview The canvas being used to preview the image/frame.
    * @param {HTMLCanvasElement} full The full-size canvas that stores the image/frame. Not needed if doing a recording.
    */
   function updateCanvases(img, preview = null, full = null) {
      if (preview !== null) {
         preview.width = preview_size[0];
         preview.height = preview_size[1];
         let ratio = Math.min(preview.width / img.width, preview.height / img.height);
         let x = (preview.width - img.width * ratio) / 2;
         let y = (preview.height - img.height * ratio) / 2;
         preview.getContext('2d').clearRect(0, 0, preview.width, preview.height);
         preview.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
            x, y, img.width * ratio, img.height * ratio);
      }
      if (full !== null) {
         full.width = img.width;
         full.height = img.height;
         full.getContext('2d').clearRect(0, 0, full.width, full.height);
         full.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
            0, 0, img.width, img.height);
      }
   }

   /**
    * Prompt the user to select a screen device, (re)-build the form, grab the first frame only, and update the preview and full-size image canvases.
    * @param {jQuery} form_obj The form object that will be cleared and have the canvases and upload button added to.
    * @param {string} itemtype The type of the item this recording would be attached to.
    * @param {integer} items_id The ID of the item this recording would be attached to.
    */
   function captureScreenshot(form_obj, itemtype, items_id) {
      navigator.mediaDevices.getDisplayMedia({video: true})
      .then(mediaStream => {
         const track = mediaStream.getVideoTracks()[0];
         // Clear any previous elements in case this is being reused
         form_obj.empty();
         // Remove any previous event handlers
         form_obj.off();
         form_obj.html(`
            <canvas id="screenshotPreview" width="${preview_size[0]}" height="${preview_size[1]}"></canvas>
            <canvas id="screenshotFull" width="200" height="180" style="display: none"></canvas>
            <button type="submit" name="upload" class="vsubmit">${__('Upload')}</button>
         `);
         // Bind upload action handler
         form_obj.on('click', 'button[name="upload"]', function(e) {
            e.preventDefault();
            const img_format = 'image/png';
            const canvas = form_obj.find('#screenshotFull').get(0);
            const base64 = canvas.toDataURL(img_format);
            const ajax_data = {
               itemtype: itemtype,
               items_id: items_id,
               format: img_format,
               img: base64
            };
            $(this).attr('disabled', true);
            $.ajax({
               type: 'POST',
               url: CFG_GLPI.root_doc+"/"+GLPI_PLUGINS_PATH.screenshot+"/ajax/screenshot.php",
               data: ajax_data
            }).done(function() {
               location.reload();
            });
         });
         imageCapture = new ImageCapture(track);
         imageCapture.grabFrame().then(img => {
            updateCanvases(img, form_obj.find('#screenshotPreview').get(0), form_obj.find('#screenshotFull').get(0));
            track.stop();
         })
      });
   }

   /**
    * Prompt the user to select a screen device, (re)-build the form, and start the MediaRecorder.
    * Then, this will continually grab frames from the video stream at a rate of 30 FPS and update the preview canvas.
    * @param {jQuery} form_obj The form object that will be cleared and have the canvases and buttons added to.
    * @param {string} itemtype The type of the item this recording would be attached to.
    * @param {integer} items_id The ID of the item this recording would be attached to.
    */
   function captureScreenRecording(form_obj, itemtype, items_id) {
      navigator.mediaDevices.getDisplayMedia({video: true})
         .then(mediaStream => {
            const track = mediaStream.getVideoTracks()[0];
            const recorder = new MediaRecorder(mediaStream, {mimeType: 'video/webm'})
            let blob = null;

            const stopRecording = function() {
               recorder.stop();
               const tracks = mediaStream.getTracks();
               tracks.forEach(function(track) {
                  track.stop();
               });
               $(this).parent().append(`<button type="button" name="upload" class="vsubmit">${__('Upload')}</button>`);
               $(this).remove();
            }
            const upload = function() {
               if (blob === null) {
                  return;
               }
               $(this).attr('disabled', true);
               const data = new FormData();
               data.append('blob', blob);
               data.append('itemtype', itemtype);
               data.append('items_id', items_id);
               data.append('format', 'video/webm');
               $.ajax({
                  type: 'POST',
                  url: CFG_GLPI.root_doc+"/"+GLPI_PLUGINS_PATH.screenshot+"/ajax/screenshot.php",
                  data: data,
                  //contentType: 'video/webm',
                  processData: false,
                  contentType: false
               }).done(function() {
                  location.reload();
               });
            }

            // Clear any previous elements in case this is being reused
            form_obj.empty();
            // Remove any previous event handlers
            form_obj.off();
            form_obj.html(`
               <canvas id="screenshotPreview" width="${preview_size[0]}" height="${preview_size[1]}"></canvas>
               <button type="button" name="stop" class="vsubmit">${__('Stop')}</button>
            `);
            $(form_obj).on('click', 'button[name="stop"]', stopRecording);
            $(form_obj).on('click', 'button[name="upload"]', upload);
            imageCapture = new ImageCapture(track);

            const grab_preview_frame = setInterval(function() {
               if (track.readyState === 'ended') {
                  clearInterval(grab_preview_frame);
                  return;
               }
               imageCapture.grabFrame().then(img => {
                  // Depending on how quickly this occurs, some frames may be rendered out of sequence since this isn't blocking.
                  // It probably doesn't matter much as this is just for the preview
                  updateCanvases(img, form_obj.find('#screenshotPreview').get(0));
               }).catch(function() {});
            }, 1000 / 30); // 30 FPS

            let chunks = [];
            recorder.ondataavailable = function(event) {
               if (event.data.size > 0) {
                  chunks.push(event.data);

                  // Create blob
                  blob = new Blob(chunks, {
                     type: 'video/webm'
                  });
               }
            }
            // Start recording the video stream
            recorder.start();
         });
   }

   $(document).on('click', '#attach_screenshot_timeline', function() {
      const edit_panel = $($(this).data('editpanel'));
      const itemtype = $(this).data('itemtype');
      const items_id = $(this).data('items_id');
      captureScreenshot(edit_panel, itemtype, items_id);
   });

   $(document).on('click', '#attach_screenrecording_timeline', function() {
      const edit_panel = $($(this).data('editpanel'));
      const itemtype = $(this).data('itemtype');
      const items_id = $(this).data('items_id');
      captureScreenRecording(edit_panel, itemtype, items_id);
   });
}