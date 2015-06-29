// NodeJS - Desktop Library.
function Networking() {
	var net = require('net');
	var ev = {};
	
	this.hello = function(){
		alert("Hello, You're using SmallIRC for Desktops.");
	}
	
	this.connect = function(host,port){
		this.socket = net.connect({host:host,port:port},function(){
			if (typeof ev['connect'] != "undefined") ev['connect']();
		});
		this.socket.on('data', function(data) {
			if (typeof ev['data'] != "undefined") ev['data'](data.toString());
		});
		this.socket.on('end', function() {
			if (typeof ev['disconnect'] != "undefined") ev['disconnect']();
		});
		this.socket.on('error', function(str) {
			if (typeof ev['error'] != "undefined") ev['error'](str);
		});
	}
	this.write = function(data){
		if (typeof this.socket != "undefined") {
			this.socket.write(data+"\n");
		}
	};
	this.close = function(){
		if (typeof this.socket != "undefined") {
			this.socket.end();
		}
	}
	this.on = function(name,cb){
		ev[name.toLowerCase()] = cb;
	};
}