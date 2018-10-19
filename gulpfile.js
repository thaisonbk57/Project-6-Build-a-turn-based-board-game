const [gulp, uglify, autoprefixer, babel, imagemin, connect] = [
  require('gulp'),
  require('gulp-uglify'),
  require('gulp-autoprefixer'),
  require('gulp-babel'),
  require('imagemin'),
  require('gulp-connect')
];

// COPY HTML
gulp.task('copyHtml', () => {
  gulp.src('src/index.html').pipe(gulp.dest('./public/'));
});

// MINIFY Photos
gulp.task('imageMin', () => {
  gulp
    .src('scr/img/')
    .pipe(imagemin())
    .pipe(gulp.dest('public/img/'));
});

// MINIFY SCRIPTS
gulp.task('scripts', () => {
  gulp
    .src('src/index.js')
    .pipe(
      babel({
        presets: ['@babel/env']
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest('./public/js'));
});

// PREFIXER for CSS
gulp.task('autoprefixer', () =>
  gulp
    .src('src/css/style.css')
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions'],
        cascade: false
      })
    )
    .pipe(gulp.dest('public/css'))
);

// WATCH
gulp.task('watch', () => {
  gulp.watch('src/**/*.js', ['scripts']);
  gulp.watch('src/css/style.css', ['autoprefixer']);
  gulp.watch('src/index.html', ['copyHtml']);
});

// CONNECT
gulp.task('connect', () => {
  connect.server({
    root: './public',
    livereload: true,
    port: 8888
  });
});

gulp.task('default', [
  'copyHtml',
  'autoprefixer',
  'scripts',
  'connect',
  'watch'
]);
