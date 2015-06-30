console.log("Index JS is Alive!");

global.fileSystem = require('fs');

var core = this;

var config = {};
config.nick = "Fudgie[SIRC]";
config.alt = "mewtwo";
config.user = "thomas";
config.real = "Thomas Edwards";

var servers = [];
servers.push({"host":"irc.smallirc.in","port":6667,"chans":["#SIRC-Client"]});
servers.push({"host":"irc.spi.gt","port":6667,"chans":["#Fudgie"]});

global.Clients = [];

console.log("Simple IRC Bot Starting up!");

servers.forEach(function(server){
	var c = new Client(config,server);
	global.Clients.push(c);
	var cid = global.Clients.indexOf(c);
	console.log("CREATING CLIENT");
	console.log(config);
	console.log(server);
	if ($('#windows .status[connection-id='+cid+']').length <= 0) {
		$('#windows').append('<div class="window status" connection-id="'+cid+'"></div>');
		focusWindow(cid,"status");
	}
	
	c.connect();
	c.on('connected',function(){
		updateWindowList();
	});
	c.on('RAW[*]',function(d){
		c.logger.info("RAW["+d.numeric+"] "+d.string);
		$('#windows .status[connection-id='+cid+']').append("RAW["+d.numeric+"] "+d.string+"<br/>");
	});
	c.on('RAW[372]',function(d){
		c.logger.info("[MOTD] "+d.string);
		$('#windows .status[connection-id='+cid+']').append(d.string+"<br/>");
	});
	c.on('CLIENT[332]',function(ch){
		var topic = ch.topic.message;
		if (ch.topic.message == "") {
			topic = "No Topic"
		}
		$('#windows .channel[target="'+ch.name.toLowerCase()+'"][connection-id='+cid+'] .topic').html(topic);
		if (ch.topic.message != "") $('#windows .channel[target="'+ch.name.toLowerCase()+'"][connection-id='+cid+'] .scrollback').append("Topic is "+topic+"<br>");
	});
	c.on('message',function(data){
		console.log(data);
		if (data.dest instanceof Channel) {
			$('#windows .channel[target="'+data.dest.name.toLowerCase()+'"][connection-id='+cid+'] .scrollback').append(" &lt;"+data.user.nick+"&gt; "+data.message+"<br>");
		} else {
			if ($('#windows .query[target="'+data.user.nick.toLowerCase()+'"][connection-id='+cid+']').length <= 0) {
				$('#windows').append('<div class="window query" connection-id="'+cid+'" target="'+data.user.nick.toLowerCase()+'"></div>');
				updateWindowList();
				focusWindow(cid,"query",data.user.nick);
			}
			$('#windows .query[target="'+data.user.nick.toLowerCase()+'"][connection-id='+cid+']').append(" &lt;"+data.user.nick+"&gt; "+data.message+"<br>");
		}
	});
	c.on('join',function(data){
		if ($('#windows .channel[target="'+data.chan.name.toLowerCase()+'"][connection-id='+cid+']').length <= 0) {
			$('#windows').append('<div class="window channel" connection-id="'+cid+'" target="'+data.chan.name.toLowerCase()+'"><div class="topic">No Topic</div><div class="scrollback"></div><div class="userlist">Userlist here</div></div>');
			updateWindowList();
			focusWindow(cid,"channel",data.chan.name);
		}
	});
});
function updateWindowList(){
	$('#chanlist').html('');
	global.Clients.forEach(function(c,cid){
		if (typeof c.srv.name != "undefined") {
			$('#chanlist').append('<div type="status" connection-id="'+cid+'">'+c.srv.name+'</div>');
		} else {
			$('#chanlist').append('<div type="status" connection-id="'+cid+'">'+c.srv.host+'</div>');
		}
		c.channels.forEach(function(ch){
			$('#chanlist').append('<div type="channel" target="'+ch.name.toLowerCase()+'" connection-id="'+cid+'">'+ch.name+'</div>');
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
updateWindowList();
function focusWindow(cid,type,name) {
	var selector = "";
	if (type.toLowerCase() == "channel") {
		selector = '#windows .channel[target="'+name.toLowerCase()+'"][connection-id='+cid+']';
	} else if (type.toLowerCase() == "status") {
		selector = '#windows .status[connection-id='+cid+']';
	} else if (type.toLowerCase() == "query") {
		selector = '#windows .query[connection-id='+cid+']';
	}
	if ($(selector).length > 0) {
		$('#windows .window').removeClass("active");
		$(selector).addClass("active");
		// Channel List
		$('#chanlist div').removeClass("active");
		if (typeof name != "undefined") {
			$('#chanlist div[type="'+type.toLowerCase()+'"][connection-id='+cid+'][target="'+name.toLowerCase()+'"]').addClass("active");
		} else {
			$('#chanlist div[type="'+type.toLowerCase()+'"][connection-id='+cid+']').addClass("active");
		}
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
	var text = $('#toolbar .message input').val();
	var connid = $('#windows .active').attr("connection-id");
	var channel = $('#windows .active').attr("target");
	var type = "";
	var nick = "???";
	var client = null;
	
	if (typeof global.Clients[connid] != "undefined") client = global.Clients[connid];
	if (client != null) nick = client.cfg.nick;
	
	if ($('#windows .active').hasClass("channel")) type = "channel";
	if ($('#windows .active').hasClass("status")) type = "status";
	
	if (text.length <= 0 || text == "") return;
	
	if (text[0] == "/") {
		var ex = text.split(" ");
		if (ex[0].toLowerCase() == "/me") {
			global.Clients[connid].action(channel,ex.splice(1).join(" "));
			$('#windows .channel[target="'+channel.toLowerCase()+'"][connection-id='+connid+'] .scrollback').append("* "+nick+" "+ex.splice(1).join(" ")+"</br>");
		} else {
			global.Clients[connid].write(text.substr(1));
		}
	} else {
		global.Clients[connid].msg(channel,text);
		$('#windows .channel[target="'+channel.toLowerCase()+'"][connection-id='+connid+'] .scrollback').append(" &lt;"+nick+"&gt; "+text+"</br>");
	}
	$('#toolbar input').val('');
});