const {src,dest,parallel,series,watch} = require('gulp');
const del = require('del');
const newer = require('gulp-newer');
const plumber = require('gulp-plumber');
const notify = require("gulp-notify");
const htmlbeautify = require('gulp-html-beautify');
const imgRetina = require('gulp-responsive-imgz-ignore');
const imagemin = require('gulp-imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');
const rigger = require('gulp-rigger');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sortMediaQueries = require('postcss-sort-media-queries');
const path = require('path');
const nunjucksRender = require('gulp-nunjucks-render');
const frontMatter = require('gulp-front-matter');
const pcsscomb = require('postcss-csscomb');
const webpackStream = require('webpack-stream');
const browserSync = require('browser-sync').create();
const bsr = function reload(cb) {
	browserSync.reload();
	cb();
}



// ====================
// ====================
// ====================
// ==================== PATHS ========================
// ====================
// ====================
// ====================

const folder = {
	src: "src/",
	build: "build/",
	dist: "dist/"
}
const ext = {
	fonts: "+(otf|eot|woff2|woff|ttf|svg|OTF|EOT|WOFF2|WOFF|TTF|SVG)",
	img: "+(jpg|jpeg|png|svg|gif|ico|JPG|JPEG|PNG|SVG|GIF|ICO)",
}
let webpackMode = "none";
// let webpackMode = "development";
let webpackDevtool = "inline-source-map";
const v = {
	src: {
		html: `${folder.src}*.html`,
		style: `${folder.src}scss/*.scss`,
		js: [`${folder.src}js/*.js`, `!${folder.src}js/modules.js`],
		jsModules: `${folder.src}js/modules.js`,
		img: `${folder.src}img/**/*.${ext.img}`,
		fonts: `${folder.src}fonts/**/*.${ext.fonts}`,
		other: `${folder.src}other/**/*.*`,
	},
	build: {
		html: folder.build,
		style: `${folder.build}css/`,
		js: `${folder.build}js/`,
		img: `${folder.build}img/`,
		fonts: `${folder.build}fonts/`,
		other: `${folder.build}other/`,
		clean: `${folder.build}**`,
	},
	dist: {
		html: folder.dist,
		style: `${folder.dist}css/`,
		js: `${folder.dist}js/`,
		img: `${folder.dist}img/`,
		fonts: `${folder.dist}fonts/`,
		other: `${folder.dist}other/`,
		clean: `${folder.dist}**`,
	},
	watch: {
		html: [`${folder.src}*.html`, `${folder.src}template/**/*.html`],
		style: `${folder.src}scss/**/*.scss`,
		js: [`${folder.src}js/**/*.js`, `!${folder.src}js/modules.js`, `!${folder.src}js/modules/`],
		jsModules: [`${folder.src}js/modules.js`, `${folder.src}js/modules/`],
		img: `${folder.src}img/**/*.${ext.img}`,
		fonts: `${folder.src}fonts/**/*.${ext.fonts}`,
		delet: [
			`${folder.src}img/**/*.${ext.img}`,
			`${folder.src}fonts/**/*.${ext.fonts}`,
			`${folder.src}js/*.js`,
			`${folder.src}*.html`
		],
	},
	config: {
		imgRetina: {
			suffix: {
				2: "@2x",
				// 3: '@3x'
			},
			ignore: ["wpn-", "none-"],
		},
		//config webserver for browserSync build
		configWebserverBuild: {
			server: {
				baseDir: folder.build,
				index: folder.build + "home.html",
				reloadDelay: 300,
				directory: true,
			},
			tunnel: false,
			host: "localhost",
			port: 3000,
			logPrefix: "build",
		},
		//config webserver for browserSync prod
		configWebserverProd: {
			server: {
				baseDir: folder.dist,
				index: folder.dist + "home.html",
				reloadDelay: 300,
				directory: true,
			},
			tunnel: false,
			host: "localhost",
			port: 3000,
			logPrefix: "prod",
		},
		//----------#OPTIONS FOR HTMLBEAUTIFY PLUGIN
		//all options https://www.npmjs.com/package/gulp-html-beautify
		optionsHtmlBeautify: {
			//indent tabs
			indent_with_tabs: true,
			//maximum number of new lines
			max_preserve_newlines: 2,
			unformatted: [
				// https://www.w3.org/TR/html5/dom.html#phrasing-content
				"abbr",
				"area",
				"b",
				"bdi",
				"bdo",
				"br",
				"cite",
				"code",
				"data",
				"datalist",
				"del",
				"dfn",
				"em",
				"embed",
				"i",
				"ins",
				"kbd",
				"keygen",
				"map",
				"mark",
				"math",
				"meter",
				"noscript",
				"object",
				"output",
				"progress",
				"q",
				"ruby",
				"s",
				"samp",
				"small",
				"strong",
				"sub",
				"sup",
				"template",
				"time",
				"u",
				"var",
				"wbr",
				"text",
				"acronym",
				"address",
				"big",
				"dt",
				"ins",
				"strike",
				"tt",
			],
		},
		cssComb: {
			"remove-empty-rulesets": true,
			"always-semicolon": true,
			"color-case": "lower",
			"block-indent": "\t",
			"color-shorthand": true,
			"element-case": "lower",
			"eof-newline": true,
			"leading-zero": true,
			"space-before-colon": "",
			"space-after-colon": " ",
			"space-before-combinator": " ",
			"space-after-combinator": " ",
			"space-between-declarations": "\n",
			"space-before-opening-brace": " ",
			"space-after-opening-brace": "\n",
			"space-after-selector-delimiter": "\n",
			"space-before-selector-delimiter": "",
			"space-before-closing-brace": "\n",
			"strip-spaces": true,
		},
		// webpack config
		webpackConf: {
			mode: webpackMode,
			devtool: webpackDevtool,
			output: {
				filename: "modules.js",
			},
			module: {
				rules: [
					{
						test: /\.m?js$/,
						exclude: /(node_modules)/,
						use: {
							loader: "babel-loader",
							options: {
								presets: ["@babel/preset-env"],
							},
						},
					},
				],
			},
			externals: {
				jquery: "jQuery",
			},
		},
	},
};


