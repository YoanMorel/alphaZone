$(function() {

  // Liste de selecteurs couramment utilisés
  var dropBox = $('#fileList');
  var divIne = $('div#onHoldTextarea');
  var imgTitle = $('input#imgTitle');
  var imgSection = $('input#imgSection');
  var imgSubSection = $('input#imgSubSection');
  var textArea = $('textarea.onHoldTextImg');

  // Tableau stockage des images, tableaux stockages des données concernant les images, tableaux pour l'autocompletion
  var fileStorage = [];
  var objsTab = [];
  var autoCompleteSections = [];
  var autoCompleteSubSections = [];

  //Prototype de l'objet contenant les données concernant les images
  function ObjToUp(id, title, section, subSection, text) {
    this.id = id;
    this.title = title;
    this.section = section;
    this.subSection = subSection;
    this.text = text;
  }

  // Fonction qui retourne l'index de l'objet trouvé dans un tableau
  function fetchTheObj(tab, target) {
    return tab.find(x => x.id === target)
  }

  // Requête AJAX pour l'autocomplétion. Elle récupère d'abord les sections puis, une fois la section sélectionnée et si elle existe, récupère ses sous-sections. La requête attend son due au format JSON. Est récupéré un objet particulier : un tableau 4 dims encodé en JSON
  function autoCompleteSources(section) {
    $.ajax({
      type: 'POST',
      url: 'assets/AJAX/autoComplete.php',
      dataType: 'json',
      data: {
        'imgSection': section
      },
      success: function(data) {
        if (autoCompleteSubSections.length) {
          autoCompleteSubSections = [];
        }
        for (var x in data['data']) {
          for (var y in data['data'][x]) {
            if (section) {
              autoCompleteSubSections.push(data['data'][x][y]);
            } else {
              autoCompleteSections.push(data['data'][x][y]);
            }
          }
        }
      },
      error: function(XMLHttpRequest, textStatus, errorThrown) {
        console.log('Status :' + textStatus + ' Error:' + errorThrown);
      }
    });
  }

  // Execute la fonction pour l'autocomplétion dès le chargement
  if (!autoCompleteSections.length) {
    autoCompleteSources('');
  }

  // Lecture du fichier JSON pour remplir le tableaux de données de fichiers si il y a une sauvegarde. Dans le cas elle existe, on affiche une alerte
  $.getJSON('assets/AJAX/autoSaveBuffer.json', function(data) {
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
            dropBox.append(
              '<div class="btnOverImg" data-imgid="' + i + '"><img id="' + i + '" class="imgDrop onHold" src="' + event.target.result + '" /><button name="' + i + '" class="btn"><i class="far fa-trash-alt"></i></button></div>');
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
  // Fonction qui va transférer les fichiers de manières asynchrone
  function UploadFiles(imgToUp, index) {
    var reader = new FileReader;
    var img = {};
    var objInTab = objsTab[index];

    reader.onload = function(event) {
      img.file = event.target.result.split(',')[1]; // Découpe les données B64 et assigne la seconde valeur du tableau
      if (objInTab) {
        img.title = objInTab.title;
        img.section = objInTab.section;
        img.subSection = objInTab.subSection;
        img.text = objInTab.text;
      }
      var postUrl = $.param(img); // Transforme les objets en parametres transmissibles par méthode POST. Dans ce cas, img.file de viendra transmis par AJAX en method POST file=IMGBASE64

      $.ajax({
        type: 'POST',
        url: 'assets/AJAX/uploadHandler.php',
        data: postUrl,
        success: function(response) {
          console.log(response);
        },
        error: function(XMLHttpRequest, textStatus, errorThrown) {
          console.log('Status :' + textStatus + ' Error:' + errorThrown);
        }
      });
    };
    reader.readAsDataURL(imgToUp);
  }

  // Le click déclenche l'upload en instançiant l'obj UploadFiles
  $('button#upload').on('click', function() {
    $.each(fileStorage, function(i, file) {
      new UploadFiles(file, i);
    });

    // A sécuriser en cas d'echec de transfert !!!!
    $('div.alert-success').show();
    $('button#upload').removeClass('btn-success').addClass('btn-danger');
    $('input, textarea').empty();
    $('#onHoldTextarea').hide();
    dropBox.css('border', '3px dashed #BBB');
    dropBox.empty();
    objsTab = [];
    fileStorage = [];
  });

  // Fonction qui se déclenche en fonction du clic sur une image dropé dans la dropBox. Elle va déclencher l'apparition de la zone de texte et plus de paramètres (à venir) et afficher le texte qui correspond à l'image si déjà tapé/enregistré
  $(document).on('click', 'img.onHold', function() {
    var imgId = $(this).attr('id');

    if (divIne.css('display') !== 'none' && textArea.attr('name') !== imgId) {
      divIne.hide();
      $('textarea, input').val('');
    }

    textArea.attr('name', imgId);
    var objFound = fetchTheObj(objsTab, textArea.attr('name'));
    if (objFound) {
      $('div.alert-warning').fadeOut();
      imgTitle.val(objsTab[objsTab.indexOf(objFound)].title);
      imgSection.val(objsTab[objsTab.indexOf(objFound)].section);
      imgSubSection.val(objsTab[objsTab.indexOf(objFound)].subSection);
      textArea.val(objsTab[objsTab.indexOf(objFound)].text);
    }
    divIne.show();
  });

  $(document).on('click', '.btnOverImg button.btn', function() {
    var btnId = $(this).attr('name');
    var divParentId = $(this).parent().data('imgid');
    var objFound = fetchTheObj(objsTab, btnId);

    if (btnId == divParentId) {
      var idToRemove = parseInt(btnId);
      fileStorage.splice(idToRemove, 1, {})
      if (objsTab && objFound) {
        objsTab[objsTab.indexOf(objFound)] = {};
      }
      $(this).parent().remove();
      $('#onHoldTextarea').hide();
      $('textarea, input').val('');
      if (!$('img').length) {
        dropBox.css('border', '3px dashed #BBB');
        $('button#upload').removeClass('btn-success').addClass('btn-danger');
      }
    }
  });

  // Event qui enregistre en temps réel le text tapé dans chaque "textarea". Il peut aussi sauvegarder automatiquement le texte dans un buffer JSON toutes les 5 secondes si aucune touche n'a été pressée dans l'intervale de temps.
  var autoSaveTimer;

  $('textarea, input').on('keyup', function() {
    var idTextarea = textArea.attr('name');
    var textInArea = textArea.val();
    var imgTitleContent = imgTitle.val();
    var imgSectionContent = imgSection.val();
    var imgSubSectionContent = imgSubSection.val();
    var objFound = fetchTheObj(objsTab, idTextarea);
    var counter = 0;

    if (!objsTab.length || !objFound) {
      objsTab.push(new ObjToUp(idTextarea, imgTitleContent, imgSectionContent, imgSubSectionContent, textInArea));
    } else {
      var objTabIndex = objsTab.indexOf(objFound);
      objsTab[objTabIndex].title = imgTitleContent;
      objsTab[objTabIndex].section = imgSectionContent;
      objsTab[objTabIndex].subSection = imgSubSectionContent;
      objsTab[objTabIndex].text = textInArea;
    }

    // Vérifie si tous les champs ont été renseignés pour activer le bouton d'upload
    $.each(objsTab, function(i, obj) {
      if (obj.section && obj.subSection && obj.title) {
        counter++;
      }
    });
    if (objsTab && counter == fileStorage.length) {
      $('button#upload').removeClass('btn-danger').addClass('btn-success').prop('disabled', false);
    } else {
      $('button#upload').removeClass('btn-success').addClass('btn-danger').prop('disabled', true);
    }

    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    if (textInArea || imgTitleContent || imgSectionContent || imgSubSectionContent) {
      autoSaveTimer = setTimeout(autoSaveData, 5000);
    }

    textArea.css({
      'height': 'auto',
      'margin-bottom': '20px'
    });
    textArea.height(textArea[0].scrollHeight + 'px'); //this[0] pour pouvoir utiliser nativement scrollHeight
    // scroll automatique quand le champ de text descend en dessous de la taille de la fenetre
    var textLength = textArea.height() + textArea.offset().top;
    if (textLength >= $(window).height()) {
      window.scroll(0, (textLength + 35));
    }
  });

  // Fonction qui va être appelé par le timer au bout de x secondes. Elle va envoyer les données concernant les images sous forme de données JSON et à l'aide d'AJAX, les enregistrer dans un fichier JSON qui sera lu en cas de perte de session.
  function autoSaveData() {
    if (objsTab.length) {
      $.ajax({
        type: 'POST',
        dataType: 'json',
        url: 'assets/AJAX/autoSave.php',
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

  $('input#imgSection').autocomplete({
    source: autoCompleteSections
  });

  $('input#imgSubSection').autocomplete({
    source: autoCompleteSubSections
  });

  $('input#imgSubSection').focus(function() {
    var imgSectionContent = imgSection.val();
    if (imgSectionContent) {
      autoCompleteSources(imgSectionContent);
    }
  });

});
