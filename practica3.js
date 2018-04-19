var game = function(){
	var Q = window.Q = Quintus()
			.include("Sprites, Scenes, Input, 2D, Touch, UI, TMX, Anim")
			.setup({
	        	width: 320,
	        	height: 480
	        }).controls().touch();

	Q.load("mario_small.png, mario_small.json", function() {
		Q.compileSheets("mario_small.png", "mario_small.json");
	});

	Q.animations('mario',{
		stand_right: { frames: [0], rate: 1/5},
		stand_left: { frames: [14], rate: 1/5},
		run_right: { frames: [0,1,2], rate: 1/15},
		run_left: { frames: [14,15,16], rate: 1/15},
		jump_right: { frames: [3,4], rate: 1/5},
		jump_left: { frames: [3,4], rate: 1/5},
		die: { frames: [12], rate: 1/5}
	});

	Q.Sprite.extend("Mario",{
		init: function(p) {
			this._super(p, { sprite: "mario", sheet: "mario", frame: 0, x: 150, y: 380 });
			this.add("2d, platformerControls");
			this.add("animation");

		},
		step: function(dt){
			if(this.p.y >= 1000){
				this.p.x = 150;
				this.p.y = 380;
			}
			if(this.p.vx > 0)
				this.play("run_right");
			else if (this.p.vx < 0)
				this.play("run_left");
			else
				this.play("stand_" + (this.p.direction === "right" ? "right" : "left"));
		}
	});

	Q.load("goomba.png, goomba.json", function() {
		Q.compileSheets("goomba.png", "goomba.json");
	});
	Q.Sprite.extend("Goomba", {
		init: function(p) {
			this._super(p, { sheet: 'goomba', vx: 100 });
			this.add("2d, aiBounce");
			this.on("bump.left, bump.right, bump.bottom", function(collision) {
				if (collision.obj.isA("Mario")) {
					Q.stageScene("endGame", 1, { label: "You Died" });
					collision.obj.destroy();
				}
			});
			this.on("bump.top", function(collision) {
				if (collision.obj.isA("Mario")) {
					this.destroy();
					collision.obj.p.vy = -300;
				}
			});
		}
	});

	Q.load("bloopa.png, bloopa.json", function() {
		Q.compileSheets("bloopa.png", "bloopa.json");
	});
	Q.Sprite.extend("Bloopa", {
		init: function(p) {
			this._super(p, { sheet: 'bloopa', gravity: 0.1});
			this.add('2d, aiBounce');
			this.on("bump.left, bump.right, bump.bottom", function(collision) {
				if (collision.obj.isA("Mario")) {
					Q.stageScene("endGame", 1, { label: "You Died" });
					collision.obj.destroy();
				} else {
					this.p.vy = -150;
				}
			});
			this.on("bump.top", function(collision) {
				if (collision.obj.isA("Mario")) {
					this.destroy();
					collision.obj.p.vy = -300;
				}
			});
		}
	});

	Q.load("princess.png");
	Q.Sprite.extend("Princess", {
		init: function(p) {
			this._super(p, { asset: "princess.png", x: 2000, y: 380});
			this.add('2d, aiBounce');
			this.on("bump.left, bump.up",function(collision) {
				if (collision.obj.isA("Mario")) {
					Q.stageScene("endGame", 1, { label: "You Win!" });
				}
			});
		}
	});

	Q.scene("level1", function(stage) {
		Q.stageTMX("level.tmx", stage);

		var mario = stage.insert(new Q.Mario());
		stage.insert(new Q.Goomba({ x: 1400, y: 0 }));
		stage.insert(new Q.Bloopa({ x: 300, y: 380 }));
		stage.insert(new Q.Princess());

		stage.add("viewport").follow(mario);
		stage.viewport.offsetY = 155;
		stage.viewport.offsetX = -10;
	});

	Q.loadTMX("level.tmx", function(){
		Q.stageScene("mainTitle");
	});

	Q.scene('endGame', function(stage){
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
		}));
		var button = container.insert(new Q.UI.Button({
			x: 0, y: 0, fill: "#CCCCCC", label: "Play Again"
		}));
		var label = container.insert(new Q.UI.Text({
			x:10, y: -10 - button.p.h, label: stage.options.label
		}));

		button.on("click",function(){
			Q.clearStages();
			Q.stageScene('mainTitle'); 
		}); 
		container.fit(20);
	});

	Q.load("mainTitle.png");

	Q.scene('mainTitle', function(stage){
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
		}));

		var button = container.insert(new Q.UI.Button({
			x: 0, y: 0, fill: "#CCCCCC", asset: "mainTitle.png", keyActionName: "fire"
		}));

		button.on("click,",function(){
			Q.clearStages();
			Q.stageScene('level1'); 
		}); 

		container.fit(20);

	});
}