// ====================
// ====================
// ====================
// ==================== BUILD task ========================
// ====================
// ====================
// ====================


// delet folder build version project
function cleanBuild(cb) {
	console.log('----------- FOLDER FOR BUILD CLEAN');
	del.sync(v.build.clean, {force: true})
	cb()
}
// If need make some task global - just use exports this task
// exports.cleanBuild = cleanBuild;

// fonts file build version project
function fontsBuild(cb) {
	src(v.src.fonts)
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(newer(v.build.fonts))
		.pipe(dest(v.build.fonts))
		cb()
}

// other file build version project
function otherBuild(cb) {
	src(v.src.other)
	.pipe(newer(v.build.other))
	.pipe(dest(v.build.other))
	cb()
}

// html file build version
function htmlBuild() {
	return src(v.src.html)
	.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(rigger())
		.pipe(frontMatter({ property: 'data' }))
		.pipe(nunjucksRender())
		.pipe(imgRetina(v.config.imgRetina))
		.pipe(dest(v.build.html))
}


// image optimize build version project
function imageBuild(cb) {
	src(v.src.img)
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(newer(v.build.img))
		.pipe(dest(v.build.img))
		cb()
}

// js Modules build version project
function jsModulesBuild() {
	return src(v.src.jsModules)
	.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
	.pipe(webpackStream(v.config.webpackConf))
	.pipe(dest(v.build.js))
}

// js file build version project
function jsBuild() {
	return src(v.src.js)
	.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
	.pipe(rigger())
	.pipe(dest(v.build.js))
}
// scss build version project
function cssBuild() {
	return src(v.src.style)
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'expanded'}))
		.pipe(sourcemaps.write())
		.pipe(dest(v.build.style))
		.pipe(browserSync.reload({stream:true}))
}

// watch task with DEV and init server
function watchServBuild() {

	// init server for DEV mode
	browserSync.init(v.config.configWebserverBuild);

	watch(v.watch.html, series(
		htmlBuild,
		bsr
	))

	watch(v.watch.style, cssBuild)

	watch(v.watch.js, series(
		jsBuild,
		bsr
	))

	watch(v.watch.jsModules, series(
		jsModulesBuild,
		bsr
	))

	watch(v.watch.fonts, series(
		fontsBuild,
		bsr
	))

	watch(v.watch.img, series(
		imageBuild,
		bsr
	))

	watch(v.watch.delet).on('unlink', function (filepath) {
    var filePathFromSrc = path.relative(path.resolve(folder.src), filepath);
    var destFilePath = path.resolve(folder.build, filePathFromSrc);
		console.log("You delet this file - " + destFilePath);
    del.sync(destFilePath);
  });
}


