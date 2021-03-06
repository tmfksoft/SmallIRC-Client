Client = function(config,server){
	this.cfg = config;
	this.srv = server;
	
	// Self stuff.
	this.connected = false;
	this.channels = [];
	this.users = [];
	this.socket = null;
	this.events = {};
	
	this.self = {};
	
	this.logger = new core.Logger("logs/"+config.nick+".log");

	this.connect = function(){
		if (typeof this.socket != null) {
			this.logger.info("Attempting to connect.");
			var parent = this;
			this.socket = new Networking();
			this.socket.connect(this.srv.host,this.srv.port)
			this.socket.on('connect',function(){
				
				parent.logger.info("Socket opened");
				
				parent.write("NICK "+parent.cfg.nick);
				parent.write("USER "+parent.cfg.user+" * * :"+parent.cfg.real);
				
				parent.fireEvent('connect');
			});
			this.socket.on('data',function(data){
				var self = parent;
				
				if (data.toString().trim().length > 0) {
					data.toString().split("\n").forEach(function(ln){
						if (ln.trim() != "") {
							self.fireEvent('data',ln.trim());
							
							// PING/PONG and events.
							var ex = ln.split(" ");
							
							if (ex[0] == "PING") {
								self.write("PONG "+ex[1]);
								self.fireEvent('ping');
							}
							if (ex.length > 1) {
								if (ex[1] == "001") {
									// We're accepted.
									self.connected = true;
									self.fireEvent("connected");
									self.srv.name = ex[6].trim();
									self.self.nick = parent.cfg.nick;
									
									// Join Channels
									for (var ch in self.srv.chans) {
										self.write("JOIN "+self.srv.chans[ch]);
									}
								} else if (ex[1] == "332") {
									var ch = ex[3].trim();
									var topic = ex.splice(4).join(" ").substr(1).trim();
									if (self.getChannel(ch) != null) {
										var channel = self.getChannel(ch);
										channel.topic.message = topic;
										self.fireEvent("CLIENT[332]",channel);
									}
								} else if (ex[1] == "PRIVMSG") {
									var msg = ex.slice(3).join(" ").slice(1).trim();
									var data = {"message":msg,"user":new User(ex[0])};
									if (ex[2][0] == "#") {
										data.dest = self.getChannel(ex[2].trim());
									} else {
										data.dest = new User(self.cfg.nick);
									}
									self.fireEvent("message",data);
								} else if (ex[1] == "JOIN") {
									// Join event.
									console.log("A user joined a channel");
									
									var ch = ex[2].substr(1).trim();
									
									if (self.getChannel(ch) == null) {
										self.channels.push(new Channel(ch));
									}
									
									var user = new User(ex[0]);
									var data = {"user":user,"chan":self.getChannel(ch)};
									console.log(data);
									self.fireEvent("join",data);
								}
								if (!self.hasEvent("RAW["+ex[1]+"]")) self.fireEvent("RAW[*]",{"numeric":ex[1],"string":ex.slice(3).join(" ").substr(1).trim(),"raw":ex.join(" ")});
								self.fireEvent("RAW["+ex[1]+"]",{"numeric":ex[1],"string":ex.slice(3).join(" ").substr(1).trim(),"raw":ex.join(" ")});
							} else {
								self.logger.info("[S] "+ln);
							}
						}
					});
				}
			});
		} else {
			this.logger.warn("A socket already exists. Please close it first.");
		}
	}
	
	// Functions
	this.msg = function(dest,msg) {
		this.write("PRIVMSG "+dest+" :"+msg);
		this.logger.info("["+dest+"] <"+self.nick+"> "+msg);
	}
	this.action = function(dest,msg) {
		this.write("PRIVMSG "+dest+" :"+String.fromCharCode(1)+"ACTION "+msg+String.fromCharCode(1));
		this.logger.info("["+dest+"] * "+self.nick+" "+msg);
	}
	this.notice = function(dest,msg) {
		this.write("NOTICE "+dest+" :"+msg);
	}
	this.quit = function(msg){
		if (typeof msg != "undefined") {
			this.write("QUIT :"+msg);
		} else {
			this.write("QUIT");
		}
	}
	this.getChannel = function(chan) {
		for (ch in this.channels) {
			if (this.channels[ch].name.toLowerCase() === chan.toLowerCase()) return this.channels[ch];
		}
		return null;
	}
	
	// Events.
	this.on = function(evt,cb) {
		this.events[evt.toLowerCase()] = cb;
	}
	this.fireEvent = function(evt,data) {
		if (typeof this.events[evt.toLowerCase()] != "undefined") {
			if (typeof data == "undefined") {
				this.events[evt.toLowerCase()]();
			} else {
				this.events[evt.toLowerCase()](data);
			}
		}
	}
	this.hasEvent = function(evt){
		if (typeof this.events[evt.toLowerCase()] != "undefined") return true;
		return false;
	}
	
	// Default Events
	this.on('RAW[*]',function(d){
		this.logger.info("[S] "+d.trim());
	});
	
	
	this.write = function(str) {
		if (typeof this.socket != "undefined") {
			this.logger.info("[C] "+str.trim());
			this.socket.write(str+"\n");
		} else {
			console.log("Not connected to socket!");
		}
	}
}
Channel = function(name){
	this.name = name.trim();
	this.users = [];
	this.topic = {};
	this.modes = [];
}
User = function(host){
	this.nick = "";
	this.user = "";
	this.real = "";
	this.host = "";
	this.modes = "";
	this.channels = [];
	
	// Magic ( For updating their host )
	this.parse = function(str) {
		if (str[0] == ":") str = str.substr(1);
		this.nick = str.split("!")[0];
	}
	this.parse(host);
}