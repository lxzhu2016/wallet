var mysql = require('mysql');
var daoCore = require('./dao.core.js');
var daoUser = require('./dao.user.js');
var daoPerson = require('./dao.person.js');
var pool = mysql.createPool({
	host : 'localhost',
	user : 'root',
	password : 'root',
	database : 'smart_wallet',
	multipleStatements : true
});

function onCreateDao() {
	var context = {
		pool : pool
	};
	var dao = daoCore(context);
	dao.user = daoUser(context);
	dao.person = daoPerson(context);
	return dao;
}

module.exports = {
	createDao : onCreateDao
};