// create common task for DEV mode
const filesBuild = parallel(htmlBuild, jsBuild, jsModulesBuild, cssBuild, fontsBuild, otherBuild);
// exports task for DEV mode
exports.default = series(filesBuild, imageBuild, watchServBuild);
exports.dev = series(cleanBuild, filesBuild, imageBuild, watchServBuild);


// ====================
// ====================
// ====================
// ==================== DIST task ========================
// ====================
// ====================
// ====================


// delet folder build version project
function cleanProd(cb) {
	console.log('------------ FOLDER FOR PRODUCTION CLEAN');
	del.sync(v.dist.clean, {force: true})
	cb()
}

// fonts file build version project
function fontsProd(cb) {
	src(v.src.fonts)
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(dest(v.dist.fonts))
		cb()
}

// other file build version project
function otherProd(cb) {
	src(v.src.other)
		.pipe(dest(v.dist.other))
		cb()
}

//html file production version
function htmlProd() {
	return src(v.src.html)
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(rigger())
		.pipe(frontMatter({ property: 'data' }))
		.pipe(nunjucksRender())
		.pipe(imgRetina(v.config.imgRetina))
		.pipe(htmlbeautify(v.config.optionsHtmlBeautify))
		.pipe(dest(v.dist.html))
}

//image optimize build version project
function imageProd(cb) {
	src(v.src.img)
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(imagemin([
			imageminPngquant({quality: [0.7, 0.8]}),
			imageminMozjpeg({progressive: true})
		],
		//for more detailed information output
		{ verbose: true,}))
		.pipe(dest(v.dist.img))
		cb()
}

// js Modules dist version project
function jsModulesProd() {
	v.config.webpackConf.mode = "production";
	v.config.webpackConf.devtool = false;
	return src(v.src.jsModules)
	.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
	.pipe(webpackStream(v.config.webpackConf))
	.pipe(dest(v.dist.js))
}

// js file Prod version project
function jsProd() {
	return src(v.src.js)
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(rigger())
		.pipe(dest(v.dist.js))
}

// scss Prod version project
function cssProd() {
	var postcssPlugins = [
		sortMediaQueries({
			sort: 'desktop-first'
			// tips how group-css-media-queries work
			// Queries order see on https://www.npmjs.com/package/postcss-sort-media-queries
		}),
		autoprefixer(),
		pcsscomb(v.config.cssComb)
	];
	return src(v.src.style)
		.pipe(plumber({ errorHandler: notify.onError("Error: <%= error.message %>") }))
		.pipe(sass())
		.pipe(postcss(postcssPlugins))
		.pipe(dest(v.dist.style))
		.pipe(browserSync.reload({stream:true}))
}

// watch task and init server on PROD mode
function watchServerProd() {

	// init server for DEV mode
	browserSync.init(v.config.configWebserverProd);

	watch(v.watch.html, series(
		htmlProd,
		bsr
	))

	watch(v.watch.style, cssProd)

	watch(v.watch.js, series(
		jsProd,
		bsr
	))

	watch(v.watch.jsModules, series(
		jsModulesProd,
		bsr
	))

	watch(v.watch.fonts, series(
		fontsProd,
		bsr
	))

	watch(v.watch.img, series(
		imageProd,
		bsr
	))

	watch(v.watch.delet).on('unlink', function (filepath) {
    var filePathFromSrc = path.relative(path.resolve(folder.src), filepath);
    var destFilePath = path.resolve(folder.dist, filePathFromSrc);
		console.log("You delet this file - " + destFilePath);
    del.sync(destFilePath);
  });
}

// create common task for PROD mode
const filesProd = parallel(htmlProd, jsProd, jsModulesProd, cssProd, fontsProd, otherProd);
// exports task for PROD mode
exports.dist = series(filesProd, imageProd, watchServerProd);
exports.distClean = series(cleanProd, filesProd, imageProd, watchServerProd);
