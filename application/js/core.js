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
	c.on('join',function(data){
		if ($('#windows .channel[channel-name="'+data.chan.name.toLowerCase()+'"][connection-id=0]').length <= 0) {
			$('#windows').append('<div class="window channel" connection-id="0" channel-name="'+data.chan.name.toLowerCase()+'"><div class="topic"></div><div class="scrollback"></div><div class="userlist">Userlist here</div></div>');
			focusWindow(0,"channel",data.chan.name);
		}
		updateWindowList();
	});
	global.Clients.push(c);
});
function updateWindowList(){
	$('#chanlist').html('');
	global.Clients.forEach(function(c,cid){
		$('#chanlist').append('<div type="status" connection-id="'+cid+'">Connection #'+cid+'</h3>');
		c.channels.forEach(function(ch){
			$('#chanlist').append('<div type="channel" target="'+ch.name+'" connection-id="'+cid+'">'+ch.name+'</div>');
		});
	});
	$('#chanlist div').click(function(){
		var cid = $(this).attr('connection-id');
		var target = $(this).attr('target');
		var type = $(this).attr('type');
		if (focusWindow(cid,type,target)) {
			$('#chanlist div').removeClass("active");
			$(this).addClass("active");
		}
	});
}
function focusWindow(cid,type,name) {
	var selector = "";
	if (type.toLowerCase() == "channel") {
		selector = '#windows .channel[channel-name="'+name+'"][connection-id='+cid+']';
	} else if (type.toLowerCase() == "status") {
		selector = '#windows .status[connection-id='+cid+']';
	}
	if ($(selector).length > 0) {
		$('#windows .window').removeClass("active");
		$(selector).addClass("active");
		return true;
	}
	return false;
}
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