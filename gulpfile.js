const gulp = require('gulp'); //подключаем gulp
const rigger = require('gulp-rigger'); //импорт файлы
const uglify = require('gulp-uglify'); //минифицирование js файлов
const concat = require('gulp-concat');  //склеивает файлы
const order = require('gulp-order');  //управлять порядком
const minifyCss = require('gulp-minify-css'); //сжимает css
const imagemin = require('gulp-imagemin'); //сжатие картинок .png .jpeg .gif .svg
const cache = require('gulp-cache');   //кеширует файлы
const browserSync = require('browser-sync');    // сервер 
const reload = browserSync.reload;              // перезагрузка сервера
const shell = require('gulp-shell');            // gulp shell
const runSequence = require('run-sequence');    // запускает задачи по очереди
const clean = require('gulp-clean');            // удаляет файл или папку

const path = {
    src: {
        html: [
            'src/*.html',
            'src/html-parts/*.html'
            ],
        styles: [
            'src/css/tools/reset.css',
            'src/css/grid/grid.css',
            'src/css/fontawesome/font-awesome.css',
            'src/css/css-parts/*.css',
            'src/css/pages/*.css',
            'src/css/*.css'
        ],
        js: [
            'src/js/vendors/**/*.js',
            'src/js/main.js'
        ],
        images: 'src/images/',
        fonts: 'src/fonts/**/*'
    },
    build: {
        html: 'build/',
        css: 'build/css/',
        js: 'build/js/',
        images: 'build/images/',
        fonts: 'build/fonts/'
    },
    watch: {
        html: 'src/**/*.html',
        css: 'src/css/**/*.css',
        js: 'src/js/**/*.js',
        images: 'src/images/**/*',
        fonts: 'src/fonts/**/*'
    },
    clean: 'build' 
}

gulp.task('html', function () {
    return gulp.src(path.src.html)
        .pipe(rigger())
        .pipe(gulp.dest(path.build.html))
        .pipe(reload({stream: true}));
});

gulp.task('js', function () {
    return gulp.src(path.src.js)
        .pipe(order(['jquery-3.3.1.min.js', '!main.js']))
        .pipe(uglify())
        .pipe(concat('main.js'))
        .pipe(gulp.dest(path.build.js))
        .pipe(reload({stream: true}));
});

gulp.task('css', function () {
    return gulp.src(path.src.styles)
        .pipe(minifyCss())
        .pipe(concat('main.css'))
        .pipe(gulp.dest(path.build.css))
        .pipe(reload({stream: true}));
});

gulp.task('fonts', function () {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts))
        .pipe(reload({stream: true}));
});

gulp.task('images', function () {
    return gulp.src(path.src.images + '**/*')
        .pipe(cache(imagemin([
                imagemin.gifsicle({interlaced: true}),
                imagemin.jpegtran({progressive: true}),
                imagemin.optipng({optimizationLevel: 5}),
                imagemin.svgo({
                    plugins: [
                        {removeViewBox: true},
                        {cleanupIDs: false}
                    ]
                })
            ], {
                verbose: true
            })
        ))
        .pipe(gulp.dest(path.src.images))
        .pipe(gulp.dest(path.build.images))
        .pipe(reload({stream: true}));
});

gulp.task('clean', function () {
    return gulp.src(path.build.html)
        .pipe(clean())
});

gulp.task('build', shell.task([
    'gulp clean',
    'gulp images',
    'gulp html',
    'gulp fonts',
    'gulp css',
    'gulp js'
]));

gulp.task('watch', function() {
    gulp.watch(path.watch.html, ['html']);
    gulp.watch(path.watch.css, ['css']);
    gulp.watch(path.watch.js, ['js']);
    gulp.watch(path.watch.images, ['images']);
});

gulp.task('browser-sync', function () {
    browserSync({
        startPath: '/',
        server: {
            baseDir: 'build'
        },
        notify: false
    })
});

gulp.task('server', function () {
    runSequence('build', 'browser-sync', 'watch');
});

gulp.task('default', ['build']); // задача по умолчанию

gulp.task('clear-cache', function () {
    cache.clearAll();
});