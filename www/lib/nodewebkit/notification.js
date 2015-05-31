// NodeWebkit Notifications.
function notification(str){
	if (typeof str != "undefined") {
		this.text = str;
	} else {
		this.text = "A Notification.";
	}
	this.data = {};
	
	/* Functions */
	this.send = function(){
		new Notification("SmallIRC",{body:this.text});
	}
}