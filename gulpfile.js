'use strict'

let
	project =     require('./package.json'),
	fs =          require('fs'),
	gulp =        require('gulp'),
	tube =        require('gulp-pipe'),
	bom =         require('gulp-bom'),
	rename =      require('gulp-rename'),
	watch =       require('gulp-watch'),
	plumber =     require('gulp-plumber'),
	cleanCSS =    require('gulp-clean-css'),
	pug =         require('gulp-pug'),
	parseYAML =   require('js-yaml'),
	liveServer =  require('browser-sync')

let sass = {
	compile:  require('gulp-sass'),
	watch:    require('gulp-watch-sass'),
	vars:     require('gulp-sass-vars')
}

let uglify = {
	core:      require('terser'),
	composer:  require('gulp-uglify/composer')
}

let
	minifyJS = uglify.composer(uglify.core, console),
	reloadServer = () => liveServer.stream()

let parseYAMLfile = fileName => parseYAML.load(fs.readFileSync(`./${fileName}.yaml`, 'utf8'))

let config = parseYAMLfile('project-config')

let vendors = parseYAMLfile('project-vendors')

let dirs = config.dirs

let paths = {
	html: {
		dev: [`${dirs.dev}/pug/**/*.pug`, `!${dirs.dev}/pug/inc/**/*.pug`],
		prod: `${dirs.prod.root}/`
	},

	js: {
		dev: `${dirs.dev}/js/**/*.js`,
		prod: `${dirs.prod.root}/${dirs.prod.main}/js/`
	},

	css: {
		dev: `${dirs.dev}/scss/**/*.scss`,
		prod: `${dirs.prod.root}/${dirs.prod.main}/css/`
	}
}

gulp.task('liveReload', () => liveServer({
	server: { baseDir: paths.html.prod },
	port: 8080,
	notify: false
}))

gulp.task('pug', () => tube([
	watch(paths.html.dev, { ignoreInitial: false }),
	plumber(),
	pug({ locals: {
		VERSION: project.version,
		PATHS: {
			js:   `${dirs.prod.main}/js`,
			css:  `${dirs.prod.main}/css`,
			img:  `${dirs.prod.main}/img`
		},
		LIBS: vendors,
		primeColor: config.prime_color
	}}),
	bom(),
	gulp.dest(paths.html.prod),
	reloadServer()
]))

gulp.task('js:assets', () => tube([
	watch(paths.js.dev, { ignoreInitial: false }),
	plumber(),
	minifyJS({}),
	bom(),
	rename({suffix: '.min'}),
	gulp.dest(paths.js.prod),
	reloadServer()
]))

let scssTubes = [
	plumber(),
	sass.vars({
		VERSION:     project.version,
		primeColor:  config.prime_color
	}, { verbose: false }),
	sass.compile({ outputStyle: 'compressed' }),
	cleanCSS(),
	bom(),
	rename({suffix: '.min'}),
	gulp.dest(paths.css.prod)
]

gulp.task('scss:build', () => tube(
	[gulp.src(paths.css.dev)].concat(scssTubes)
))

gulp.task('scss:dev', () => tube(
	[sass.watch(paths.css.dev)].concat(scssTubes, [reloadServer()])
))

gulp.task('default', gulp.parallel('pug', 'js:assets', 'scss:dev'))
gulp.task('dev', gulp.parallel('liveReload', 'default'))
