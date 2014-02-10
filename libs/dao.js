var mysql = require('mysql');
var async = require('async');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var pool = mysql.createPool({
	host : 'localhost',
	user : 'root',
	password : 'root',
	database : 'smart_wallet',
	multipleStatements : true
});

function onCreateDao() {
	var that = {
		connection : null
	};

	function open(request, onOpen) {
		pool.getConnection(function(error, connection) {
			that.connection = connection;
			onOpen({
				error : error,
				connection : connection
			});
		});
	}

	function close(request, onClose) {
		if (that.connection) {
			that.connection.release();
			that.connection = null;
			onClose({});
		} else {
			onClose({
				error : {
					message : "connection is not ready"
				}
			});
		}
	}

	function beginTransaction(request, onBeginTransaction) {
		if (that.connection) {
			that.connection.beginTransaction(function(error) {
				onBeginTransaction({
					error : error
				});
			});
		} else {
			onBeginTransaction({
				error : {
					message : 'connection is not ready'
				}
			});
		}
	}

	function commit(request, onCommit) {
		request = request || {};
		request.commit = true;
		endTransaction(request, onCommit);
	}
	function rollback(request, onRollback) {
		request = request || {};
		request.commit = false;
		endTransaction(request, onRollback);
	}

	function endTransaction(request, onEndTransaction) {
		request = request || {
			commit : false
		};

		if (that.connection) {
			if (request.commit) {
				that.connection.commit(function(error) {
					if (error) {
						that.connection.rollback(function(error) {
							onEndTransaction({
								error : error
							});
						});
					} else {
						onEndTransaction({
							error : error
						});
					}
				});
			} else {
				that.connection.rollback(function(error) {
					onEndTransaction({
						error : error
					});
				});
			}
		} else {
			onEndTransaction({
				error : {
					message : 'connection is not ready'
				}
			});
		}
	}

	function reset(request, onReset) {
		var absFilePath = path.resolve(request.scriptFile);
		fs.readFile(absFilePath, {
			encoding : 'utf8'
		}, function(error, data) {
			if (error) {
				onReset({
					error : error
				});
			} else {
				if (that.connection) {
					that.connection.query(data, function(error, result) {
						onReset({
							error : error
						});
					});
				} else {
					onReset({
						error : {
							message : 'connection is not ready'
						}
					});
				}
			}
		});
	}

	function login(request, onLogin) {
		console.log('login with username:"' + request.username + '" password:"'
				+ request.password + '"');

		var pwdDigest = crypto.createHash('md5').update(request.password,
				'utf8').digest('hex').toUpperCase();

		console.log('digest of "' + request.password + '" is "' + pwdDigest);

		var sql = 'select 1 from wallet_user where username=? and password=?';
		var args = [ request.username, pwdDigest ];

		var onAction = function(error, rows, fields) {
			var succeed = (!error) && (rows) && (rows.length === 1);
			var ticket = crypto.createHash('md5').update(
					request.username + new Date(), 'utf8').digest('hex')
					.toUpperCase();
			onLogin({
				error : error,
				ticket : succeed ? ticket : undefined
			});
		};
		that.connection.query(sql, args, onAction);
	}

	function checkUserExists(request, onCheckUserExists) {
		var sql = "select 1 from wallet_user where username=?";
		var args = [ request.username ];
		var onAction = function(error, rows, fields) {
			onCheckUserExists({
				error : error,
				exists : (rows) && (rows.length === 1) ? true : false
			});
		};

		that.connection.query(sql, args, onAction);
	}

	function createUser(request, onCreateUser) {
		var tasks = {
			f00 : function(callback) {
				console.log('user.create: check if username exists.');
				checkUserExists({
					username : request.username
				}, function(result) {
					if (result.exists) {
						result.error = {
							message : 'username existed'
						};
					}
					callback(result.error, result);
				});
			},
			f01 : function(callback) {
				console.log('user.create: insert into wallet_user.');
				console.log('username:'+request.username+'password:'+request.password);
				var pwdDigest = crypto.createHash('md5').update(
						request.password, 'utf8').digest('hex').toUpperCase();

				var sql = 'insert into wallet_user (username,password,sys_created_on)'
						+ ' values(?,?,?)';
				var args = [ request.username, pwdDigest, new Date() ];
				var onAction = function(error, result) {
					var succeed = (!error) && (result) && (result.insertId);
					callback(error, {
						error : error,
						userId : succeed ? result.insertId : 0
					});
				};
				that.connection.query(sql, args, onAction);
			}
		};
		function lastCallback(error, results) {
			console.log("user.create:lastCallback");
			onCreateUser(results.f01);
		}
		async.series(tasks, lastCallback);
	}
	function checkPersonExists(request, onCheckPersonExists) {

		if (request.email || request.mobile) {
			var args = [];
			var sql = "select 1 from wallet_person where ";
			if (request.email) {
				sql += " email=? or";
				args.push(request.email);
			}
			if (request.mobile) {
				sql += " mobile=?";
				args.push(request.mobile);
			}

			if (sql.slice(sql.length - 2) === 'or') {
				sql = sql.slice(0, sql.length - 2);
			}
			console.log('person.exists: final sql is "' + sql + '"');
			var onAction = function(error, rows, fields) {
				
				onCheckPersonExists({
					error : error,
					exists : (rows) && (rows.length === 1)
				});
			};

			that.connection.query(sql, args, onAction);

		} else {
			onCheckPersonExists({
				error : null,
				exists : false
			});
		}

	}
	function createPerson(request, onCreatePerson) {
		var tasks = {
			f00 : function(callback) {
				checkPersonExists({
					email : request.email,
					mobile : request.mobile
				}, function(result) {
					if (result.exists) {
						result.error = {
							message : "person's email or mobile existed."
						};
					}
					callback(result.error, result);
				});
			},
			f01 : function(callback) {
				var sql = 'insert into wallet_person(user_id,first_name,last_name,email,mobile,is_user,sys_created_on)'
						+ " values(?,?,?,?,?,?,?)";
				var args = [ request.userId, request.firstName,
						request.lastName, request.email, request.mobile,
						request.isUser, new Date() ];
				var onAction = function(error, result) {
					callback(error, {
						error : error,
						personId : (!error) ? result.insertId : 0
					});
				};
				that.connection.query(sql, args, onAction);
			}
		};
		function lastCallback(error, results) {
			onCreatePerson(error, results.f01);
		}
		async.series(tasks, lastCallback);
	}

	function listPerson(request, onListPerson) {
		var sql = "select first_name as firstName,last_name as lastName, email, mobile,is_user as isUser"
				+ " from wallet_person where user_id=? order by last_name asc,first_name asc";
		var args = [ request.userId ];
		var onAction = function(error, result, fields) {
			onListPerson({
				error:error,
				persons:result
			});
		};
		that.connection.query(sql, args, onAction);
	}

	function createAccountCategory(request, onCreateAccountCategory) {

	}

	function createAccount(request, onCreateAccount) {

	}

	function createAccountTransaction(request, onCreateAccountTransaction) {

	}

	var dao = {
		open : open,
		close : close,
		reset : reset,
		beginTransaction : beginTransaction,

		commit : commit,
		rollback : rollback,
		user : {
			login : login,
			create : createUser,
			exists : checkUserExists
		},
		person : {
			exists : checkPersonExists,
			create : createPerson,
			list : listPerson
		}

	};
	return dao;
}

module.exports = {
	createDao : onCreateDao
};