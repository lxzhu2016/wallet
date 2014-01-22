var http = require('http');
var url = require('url');
var path = require('path');
var mime = require('mime');
var fs = require('fs');
var crypto = require('crypto');

var cookie = require('./libs/cookie.js');
var dataAccess = require('./libs/data.js');
function echo(obj) {
	console.log();
	for ( var p in obj)
		console.log(p + '=' + obj[p]);
}
function md5(input) {
	var result = crypto.createHash('md5').update(input).digest('hex');
	return result;
}

function reply404(req, res) {
	req.header.cookie['session-id'] = {
		value : 'www.lxzhu.net'
	};
	res.writeHead(404, {
		'Content-Type' : 'text/plain',
		'cookie' : req.header.cookie.toString()
	});
	res.end('REQUESTED RESOURCE NOT FOUND!');
}

function replyStaticFile(req, res, absFilePath) {
	console.log('reply static file ' + absFilePath);
	fs.exists(absFilePath, function(exists) {
		if (!exists) {
			console.log('file ' + absFilePath + ' does not exist.');
			reply404(req, res);
		} else {
			console.log('file ' + absFilePath + ' exists.');
			fs.readFile(absFilePath, function(err, data) {
				var ext = path.extname(absFilePath) || '.unknown';
				console.log('get extname ' + ext + ' for file path '
						+ absFilePath);
				var mimeName = mime.lookup(ext.slice(1));
				console.log('get mimeName ' + mimeName + ' from ext name '
						+ ext);
				res.writeHead(200, {
					'Content-Type' : mimeName
				});
				res.end(data);
			});
		}
	});
}

function replyJSON(req, res) {
	var pathname = url.parse(req.url).pathname;
	var basename = path.basename(pathname);
	if ('login' === basename) {
		onLogin(req, res);
	} else if ('logout' === basename) {
		onLogout(req, res);
	} else {
		reply404(req, res);
	}
}

function onLogin(req, res) {
	dataAccess.login({
		username : req.data.username,
		password : req.data.password
	}, function(err, rows, fields) {
		if (err) {
			console.log(err);
			res.writeHead(500, {
				'Content-Type' : 'text/json'
			});
			res.end(JSON.stringify({
				faults : [ {
					code : 500,
					message : 'internal error',
					stack : 'stack unavailable'
				} ]
			}));
		} else {
			var userticket = md5(req.data.username + req.data.password);
			req.header.cookie.userticket = {
				value : userticket
			};
			var cookieText = req.header.cookie.toString();
			res.writeHead(200, {
				'Content-Type' : 'text/json',
				'cookie' : cookieText
			});

			res.end(JSON.stringify({
				userticket : md5
			}));
		}
	});
}

function onLogout(req, res) {

}

var svr = http.createServer(function(req, res) {
	var c = cookie.parse(req);
	var pathname = url.parse(req.url).pathname;
	console.log('requesting ' + pathname);
	if ('/' == pathname) {
		pathname = '/pubs/index.html';
		console.log('rewrite / to /pubs/index.html');
	}
	var jsonText = '';
	req.on('data', function(data) {
		jsonText += data.toString();
	});
	req.on('end', function() {
		// try{
		if (pathname.toLowerCase().indexOf('/pubs') == 0) {
			replyStaticFile(req, res, '.' + pathname);
		} else if (pathname.toLowerCase().indexOf('/actions') == 0) {
			console.log('json text is ' + jsonText);
			req.data = JSON.parse(jsonText);
			replyJSON(req, res);
		} else {
			reply404(req, res);
		}
		// }catch(err){
		// echo(err);
		// console.log(err);
		// }
	});

});

svr.listen(8080, function() {
	console.log('server is running at port 8080');
});
