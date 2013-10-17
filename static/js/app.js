(function (d, w){
	var utils = {
		typeOf: function(object){
			var strings = {
				"[object Array]": "array",
				"[object Object]": "object",
				"[object String]": "string"
			};

			return strings[Object.prototype.toString.call(object)];
		}
	};

	function Game(){
		var self = this;
		var running = false;

		this.canvas = new GameCanv();
		this.controls = new GameControls();
		this.player = new Player(this.canvas, this.controls);

		this.start = function(){
			running = true;
			var start = 0;
			var delay = 10; // 30 miliseconds between
			window.requestAnimationFrame(function gameLoop(time){
				if((time - start) > delay){
					start = time;
					self.canvas.update();
				}
				
				if(running){
					window.requestAnimationFrame(gameLoop);
				}
			});
		};

		this.stop = function(){
			running = false;
		};
	}

	function GameCanv(){
		console.log("init canvas");

		var layers = [];
		var canvas = d.getElementById("canvas");
		var ctx = canvas.getContext("2d");

		this.height = canvas.height;
		this.width = canvas.width;

		this.getCtx = function(){
			return ctx;
		};
		this.addLayer = function(index, canvObj){
			layers[index] = canvObj;
		};

		this.removeLayer = function(index){
			delete layers[index];
		};

		this.clear = function (){
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		};

		this.update = function(){
			this.clear();
			for(var i = 0, ii = layers.length, layer = layers[i]; i<ii; layer = layers[i++]){
				if(layer === undefined){
					continue;
				}

				layer.update(canvas, ctx);
			}

			ctx.moveTo(0, 300);
			ctx.lineTo(canvas.width, 300);
			ctx.stroke();
		};
	}

	function CanvObj(gameCanv){
		console.log("init canvas object");

		var x, y, width, height, index=0;
		this.canvas = gameCanv;
		this.ctx = gameCanv.getCtx();

		gameCanv.addLayer(index, this);

		this.update = function(){
			console.log("update canv object");
		};
		this.clear = function(){
			this.ctx.clearRect(this.x, this.y, this.width, this.height);
		};
		this.remove = function(){
			this.canvas.removeLayer(index);
		};
	}

	function Player(gameCanv, controls){
		var self = this;

		CanvObj.call(this, gameCanv);
		this.controls = controls;
		this.x = 0;
		this.y = 0;
		this.width = 10;
		this.height = 10;
		this.runDir = 0;
		this.grounded = true;
		this.speed = 5;
		this.jumpImpulse = 1;
		this.gravity = 0.1;
		this.groundLevel = this.canvas.height - this.height - 140;
		this.y = this.groundLevel - this.height;

		this.controls.addListener(["left", "right"], function(key, action){
			if(action === "keydown"){
				self.run(key);
			} else{
				self.stop();
			}
		});

		this.controls.addListener(["space", "up"], function(key, action){
			if(action === "keydown"){
				self.jump();
			}
		});

		this.run = function(dir){
			this.runDir = (dir === "left")? -1: +1;
		};

		this.stop = function(){
			this.runDir = 0;
		};

		this.jump = function(){
			this.grounded = false;
		};

		this.update = function(){
			this.x += this.runDir*this.speed;
			if(!this.grounded){
				this.jumpImpulse -= this.gravity;
				this.y -= this.jumpImpulse*this.speed;
				if(this.y >= this.groundLevel - this.height){
					this.grounded = true;
					this.jumpImpulse = 2;
				}
				
			}

			this.draw();
		};

		this.draw = function(){
			this.ctx.fillStyle = "black";
			this.ctx.fillRect(this.x, this.y, this.width, this.height);
		};
	}

	function Mob(){
		console.log("init mob");
	}

	function Timer(){
		console.log("init timer");

		var currentTime = 0; // in seconds, e.g. 2.5 - 2 and half seconds
		var running = false;

		this.getTime = function(){
			return currentTime;
		};

		this.start = function(){
			console.log("start timer");
			running = true;
			var timer = setInterval(function (){
				if(running){
					currentTime += 0.1;  // increase by 1/10 of a second
				} else{
					clearInterval(timer);
				}
			}, 100);
		};

		this.stop = function(){
			console.log("stop timer");
			running = false;
		};

		this.reset = function(){
			currentTime = 0;
		};
	}

	function GameControls(){
		var keys = {
			27: "esc",
			32: "space",
			37: "left",
			38: "up",
			39: "right",
			40: "down"
		};

		var self = this;

		this.listeners = {};
		for(var key in keys){
			this.listeners[keys[key]] = [];
		}

		this.addListener = function(keys, callback){
			console.log(keys);
			var keysToAdd = utils.typeOf(keys) === "array"? keys: [keys];
			for(var i=0, ii=keys.length; i<ii; i++){
				if(this.listeners[keys[i]] !== undefined){
					this.listeners[keys[i]].push(callback);
				}
			}
		};
		this.trigger = function(key, action){
			if(this.listeners[key] === undefined){
				return;
			}
			var listeners = this.listeners[key];
			for(var i=0, ii = listeners.length; i<ii; i++){
				listeners[i](key, action);
			}
		};

		d.addEventListener("keydown", function(e){
			self.trigger(keys[e.keyCode], "keydown");
		});

		d.addEventListener("keyup", function(e){
			self.trigger(keys[e.keyCode], "keyup");
		});
		console.log("init controls");
	}

	w.onload = function(){
		var game = new Game();
		game.start();
	};

})(document, window);