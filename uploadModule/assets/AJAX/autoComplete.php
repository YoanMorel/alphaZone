<?php

require '../../../../config/config.php';

extract($_POST);

$dataBase = mysqli_connect($serverAJF, $userAJF, $passwordAJF, $baseName);

if (empty($imgSection)):
  $sqlRequest = 'SELECT section FROM sections';
else:
  $sqlRequest = "SELECT sub.subSection FROM subSections sub JOIN sections s ON s.id = sub.id_sections WHERE '$imgSection' = s.section";
endif;

$request = mysqli_query($dataBase, $sqlRequest);
$response = mysqli_fetch_all($request, MYSQLI_NUM);
echo json_encode(array('data' => $response));
mysqli_free_result($request);
mysqli_close($dataBase);

 ?>
