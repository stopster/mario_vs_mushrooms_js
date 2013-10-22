(function (d, w){
	var utils = {
		typeOf: function(object){
			var str = Object.prototype.toString.call(object);
			return str.match(/\[object\s(\w+)/)[1].toLowerCase();
		}
	};

	function Game(){
		var self = this;
		var running = false;

		this.canvas = new GameCanv();
		this.controls = new GameControls();
		this.player = new Player(this.canvas, this.controls);
		var level = new GameLevel(1, this.canvas);

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

	function GameLevel(lvl, gameCanv){
		var objects = [{
			x: -20,
			y: 0,
			width: 20,
			height: gameCanv.height,
			color: "grey"
		}, {
			x: gameCanv.width,
			y: 0,
			width: 20,
			height: gameCanv.height,
			color: "grey"
		}, {
			x: 0,
			y: gameCanv.height - 100,
			width: gameCanv.width,
			height: 100,
			color: "black"
		}];

		this.objects = [];

		var startIndex = 1;
		
		for(var i=0, ii=objects.length; i<ii; i++){
			var obj= objects[i];
			this.objects[i] = new Wall(gameCanv, obj.x, obj.y, obj.width, obj.height, startIndex + i);
		}

		var mobMgr = new MobMgr(lvl, gameCanv, gameCanv.height - 100);
		mobMgr.start();
	}

	function MobMgr(lvl, canvas, groundLevel){
		var self = this;
		var qty = lvl * 3;
		var timer;
		var mobStartIndex = 20;

		var canvasWidth = canvas.height;

		function generateMobs(qty){
			for(var i=0; i<qty; i++){
				var mob = new Mob(canvas, canvasWidth*Math.random(), groundLevel - 20, mobStartIndex++);
			}
		}

		this.start = function(){
			generateMobs(qty);
			timer = setInterval(function(){
				generateMobs(qty);
			}, 5000);
		};

		this.stop = function(){
			clearInterval(timer);
		};
	}

	function CollisionMgr(){
		var objects = [];
		var abs = Math.abs;
		var delta = 15;
		var oppositeDirs = {
			"left": "right",
			"top": "bottom",
			"bottom": "top",
			"right": "left"
		};

		this.addObject = function(index, canvObj){
			objects[index] = canvObj;
		};

		this.removeObject = function(index){
			delete objects[index];
		};

		this.checkCollision = function(obj1, obj2){
			var b1 = obj1.getBoundaries();
			var b2 = obj2.getBoundaries();
			var dir = null,
				dx = 0,
				dy = 0;

			if(b1.left>b2.right||b1.right<b2.left||b1.top>b2.bottom||b1.bottom<b2.top){
				return;
			}

			if(b1.left - b2.left>0){
				dx = b1.left - b2.right;
				if(abs(dx) <= delta){
					dir = "left";
				}
			} else{
				dx = b1.right - b2.left;
				if(abs(dx) <= delta){
					dir = "right";
				}
			}

			if(b1.top - b2.top > 0){
				dy = b1.top - b2.bottom;
				if(abs(dy) <= delta){
					dir = "top";
				}
			} else{
				dy = b2.top - b1.bottom;
				if(abs(dy) <= delta){
					dir = "bottom";
				}
			}
			// By doing ~~ we getting Math.floor();
			obj1.collideWith(obj2, dir, dx, dy);
			// By doing ~x + 1 we get -1*Math.floor() + 1;
			obj2.collideWith(obj1, oppositeDirs[dir], -dx, -dy);
		};
		this.checkAllCollisions = function(){
			var toCheckLength = objects.length;
			if(toCheckLength < 2){
				return;
			}

			for(var i=0, ii = objects.length; i<ii; i++){
				var obj1 = objects[i];
				if(obj1 === undefined){
					continue;
				}
				for(var j=i+1; j<toCheckLength; j++){
					var obj2 = objects[j];
					if(obj2 === undefined){
						continue;
					}
					this.checkCollision(obj1, obj2);
				}
			}
		};
	}

	function GameCanv(){
		var layers = [];
		var canvas = d.getElementById("canvas");
		var ctx = canvas.getContext("2d");

		var collisionMgr = new CollisionMgr();

		this.height = canvas.height;
		this.width = canvas.width;

		this.getCtx = function(){
			return ctx;
		};
		this.addLayer = function(index, canvObj, isCollidable){
			layers[index] = canvObj;
			if(isCollidable){
				collisionMgr.addObject(index, canvObj);
			}
		};

		this.removeLayer = function(index){
			delete layers[index];
			collisionMgr.removeObject(index);
		};

		this.clear = function (){
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		};

		this.update = function(){
			this.clear();

			collisionMgr.checkAllCollisions();

			for(var i = 0, ii = layers.length; i<ii; i++){
				var layer = layers[i];
				if(layer === undefined){
					continue;
				}
				layer.update(canvas, ctx);
			}
		};

	}

	function CanvObj(gameCanv){
		this.update = function(){
			// DO nothing
		};
		this.clear = function(){
			this.ctx.clearRect(this.x, this.y, this.width, this.height);
		};
		this.remove = function(){
			this.canvas.removeLayer(index);
		};
		this.collideWith = function(object, dir){
			// do nothing
		};
		this.getBoundaries = function(){
			return {
				left: this.x,
				top: this.y,
				right: this.x + this.width,
				bottom: this.y + this.height
			};
		};
	}

	Player.prototype = new CanvObj();

	function Player(gameCanv, controls){
		var self = this;
		var abs = Math.abs;
		this.canvas = gameCanv;
		this.ctx = gameCanv.getCtx();
		this.controls = controls;

		this.x = 20;
		this.y = 100;
		this.index = 10;

		gameCanv.addLayer(this.index, this, true);

		this.width = 10;
		this.height = 10;

		this.runDir = 0;
		this.grounded = false;
		this.speed = 5;
		this.jumpImpulse = 1.8;
		this.currentJump = 0;
		this.gravity = 0.1;
		this.groundLevel = 400;
		this.barriers = { left: null, top: null, right: null, bottom: null };

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
			if(this.grounded){
				this.currentJump = -this.jumpImpulse;
			}
			this.grounded = false;
		};

		this.attack = function(damage){
			if(damage>=10){
				this.die();
			}
		};

		this.die = function(){
			gameCanv.removeLayer(self.index);
			alert("you lost!");
		};

		this.update = function(){
			var dx = this.runDir*this.speed;
			this.x += (dx > 0)?
				(this.barriers.right === null? dx: 0):
				(this.barriers.left === null? dx: 0);
			this.grounded = this.barriers.bottom !== null? this.grounded: false;	
			if(!this.grounded){
				var dy = this.currentJump*this.speed;
				if(dy < 0){
					if(this.barriers.top !== null){
						this.currentJump = -this.currentJump;
					}
					this.currentJump += this.gravity;
				} else if(dy >= 0){
					if(this.barriers.bottom !== null){
						this.grounded = true;
						this.currentJump = 0;
					} else{
						this.currentJump += this.gravity;
					}
				}
				dy = this.currentJump*this.speed;
				this.y += dy;
			}

			this.draw();
			this.barriers = { left: null, top: null, right: null, bottom: null };
		};

		this.collideWith = function(obj, dir, dx, dy){
			this.barriers[dir] = obj;
			this.x -= (dir === "left" || dir === "right")? dx: 0;
			this.y -= (dir === "top" || dir === "bottom")? dy: 0;
		};

		this.draw = function(){
			this.ctx.fillStyle = "black";
			this.ctx.fillRect(this.x, this.y, this.width, this.height);
		};
	}

	Mob.prototype = new CanvObj();

	function Mob(gameCanv, x, y, index){
		this.x = x;
		this.y = y;
		this.index = index;
		this.width = 15;
		this.height = 20;
		this.speed =1;
		this.color = "green";
		this.damage = 10;

		this.barriers = {top: null, bottom: null, left: null, right: null};

		this.runDir = Math.random()>0.5? +1: -1;

		gameCanv.addLayer(this.index, this, true);

		this.collideWith = function(obj, dir, dx, dy){
			if(obj instanceof Player){
				if(dir === "top"){
					this.die();
				} else{
					console.log("hit player");
					obj.attack(this.damage);
				}
			}
			this.barriers[dir] = obj;
		};

		this.update = function(canvas, ctx){
			var dx = this.runDir*this.speed;
			if(dx > 0 && this.barriers.right !== null){
				this.runDir = -1;
			} else if(dx < 0 && this.barriers.left !== null){
				this.runDir = +1;
			}
			this.x += this.runDir*this.speed;
			this.draw(ctx);
			this.barriers = {top: null, bottom: null, left: null, right: null};
		};

		this.draw = function(ctx){
			ctx.fillStyle = this.color;
			ctx.fillRect(this.x, this.y, this.width, this.height);
		};

		this.die = function(){
			gameCanv.removeLayer(this.index);
		};
	}

	Wall.prototype = new CanvObj();

	function Wall(gameCanv, x, y, width, height, index){
		this.color = "red";

		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.canvas = gameCanv;
		this.ctx = gameCanv.getCtx();

		this.canvas.addLayer(index, this, true);

		this.update = function(canvas, ctx){
			this.draw(canvas, ctx);
		};

		this.draw = function(canvas, ctx){
			ctx.fillStyle = this.color;
			ctx.fillRect(x, y, width, height);
		};
	}

	function Timer(){
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
	}

	w.onload = function(){
		var game = new Game();
		game.start();
	};

})(document, window);