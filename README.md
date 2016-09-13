Tramontana web library
=====================================


Introduction
------------

A prototyping kit for iOS.
<div style="text-align: center">
<img src="https://github.com/pierdr/ofxTramontana/raw/master/media/tramontanaBanner.jpg" alt="" width="600px"/>
</div>
Tramonatana is a platform intended as a tool for designers and creatives to use iPhones and iPads as sensors or actuators and create quick prototypes of interactive apps, spaces and objects.

With this web library you can control from a desktop sketch your phone and you can use it as a sensor or actuator with little effort. You can download the iOS app [here](https://itunes.apple.com/us/app/tramontana/id1121069555?ls=1&mt=8).

Getting started
------------

HTML

~~~~ 
<html>
	<head>
	<!-- import jquery-->
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js"></script>
	<!-- import tramontana-->
		<script src="https://rawgit.com/pierdr/tramontana/master/lib/bft_min.js"></script>
	<!-- create a BFtObject -->
		<script>
			var iphone=new BFtObject();
		</script>
	</head>
	<body>
		<button onclick="iphone.start('192.168.1.2')">start</button><br/>

		<!-- MAKE VIBRATE -->
		<button onclick="iphone.makeVibrate()">vibrate</button>
	</body>

</html>
~~~~ 


You can find the IP Address to give as argument in the landing view on your Tramontana App:<br/>
<img src="https://github.com/pierdr/ofxTramontana/raw/master/media/iphoneScreen.png" width="300px" />


Device as actuator
------------
Your device can act as an actuator with:<br/>
- vibration;<br/>
- screen color and brightness;<br/>
- flash light;<br/>
- displaying a picture or playing audio and video;<br/>

To trigger your device you can invoke any of the following methods:

```Javascript
	setFlashLight(intensity);
    pulseFlashLight(numberOfPulses, duration , intensity);
    
    makeVibrate();
    setColor(r,g,b,a);//where a is not alpha but screen intensity
    transitionColors(color1, color2, duration);
    showImage(url);
```

Playing media remotely
------------  
It's possible to play video, audio and display an image remotely. The supported formats are: 
<br/>_images_
JPEG, PNG
<br/>_video_  H.264 MP4 (more info [here](http://www.apple.com/uk/iphone/compare/))
<br/>_audio_ AAC, MP3
      
```Javascript  
        playVideo(url,callback);//the callback is called when the video ends
        playVideo(url);
        playAudio(url);
        setBrightness(brightness);
```

Using the camera
------------ 
Tramontana allows you to use the camera remotely and optionally upload the picture to Dropbox. To use the Dropbox feature the only thing you need to do is connecting your dropbox account from the App's landing page.<br/><br/>
The method to take a picture can have 2 optional parameters, the first one for the camera number <br/>__0 = back camera__ (default)<br/> __1 = front camera__ 


The second allows you to display the standard iOS camera view. __true = interface__ <br/> __false = background shooting__ (default)


```Javascript
	 takePicture()
	 takePicture(camera)
	 takePicture(camera,ui)
	 
```




Dependencies
------------
[jQuery](https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js)




