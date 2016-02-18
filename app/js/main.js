$(document).ready(function() {
  
  var colors = ['#1a48a6', '#a71b3b', '#a6781a', '#1ba768'];

  function rgb2hex(orig){
    var rgb = orig.replace(/\s/g,'').match(/^rgba?\((\d+),(\d+),(\d+)/i);
    return (rgb && rgb.length === 4) ? "#" +
    ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : orig;
  }

    // Функция перевода цвета hex в RGBA - необходимо получить цвет для заливки фонов именно в нем,
    // так как цвет текста расположенного внутри данных элементов должен быть не прозрачным
  function convertHex(hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);
    result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
    return result;
  }

  // Вызываем анонимную функцию по наведению мыши на логотип 
  $('.logo__link').on('mouseenter', function(){ 
    var colorRgb = $(this).closest('.footer').css('background-color');  // определяем текущее значение цвета в rgb
    var color = (rgb2hex(colorRgb)); // переводим из rgb в hex (что бы сравнить с рандомно выбранным значением из массива)
    var newColor, rand;
    var opacity = 100;

    do{
      rand = Math.floor(Math.random() * colors.length); // выбираем рандомно индекс элемента массива со значением цветов
      newColor = colors[rand]; // возвращаем в переменную цвет выбранного выше элемента
    } while (newColor == color); //проверяем является ли выбранный цвет равным текущему, если да - повторяем цикл

    $(this).closest('.footer').css({
      'background-color': convertHex(newColor, 90),
      'transition' : 'all .1s linear'
      }); // задаем футеру выбранный цвет в RGBA с прозрачностью 0.9

    // задаем сылкам фон с уменьшением полупрозрачности на 10% у каждого следующего элемента
    $('.main-menu__item').each(function(index, el) { //
      $(el).find('.main-menu__link').css({
        'background-color' : convertHex(newColor, opacity),
        'transition' : 'all .1s linear'
      });
      opacity = opacity - 10;
    });
  });


  $('.main-menu__link').hover(function(){
    var index = $('.main-menu__link').index(this);
    var textColor = $(this).css('background-color');
    var bgColor = '#ffffff';
    $(this).css({
      'color' : rgb2hex(textColor),
      'background-color' : convertHex(bgColor, 100 - index*10)
    });
  }, function(){
    var index = $('.main-menu__link').index(this);
    var bgColor = rgb2hex($('.footer').css('background-color'));
    $(this).css({
      'color' : "#fff",
      'background-color' : convertHex(bgColor, 100 - index*10)
    });
  });

  $('.submenu__item a').hover(function(){
    var color = $('.footer').css('background-color');
    $(this).css('color', rgb2hex(color));
  }, function(){
    $(this).css('color', '#fff');
  });











  $('.main-menu__link').on('click', function(e){
    e.preventDefault();
    var href = $(this).attr('href');
    getContent(href, true);
  });

  window.addEventListener("popstate", function(e) {

    // Get State value using e.state
    getContent(location.pathname, false);
  });

  function getContent(url, addEntry) {
    $.get(url)
      .done(function(data) {

            $('html').html(data);

            if(addEntry == true) {
                // Add History Entry using pushState
                history.pushState(null, null, url);
            }


    });
  }

});