var $j = jQuery.noConflict();
var B_MASK = 255;
var G_MASK = 255<<8;
var R_MASK = 255<<16;

var INIT 		= 0;
var CALIBRATE 	= 1;
var PLAY		= 2;
var state 		= CALIBRATE;

var zeroAttitude={'r':0,'y':0,'p':0};
var currentAttitude={'r':0,'y':0,'p':0};	


  var processingSketch=function(processing) {
  
	processing.world={};
	var iteration = 1;
	var timeStep = 1.0/60.0;
	var font;
	var words=[];


	processing.setup = function() 
	{
		
		font = processing.loadFont("sans-serif", 32);
		processing.textFont(font,22);
		console.log($j(document).width(),$j(document).height());
		processing.size(600,600);

		processing.world = createWorld(processing.width,processing.height, new b2Vec2(10, 500));
	}

  // Override draw function, by default it will be called 60 times per second
  processing.draw = function() {
	    var xTmp=processing.map(zeroAttitude.y-currentAttitude.y, -1, 1, 0, processing.width);
	    var yTmp=processing.map(zeroAttitude.p-currentAttitude.p, -1, 1, 0, processing.height);
	   // Update
		processing.world.Step(timeStep, iteration);

		// Draw
		processing.background(333);
		for (var i=0;i<words.length;i++)
		{	
			words[i].draw();
		}


		processing.pushMatrix();
        processing.translate(xTmp, yTmp);
        processing.line(-30, 0, 30,0);
        processing.line(0, -30, 0,30);
        processing.noFill();
        processing.rect(-10, -10, 20, 20 );
        processing.fill();
        processing.popMatrix();
        processing.world.m_gravity.Set(processing.map(zeroAttitude.y-currentAttitude.y,-1,1,-500,500),processing.map(zeroAttitude.p-currentAttitude.p,-1,1,-500,500));

  	};

  processing.addCell=function()
	{
		words.push( new Cell(processing, processing.world, "Click", Math.random()*processing.width, Math.random()*processing.height) );
	}
}

var canvas = document.getElementById("canvas");
// attaching the sketchProc function to the canvas
var p = new Processing(canvas, processingSketch);

// --------------------------------------------------------------
// Cell
// --------------------------------------------------------------
function Cell(p,b2dworld,s,x,y)
{
	this.text 	= "";
	this.textw	= p.textWidth(s);
	this.texth	= 8;
	this.radius = 1.3*this.textw/2;
	this.body 	= createBall(b2dworld, x,y, 1.3*this.textw/2);
	
	this.shape	= this.body.GetShapeList();
	this.color  = {"r":175+(Math.random()*20-10),"g":175+(Math.random()*20-10),"b":175+(Math.random()*20-10)};		

	this.draw = function()
	{
		p.fill(this.color.r,this.color.g,this.color.b);
		drawShape(this.shape, p);
		p.fill(255);
		p.pushMatrix();
		p.translate(this.shape.m_position.x, this.shape.m_position.y);
		p.rotate(this.body.GetRotation());
		p.line(0,0,0,this.radius);
		p.popMatrix();
	}
}

//--------------------------------------------------------------
function createWorld(w,h,gravity) 
{	
	var worldAABB = new b2AABB();
	worldAABB.minVertex.Set(-1000, -1000);
	worldAABB.maxVertex.Set(1000, 1000);
	var doSleep = true;
	var world = new b2World(worldAABB, gravity, doSleep);

	createGround(world,w,h);
	createRoof(world,w,h);
	createWalls(world,w,h);

	return world;
}

function createGround(world,w,h) {
	var groundHeight = 50;
	var groundSd = new b2BoxDef();
	groundSd.extents.Set(w/2, groundHeight/2);
	groundSd.restitution = 0.1;
	var groundBd = new b2BodyDef();
	groundBd.AddShape(groundSd);
	groundBd.position.Set(w/2, h+groundHeight/2);
	return world.CreateBody(groundBd)
}

function createRoof(world,w,h) {
	var groundHeight = 50;
	var groundSd = new b2BoxDef();
	groundSd.extents.Set(w/2, groundHeight/2);
	groundSd.restitution = 0.1;
	var groundBd = new b2BodyDef();
	groundBd.AddShape(groundSd);
	groundBd.position.Set(w/2, -groundHeight/2);
	return world.CreateBody(groundBd)
}

function createWalls(world,w,h)
{
	var wallWidth 	= 50;
	var wallHeight 	= h;
	createBox(world, -wallWidth/2, wallHeight/2, wallWidth/2, wallHeight/2);
	createBox(world, w+wallWidth/2, wallHeight/2, wallWidth/2, wallHeight/2);
}


function createBall(world, x, y, r) {
	var ballSd = new b2CircleDef();
	ballSd.density = 1.0;
	ballSd.radius = r;
	ballSd.restitution = 0.7;
	ballSd.friction = 0.05;
	var ballBd = new b2BodyDef();
	ballBd.AddShape(ballSd);
	ballBd.position.Set(x,y);
	return world.CreateBody(ballBd);
}

function createBox(world, x, y, width, height, fixed) 
{
	if (typeof(fixed) == 'undefined') fixed = true;
	var boxSd = new b2BoxDef();
	if (!fixed) boxSd.density = 1.0;
	boxSd.extents.Set(width, height);
	var boxBd = new b2BodyDef();
	boxBd.AddShape(boxSd);
	boxBd.position.Set(x,y);
	return world.CreateBody(boxBd)
}

function drawWorld(world, processing) 
{
	for (var b = world.m_bodyList; b; b = b.m_next) {
		for (var s = b.GetShapeList(); s != null; s = s.GetNext()) {
			drawShape(s, processing);
		}
	}
}

function drawShape(shape, processing) 
{
	switch (shape.m_type) {
	case b2Shape.e_circleShape:
	{
		var circle = shape;
		var pos = circle.m_position;
		var r = circle.m_radius*2;
		var segments = 16.0;
		var theta = 0.0;
		var dtheta = 2.0 * Math.PI / segments;
		
		// draw circle
		processing.pushMatrix();
		processing.translate(pos.x,pos.y);
	//					processing.rotate( processing.degrees( circle.m_body.GetRotation() ) );
		processing.ellipse(0,0,r,r);
		processing.popMatrix();
		

	}
	break;

	case b2Shape.e_polyShape:
	{
	var poly = shape;
	var v0 = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[0]));
	var v1,v2;
	for (var i = 0; i < poly.m_vertexCount-1; i++) {
		v1 = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[i]));
		v2 = b2Math.AddVV(poly.m_position, b2Math.b2MulMV(poly.m_R, poly.m_vertices[i+1]));
		processing.line(v1.x,v1.y,v2.x,v2.y);
	}
	processing.line(v2.x,v2.y,v0.x,v0.y);
	}
	break;
	}
}
function getColor(cNum) {

  // then : 
  var r = cNum & R_MASK;
  var g = cNum & G_MASK;
  var b = cNum & B_MASK;

  return {"r":r,"g":g,"b":b};
}