var async = require('async');
var crypto = require('crypto');

function UserDao(context) {
	this.context = context;
}

module.exports = function(context) {
	return new UserDao(context);
};

UserDao.prototype.login = function(request, onLogin) {
	var that = this;

	console.log('login with username:"' + request.username + '" password:"'
			+ request.password + '"');

	var pwdDigest = crypto.createHash('md5').update(request.password, 'utf8')
			.digest('hex').toUpperCase();

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
	that.context.connection.query(sql, args, onAction);
};

/**
 * 
 * @param request
 * @param onCheckUserExists
 */

UserDao.prototype.exists = function(request, onCheckUserExists) {
	var sql = "select 1 from wallet_user where username=?";
	var args = [ request.username ];
	var onAction = function(error, rows, fields) {
		onCheckUserExists({
			error : error,
			exists : (rows) && (rows.length === 1) ? true : false
		});
	};

	this.context.connection.query(sql, args, onAction);
};



UserDao.prototype.create = function(request, onCreateUser) {
	var that = this;
	var tasks = {
		f00 : function(callback) {
			console.log('user.create: check if username exists.');
			that.exists({
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
			console.log('username:' + request.username + 'password:'
					+ request.password);
			var pwdDigest = crypto.createHash('md5').update(request.password,
					'utf8').digest('hex').toUpperCase();

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
			that.context.connection.query(sql, args, onAction);
		}
	};
	function lastCallback(error, results) {
		console.log("user.create:lastCallback");
		onCreateUser(results.f01);
	}
	async.series(tasks, lastCallback);
};



function createAccountCategory(request, onCreateAccountCategory) {

}



function createAccount(request, onCreateAccount) {

}


function createAccountTransaction(request, onCreateAccountTransaction) {

}
