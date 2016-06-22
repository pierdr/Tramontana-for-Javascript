/********
Developed by Pierluigi Dalla Rosa @binaryfutures
v0.0.7
21-06-16
*******/

window.BFt={};
BFt.state = "INIT";
BFt.changedStateInCycle = 0;

BFt.changeState=function(newstate)
{
	if(newstate!=BFt.state)
	{
		BFt.state = newstate;
		BFt.changedStateInCycle=1;
		jQuery.event.trigger('stateChanged', {});	

	}
}
window.onbeforeunload = function(){
 	for(var a in BFt)
 	{
 		BFt[a].socket.close(16,"page closing");
 	}
}
window.BFtObject= function () {
        var object = new Object();

        object.socket 				= new Object();
        object.status 			   	= "INIT";

        object.setupSocket = object.start = function(socketAddress){
			
			if(socketAddress=="")
			{
				socketAddress = "192.168.1.:9092";
				return;
			}
			if(socketAddress.indexOf(":")==-1)
			{
				socketAddress=socketAddress+":9092";
			}

			if (BrowserDetect.browser == "Firefox") {
				console.error("Websocket not supported. Please use Safari or Chrome.");
			} else {

				object.socket = new ReconnectingWebSocket(get_appropriate_ws_url(socketAddress));
				
			}
			
			// open
			try {
				object.socket.onopen = function() {
					
					object.status = "OPEN";
					jQuery.event.trigger('socketOpened',[]);
					object.retrial=0;
					try{
						socketOpened();
					}
					catch(e)
					{

					}
				} 


				// received message
				object.socket.onmessage =function got_packet(msg) {
					
					
					
					try{
						messageObject = JSON.parse(msg.data);
					}
					catch(e)
					{

						console.warn("error loading JSON",msg,e);
					}
					var ipAddress=object.socket.url.replace(object.socket.url.slice(-5),'');
						ipAddress=ipAddress.slice(5);
					if(messageObject["m"]=="x")
					{
						jQuery.event.trigger('ping', {"address":ipAddress});	
						return;
					}
					console.info("::: ----> received:\""+messageObject["m"]+"\"",messageObject);
					
					if(messageObject["m"]=="touched")
					{
						

						if(messageObject["value"]==0 || messageObject["value"]=="0")
						{
							
							object.touched = false;
						}
						else
						{
								object.touched = true;
								jQuery.event.trigger('touched', {"address":ipAddress,"x":messageObject["x"],"y":messageObject["y"]});						
						}
						try{
					        touched(ipAddress,messageObject["x"],messageObject["y"]);
						}
						catch(e)
						{
							
						}
						return;
					}
					else if(messageObject["m"] == "a")
					{
						jQuery.event.trigger('a', {"address":ipAddress,"r":messageObject["r"],"y":messageObject["y"],"p":messageObject["p"]});
					}
					else if(messageObject["m"] == "rx")
					{
						jQuery.event.trigger('receivedRx', {"address":ipAddress,"v":messageObject["v"]});
					}
					else if(messageObject["m"] == "orientationChanged")
					{
						object.orientation = messageObject["value"];

						try{
					        orientationChanged(ipAddress,object.orientation);
						}
						catch(e)
						{
							
						}
						jQuery.event.trigger('orientationChanged', {"address":ipAddress,"value":messageObject["value"]});
					}
					else if(messageObject["m"] == "magnetometerUpdate")
					{
						object.magnetometer = messageObject["t"];
						object.magnetometerIntensity = messageObject["i"];

						try{
					        magnetometerEvent(ipAddress,object.magnetometer,object.magnetometerIntensity);
						}
						catch(e)
						{
							
						}
						jQuery.event.trigger('magnetometerEvent', {"address":ipAddress,"i":messageObject["i"],"t":messageObject["t"]});
					}
					else if(messageObject["m"] == "distanceChanged")
					{
						object.proximity = messageObject["proximity"];
						

						try{
					        distanceChanged(ipAddress,object.proximity);
						}
						catch(e)
						{
							
						}
						jQuery.event.trigger('distanceChanged', {"address":ipAddress,"p":messageObject["proximity"]});
					}
					else if(messageObject["m"] == "audioJackChanged")
					{
						object.audiojack = messageObject["in"];
						

						try{
					        audioJackChanged(ipAddress,object.audiojack);
						}
						catch(e)
						{
							
						}
						jQuery.event.trigger('audioJackChanged', {"address":ipAddress,"in":messageObject["in"]});
					}
					else if(messageObject["m"] == "powerSourceChanged")
					{
						object.powersource = messageObject["source"];
						

						try{
					        powerSourceChanged(ipAddress,object.powersource);
						}
						catch(e)
						{
							
						}
						jQuery.event.trigger('powerSourceChanged', {"address":ipAddress,"in":messageObject["source"]});
					}else if(messageObject["m"] == "batteryGet")
					{
						object[boardNumReceived].batteryLevel = messageObject["value"];
						try{
					        gotBatteryLevel(messageObject["value"]);
						}
						catch(e)
						{
							
						}

					}
					else if(messageObject["m"] == "error")
					{
						console.warn(messageObject["type"]);
					}
					else if(messageObject["m"] == "test")
					{
						console.log(Date.now());
					}
				}

				object.socket.onclose = function(){
					object.status = "CLOSED";
					console.warn("connection: %s",object.status,object.socket);
					
				}
				object.socket.onerror = function(){
					object.status = "ERROR";
				}
				
			} catch(exception) {
				alert('<p>Error' + exception);  
				object.status = "ERROR";
			}
		}

		
		object.setServo = function(num,val)
		{
			if(arguments.length == 2)
			{	
				this.sendMessage("{\"m\":\"srv\",\"n\":"+num+",\"v\":"+val+"}");
			}
		}
		object.setRelayEmbedded = function(num,val)
		{
			if(arguments.length == 2)
			{	

				this.sendMessage("{\"m\":\"rel\",\"n\":"+num+",\"v\":"+Math.round(val)+"}");
			}
		}
		object.doTxEmbedded = function(val)
		{
			if(arguments.length == 1)
			{	

				this.sendMessage("{\"m\":\"tx\",\"v\":"+val+"}");
			}
		}
		object.setColorEmbedded = function(num,red,green,blue,intensity)
		{
			if(arguments.length == 5)
			{	

				this.sendMessage("{\"m\":\"col\",\"n\":\""+num+"\",\"r\":\""+Math.floor(red)+"\",\"g\":\""+Math.floor(green)+"\",\"b\":\""+Math.floor(blue)+"\",\"a\":\""+Math.floor(intensity)+"\"}");
			}
		}
		object.setColor = function(red,green,blue,intensity)
		{
			if(arguments.length == 4)
			{	
				this.sendMessage("{\"m\":\"setColor\",\"r\":\""+red+"\",\"g\":\""+green+"\",\"b\":\""+blue+"\",\"a\":\""+intensity+"\"}");
			}
		}
		object.setLED = function(onvalue)
		{
			if(onvalue>0 && onvalue<=1.0)
			{
				this.sendMessage("{\"m\":\"setLED\",\"value\":\"1\",\"in\":\""+onvalue+"\"}");
			}
			else
			{
				this.sendMessage("{\"m\":\"setLED\",\"value\":\"0\"}");
			}
		}
		object.pulseLED = function(numberOfPulses,duration,intensity)
		{
			if(arguments.length == 3)
			{	
				this.sendMessage("{\"m\":\"pulseLED\",\"t\":\""+numberOfPulses+"\",\"d\":\""+duration+"\",\"i\":\""+intensity+"\"}");
			}
			else
			{
				console.warn('pulseLED requires 3 inputs: numberOfPulses,duration,intensity');
			}
		}
		object.showImage=function(url)
		{
			if(typeof url=='string')
			{
				this.sendMessage("{\"m\":\"showImage\",\"url\":\""+url+"\"}");
			}
			else
			{
				console.warn('showImage requires a string input');
			}
		}
		object.playVideo=function(url)
		{
			if(typeof url=='string')
			{
				this.sendMessage("{\"m\":\"playVideo\",\"url\":\""+url+"\"}");
			}
			else
			{
				console.warn('playVideo requires a string input');
			}
		}
		object.playAudio=function(url)
		{
			if(typeof url=='string')
			{
				this.sendMessage("{\"m\":\"playAudio\",\"url\":\""+url+"\"}");
			}
			else
			{
				console.warn('playAudio requires a string input');
			}
		}
		object.setBrightness = function(brightness)
		{
			if(isNumber(brightness))
			{	
				this.sendMessage("{\"m\":\"setBrightness\",\"b\":\""+brightness+"\"}");
			}
			else
			{
				console.warn('setBrighness requires one numerical parameter');
			}
		}
		object.transitionColors = function(color1,color2,duration)
		{
			if(arguments.length == 3)
			{	
				if(!isNumber(duration))
				{
					duration=5.0;
					console.warn("transitionColors: duration is not a number");
				}
				 this.sendMessage("{\"m\":\"transitionColors\",\"r1\":\""+color1.r+"\",\"g1\":\""+color1.b+"\",\"b1\":\""+color1.g+"\",\"a1\":\""+color1.a+"\",\"r2\":\""+color2.r+"\",\"g2\":\""+color2.g+"\",\"b2\":\""+color2.b+"\",\"a2\":\""+color2.a+"\",\"duration\":\""+duration+"\"}");
			}
			else
			{
				console.warn('transitionColors requires 3 parameters: color1,color2,duration');
			}
		}
		object.getBatteryLevel = function()
		{
			
			var message="{\"m\":\"getBattery\"}";
			this.sendMessage(message);
		}
	    object.subscribeDistance = function()
	    {
	      this.sendMessage("{\"m\":\"registerDistance\"}");
	    }
	    object.releaseDistance = function()
	    {
	      this.sendMessage("{\"m\":\"releaseDistance\"}");
	    }
		object.subscribeTouch = function()
		{
			this.touchRegistered = true;
			this.sendMessage("{\"m\":\"registerTouch\"}");
		}
		object.releaseTouch = function()
		{
			this.touchRegistered = false;
			this.sendMessage("{\"m\":\"releaseTouch\"}");
		}
		object.subscribeAttitude = function(frequency)
		{
			this.attitudeRegistered = true;
			this.sendMessage("{\"m\":\"registerAttitude\",\"f\":\""+frequency+"\"}");
		}
		object.releaseAttitude = function(frequency)
		{
			this.attitudeRegistered = false;
			this.sendMessage("{\"m\":\"releaseAttitude\"}");
		}
		object.subscribeAudioJack=function ()
	    {
	      this.sendMessage("{\"m\":\"registerAudioJack\"}");
	    }
	    function releaseAudioJack()
	    {
	      this.sendMessage("{\"m\":\"releaseAudioJack\"}");
	    }
	    object.subscribePowerSource=function ()
	    {
	      this.sendMessage("{\"m\":\"registerPowerSource\"}");
	    }
	    function releasePowerSource()
	    {
	      this.sendMessage("{\"m\":\"releasePowerSource\"}");
	    }
	    object.subscribeMagnetometer=function ()
	    {
	      this.sendMessage("{\"m\":\"registerMagnetometer\"}");
	    }
	    object.releaseMagnetometer= function()
	    {
	      this.sendMessage("{\"m\":\"releaseMagnetometer\"}");
	    }
		object.subscribeOrientation = function()
		{
			var message="{\"m\":\"registerOrientation\"}";
			object.orientationRegistered = true;
			this.sendMessage(message);
		}
		object.releaseOrientation= function(){
			
			var message="{\"m\":\"releaseOrientation\"}";
			object.orientationRegistered = false;
			this.sendMessage(message);
		}
		object.subscribeRxEmbedded = function(){
			var message="{\"m\":\"srx\"}";
			this.sendMessage(message);
		}
		object.releaseRxEmbedded = function()
	    {
	      this.sendMessage("{\"m\":\"drx\"}");
	    }
		object.makeVibrate= function(duration){
			var message;
			if(duration != "" && duration != undefined && duration != '')
			{
				message="{\"m\":\"makeVibrate\",\"duration\":\""+duration+"\"}";
			}
			else
			{
				message="{\"m\":\"makeVibrate\"}";
			}
			this.sendMessage(message);
		}
		object.sendMessage = function(message){
			try{
				
					object.socket.send(message);
					object.retrial=0;
				
			}
			catch(e)
			{
				if(object.retrial<3)
				{
					object.socket.refresh();
					object.retrial++;
					setTimeout(function(){
						object.sendMessage(message);}
						, 100);
				}
				else{
					console.warn("communication error: "+e);
				}
			}
		}
        return object;
    };

