<?php
  $imgFile = $_POST['file'];
  $name = md5(rand().time().'unPeuDePaprikaPourDonnerDuGoutAMonHash').'.jpg';

  $encodedData = str_replace(' ', '+', $imgFile);
  $decodedData = base64_decode($encodedData);

  file_put_contents('assets/img/'.$name, $decodedData);
  $response = 'assets/img/'.$name;
  echo $response;
 ?>
