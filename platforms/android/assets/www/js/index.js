console.log("Index JS is Alive!");

var sock = new Networking();

sock.on('connect',function(){
	alert("Connected!");
	sock.write("NICK SIRC");
	sock.write("USER a b c :realname");
});
sock.on('data',function(data){
	var d = data.split("\n");
	d.forEach(function(ln){
		var line = ln.trim();
		if (line != "") {
			console.log(line);
			$('#scrollback').append(line+"</br>");
			var ex = ln.split(" ");
			if (ex[0] == "PING"){
				sock.write("PONG "+ex[1]);
			}
			if (ex.length > 1) {
				if (ex[1] == "001") {
					sock.write("JOIN #TMFKSOFT");
				}
			}
		}
	});
});
sock.on('disconnect',function(){ alert('Disconnected!'); });
sock.connect("irc.smallirc.in",6667);

$('#input button').click(function(){
	sock.write("PRIVMSG #TMFKSOFT :"+$('#input input').val());
	$('#scrollback').append("<You> "+$('#input input').val()+"</br>");
	$('#input input').val('');
});