#! javascript

var gaze = require('gaze')
var path = require('path')
var fs = require('fs')
var fse = require('fs-extra')

gaze([
	path.join(__dirname, '../src/*'),
	path.join(__dirname, '../src/**/*')
],
function(err, watcher){
	if (err) throw err
	this.on('all', function(event, filepath){
		console.log(filepath + ' was ' + event)
		fs.readFile(filepath, 'utf8', function(err, data){
			if (err) throw err

			var _tmp$01 = filepath.split('\\')
			var filefullname = _tmp$01[_tmp$01.length - 1]
			var _tmp$02 = filefullname.split('.')
			var filename = _tmp$02[0]
			var filetype = _tmp$02[1]
			
			if (filetype == 'md' || filetype == 'markdown') {
				var _postpath, fileMd = parseMd(data)
				var _orgnpath = path.join(__dirname, '../src/layout/' + fileMd.layout + '.html')

				switch(fileMd.layout){
					case 'category':
						// @this is default page (index.html)
						if (fileMd.category == 0) {
							_postpath = path.join(__dirname, '../_web/index.html')
							break
						}

						// @this is category page (index.html)
						if (typeof fileMd.category === 'string') {
							_postpath = path.join(__dirname, '../_web/' + fileMd.category + '.html')
							break
						}
					case 'post':
						// @this is post page (index.html)
						_postpath = path.join(__dirname, '../_web/' + fileMd.category + '/' + filename + '.html')
						break
				}

				// @parse layout
				var _stream = fs.createReadStream(_orgnpath, 'utf8')
				var dowrite = fs.createWriteStream(_postpath, 'utf8')
				_stream.on('data', function(chunk) {
					var snippets = chunk.match(/\<snippet.+\/\>/g)
					for (var i = 0; i < snippets.length; i++) {
						var _id = snippets[i].match(/id=\".+\"/g)
						_id = _id[0].split('"')[1]
						var _snippet = fs.readFileSync(path.join(__dirname, '../src/snippets/' + _id + '.html'), 'utf8')
						var _tmp$03 = chunk.split(snippets[i])
						console.log('i is:'+i)
						if (i == 0) {
							console.log('0'+_tmp$03[0])
							dowrite.write(_tmp$03[0] + _snippet)
						} else {
							var _tmp$04 = _tmp$03[0].split(snippets[i-1])
							console.log('2'+_tmp$04[1])
							dowrite.write(_tmp$04[1] + _snippet)
							i == snippets.length - 1 && dowrite.write(_tmp$03[1])
						}
					}
				})
				_stream.on('end', function(){
					dowrite.end()
				})
				
				// _stream.pipe()
				// try{
				// 	fse.copySync(_orgnpath, _postpath)
				// } catch(err) {
				// 	console.log(err)
				// }
				// var _layout = fs.readFileSync(_orgnpath, 'utf8')
				// console.log(_layout)
			}
		})
	})
})

// function parseRequire(req) {
// 	var arg, exp
// 	arg = req.match(/\(.+\)/g)
// 	arg.indexOf('.css') >= 0 && exp = '<link rel="stylesheet" type="text/css" href="' + req + '">'
// }

function parseMd(req) {
	var exp = {},
		props = req.match(/---\s((.|\s)+)---/g)
	props = props[0].replace(/\r|\n|---/g, '')
	var _props = props.split(',')
	for (var i = 0; i < _props.length; i++) {
		var _key = _props[i].split(':')
		exp[_key[0]] = _key[1].replace(/\s/g, '')
	}
	return exp
}
