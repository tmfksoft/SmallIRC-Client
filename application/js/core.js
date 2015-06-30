console.log("Index JS is Alive!");

global.fileSystem = require('fs');

var core = this;

var config = {};
config.nick = "Fudgie[SIRC]";
config.alt = "mewtwo";
config.user = "thomas";
config.real = "Thomas Edwards";

var servers = [];
servers.push({"host":"irc.smallirc.in","port":6667,"chans":["#tmfksoft"]});

global.Clients = [];

console.log("Simple IRC Bot Starting up!");

servers.forEach(function(server){
	var c = new Client(config,server);
	console.log("CREATING CLIENT");
	console.log(config);
	console.log(server);
	
	c.connect();
	c.on('RAW[*]',function(d){
		c.logger.info("RAW["+d.numeric+"] "+d.string);
		$('#windows .status[connection-id=0]').append("RAW["+d.numeric+"] "+d.string+"<br/>");
	});
	c.on('RAW[372]',function(d){
		c.logger.info("[MOTD] "+d.string);
	});
	c.on('CLIENT[332]',function(ch){
		$('#windows .channel[channel-name="'+ch.name.toLowerCase()+'"][connection-id=0] .topic').html(ch.topic.message);
		$('#windows .channel[channel-name="'+ch.name.toLowerCase()+'"][connection-id=0] .scrollback').append("Topic is "+ch.topic.message+"<br>");
	});
	c.on('message',function(data){
		console.log(data.user);
		$('#windows .channel[channel-name="'+data.chan.name.toLowerCase()+'"][connection-id=0] .scrollback').append(" &lt;"+data.user.nick+"&gt; "+data.message+"<br>");
	});
	global.Clients.push(c);
});
$(window).bind('beforeunload',function(){
	console.log("Page closed");
	global.Clients.forEach(function(c){
		c.quit("Client Closed");
	});
});
$('#toolbar button').click(function(){
	var text = $('#toolbar input').val();
	var connid = 0;
	var channel = "#tmfksoft";
	
	if (text.length <= 0 || text == "") return;
	
	if (text[0] == "/") {
		var ex = text.split(" ");
		if (ex[0].toLowerCase() == "/me") {
			global.Clients[0].action("#tmfksoft",ex.splice(1).join(" "));
			$('#windows .channel[channel-name="'+channel.toLowerCase()+'"][connection-id='+connid+'] .scrollback').append("* You "+ex.splice(1).join(" ")+"</br>");
		} else {
			global.Clients[0].write(text.substr(1));
		}
	} else {
		global.Clients[0].msg("#tmfksoft",text);
		$('#windows .channel[channel-name="'+channel.toLowerCase()+'"][connection-id='+connid+'] .scrollback').append(" &lt;You&gt; "+text+"</br>");
	}
	$('#toolbar input').val('');
});