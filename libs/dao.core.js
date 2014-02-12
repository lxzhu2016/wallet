var mysql = require('mysql');
var async = require('async');
var fs = require('fs');
var path = require('path');



function DaoCore(context) {
	this.context = context;
}


module.exports=function(context){
	return new DaoCore(context);
};

DaoCore.prototype.open = function(request, onOpen) {
	var that=this;
	this.context.pool.getConnection(function(error, connection) {		
		that.context.connection = connection;
		onOpen({
			error : error,
			connection : connection
		});
	});
};

DaoCore.prototype.close = function(request, onClose) {	
	if (this.context.connection) {
		this.context.connection.release();
		this.context.connection = null;
		onClose({});
	} else {
		console.log("the connection is null");
		onClose({
			error : {
				message : "connection is not ready"
			}
		});
	}
};

DaoCore.prototype.beginTransaction = function(request, onBeginTransaction) {
	var that=this;
	if (that.context.connection) {
		console.log("begin connection");
		that.context.connection.beginTransaction(function(error) {
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
};

DaoCore.prototype.commit = function(request, onCommit) {
	request = request || {};
	request.commit = true;
	this.endTransaction(request, onCommit);
};
DaoCore.prototype.rollback = function(request, onRollback) {
	request = request || {};
	request.commit = false;
	this.endTransaction(request, onRollback);
};

DaoCore.prototype.endTransaction = function(request, onEndTransaction) {
	var that=this;
	request = request || {
		commit : false
	};

	if (that.context.connection) {
		if (request.commit) {
			that.context.connection.commit(function(error) {
				if (error) {
					that.context.connection.rollback(function(error) {
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
			that.context.connection.rollback(function(error) {
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
};

DaoCore.prototype.reset = function(request, onReset) {
	var that=this;
	var absFilePath = path.resolve(request.scriptFile);
	fs.readFile(absFilePath, {
		encoding : 'utf8'
	}, function(error, data) {
		if (error) {
			onReset({
				error : error
			});
		} else {
			if (that.context.connection) {
				that.context.connection.query(data, function(error, result) {
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
};
