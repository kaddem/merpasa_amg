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

// gulp.task('mainJS', function() {
//     return gulp.src(mainBowerFiles('**/*.js'))
//     .pipe(gulp.dest('app/js/vendor'))
// });

// gulp.task('mainCSS', function() {
//     return gulp.src(mainBowerFiles('**/*.css'))
//     .pipe(gulp.dest('app/css/vendor'))
// });



// Clean dist folder 
gulp.task('clean', function () {
    return gulp.src('dist', {read: false})
        .pipe(clean());
});

// build project
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

// минифицируем графику и отправляем в финальную сборку
gulp.task('image', ['clean'], function () {
  return gulp.src('app/img/*.*')
    .pipe(imagemin())
    .pipe(gulp.dest('dist/img/'))
});

// Отправка собранного проекта на хостинг - очищает папку dist, собирает в нее проект по новой и отправляет на хостинг
gulp.task('ftp', ['build'], function () {
    return gulp.src('dist/**/*')
        .pipe(ftp({
            host: '77.222.56.169', //КЭП и далее тоже)
            user: 'kademidovm', // Логин от ftp аккаунта
            pass: '', //Указать пароль от ftp акаунта
            port: '21', // порт при необходимости. Если убрать этот параметр порт по умолчанию 22
            remotePath: 'group/public_html/testgulp'
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
    // .pipe(imagemin())
    .pipe(gulp.dest('app/img/'))
    .pipe(notify("Sprite rebuild!"));;
  
  return spriteData.css
    .pipe(gulp.dest('app/less/'));
});

// less compilation. При оштбке в компиляции падает gulp!!!
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
  gulp.watch('app/less/**/*.less', ['less']);
  gulp.watch('bower.json', ['bower']);
  gulp.watch('app/img/sprite/*.*', ['sprite']);
});

gulp.task('default', ['webserver', 'sprite', 'less', 'bower', 'watch']);

