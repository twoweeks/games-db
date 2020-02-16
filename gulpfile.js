'use strict'

let
	project =     require('./package.json'),
	fs =          require('fs'),
	gulp =        require('gulp'),
	tube =        require('gulp-pipe'),
	bom =         require('gulp-bom'),
	rename =      require('gulp-rename'),
	watch =       require('gulp-watch'),
	clean =       require('gulp-clean'),
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
		dev:   [`${dirs.dev}/pug/**/*.pug`, `!${dirs.dev}/pug/inc/**/*.pug`],
		prod:   `${dirs.build}/`,
	},

	js: {
		dev:    `${dirs.dev}/js/**/*.js`,
		prod:   `${dirs.build}/${dirs.assets}/js/`,
	},

	css: {
		dev:   `${dirs.dev}/scss/**/*.scss`,
		prod:  `${dirs.build}/${dirs.assets}/css/`,
	},
}

gulp.task('liveReload', () => liveServer({
	server: [dirs.build, dirs.dist_static],
	port: 8080,
	notify: false
}))

let pugTubes = [
	plumber(),
	pug({ locals: {
		VERSION:     project.version,

		PATHS: {
			js:   `./${dirs.assets}/js`,
			css:  `./${dirs.assets}/css`,
			img:  `./${dirs.assets}/img`,
		},

		LIBS: vendors,

		primeColor: config.prime_color
	}}),
	bom(),
	gulp.dest(paths.html.prod)
]

gulp.task('pug:build', () => tube(
	[gulp.src(paths.html.dev)]
		.concat(pugTubes)
))

gulp.task('pug:dev', () => tube(
	[watch(paths.html.dev, { ignoreInitial: false })]
		.concat(pugTubes, [reloadServer()])
))

let jsTubes = (dest = paths.js.prod) => [
	plumber(),
	minifyJS({}),
	bom(),
	rename({ suffix: '.min' }),
	gulp.dest(dest)
]

gulp.task('js:assets:build', () => tube(
	[gulp.src(paths.js.dev)]
		.concat(jsTubes())
))

gulp.task('js:assets:dev', () => tube(
	[watch(paths.js.dev, { ignoreInitial: false })]
		.concat(jsTubes(), [reloadServer()])
))

let scssTubes = [
	plumber(),
	sass.vars({
		VERSION:     project.version,
		primeColor:  config.prime_color
	}, { verbose: false }),
	sass.compile({ outputStyle: 'compressed' }),
	cleanCSS(),
	bom(),
	rename({ suffix: '.min' }),
	gulp.dest(paths.css.prod)
]

gulp.task('scss:build', () => tube(
	[gulp.src(paths.css.dev)].concat(scssTubes)
))

gulp.task('scss:dev', () => tube(
	[sass.watch(paths.css.dev)].concat(scssTubes, [reloadServer()])
))

/* Копирование файлов из dirs.build и dirs.dist_static в одну общую dirs.dist */

gulp.task('dist:copy', () => tube([
	gulp.src([
		`${dirs.build}/**/*`, `${dirs.build}/**/.*`,
		`${dirs.dist_static}/**/*`, `${dirs.dist_static}/**/.*`
	]),
	gulp.dest(dirs.dist)
]))

gulp.task('dist:clean', () => tube([
	gulp.src(dirs.dist, { read: false, allowEmpty: true }),
	clean()
]))

gulp.task('dist', gulp.series('dist:clean', 'dist:copy'))

/* Команды для сборки и разработки */

gulp.task('build', gulp.parallel('pug:build', 'js:assets:build', 'scss:build'))

gulp.task('build:clean', () => tube([
	gulp.src(dirs.build, { read: false, allowEmpty: true }),
	clean()
]))

gulp.task('dev', gulp.parallel('liveReload', 'pug:dev', 'js:assets:dev', 'scss:dev'))

gulp.task('default', gulp.series('build:clean', 'build', 'dist'))
