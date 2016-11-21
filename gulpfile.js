var src        = "app/assets/";
var dist       = "dist/";
var components = src + "components";


var gulp         = require('gulp'),
    del          = require('del'),
    stylus       = require('gulp-stylus'),
    quills       = require('quills'),
    poststylus   = require('poststylus'),
    autoprefixer = require('autoprefixer'),
    notify       = require('gulp-notify'),
    plumber      = require('gulp-plumber'),
    jshint       = require('gulp-jshint'),
    stylish      = require('jshint-stylish'),
    bower        = require('main-bower-files'),
    concat       = require('gulp-concat'),
    uglify       = require('gulp-uglify'),
    replace      = require('gulp-replace'),
    imagemin     = require('gulp-imagemin'),  
    pngquant     = require('imagemin-pngquant'),
    open         = require('gulp-open'),
    path         = require('path'),
    debug        = require('gulp-debug'),
    connect      = require('gulp-connect'),
    csso         = require('gulp-csso')
    ;



//  CLEAN DEV FOLDERS
gulp.task('clean',            del.bind( null, ['dist'] ));
gulp.task('clean:components', del.bind( null, [src + 'components'] ));
gulp.task('clean:modules',    del.bind( null, ['node_modules'] ));
gulp.task('clean:all', ['clean', 'clean:components', 'clean:modules'], null);
//  CLEAN DEV FOLDERS




//  COMPILE STYL FILES
gulp.task('stylus', function(){
  return gulp.src(src + 'stylus/main.styl')

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

  .pipe( gulp.dest( src + 'css' ))
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
    .pipe( gulp.dest( src + 'js' ))
    .pipe( connect.reload() );
});
//  LINT JS




//  PASS ALL BOWER FILES
gulp.task("bower:css", function(){
  return gulp.src( bower({ 'filter': '**/*.css'}) )
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
  .pipe( gulp.dest( src + 'css'));
});

gulp.task("bower:js", function(){
  return gulp.src( bower({
    "filter": "**/*.js",
    "overrides": {
      "three.js": {
        "main": [
          "build/three.js",
          "examples/js/Detector.js",
          "examples/js/controls/OrbitControls.js",
          "examples/js/loaders/OBJLoader.js",        ] 
      }

    }

  }) )
  .pipe( debug() )
  .pipe( concat('vendor.min.js') )
  .pipe( uglify() )
  .pipe(notify({
    title:   'Vendor Scripts',
    sound:   true,
    message: "<%= file.relative %> concatenado y minificado con exito!!",
    appIcon: path.join( __dirname, 'gulp-logos/js-logo.png')
  }))
  .pipe( gulp.dest( src + 'js'));
});

gulp.task('bower:fonts', function(){
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
  .pipe( gulp.dest( src + 'fonts') );
});

gulp.task('bower:all', [ 'bower:css', 'bower:js', 'bower:fonts'], function() {
});
//  PASS ALL BOWER FILES




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
    .pipe(gulp.dest(src + 'images'));
});
//  MINIFY ALL IMAGENES




// WATCHERs
gulp.task('watch:stylus', ['stylus'], function(){
  gulp.watch(src + 'stylus/**/*.styl', ['stylus']);
});

gulp.task('watch:js', ['lint'], function(){
  gulp.watch(src + 'scripts/**/*.js', ['lint']);
});

gulp.task('watch:images', ['imagemin'], function(){
  gulp.watch(src + 'images/**/*' , ['imagemin']);
});

gulp.task('watch:components', ['bower:all'], function(){
  gulp.watch( components + '/**/*' , ['bower:all'] );
});

gulp.task('watch:all', ['watch:stylus', 'watch:js', 'watch:images', 'watch:components'], function(){
});
// WATCHERs



//  OPEN BROWSER & SERVER WITH LIVERELOAD
gulp.task('serve', ['watch:all', 'open-browser'], function(){
  connect.server({
    root: ['app'],
    port: 1234,
    livereload: true,
  });

  gulp.watch('app/**/*', function(){
    gulp.src('app/**/*')
    .pipe( connect.reload() );
  });
});

gulp.task('serve:dist', ['open-browser:dist'], function(){
    connect.server({
    root: ['dist'],
    port: 4321,
    livereload: true,
  });
});
//  OPEN BROWSER & SERVER WITH LIVERELOAD



// UTILS
gulp.task('open-browser', function(){
  gulp.src( __filename )
  .pipe( open({
    // app: 'chrome',
    uri: 'http://localhost:1234'
  }));
});
gulp.task('open-browser:dist', function(){
  gulp.src( __filename )
  .pipe( open({
    // app: 'chrome',
    uri: 'http://localhost:4321'
  }));
});
// UTILS

gulp.task('default', ['serve']);