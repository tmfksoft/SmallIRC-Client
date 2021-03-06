Logger = function(file) {
	this.file = file;
	this.handle = null;
	self = this;
	
	global.fileSystem.open(file,'w',function(err,fd){
		self.handle = fd;
	});
	
	this.info = function(str){
		console.log("[INFO] "+str);;
		if (this.handle != null) global.fileSystem.write(this.handle,"[INFO] "+str+"\r\n");
	}
	this.warn = function(str){
		if (this.handle != null) global.fileSystem.write(this.handle,"[WARN] "+str+"\r\n");
	}
}