<?php

  require '../../../../config/config.php';

  extract($_POST);

  $dataBase       = mysqli_connect($serverAJF, $userAJF, $passwordAJF, $baseName);
  $name           = md5(rand().time().'unPeuDePaprikaPourDonnerDuGoutAMonHash').'.jpg';
  $encodedData    = str_replace(' ', '+', $file);
  $decodedData    = base64_decode($encodedData);
  $sectionLink    = '../img/'.$section;
  $subSectionLink = '../img/'.$section.'/'.$subSection;

  /**
  * Penser à supprimer le buffer une fois les fichiers et leurs informations chargés
  */

  if (is_dir($sectionLink)):
    if (is_dir($subSectionLink)):
      file_put_contents($subSectionLink.'/'.$name, $decodedData);
    else:
      mkdir($subSectionLink);
      file_put_contents($subSectionLink.'/'.$name, $decodedData);
    endif;
  else:
    mkdir($sectionLink);
    mkdir($subSectionLink);
    file_put_contents($subSectionLink.'/'.$name, $decodedData);
  endif;

  $response = 'assets/img/'.$name.' loaded '.date('H:i:s', time()).'...';
  echo $response;
  mysqli_close($dataBase);
  ?>
