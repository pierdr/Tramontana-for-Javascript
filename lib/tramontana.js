/********
Developed by Pierluigi Dalla Rosa
v0.1.3
07-09-19
*******/
window.tramontanaMaster={};
window.tramontanaMaster.state = "INIT";
window.tramontanaMaster.changedStateInCycle = 0;

tramontanaMaster.changeState=function(newstate)
{
	if(newstate!=tramontana.state)
	{
		tramontanaMaster.state = newstate;
		tramontanaMaster.changedStateInCycle=1;
		jQuery.event.trigger('stateChanged', {});	

	}
}
window.onbeforeunload = function(){

 	for(var a in tramontanaMaster)
 	{
 		//tramontanaMaster[a].socket.close(16,"page closing");
 	}
}
window.tramontana= function () {
        var object = new Object();
        object.socket 					= new Object();
        object.status 			   		= "INIT";
        object.subscribed 				= {distance:0,orientation:0,attitude:0,magnetometer:0,touch:0,audiojack:0,powersource:0,rxembedded:0,btnsembedded:0,ldrembedded:0};
        object.callbacks 				= {videoended:0,socketopen:0,distance:0,orientation:0,attitude:0,magnetometer:0,touch:0,audiojack:0,powersource:0,rxembedded:0,btnsembedded:0,ldrembedded:0};
        object.subscribeFunctions   	= {distance:0,orientation:0,attitude:0,magnetometer:0,touch:0,audiojack:0,powersource:0,rxembedded:0,btnsembedded:0,ldrembedded:0};
        object.setupSocket = object.start = function(socketAddress,b){
			
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
				if(true)
				{
					object.socket = new ReconnectingWebSocket(get_appropriate_ws_url(socketAddress));
					//object.socket = new WebSocket(get_appropriate_ws_url(socketAddress));
				}
				else //NODEJS
				{
					//var WebSocket = require('ws');
					//object.socket = new WebSocket(get_appropriate_ws_url(socketAddress));
				}
			}
			
			//registerCALLBACK
			if(b!=undefined)
			{
				object.callbacks.socketopen=b;
			}
			// open
			try {
				object.socket.onopen = function() {
					
					
					object.status = "OPEN";
					jQuery.event.trigger('socketOpened',[]);
					object.retrial=0;

					for (var id in object.subscribed) {
						if(object.subscribed[id])
						{
							object.subscribeFunctions[id]();
						}
					}
					if(object.callbacks.socketopen!=0)
					{
						object.callbacks.socketopen();
					}
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
					if(messageObject["m"]=="x" || messageObject["m"]=="xm" || messageObject["m"]=="xt")
					{
						jQuery.event.trigger('ping', {"address":ipAddress,"type":messageObject["m"]});	
						return;
					}
					console.info("::: ----> received:\""+messageObject["m"]+"\"",messageObject);
					
					if(messageObject["m"]=="touched")
					{
						

						if(messageObject["value"]==0 || messageObject["value"]=="0")
						{
							
							object.touched = false;
						}
						if(object.callbacks.touched!=0)
				        {
				        	object.callbacks.touched(ipAddress,{"x":messageObject["x"],"y":messageObject["y"]});
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
						if(object.callbacks.attitude!=0)
				        {
				        	object.callbacks.attitude(ipAddress,{"r":messageObject["r"],"y":messageObject["y"],"p":messageObject["p"]});
				        }
					}
					else if(messageObject["m"] == "oom")
					{
						jQuery.event.trigger('oom', {"address":ipAddress});
					}
					else if(messageObject["m"] == "rx")
					{
						jQuery.event.trigger('receivedRx', {"address":ipAddress,"v":messageObject["v"]});
						if(object.callbacks.rxembedded!=0)
				        {
				        	object.callbacks.rxembedded(ipAddress,messageObject["v"]);
				        }
					}
					else if(messageObject["m"] == "orientationChanged")
					{
						object.orientation = messageObject["value"];
						if(object.callbacks.orientation!=0)
				        {
				        	object.callbacks.orientation(ipAddress,object.orientation);
				        }
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
						if(object.callbacks.magnetometer!=0)
				        {
				        	object.callbacks.magnetometer(ipAddress,object.magnetometer,object.magnetometerIntensity);
				        }
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
						if(object.callbacks.distance!=0)
				        {
				        	object.callbacks.distance(ipAddress,object.proximity);
				        }

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
						
						if(object.callbacks.audiojack!=0)
				        {
				        	object.callbacks.audiojack(ipAddress,object.audiojack);
				        }
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
						
						if(object.callbacks.powersource!=0)
				        {
				        	object.callbacks.powersource(ipAddress,object.powersource);
				        }

						try{
							
					        powerSourceChanged(ipAddress,object.powersource);

						}
						catch(e)
						{
							
						}
						jQuery.event.trigger('powerSourceChanged', {"address":ipAddress,"in":messageObject["source"]});
					}else if(messageObject["m"] == "batteryGet")
					{
						object.batteryLevel = messageObject["value"];

						try{
					        gotBatteryLevel(messageObject["value"]);
						}
						catch(e)
						{
							
						}
						jQuery.event.trigger('gotBatteryLevel', {"address":ipAddress,"batteryLevel":messageObject["value"]});

					}else if(messageObject["m"] == "videoEnded")
					{
						if(object.callbacks.videoended!=0)
				        {
				        	object.callbacks.videoended(ipAddress);
				        }
						try{
					        videoEnded();
						}
						catch(e)
						{
							
						}
						jQuery.event.trigger('videoEnded', {"address":ipAddress});
					}else if(messageObject["m"] == "btn")
					{
						if(object.callbacks.btnsembedded!=0)
				        {
				        	object.callbacks.btnsembedded(ipAddress,messageObject[n],messageObject[v]);
				        }
						try{
					        
						}
						catch(e)
						{
							
						}
						jQuery.event.trigger('btnEvent', {"address":ipAddress});
					}
					else if(messageObject["m"] == "ldr")
					{
						if(object.callbacks.ldrembedded!=0)
				        {
				        	object.callbacks.ldrembedded(ipAddress,messageObject["v"]);
				        }
						try{
					       ldrEmbeddedReceived(ipAddress,messageObject["v"]);
						}
						catch(e)
						{
							
						}
						jQuery.event.trigger('ldrUpdate', {"address":ipAddress,"v":messageObject["v"]});
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

		
		object.setServoEmbedded = function(servoIndex,value)
		{
			if(arguments.length == 2)
			{	
				this.sendMessage("{\"m\":\"srv\",\"n\":"+servoIndex+",\"v\":"+value+"}");
			}
		}
		object.setRelayEmbeddedOff = function(relayIndex){
			this.sendMessage("{\"m\":\"rel\",\"n\":"+relayIndex+",\"v\":0}");
		}
		object.setRelayEmbeddedOn = function(relayIndex){
			this.sendMessage("{\"m\":\"rel\",\"n\":"+relayIndex+",\"v\":1}");
		}
		object.setRelayEmbedded = function(num,val)
		{
			if(arguments.length == 2)
			{	

				this.sendMessage("{\"m\":\"rel\",\"n\":"+num+",\"v\":"+Math.round(val)+"}");
			}
		}
		object.sendSerialMessageEmbedded = function(val)
		{
			if(arguments.length == 1)
			{	

				this.sendMessage("{\"m\":\"tx\",\"v\":\""+val+"\"}");
			}
		}
		object.setColorEmbedded = function(num,red,green,blue)
		{
			
				this.sendMessage("{\"m\":\"col\",\"n\":\""+num+"\",\"r\":\""+Math.floor(red)+"\",\"g\":\""+Math.floor(green)+"\",\"b\":\""+Math.floor(blue)+"\"}");
			
		}
		object.blinkColorEmbedded = function(num,red,green,blue)
		{
			if( arguments.length == 4)
			{	

				this.sendMessage("{\"m\":\"blk\",\"n\":\""+num+"\",\"r\":\""+Math.floor(red)+"\",\"g\":\""+Math.floor(green)+"\",\"b\":\""+Math.floor(blue)+"\"}");
			}
		}
		object.setAllColorEmbedded = function(red,green,blue)
		{
			if(arguments.length == 3)
			{	

				this.sendMessage("{\"m\":\"all\",\"r\":\""+Math.floor(red)+"\",\"g\":\""+Math.floor(green)+"\",\"b\":\""+Math.floor(blue)+"\"}");
			}
		}
		object.setColor = function(red,green,blue,intensity)
		{

			if(arguments.length == 3 || arguments.length == 4)
			{	
				if(red>1.0 || green>1.0 || blue>1.0)
				{
					red=red/255;
					green=green/255;
					blue=blue/255;
					intensity=intensity/255;
				}
				this.sendMessage("{\"m\":\"setColor\",\"r\":\""+red+"\",\"g\":\""+green+"\",\"b\":\""+blue+"\",\"a\":\""+intensity+"\"}");
			}
			
			if(arguments.length == 1)
			{
				if(arguments[0].hasOwnProperty(r))
				{
					var color = red;
					if(color.r>1.0 || color.g>1.0 || color.b>1.0)
					{
						color.r=color.r/255;
						color.g=color.g/255;
						color.b=color.b/255;
						color.a=color.a/255;
					}
					this.sendMessage("{\"m\":\"setColor\",\"r\":\""+color.r+"\",\"g\":\""+color.g+"\",\"b\":\""+color.b+"\",\"a\":\""+color.a+"\"}");
				}
			}
		}
		object.setFlashLight = function(onvalue)
		{
			
				onvalue=clamp(onvalue, 0, onvalue);
				this.sendMessage("{\"m\":\"setLED\",\"value\":\"1\",\"in\":\""+onvalue+"\"}");
			
			
		}
		object.pulseFlashLight = function(numberOfPulses,duration,intensity)
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
		object.playVideo=function(url,callback)
		{
			if(callback!=undefined)
	        {
	        	object.callbacks.videoended=callback;
	    	}
	    	else
	    	{
	    		object.callbacks.videoended=0;
	    	}
			if(typeof url=='string')
			{
				this.sendMessage("{\"m\":\"playVideo\",\"url\":\""+url+"\"}");
			}
			else
			{
				console.warn('playVideo requires a string input');
			}
		}
		object.loopVideo=function(url,callback)
		{
			if(callback!=undefined)
	        {
	        	object.callbacks.videoended=callback;
	    	}
	    	else
	    	{
	    		object.callbacks.videoended=0;
	    	}
			if(typeof url=='string')
			{
				this.sendMessage("{\"m\":\"loopVideo\",\"url\":\""+url+"\"}");
			}
			else
			{
				console.warn('loopVideo requires a string input');
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
		object.takePicture = function(camera,ui)
		{
			if(arguments.length>0 && isNumber(camera))
			{	
				var message="{\"m\":\"takePicture\",\"c\":\""+camera+"\"";

				if(arguments.length>1)
				{
					if(ui=="ui")
					{
						message+=",\"i\":\"ui\"";
					}
				}
				message+="}";
				this.sendMessage(message);
			}
			else
			{
				this.sendMessage("{\"m\":\"takePicture\"}");
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
			object.sendMessage(message);
		}
	    object.subscribeFunctions.distance = object.subscribeDistance = function(callback)
	    {
	    	object.subscribed.distance=1;
	        object.sendMessage("{\"m\":\"registerDistance\"}");
	        if(callback!=undefined)
	        {
	        	object.callbacks.distance=callback;
	    	}
	    	else
	    	{
	    		object.callbacks.distance=0;
	    	}
	    }
	    object.releaseDistance = function()
	    {
	    	object.subscribed.distance=0;
	      object.sendMessage("{\"m\":\"releaseDistance\"}");
	    }
		object.subscribeFunctions.touch = object.subscribeTouch = function(callback)
		{
			object.subscribed.touch=1;
			
			object.sendMessage("{\"m\":\"registerTouch\"}");
			if(callback!=undefined)
	        {
	        	object.callbacks.touch=callback;
	    	}
	    	else
	    	{
	    		object.callbacks.touch=0;
	    	}
		}
		object.releaseTouch = function()
		{
			object.subscribed.touch=0;
			object.sendMessage("{\"m\":\"releaseTouch\"}");
		}
		object.subscribeFunctions.attitude = object.subscribeAttitude = function(frequency,callback)
		{
			object.subscribed.attitude = 1;
			object.sendMessage("{\"m\":\"registerAttitude\",\"f\":\""+frequency+"\"}");
			if(callback!=undefined)
	        {
	        	object.callbacks.attitude=callback;
	    	}
	    	else
	    	{
	    		object.callbacks.attitude=0;
	    	}
		}
		object.releaseAttitude = function(frequency)
		{
			object.subscribed.attitude = 0;
			object.sendMessage("{\"m\":\"releaseAttitude\"}");
		}
		 object.subscribeFunctions.audiojack = object.subscribeAudioJack=function (callback)
	    {
	    	object.subscribed.audiojack = 1;
	      	object.sendMessage("{\"m\":\"registerAudioJack\"}");
	      	if(callback!=undefined)
	        {
	        	object.callbacks.audiojack=callback;
	    	}
	    	else
	    	{
	    		object.callbacks.audiojack=0;
	    	}
	    }
	    object.releaseAudioJack= function()
	    {
	    	object.subscribed.audiojack=0;
	        object.sendMessage("{\"m\":\"releaseAudioJack\"}");
	    }
	    object.subscribeFunctions.powersource =  object.subscribePowerSource=function (callback)
	    {
	    	object.subscribed.powersource=1;
	      object.sendMessage("{\"m\":\"registerPowerSource\"}");
	      if(callback!=undefined)
	        {
	        	object.callbacks.powersource=callback;
	    	}
	    	else
	    	{
	    		object.callbacks.powersource=0;
	    	}
	    }
	    object.releasePowerSource=function()
	    {
	    	object.subscribed.powersource=0;
	      object.sendMessage("{\"m\":\"releasePowerSource\"}");
	    }
	    object.subscribeFunctions.magnetometer=object.subscribeMagnetometer=function (callback)
	    {
	    	object.subscribed.magnetometer=1;
	      	object.sendMessage("{\"m\":\"registerMagnetometer\"}");
	     	if(callback!=undefined)
	        {
	        	object.callbacks.magnetometer=callback;
	    	}
	    	else
	    	{
	    		object.callbacks.magnetometer=0;
	    	}
	    }
	    object.releaseMagnetometer= function()
	    {
	    	object.subscribed.magnetometer=0;
	      object.sendMessage("{\"m\":\"releaseMagnetometer\"}");
	    }
		object.subscribeFunctions.orientation=object.subscribeOrientation = function(callback)
		{
			object.subscribed.orientation=1;
			var message="{\"m\":\"registerOrientation\"}";
			object.sendMessage(message);
			if(callback!=undefined)
	        {
	        	object.callbacks.orientation=callback;
	    	}
	    	else
	    	{
	    		object.callbacks.orientation=0;
	    	}
		}
		object.releaseOrientation= function(){
			
			var message="{\"m\":\"releaseOrientation\"}";
			object.subscribed.orientation=0;
			object.sendMessage(message);
		}
		object.subscribeFunctions.rxembedded=object.subscribeRxEmbedded = function(callback){
			var message="{\"m\":\"srx\"}";
			object.subscribed.rxembedded =1;
			object.sendMessage(message);
			if(callback!=undefined)
	        {
	        	object.callbacks.rxembedded=callback;
	    	}
	    	else
	    	{
	    		object.callbacks.rxembedded=0;
	    	}
		}
		object.releaseRxEmbedded = function()
	    {
	    	object.subscribed.rxembedded =0;
	      	object.sendMessage("{\"m\":\"drx\"}");
	    }
	    object.subscribeFunctions.ldrembedded=object.subscribeLDREmbedded = function(frequency,callback){
			var message="{\"m\":\"sldr\",\"f\":\""+frequency+"\"}";
			object.subscribed.ldrembedded =1;
			object.sendMessage(message);
			if(callback!=undefined)
	        {
	        	object.callbacks.ldrembedded=callback;
	    	}
	    	else
	    	{
	    		object.callbacks.ldrembedded=0;
	    	}
		}
		object.releaseLDREmbedded = function()
	    {
	    	object.subscribed.ldrembedded =0;
	      	object.sendMessage("{\"m\":\"dldr\"}");
	    }
	    object.subscribeFunctions.btnsembedded=object.subscribeButtonsEventEmbedded = function(callback){
			var message="{\"m\":\"sbtn\"}";
			object.subscribed.btnsembedded =1;
			object.sendMessage(message);
			if(callback!=undefined)
	        {
	        	object.callbacks.btnsembedded=callback;
	    	}
	    	else
	    	{
	    		object.callbacks.btnsembedded=0;
	    	}
		}
		object.releaseButtonsEventEmbedded = function()
	    {
	    	object.subscribed.btnsembedded =0;
	      	object.sendMessage("{\"m\":\"dbtn\"}");
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
			object.sendMessage(message);
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