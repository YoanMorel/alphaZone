<?php

  $jsonFile = __DIR__.'/autoSaveBuffer.json';
  $openFile = fopen($jsonFile, 'w') or die(1);
  $jsonData = $_POST['data'];
  fwrite($openFile, $jsonData);
  fclose($openFile);

  $response = json_encode('Autosave '.date('H:i:s', time()).'...');
  echo $response;

 ?>
