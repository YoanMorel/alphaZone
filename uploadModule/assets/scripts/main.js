$(function() {

  // Tableau stockage des images, tableaux stockages des données concernant les images
  var fileStorage = [];
  var dropBox = $('#fileList');
  var objsTab = [];

  //Prototype de l'objet contenant les données concernant les images
  function ObjToUp(id, title, section, text) {
    this.id = id;
    this.title = title;
    this.section = section;
    this.text = text;
  }

  //Lecture du fichier JSON pour remplir le tableaux de données de fichiers si il y a une sauvegarde. Dans le cas elle existe, on affiche une alerte
  $.getJSON('autoSaveBuffer.json', function(data) {
    $.each(data, function(key, val) {
      if (val.text.length) {
        $('div.alert-warning').show();
        objsTab.push(val);
      }
    });
  });

  function dragoverDragenterEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    $(this).css('border', '3px dashed red');
  }

  function dragleaveEvent(event) {
    event.preventDefault();
    event.stopPropagation();
    $(this).css('border', '3px dashed #BBB');
  }

  //Fonction qui se déclenche au glisser-déposer de fichier images. Elle va lire le dataTransfer, boucler sur chaque fichiers et les afficher avec FileReader
  function dropEvent(event) {
    var dataTransfer = event.originalEvent.dataTransfer;
    if (dataTransfer && dataTransfer.files.length) {
      event.preventDefault();
      event.stopPropagation();
      $('div.alert-success').fadeOut();
      $(this).css('border', '3px dashed green');
      $.each(dataTransfer.files, function(i, file) {
        fileStorage.push(file);
        var reader = new FileReader();
        reader.onload = function(event) {
          if (file.type.match('image.*')) {
            $('button#upload').removeClass('btn-danger').addClass('btn-success');
            dropBox.prepend($('<img />', {
              id: i,
              src: event.target.result,
              'class': 'img-fluid imgDrop onHold'
            }));
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }

  // Appels de fonction pour gérer les évènement du DROP
  dropBox.on('dragover dragenter', dragoverDragenterEvent);
  dropBox.on('dragleave', dragleaveEvent);
  dropBox.on('drop', dropEvent);

  // Fonction qui va, à l'aide d'AJAX, envoyer les fichiers vers le serveur. AJAX va executer un script PHP renseigné par son URL. Le fichier PHP va retourner une réponse dans le type de donnée déclaré.
  function upTheReaderLoad(event) {
    var img = {};
    img.file = event.target.result.split(',')[1];
    var str = $.param(img); // Transforme les objets en parametres transmissibles par méthode POST. Dans ce cas, img.file de viendra transmis par AJAX en method POST file=IMGBASE64
    $.ajax({
      type: 'POST',
      url: 'uploadHandler.php',
      data: str,
      success: function(response) {},
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.log('Status :' + textStatus + ' Error:' + errorThrown);
      }
    });
  }

  // Fonction qui va transférer les fichiers de manières asynchrone
  function UploadFiles(imgToUp) {
    var reader = new FileReader;

    reader.onload = upTheReaderLoad;
    reader.readAsDataURL(imgToUp);
  }

  // Le click déclenche l'upload en instançiant l'obj UploadFiles
  $('button#upload').on('click', function() {
    $.each(fileStorage, function(i, file) {
      new UploadFiles(file);
    });
    $('div.alert-success').show();
    $('button#upload').removeClass('btn-success').addClass('btn-danger');
    dropBox.css('border', '3px dashed #BBB');
    dropBox.empty();
    objsTab = [];
    fileStorage = [];
  });

  // Fonction qui se déclenche en fonction du clic sur une image dropé dans la dropBox. Elle va déclencher l'apparition de la zone de texte et plus de paramètres (à venir) et afficher le texte qui correspond à l'image si déjà tapé/enregistré
  $(document).on('click', 'img.onHold', function() {
    var imgId = $(this).attr('id');
    var textArea = $('textarea.onHoldTextImg');
    var divIne = $('div#onHoldTextarea');
    var imgTitle = $('input#imgTitle');

    if (divIne.css('display') !== 'none' && textArea.attr('name') !== imgId) {
      divIne.hide();
      imgTitle.val('');
      textArea.val('');
    }

    textArea.attr('name', imgId);
    var objFound = objsTab.find(x => x.id === textArea.attr('name'))
    if (objFound) {
      $('div.alert-warning').fadeOut();
      imgTitle.val(objsTab[objsTab.indexOf(objFound)].title);
      textArea.val(objsTab[objsTab.indexOf(objFound)].text);
    }
    divIne.show();
  });

  // Event qui enregistre en temps réel le text tapé dans chaque "textarea". Il peut aussi sauvegarder automatiquement le texte dans un buffer JSON toutes les 5 secondes si aucune touche n'a été pressée dans l'intervale de temps.
  var autoSaveTimer;

  $('textarea').on('keyup', function() {
    var idTextarea = $(this).attr('name');
    var objFound = objsTab.find(x => x.id === idTextarea);
    var textInArea = $(this).val();
    var imgTitle = $('input#imgTitle').val();
    var imgSection = $('input#imgSection').val();

    if (!objsTab.length || !objFound) {
      objsTab.push(new ObjToUp(idTextarea, imgTitle, imgSection, textInArea));
    } else {
      var objTabIndex = objsTab.indexOf(objFound);
      objsTab[objTabIndex].title = imgTitle;
      objsTab[objTabIndex].section = imgSection;
      objsTab[objTabIndex].text = textInArea;
    }

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    autoSaveTimer = setTimeout(autoSaveData, 5000);

    $(this).css({
      'height': 'auto',
      'margin-bottom': '20px'
    });
    $(this).height($(this)[0].scrollHeight + 'px'); //this[0] pour pouvoir utiliser nativement scrollHeight
  });

  // Fonction qui va être appelé par le timer au bout de x secondes. Elle va envoyer les données concernant les images sous forme de données JSON et à l'aide d'AJAX, les enregistrer dans un fichier JSON qui sera lu en cas de perte de session.
  function autoSaveData() {
    if (objsTab.length) {
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: 'autoSave.php',
        data: {
          data: JSON.stringify(objsTab)
        },
        success: function(response) {
          console.log(response);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          console.log('Status :' + textStatus + ' Error:' + errorThrown);
        }
      });
    }
  }

});
