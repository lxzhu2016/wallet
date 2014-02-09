var express=require('express');
var http=require('http');
var path=require('path');
var app=express();
app.configure(function(){
	app.set('port', process.env.PORT||8000);
	app.set('views',__dirname+'/views');
	app.set('view engine','jade');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(app.router);
	app.use(express.static(path.join(__dirname,'pubs')));
});
app.configure('development',function(){
	app.use(express.errorHandler());
});
app.get('/',function(req,res){
	res.render('index',{title:'zhu liangxiong'});
});
http.createServer(app).listen(app.get('port'),function(error){
	if(error){
		console.log(error);
	}else{
		console.log('server is running on port '+app.get('port'));
	}
});
