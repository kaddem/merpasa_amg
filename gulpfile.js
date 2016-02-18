var gulp = require('gulp');
var rename = require('gulp-rename');
var minifyCss = require('gulp-minify-css');
var notify = require("gulp-notify");
var autoprefixer = require('gulp-autoprefixer');
var livereload = require('gulp-livereload');
var server = require('gulp-server-livereload');
var less = require('gulp-less');
var spritesmith = require('gulp.spritesmith');
var imagemin = require('gulp-imagemin');
var wiredep = require('wiredep').stream;
var mainBowerFiles = require('main-bower-files');
var useref = require('gulp-useref');
var gulpif = require('gulp-if');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var ftp = require('gulp-ftp'); // если неободимо sftp соединение - заменить gulp-ftp на gulp-sftp(см. package.json)

// Очищаем папку dist дабы убрать оставшийся 
// от пердыдущей сборки проекта на продакшн мусор
gulp.task('clean', function () {
  return gulp.src('dist', {read: false})
  .pipe(clean());
});

// минифицируем графику и сохраняем в папку для 
// продакшена, предварительно очистив ее таском 'clean'
gulp.task('image', ['clean'], function () {
  return gulp.src('app/img/*.*')
  .pipe(imagemin())
  .pipe(gulp.dest('dist/img/'))
});

// собираем весь проект для продакшена:
gulp.task('build', ['image'], function () {
  var assets = useref.assets();
  return gulp.src('app/*.html')
  .pipe(assets)
  .pipe(gulpif('*.js', uglify()))
  .pipe(gulpif('*.css', minifyCss()))
  .pipe(assets.restore())
  .pipe(useref())
  .pipe(gulp.dest('dist'))
});

// Отправка собранного проекта на хостинг - очищает папку dist,
// собирает в нее проект по новой и отправляет на хостинг
gulp.task('ftp', ['build'], function () {
  return gulp.src('dist/**/*')
  .pipe(ftp({
    host: '77.222.56.63', //КЭП и далее тоже
    user: 'kademidovm', // Логин от ftp аккаунта
    pass: 'xiefciicsu', //Указать пароль от ftp акаунта
    port: '21', // указываем при необходимости. порт по умолчанию 22
    remotePath: 'group/public_html/merpasa'
  }));
});

// local server with livereload
gulp.task('webserver', function() {
  gulp.src('app')
  .pipe(server({
    livereload: true,
    directoryListing: false,
    open: true,
    // defaultFile: 'index.html'
  }));
});

// build sprite - png and less files
gulp.task('sprite', function () {
  var spriteData = gulp.src('app/img/sprite/*.*')
  .pipe(spritesmith({
    imgName: 'sprite.png',
    imgPath: '../img/sprite.png',
    cssName: 'sprite.less'
  }));

  spriteData.img
  // .pipe(imagemin()) //графика будет минифицирована при сборке на продакшн
  .pipe(gulp.dest('app/img/'))
  .pipe(notify("Sprite rebuild!"));;
  
  return spriteData.css
  .pipe(gulp.dest('app/less/'));
});

// less compilation. При ошибке в компиляции падает gulp!!!
gulp.task('less', function () {
  return gulp.src('app/less/main.less')
  .pipe(less())
  .pipe(autoprefixer({
    browsers: ['last 15 versions'],
    cascade: false
  }))
    // .pipe(minifyCss())
    // .pipe(rename('style.min.css'))
  .pipe(gulp.dest('app/css'))
  .pipe(notify("Hey, man! less to css complete!"));
});

// compilation bootstrap less files
gulp.task('bootstrapCompil', function () {
  return gulp.src('app/bower_components/bootstrap/less/bootstrap.less')
  .pipe(less())
  .pipe(autoprefixer({
    browsers: ['last 15 versions'],
    cascade: false
  }))
  .pipe(minifyCss())
  .pipe(rename('bootstrap.min.css'))
  .pipe(gulp.dest('app/bower_components/bootstrap/dist/css/'))
  .pipe(notify("Эй мужик! bootstrap перекомпилировали!"));
});

// автоматом прописывает в html файл пути к библиотекам css и js
gulp.task('bower', function () {
  gulp.src('./app/index.html')
  .pipe(wiredep({
    directory : "app/bower_components"
  }))
  .pipe(gulp.dest('app'));
});

// отслеживаем изменения в проекте - less ясен перекомпилирует по новой css, 
// bower - добавляет в html пути к новым библиотекам
// sprite отслеживает появление новой графики для переклеивания спрайта
gulp.task('watch', function (){
  gulp.watch('app/bower_components/bootstrap/less/**/*.less', ['bootstrapCompil']);
  gulp.watch('app/less/**/*.less', ['less']);
  gulp.watch('bower.json', ['bower']);
  gulp.watch('app/img/sprite/*.*', ['sprite']);
});

gulp.task('default', ['webserver', 'sprite', 'less', 'bootstrapCompil', 'bower', 'watch']);

