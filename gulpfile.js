var src        = "app/assets/";
var dest       = "dist/";
var components = src + "components";


var gulp         = require('gulp'),
    del          = require('del'),
    stylus       = require('gulp-stylus'),
    quills       = require('quills'),
    poststylus   = require('poststylus'),
    autoprefixer = require('autoprefixer'),
    cssnano      = require('cssnano'),
    csso         = require('gulp-csso'),
    notify       = require('gulp-notify'),
    plumber      = require('gulp-plumber'),
    jshint       = require('gulp-jshint'),
    concat       = require('gulp-concat'),
    stylish      = require('jshint-stylish'),
    bower        = require('main-bower-files'),
    filter       = require('gulp-filter'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify'),
    merge        = require('merge-stream'),
    replace      = require('gulp-replace'),
    imagemin     = require('gulp-imagemin'),  
    pngquant     = require('imagemin-pngquant'),
    livereload   = require('gulp-livereload'),
    argv         = require('yargs').argv,
    open         = require('gulp-open'),
    path         = require('path'),
    debug        = require('gulp-debug')
    ;


//  CLEAN DEV FOLDERS
gulp.task('clean',            del.bind( null, ['dist'] ));
gulp.task('clean:components', del.bind( null, [dest + 'components'] ));
gulp.task('clean:modules',    del.bind( null, ['node_modules'] ));
gulp.task('clean:all', ['clean', 'clean:components', 'clean:modules'], null);
//  CLEAN DEV FOLDERS


//  COMPILE STYL FILES
gulp.task('stylus', function(){
  return gulp.src(src + 'styles/main.styl')

  .pipe( plumber({
    errorHandler: function(err){
      notify.onError({
        title:   'Stylus',
        sound:   true,
        message: "Error: <%= error.message %>",
        appIcon: path.join(__dirname, 'gulp-logos/stylus-logo.png')
      })(err);
      // this.emit('end');
    }
  }) )

  .pipe( stylus({ 
    'use':  [
      quills(),
      poststylus([
        autoprefixer({ browsers: ['last 4 versions', '> 5%'] })
      ])
      //poststylus([autoprefixer, cssnano])
    ],
    import: ['quills'] 
  }))

  .pipe(notify({
    title:   'Stylus',
    sound:   true,
    message: "<%= file.relative %> compilado con exito!!",
    appIcon: path.join(__dirname, 'gulp-logos/stylus-logo.png')
  }))

  .pipe( gulp.dest( dest + 'css' ))

  .pipe( connect.reload() );
});
//  COMPILE STYL FILES


//  LINT JS
gulp.task('lint', function(){
  return gulp.src(src + 'scripts/**/*.js')
    .pipe( jshint() )
    .pipe( jshint.reporter(stylish) )
    .pipe( notify({
      title:   'JSLint',
      sound:   true,
      message: "<%= file.relative %> compilado!!",
      appIcon: path.join( __dirname, 'gulp-logos/js-logo.png')
    }))
    .pipe( concat('main.js') )
    .pipe( gulp.dest( dest + 'js' ));

    .pipe( connect.reload() );
});
//  LINT JS


//  PASS ALL BOWER FILES
gulp.task("bower:css", function(){
  return gulp.src( bower({
    "overrides": {
      "bootstrap": {
        "main": [
          "dist/css/bootstrap.css",
        ]
      }
    }
  }) )
  .pipe( filter('**/*.css') )
  //.pipe( debug() )
  .pipe( concat('vendor.min.css'))
  .pipe( replace('font/', 'fonts/') )
  .pipe( replace('roboto/', '') )
  .pipe( csso() )
  .pipe(notify({
    title:   'Vendor Styles',
    sound:   true,
    message: "<%= file.relative %> concatenado y minificado con exito!!",
    appIcon: path.join( __dirname, 'gulp-logos/css-logo.png')
  }))
  .pipe( gulp.dest( dest + 'css'));
});


gulp.task("bower:js", function(){
  return gulp.src( bower({
    "overrides": {
      "bootstrap": {
        "main": [
          "dist/js/bootstrap.js"
        ]
      }
    }
  }) )
  .pipe( filter('**/*.js'))
  .pipe( debug() )
  .pipe( concat('vendor.min.js') )
  .pipe( uglify() )
  .pipe(notify({
    title:   'Vendor Scripts',
    sound:   true,
    message: "<%= file.relative %> concatenado y minificado con exito!!",
    appIcon: path.join( __dirname, 'gulp-logos/js-logo.png')
  }))
  .pipe( gulp.dest( dest + 'js'));
});


gulp.task('bower:all', [ 'bower:css', 'bower:js'], function() {
});
//  PASS JS BOWER FILES


//  COPY FONTS
gulp.task('fonts', function() {
  return gulp.src( src + 'fonts/**/*' )
  .pipe( gulp.dest( dest + 'fonts') );
});

gulp.task('fonts:bower', function(){
  return gulp.src( bower({
    filter: [
    '**/*.eot',
    '**/*.svg',
    '**/*.ttf',
    '**/*.woff',
    '**/*.woff2',
    '**/*.otf',
    ] 
  }))
  .pipe( gulp.dest( dest + 'fonts') );
});

gulp.task('fonts:all', [ 'fonts', 'fonts:bower'], function() {
});
//  COPY FONTS


//  MINIFY ALL IMAGENES
gulp.task('imagemin', function(){
  return gulp.src( src + 'images/**/*')
    .pipe( imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{
        removeViewBox: false,
        cleanupIDs: false
      }],
      use: [pngquant()]
    }))
    .pipe(gulp.dest(dest + 'images'));
});
//  MINIFY ALL IMAGENES


// WATCHERs
gulp.task('watch:stylus', ['stylus'], function(){
  gulp.watch(src + 'styles/**/*.styl', ['stylus']);
});

gulp.task('watch:js', ['lint'], function(){
  gulp.watch(src + 'scripts/**/*.js', ['lint']);
});

gulp.task('watch:fonts', ['fonts'], function(){
  gulp.watch( src + 'fonts/**/*' , ['fonts']);
});

gulp.task('watch:images', ['imagemin'], function(){
  gulp.watch(src + 'images/**/*' , ['imagemin']);
});

gulp.task('watch:components', ['bower:all', 'fonts:bower'], function(){
  gulp.watch( components + '/**/*' , ['bower:all', 'fonts:bower'] );
});

gulp.task('watch:all', ['watch:stylus', 'watch:js', 'watch:fonts', 'watch:images', 'watch:components'], function(){
});
// WATCHERs


//  OPEN BROWSER & SERVER WITH LIVERELOAD
gulp.task('serve', ['watch:all'], function(){

  livereload.listen(1234);
  // livereload.listen({ port: 1234, basePath: 'dist' });
  gulp.watch('app/**/*', ['watch:all']);



//  var src = [
//    'app/**/*',
//  ];
//
//  gulp.watch(src)
//  .on('change', function (event) {
//    console.log(event.path)
//    livereload.changed(event.path);
//  });
//  livereload.listen();
//
//  var url = argv.open || argv.o;
//  if (typeof url !== "undefined") {
//    gulp.src( __filename )
//    .pipe( open({
//      app: 'chrome',
//      uri: argv.open || argv.o
//    }));
//  }
});

//  OPEN BROWSER & SERVER WITH LIVERELOAD