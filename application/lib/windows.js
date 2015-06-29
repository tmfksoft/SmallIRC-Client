// Contrary to popular belief. This is actually just a Window Manager.
WindowManager = function(){
	this.windows = {};
	
	this.loadWindow = function(id,path) {
		// Loads a window.
		if (global.fileSystem.existsSync(path)) {
			if (global.fileSystem.existsSync(path+"window.json")) {
				// Load the config.
				global.fileSystem.readFile(path+"window.json",function(d){
					console.log(d);
				});
			} else {
				console.log("window.json file doesnt exist");
			}
		} else {
			console.log("window doesnt exist");
		}
	}
	this.unloadWindow = function(id) {
		if (this.getWindow(id) != null) {
			var w = this.getWindow(id);
			w.close();
			delete this.windows(id.toLowerCase());
		}
	}
	this.getWindow = function(id) {
		if (typeof this.windows[id.toLowerCase()] != "undefined") {
			return this.windows[id.toLowerCase()];
		}
		return null;
	}
}
Window = function(cnf){
	this.config = cnf;
	this.handle = null;
	
	this.open = function(){
		if (typeof this.config.options != "undefined") {
			this.handle = gui.Window.open(this.config.path,this.config.options);
		} else {
			this.handle = gui.Window.open(this.config.path);
		}
	}
	this.close = function(){
		if (this.handle != null) {
			this.handle.close();
		}
	}
}
global.windowManager = new WindowManager();