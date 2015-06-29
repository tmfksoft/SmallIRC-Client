console.log("Running on "+self.platform);
$('body').ready(function(){
	$.get("index.html",function(data){
		$('body').append(data);
	});
});