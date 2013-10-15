(function (d, w){
	function Game(){
		var self = this;
		var running = false;

		this.canvas = new GameCanv();
		this.player = new Player(this.canvas);

		this.start = function(){
			running = true;
			var start = 0;
			var delay = 30; // 30 miliseconds between
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
		};
	}

	function CanvObj(gameCanv){
		console.log("init canvas object");

		var x, y, index=0;
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

	function Player(gameCanv){
		console.log("init player");
		var self = this;

		CanvObj.call(this, gameCanv);
		this.x = 0;
		this.y = 0;
		this.width = 10;
		this.height = 10;

		d.addEventListener("keydown", function(e){
			switch(e.keyCode){
				case 37:
					self.x -=5;
					break;
				case 38:
					self.y -=5;
					break;
				case 39:
					self.x +=5;
					break;
				case 40:
					self.y +=5;
					break;
			}
		});
		this.update = function(){
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
		console.log("init controls");
	}

	w.onload = function(){
		var game = new Game();
		game.start();
	};

})(document, window);