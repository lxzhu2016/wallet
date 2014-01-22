exports.parse = function(req) {
	var cookie = {};
	if (req && req.header && req.header.cookie) {
		console.log('cookie:' + req.header.cookie);
		var pairs = req.header.cookie.split(';');
		for (var idx = 0; idx < pairs.length; idx++) {
			var items = paris[idx].split('=');
			var name = items[0];
			var value = decodeURIComponent(items[1]);
			console.log(name + '=' + value);
			cookie[name] = {
				"value" : value
			};
		}
	}

	cookie.toString = function() {
		var retCookieText = '';
		for ( var prop in this) {
			console.log('cookie name=' + prop + 'type is '
					+ typeof (this[prop]));

			if (this.hasOwnProperty(prop) && typeof (this[prop]) != 'function') {
				retCookieText += prop + '='
						+ encodeURIComponent(this[prop].value) + ';';
			}
		}

		if (retCookieText != '')
			retCookieText = retCookieText.slice(0, -1);
		return retCookieText;
	};

	if (!req.header)
		req.header = {};
	req.header.cookie = cookie;
	return cookie;
};
