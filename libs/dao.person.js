var async = require('async');

var fn = {};
function PersonDao(context) {
	this.context = context;
}
PersonDao.prototype = fn;
module.exports=function(context){
	return new PersonDao(context);
};

fn.exists = function(request, onCheckPersonExists) {
	var that=this;
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

		that.context.connection.query(sql, args, onAction);

	} else {
		onCheckPersonExists({
			error : null,
			exists : false
		});
	}

};

fn.create = function(request, onCreatePerson) {
	var that=this;
	var tasks = {
		f00 : function(callback) {
			that.exists({
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
			var sql = 'insert into wallet_person(user_id,first_name,last_name,'
					+ '	email,mobile,is_user,sys_created_on)'
					+ '	values(?,?,?,?,?,?,?)';
			var args = [ request.userId, request.firstName, request.lastName,
					request.email, request.mobile, request.isUser, new Date() ];
			var onAction = function(error, result) {
				callback(error, {
					error : error,
					personId : (!error) ? result.insertId : 0
				});
			};
			that.context.connection.query(sql, args, onAction);
		}
	};
	function lastCallback(error, results) {
		onCreatePerson(error, results.f01);
	}
	async.series(tasks, lastCallback);
};

fn.list = function(request, onListPerson) {
	var sql = "select first_name as firstName,last_name as lastName, email, mobile,is_user as isUser"
			+ " from wallet_person where user_id=? order by last_name asc,first_name asc";
	var args = [ request.userId ];
	var onAction = function(error, result, fields) {
		onListPerson({
			error : error,
			persons : result
		});
	};
	this.context.connection.query(sql, args, onAction);
};