<?php
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

include ('../../../inc/includes.php');
Html::header_nocache();

Session::checkLoginUser();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
   // Bad request method
   die(405);
}
if (!isset($_POST['img'], $_POST['itemtype'], $_POST['items_id'])) {
   // Missing required data
   die(400);
}

$format_ext_map = [
   'image/png'    => 'png',
   'image/jpeg'   => 'jpg'
];

if (!isset($_POST['format'], $format_ext_map[$_POST['format']])) {
   // Unsupported format or missing format
   die(400);
}

$ext = $format_ext_map[$_POST['format']];
// Name format: Screenshot + Timestamp + random 5 character hex + extension
$file_name = 'Screenshot ' . $_SESSION['glpi_currenttime'] . '-' . sprintf('%05X', random_int(0, 1048575)) . '.' . $ext;
$data = file_get_contents($_POST['img']);
// Save image to tmp then add document and link. Adding the document will cleanup the temp file for us.
$file = fopen(GLPI_TMP_DIR . '/' . $file_name, 'wb');
fwrite($file, $data);
fclose($file);

$doc = new Document();
$doc_id = $doc->add([
   'name'         => $file_name,
   '_filename'    => [$file_name]
]);
$doc_item = new Document_Item();
$doc_item->add([
   'documents_id' => $doc_id,
   'itemtype'     => $_POST['itemtype'],
   'items_id'     => $_POST['items_id'],
]);

// In case something fails and the temp file remains, remove it
if (file_exists(GLPI_TMP_DIR . '/' . $file_name)) {
   unlink(GLPI_TMP_DIR . '/' . $file_name);
}