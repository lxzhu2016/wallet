var mysql = require('mysql');
var async = require('async');
var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

var pri = {
	user : {},
	person : {},
	account : {
		types : {
			assets : 1,
			debt : 2,
			balance : 3
		},
		category : {

		}
	},
	hasTx : false
};

var pub = {
	user : {},
	person : {},
	account : {
		types : {
			assets : pri.account.types.assets,
			debt : pri.account.types.debt,
			balance : pri.account.types.balance
		},
		category : {

		}
	},
	transaction : {}
};

module.exports = pub;

var pool = mysql.createPool({
	host : 'localhost',
	user : 'root',
	password : 'root',
	database : 'smart_wallet',
	multipleStatements : true
});

pri.execSql = function() {
	var args = arguments;
	var onAction = args[args.length - 1];
	var hasAction = (null != onAction) && (typeof (onAction) === 'function');

	pool.getConnection(function(err, con) {
		if (err) {
			console.log(err);
			if (hasAction) {
				onAction(err, null, null);
			}
		} else {
			try {
				con.query.apply(con, args);
			} finally {
				con.release();
			}
		}
	});
};

pri.reset = function(filePath, onAction) {
	var absFilePath = path.resolve(filePath);
	fs.readFile(absFilePath, {
		encoding : 'utf8'
	}, function(err, data) {
		if (err) {
			onAction(err, null);
		} else {
			console.log(data);
			var sql = data;
			pri.execSql(sql, onAction);
		}
	});
	/*
	 * var tasks = [ function(onActionEachStep) { pri.execSql('delete from
	 * wallet_transaction;', onActionEachStep); }, function(onActionEachStep) {
	 * pri.execSql('delete from wallet_account_category', onActionEachStep); },
	 * function(onActionEachStep) { pri.execSql('delete from wallet_account',
	 * onActionEachStep); }, function(onActionEachStep) { pri.execSql('delete
	 * from wallet_person', onActionEachStep); }, function(onActionEachStep) {
	 * pri.execSql('delete from wallet_user', onActionEachStep); } ];
	 * 
	 * async.series(tasks, function(err, result) { onAction(); });
	 */
};

pri.user.login = function(request, onLogin) {
	console.log("typeof onLogin is "+typeof(onLogin));
	var sql = 'select 1 from wallet_user where username=? and password=?';
	var pwdDigest = crypto.createHash('md5').update(request.password, 'utf8')
			.digest('hex').toUpperCase();
	console.log('password from "' + request.password + '" to "' + pwdDigest);
	var args = [ request.username, pwdDigest ];
	var onAction = function(err, rows, fields) {
		var succeed = (!err) && (rows) && (rows.length == 1);
		console.log("typeof onLogin is "+typeof(onLogin));
		onLogin({
			succeed : succeed
		});
	};
	pri.execSql(sql, args, onAction);
};

pri.user.create = function(request, onCreate) {
	var sql = 'insert into wallet_user (username,password,sys_created_on)'
			+ ' values(?,?,?)';
	var args = [ request.username, request.password, new Date() ];
	var onAction = function(err, result) {
		var succeed = (!err) && (result) && (result.insertId);
		if (succeed) {
			request.userId = result.insertId;
			request.isUser = true;
			pri.person.create(request, onCreate);
		} else {
			onCreate({
				succeed : false,
				userId : 0
			});
		}
	};
	pri.execSql(sql, args, onAction);
};

pri.person.create = function(request, onCreate) {
	if (!request.isUser) {
		request.isUser = false;
	}
	if (request.userId <= 0) {
		throw {
			code : 100,
			message : "request.userId must be great than 0 and actually exists."
		};
	}
	var sql = 'insert into wallet_person(user_id,first_name,last_name,'
			+ ' email,mobile,is_user,sys_created_on) '
			+ ' values(?,?,?,?,?,?,?)';
	var args = [ request.userId, request.firstName, request.lastName,
			request.email, request.phone, request.isUser, new Date() ];
	var onAction = function(err, result) {
		var succeed = (!err) && (result) && (result.insertId);
		if (succeed) {
			onCreate({
				succeed : true,
				userId : request.userId,
				personId : result.insertId
			});
		} else {
			onCreate({
				succeed : false,
				userId : 0,
				personId : 0
			});
		}
	};
	pri.execSql(sql, args, onAction);
};

