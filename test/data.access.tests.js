var should = require("should");
var async = require('async');
var dao = require("../libs/dao.js").createDao();

function onBefore(done) {
	var tasks = {
		f00 : function(callback) {
			//console.log(dao.context);
			dao.open(null, function(result) {
				callback(result.error, result);
			});
		},
		f01 : function(callback) {
			//console.log(dao.context);
			dao.reset({
				scriptFile : './test/test.sql'
			}, function(result) {
				callback(result.error, result);
			});
		},
		f02 : function(callback) {
			//console.log(dao.context);
			dao.close(null, function(result) {
				callback(result.error, result);
			});
		}
	};
	function lastCallback(error, results) {
		//console.log(dao.context);
		should.not.exist(error);
		should.exist(results);
		should.exist(results.f00);
		should.exist(results.f01);
		done();
	}
	async.series(tasks, lastCallback);
}
function onBeforeEach(done) {
	var tasks = {
		f00 : function(callback) {
			console.log();
			console.log("before each:open connection.");
			dao.open(null, function(result) {
				callback(result.error, result);
			});
		},
		f01 : function(callback) {
			dao.beginTransaction(null, function(result) {
				callback(result.error, result);
			});
		}
	};
	function lastCallback(error, results) {
		should.not.exists(error);
		done();
	}
	async.series(tasks, lastCallback);
}
function onAfterEach(done) {
	var tasks = {
		f00 : function(callback) {
			dao.rollback(null, function(result) {
				callback(result.error, result);
			});
		},
		f01 : function(callback) {
			console.log("before each:close connection.");
			dao.close(null, function(result) {
				callback(result.error, result);
			});
		}
	};
	function lastCallback(error, results) {
		should.not.exists(error);
		done();
	}
	async.series(tasks, lastCallback);
}

function loginJohn(done) {
	var tasks = {
		f01 : function(callback) {
			dao.user.login({
				username : 'john',
				password : 'john@gmail.com'
			}, function(result) {
				callback(result.error, result);
			});
		}
	};

	function lastCallback(error, results) {
		should.not.exist(error);
		should.exist(results);
		should.exist(results.f01);
		should.exist(results.f01.ticket);
		done();
	}

	async.series(tasks, lastCallback);
}
function loginJohnInvalidPassword(done) {
	var tasks = {

		f01 : function(callback) {
			dao.user.login({
				username : 'john',
				password : 'invalid password'
			}, function(result) {
				callback(result.error, result);
			});
		}
	};
	function lastCallback(error, results) {

		should.exist(results.f01);
		should.not.exist(results.f01.ticket);
		done();
	}
	async.series(tasks, lastCallback);
}
function userExists(done) {
	var tasks = {

		f01 : function(callback) {
			dao.user.exists({
				username : 'john'
			}, function(result) {
				callback(result.error, result);
			});
		}
	};
	function lastCallback(error, results) {
		should.not.exist(error);
		should.exist(results.f01);
		should.equal(true, results.f01.exists);
		done();
	}
	async.series(tasks, lastCallback);
}
function userNotExists(done) {
	var tasks = {

		f01 : function(callback) {
			dao.user.exists({
				username : 'john-not-exist'
			}, function(result) {
				callback(result.error, result);
			});
		}
	};
	function lastCallback(error, results) {
		should.not.exist(error);
		should.exist(results.f01);
		should.equal(false, results.f01.exists);
		done();
	}
	async.series(tasks, lastCallback);
}

function createUser(done) {
	var tasks = {
		f00 : function(callback) {
			dao.user.create({
				username : 'test20140209',
				password : 'My password is really very long'
			}, function(result) {
				callback(result.error, result);
			});
		},
		f01 : function(callback) {
			dao.user.exists({
				username : 'test20140209'
			}, function(result) {
				callback(result.error, result);
			});
		}
	};

	function lastCallback(error, results) {
		should.not.exist(error);		
		should.exist(results.f00);
		should.exist(results.f00.userId);
		results.f00.userId.should.be.greaterThan(0);		

		should.exist(results.f01);
		should.exist(results.f01.exists);
		should.equal(results.f01.exists, true);
		done();
	}
	async.series(tasks, lastCallback);
}
function personEmailExists(done){
	
	dao.person.exists({
		email:'john@gmail.com'
	},function(result){
		should.not.exists(result.error);
		should.equal(true,result.exists);
		done();
	});
}
function listPerson(done){
	dao.person.list({
		userId:1
	},function(result){
		should.not.exist(result.error);
		should.exist(result.persons);
		should.equal(3,result.persons.length);
		done();
	});
}
describe('dao', function() {
	before(onBefore);
	beforeEach(onBeforeEach);
	afterEach(onAfterEach);

	describe(".user", function() {
		describe(".login()", function(done) {
			it('login with john and john@gmail.com', function(done) {
				loginJohn(done);
			});

			it("login with john and invalid password", function(done) {
				loginJohnInvalidPassword(done);
			});
		});

		describe(".exists", function(done) {
			it("user name john exists", function(done) {
				userExists(done);
			});

			it("username john-not-exists does not exist", function(done) {
				userNotExists(done);
			});
		});

		describe(".create", function(done) {
			it("create user with valid data", function(done) {
				createUser(done);
			});
		});
	});
	
	describe(".person",function(){
		describe(".exists",function(done){
			it('email john@gmail.com exists',function(done){
				personEmailExists(done);
			});			
		});
		
		describe(".list",function(done){
			it("there are 3 person associated with user_id=1",function(done){
				listPerson(done);
			});
			
		});
	});
});
