console.log("Index JS is Alive!");

var fs = require('fs');
var core = this;

var config = {};
config.nick = "Fudgie[SIRC]";
config.alt = "mewtwo";
config.user = "thomas";
config.real = "Thomas Edwards";

var servers = [];
servers.push({"host":"irc.smallirc.in","port":6667,"chans":["#tmfksoft"]});

var clients = [];

console.log("Simple IRC Bot Starting up!");

servers.forEach(function(server){
	var c = new Client(config,server);
	console.log("CREATING CLIENT");
	console.log(config);
	console.log(server);
	
	c.connect();
	c.on('ping',function(){
		c.action("#tmfksoft","I got a ping");
	});
	c.on('RAW[*]',function(d){
		c.logger.info("RAW["+d.numeric+"] "+d.string);
	});
	c.on('RAW[372]',function(d){
		c.logger.info("[MOTD] "+d.string);
	});
	c.on('message',function(data){
		console.log(data.user);
		$('#scrollback').append("["+data.chan.name+"] &lt;"+data.user.nick+"&gt; "+data.message+"<br>");
	});
	clients.push(c);
});
$(window).bind('beforeunload',function(){
	console.log("Page closed");
	clients.forEach(function(c){
		c.quit("Client Closed");
	});
});
$('#input button').click(function(){
	clients[0].msg("#tmfksoft",$('#input input').val());
	$('#scrollback').append("You: "+$('#input input').val()+"</br>");
	$('#input input').val('');
});