/**
 * load person of specified user
 */
pri.person.load = function(request, onLoad) {
	var sql = 'select person_id as personId,first_name as firstName,'
			+ ' last_name as lastName,email,mobile,is_user as isUser'
			+ ' where user_id=?';
	var args = [ request.userId ];
	var onAction = function(err, rows, fields) {
		if (err) {
			console.log(err);
			onLoad({
				succeed : false,
				rows : []
			});
		} else {
			onLoad({
				succeed : true,
				rows : rows || []
			});
		}

	};
	pri.execSql(sql, args, onAction);
};

/**
 * <summary> delete associate person from user. </summary>
 */
pri.person.remove = function(request, onRemove) {
	var sql = 'delete from wallet_person where user_id=? and is_user=?';
	var args = [ request.userId, false ];
	var onAction = function(err, result) {
		if (err) {
			console.log(err);
			if (err) {
				console.log(err);
				onRemove({
					succeed : false
				});
			} else {
				onRemove({
					succeed : true
				});
			}
		}
	};

	pri.execSql(sql, args, onAction);
};

/**
 * <summary> insert account category. </summary> <remarks> todo:
 * <ul>
 * <li>check if (user_id,account_category_name) unique.</li>
 * <li>check if (user_id) exists.</li>
 * </ul>
 * </remarks>
 */
pri.account.category.create = function(request, onCreate) {
	var sql = 'insert into wallet_account_category(user_id,account_category_name'
			+ ',description,sys_created_on)' + ' values(?,?,?,?)';
	var args = [ request.userId, request.accountCategoryName,
			request.Description, new Date() ];
	var onAction = function(err, result) {
		var succeed = (!err) && (result) && (result.insertId);
		if (succeed) {
			onCreate({
				succeed : true,
				accountCategoryId : result.insertId,
				userId : request.userId
			});
		} else {
			onCreate({
				succeed : false,
				accountCategoryId : 0,
				userId : 0
			});
		}
	};
	pri.execSql(sql, args, onAction);
};

pri.account.category.Remove = function(request, onRemove) {

};

/*
 * <summary> load category of a user </summary>
 */
pri.account.category.load = function(request, onLoad) {
	var sql = 'select account_category_id as accountCategoryId,'
			+ ' account_category_name as accountCategoryName,'
			+ ' description,' + ' sys_created_on as sysCreatedOn'
			+ ' from wallet_account_category' + ' where user_id=?';
	var onAction = function(err, rows, fields) {
		if (err) {
			onLoad({
				succeed : false,
				rows : []
			});
		} else {
			onLoad({
				succeed : true,
				rows : rows
			});
		}
	};
	pri.execSql(sql, [ request.userId ], onAction);
};

pri.account.create = function(request, onCreate) {
	var sql = 'insert into wallet_account('
			+ ' user_id,person_id,account_type_id,account_category_id,account_name,'
			+ ' description,createdOn,sys_created_on)'
			+ ' values(?,?,?,?,?,?,?,?)';
	var args = [ request.userId, request.personId, request.accountTypeId,
			request.accountCategoryId, request.accountName,
			request.description, request.createdOn, new Date() ];
	var onAction = function(err, result) {
		var succeed = (!err) && (result) && (result.insertId);
		if (succeed) {
			onCreate({
				succeed : true,
				accountId : result.insertId
			});
		} else {
			onCreate({
				succeed : false,
				accountId : 0
			});
		}
	};
	pri.execSql(sql, args, onAction);
};

module.exports.reset = function(filePath, onAction) {
	pri.reset(filePath, onAction);
};

module.exports.transaction.begin = function(onAction) {

};

module.exports.transaction.commit = function() {

};

module.exports.transaction.rollback = function() {

};

module.exports.user.login = function(request, onLogin) {
	pri.user.login(request, onLogin);
};

module.exports.user.create = function(request, onCreate) {
	pri.user.create(request, onCreate);
};

module.exports.person.create = function(request, onCreate) {
	pri.person.create(request, onCreate);
};

module.exports.person.remove = function(request, onRemove) {
	pri.person.remove(request, onRemove);
};

module.exports.person.load = function(request, onLoad) {
	pri.person.load(request, onLoad);
};
