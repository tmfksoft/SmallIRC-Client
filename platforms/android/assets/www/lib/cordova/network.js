// Cordova - Cordova Networking Library.
// Using https://github.com/blocshop/sockets-for-cordova
function Networking() {
	var ev = {};
	
	this.hello = function(){
		alert("Hello, You're using SmallIRC for Mobiles.");
	}
	
	this.connect = function(host,port){
		this.socket = new Socket();
		this.socket.open(host,port,function(){
			if (typeof ev['connect'] != "undefined") ev['connect']();
		},function(){
			alert("Error connecting!");
		});
		this.socket.onData = function(data) {
			var d = String.fromCharCode.apply(null, data);
			if (typeof ev['data'] != "undefined") ev['data'](d);
		};
		
		this.socket.onClose = function(hasError) {
			if (typeof ev['disconnect'] != "undefined") ev['disconnect']();
		};
		this.socket.onError = function(str){
			alert("Networking ERROR: "+str);
			if (typeof ev['error'] != "undefined") ev['error'](str);
		}
	}
	this.write = function(str){
		if (typeof this.socket != "undefined") {
			var str = str+"\n";
			var data = new Uint8Array(str.length);
			for (var i = 0; i < data.length; i++) {
				data[i] = str.charCodeAt(i);
			}
			this.socket.write(data);
		}
	};
	this.close = function(){
		if (typeof this.socket != "undefined") {
			this.socket.shutdownWrite(); 
		}
	}
	this.on = function(name,cb){
		ev[name.toLowerCase()] = cb;
	};
}