<?php
/*
 -------------------------------------------------------------------------
 Screenshot
 Copyright (C) 2020-2021 by Curtis Conard
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

class PluginScreenshotScreenshot extends CommonGLPI {

    public static function isValidScreenshot(string $file)
    {
        if (!str_starts_with($_POST['img'], 'data:')) {
            return false;
        }
        $config = Config::getConfigurationValues('plugin:screenshot');
        $screenshot_format = $config['screenshot_format'];

        // Security check the actual data is at least an image
        if (extension_loaded('exif')) {
            $etype = exif_imagetype($file);
            $exif_types = [
                'image/jpeg' => IMAGETYPE_JPEG,
                'image/png'  => IMAGETYPE_PNG,
                'image/webp' => IMAGETYPE_WEBP,
            ];
            if ($etype !== $exif_types[$screenshot_format]) {
                return false;
            }
        } else {
            $fileinfo = finfo_open(FILEINFO_MIME_TYPE);
            if (finfo_file($fileinfo, $file) !== $screenshot_format) {
                return false;
            }
        }
        return true;
    }

    public static function isValidScreenRecording(string $file_path)
    {
        $fileinfo = finfo_open(FILEINFO_MIME_TYPE);
        return finfo_file($fileinfo, $file_path) === 'video/webm';
    }

   /**
    * @param array{rand: string, item: CommonITILObject} $params
    * @return false|void
    */
   public static function timelineActions(array $params)
   {
      $rand   = $params['rand'];
      $itilitem = $params['item'];

      $fup = new ITILFollowup();
      $fup->getEmpty();
      $fup->fields['itemtype'] = $itilitem::getType();
      $fup->fields['items_id'] = $itilitem->getID();
      $canadd_fup = $fup->can(-1, CREATE, $tmp) &&
         !in_array($itilitem->fields["status"], array_merge($itilitem::getSolvedStatusArray(), $itilitem::getClosedStatusArray()), true);
      $canadd_document = $canadd_fup || ($itilitem->canAddItem('Document') &&
            !in_array($itilitem->fields["status"], array_merge($itilitem::getSolvedStatusArray(), $itilitem::getClosedStatusArray()), true));

      if (!$canadd_document) {
         return false;
      }

      $edit_panel = "#viewitem".$itilitem->fields['id'].$rand;

      echo "<li class='followup cursor-pointer user-select-none' id='attach_screenshot_timeline' data-editpanel='$edit_panel' data-itemtype='{$itilitem::getType()}' data-items_id='{$itilitem->getID()}'>
            <i class='fas fa-camera'></i>".
         __("Screenshot", 'screenshot')."</li>";
      if (Session::haveRight('plugin_screenshot_recording', CREATE)) {
         echo "<li class='followup cursor-pointer user-select-none' id='attach_screenrecording_timeline' data-editpanel='$edit_panel' data-itemtype='{$itilitem::getType()}' data-items_id='{$itilitem->getID()}'>
            <i class='fas fa-video'></i>" .
            __("Screen Recording", 'screenshot') . "</li>";
      }
      echo Html::scriptBlock('window.GLPIMediaCapture.evalTimelineAction();');
   }

   /**
    * @return array<string, string>
    */
   public static function getScreenshotFormats(): array
   {
      return [
         'image/png'    => 'PNG',
         'image/jpg'    => 'JPG / JPEG',
      ];
   }

   /**
    * @return array<string, string>
    */
   public static function getScreenRecordingFormats(): array
   {
      return [
         'video/webm'   => 'WEBm',
         //'video/mp4'    => 'MP4',
      ];
   }

   public static function getExtensionForMime(string $mime): ?string
   {
      $mappings = [
         'image/png'    => 'png',
         'image/jpg'    => 'jpg',
         'video/webm'   => 'webm',
         //'video/mp4'    => 'mp4',
      ];
      return $mappings[$mime] ?? null;
   }
}
