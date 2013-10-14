(function (d, w){
	function Game(){
		console.log("init game");

		this.canvas = new GameCanv();

		this.start = function(){
			console.log("start game");
		};

		this.stop = function(){
			console.log("stop game");
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

		this.update = function(){
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

		var x, y, index;
		this.canvas = gameCanv;
		this.ctx = gameCanv.getCtx();

		gameCanv.addLayer(0, this);

		this.update = function(){
			console.log("update canv object");
		};

		this.remove = function(){
			this.canvas.removeLayer(index);
		};
	}

	function Player(){
		console.log("init player");
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