// Cordova Notifications.
function notification(str){
	if (typeof str != "undefined") {
		this.text = str;
	} else {
		this.text = "A Notification.";
	}
	this.data = {};
	
	/* Functions */
	this.send = function(){
		cordova.plugins.notification.local.schedule({
			id: 1,
			text: this.text,
			data:this.data
		});
	}
}