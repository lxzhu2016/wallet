var dao = require('./dao');
var async = require('async');
var pri = {
	http404 : function(it) {
		return function(req, res) {
			res.writeHead(404, {
				'Content-Type' : 'text/plain'
			});
			res.end("The method requested does no exist or"
					+ " is not allowed to request via this http verb.");
		};
	},
	list_methods : function(it) {
		return function(req, res) {
			res.end("NOT IMPLEMENTED.");
		};
	},

	openDao : function(it, callback) {
		it.dao.open(null, function(result) {
			callback(result.error, result);
		});
	},

	closeDao : function(it, callback) {
		it.dao.close(null, function(result) {
			callback(result.error, result);
		});
	}
};

function login(it) {
	return function(req, res) {
		it.dao = dao.createDao();
		var tasks = {
			f00 : function(callback) {
				pri.openDao(it, callback);
			},
			f01 : function(callback) {
				dao.user.login({
					username : req.body.username,
					password : req.body.password
				}, function(result) {
					callback(result.error, result);
				});
			},
			f02 : function(callback) {
				pri.closeDao(it, callback);
			}
		};
		var lastCallback = function(error, results) {
			if (error) {
				res.writeHead(500, {
					'Content-Type' : 'text/json'
				});
				res.end(JSON.stringify({
					error : {
						message : error.message
					}
				}));
			} else {
				res.writeHead(200, {
					'Content-Type' : 'text/json'
				});
				res.end(JSON.stringify({
					ticket : results.f02.ticket
				}));
			}
		};
		async.series(tasks, lastCallback);
	};
}

function validate_mobile(it) {
	return function(req, res) {
		it.dao = dao.createDao();

		var tasks = {
			f00 : function(callback) {
				pri.openDao(it, callback);
			},
			f01 : function(callback) {
				it.dao.person.exists({
					mobile : req.body.mobile
				}, function(result) {
					callback(result.error, result);
				});
			},
			f02 : function(callback) {
				pri.closeDao(it, callback);
			}
		};
		var lastCallback = function(error, results) {
			res.writeHead(200, {
				'Content-Type' : 'text/json'
			});
			if (error) {
				res.end(JSON.stringify({
					faults : [ {
						message : error.message
					} ]
				}));
			} else {
				res.end(JSON.stringify({
					isFormatCorrect : true,
					exists : results.f01.exists
				}));
			}
		};
		async.series(tasks, lastCallback);
	};
}

function validate_email(it) {
	return function(req, res) {
		it.dao = dao.createDao();

		var tasks = {
			f00 : function(callback) {
				pri.openDao(it, callback);
			},
			f01 : function(callback) {
				it.dao.person.exists({
					email : req.body.email
				}, function(result) {
					callback(result.error, result);
				});
			},
			f02 : function(callback) {
				pri.closeDao(it, callback);
			}
		};
		var lastCallback = function(error, results) {
			res.writeHead(200, {
				'Content-Type' : 'text/json'
			});
			if (error) {
				res.end(JSON.stringify({
					faults : [ {
						message : error.message
					} ]
				}));
			} else {
				res.end(JSON.stringify({
					isFormatCorrect : true,
					exists : results.f01.exists
				}));
			}
		};
		async.series(tasks, lastCallback);
	};
}

function validate_username(it) {
	return function(req, res) {
		it.dao = dao.createDao();

		var tasks = {
			f00 : function(callback) {
				pri.openDao(it, callback);
			},
			f01 : function(callback) {
				it.dao.user.exists({
					username : req.body.username
				}, function(result) {
					callback(result.error, result);
				});
			},
			f02 : function(callback) {
				pri.closeDao(it, callback);
			}
		};
		var lastCallback = function(error, results) {
			res.writeHead(200, {
				'Content-Type' : 'text/json'
			});
			if (error) {
				res.end(JSON.stringify({
					faults : [ {
						message : error.message
					} ]
				}));
			} else {
				res.end(JSON.stringify({
					isFormatCorrect : true,
					exists : results.f01.exists
				}));
			}
		};
		async.series(tasks, lastCallback);
	};
}

function create_user(it){
	return function(req,res){
		it.dao=dao.createDao();
		var tasks={
				f00:function(callback){
					pri.openDao(it, callback);
				},
				f01:function(callback){
					console.log(req.body);
					it.dao.user.create({
						username:req.body.username,
						password:req.body.password
					},function(result){
						callback(result.error,result);
					});
				},
				f02:function(callback){
					pri.closeDao(it, callback);
				}
		};
		var lastCallback=function(error,results){
			res.writeHead(200,{'Content-Type':'application/json'});
			res.end(JSON.stringify({
				userId:results.f01.userId
			}));
		};
		async.series(tasks,lastCallback);
	};
}
var pub = {
	shared : {

	},
	get : {

	},
	post : {
		login : login,
		create_user:create_user
	}
};

module.exports = {
	/**
	 * if method is not specified, list all service methods. if method is
	 * missing (can not find), return 404. return method handler.
	 */
	resolve : function(serviceMethod, httpMethod) {
		if (!serviceMethod) {
			return pri.list_methods;
		} else {
			var retMethod = null;
			if (!pub[httpMethod])
				httpMethod = 'post';
			retMethod = pub[httpMethod][serviceMethod]
					|| pub.shared[serviceMethod] || pri.http404;
			return retMethod({});
		}
	}
};
