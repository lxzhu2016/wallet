var should = require("should");
var data = require("../libs/data.js");

describe('data', function() {
	before(function(done){
		data.reset('./test/test.sql',function(err,result){
			should.not.exist(err);
			done();
		});
	});
	
	describe(".user", function() {
		var user=data.user;
		describe(".login()", function(done) {
			it('login with john and john@gmail.com', function(done) {
				user.login({
					username : 'john',
					password : 'john@gmail.com'
				}, function(resp) {					
					should.exist(resp);
					should.exist(resp.succeed);
					should.equal(true,resp.succeed);
					done();
				});
			});			
		});
		
		describe(".create()",function(){
			it('create with nodejs and mocha',function(done){
				user.create({
					username:'mxxing',
					password:'annie',
					firstName:'annie',
					lastName:'xing',
					email:'mxxing@live.com',
					mobile:'15811596908',
				},function(resp){
					done();
				});
			});
		});
	});
});
