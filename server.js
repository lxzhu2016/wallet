var express=require('express');
var http=require('http');
var path=require('path');
var app=express();
app.configure(function(){
	
});

app.get('/',routes.index);
