var express=require('express');
var http=require('http');
var path=require('path');
var app=express();


app.get('/',function(req,res){
	res.end("Hello");
});
app.listen(8000);
