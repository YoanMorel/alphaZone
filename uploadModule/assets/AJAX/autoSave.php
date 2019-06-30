<?php

  extract($_POST);
  $jsonFile = __DIR__.'/autoSaveBuffer.json';
  if ($order == '66'):
    unlink($jsonFile);
    $response = 'Order 66 completed...';
  else:
    $openFile = fopen($jsonFile, 'w') or die(1);
    $jsonData = $_POST['data'];
    fwrite($openFile, $jsonData);
    fclose($openFile);

    $response = json_encode('Autosave '.date('H:i:s', time()).'...');
  endif;
  echo $response;
 ?>
