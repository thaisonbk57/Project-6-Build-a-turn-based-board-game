const [gulp, uglify,autoprefixer, babel, imagemin] = [require("gulp"),
                                              require("gulp-uglify"),
                                              require("gulp-autoprefixer"),
                                              require("gulp-babel"),
                                              require("imagemin")];

// COPY HTML
gulp.task('copyHtml', () => {
  gulp.src("src/index.html")
      .pipe(gulp.dest("./dist/"))
});


// MINIFY Photos
gulp.task('imageMin', () => {
  gulp.src('scr/img/')
      .pipe(imagemin())
      .pipe(gulp.dest("dist/img/"))
});

// MINIFY SCRIPTS
gulp.task('scripts', () => {
  gulp.src('src/index.js')
      .pipe(babel({
        presets: ['@babel/env']
      }))
      .pipe(uglify())
      .pipe(gulp.dest("./dist/js"))
});


// PREFIXER for CSS
gulp.task('autoprefixer', () =>
    gulp.src('src/css/style.css')
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(gulp.dest('dist/css'))
);

// WATCH
gulp.task('watch', () => {
  gulp.watch('src/**/*.js', ['scripts']);
  gulp.watch('src/css/style.css', ['autoprefixer']);
  gulp.watch('src/index.html', ['copyHtml']);
})

gulp.task('default', ['copyHtml','autoprefixer', 'scripts', 'watch']);