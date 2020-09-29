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
   const self = this;

   this.evalTimelineAction = function() {
      if (typeof ImageCapture === "undefined") {
         $('#attach_screenshot_timeline').hide();
      }
   }

   function captureScreenshot(form_obj) {
      navigator.mediaDevices.getDisplayMedia({video: true})
      .then(mediaStream => {
         const track = mediaStream.getVideoTracks()[0];
         imageCapture = new ImageCapture(track);
         imageCapture.grabFrame().then(img => {
            form_obj.empty();
            // I think the canvas size needs to be dynamic...
            form_obj.html(`
               <canvas id="screenshotPreview" width="200" height="180"></canvas>
               <canvas id="screenshotFull" width="200" height="180" style="display: none"></canvas>
               <button type="submit" name="upload" class="vsubmit">${__('Upload')}</button>
            `);
            // Render preview (Fixed size)
            const canvas = form_obj.find('#screenshotPreview').get(0);
            canvas.width = 200;
            canvas.height = 180;
            let ratio  = Math.min(canvas.width / img.width, canvas.height / img.height);
            let x = (canvas.width - img.width * ratio) / 2;
            let y = (canvas.height - img.height * ratio) / 2;
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
               x, y, img.width * ratio, img.height * ratio);

            // Render full size image (Used for sending to server but hidden to user)
            const canvas_full = form_obj.find('#screenshotFull').get(0);
            canvas_full.width = img.width;
            canvas_full.height = img.height;
            canvas_full.getContext('2d').clearRect(0, 0, canvas_full.width, canvas_full.height);
            canvas_full.getContext('2d').drawImage(img, 0, 0, img.width, img.height,
               0, 0, img.width, img.height);
            track.stop();
         })
      });
   }

   $(document).on('click', '#attach_screenshot_timeline', function(event) {
      const edit_panel = $($(this).data('editpanel'));
      const itemtype = $(this).data('itemtype');
      const items_id = $(this).data('items_id');
      captureScreenshot(edit_panel);
      edit_panel.on('click', 'button[name="upload"]', function(e) {
         e.preventDefault();
         const img_format = 'image/png';
         const canvas = edit_panel.find('#screenshotFull').get(0);
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
   });
}