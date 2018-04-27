var game = function(){
	var Q = window.Q = Quintus()
			.include("Sprites, Scenes, Input, 2D, Touch, UI, TMX, Anim")
			.setup({
	        	width: 320,
	        	height: 480
	        }).controls().touch();

	Q.animations('mario',{
		stand_right: { frames: [0], rate: 1/5},
		stand_left: { frames: [14], rate: 1/5},
		run_right: { frames: [0,1,2], rate: 1/5},
		run_left: { frames: [14,15,16], rate: 1/5},
		jump_right: { frames: [4], rate: 1/5},
		jump_left: { frames: [18], rate: 1/5},
		die: { frames: [12], rate: 1/5}
	});

	Q.component('defaultEnemy', {
		added: function() {
			this.entity.on("bump.top", function(collision) {
				if (collision.obj.isA("Mario")) {
					this.p.alive = false;
					this.play("die");
					collision.obj.p.vy = -300;
				}
			});
			this.entity.on("bump.left, bump.right, bump.bottom", function(collision){
				if(collision.obj.isA("Mario")){
					collision.obj.p.alive = false;
					Q.stageScene("endGame", 2, { label: "You Died" });
				}
			});
		}
	});

	Q.Sprite.extend("Mario",{
		init: function(p) {
			this._super(p, {
				sprite: "mario",
				sheet: "mario",
				frame: 0,
				x: 150,
				y: 380,
				alive: true,
				jumpSpeed: -400
			});
			this.add("2d, platformerControls");
			this.add("animation, tween");
		},
		step: function(dt){
			if(this.p.y >= 1000){
				this.p.x = 150;
				this.p.y = 380;
			}
			if(this.p.alive){
				if(this.p.vx > 0)
					this.play("run_right");
				else if (this.p.vx < 0)
					this.play("run_left");
				else
					this.play("stand_" + (this.p.direction === "right" ? "right" : "left"));

				if(this.p.vy !== 0)
				this.play("jump_" + this.p.direction);
			}else
				this.play("die");

		}
	});

	Q.animations('goomba', {
		move: {frames: [0,1], rate: 1/5},
		die: {frames: [2], rate: 1/15}
	});

	Q.Sprite.extend("Goomba", {
		init: function(p) {
			this._super(p, {
				sprite: 'goomba',
				sheet: 'goomba',
				frame: 0,
				x: 1400,
				y: 0,
				vx: 100,
				alive: true
			});
			this.add("2d, aiBounce, animation, defaultEnemy");
		},
		step: function(dt){
			if(this.p.alive)
				this.play("move");
			else{
				this.p.vx = 0;
				var that = this;
				setTimeout(function(){
					that.destroy();
				}, 1000);
			}
		}
	});

	Q.animations('bloopa', {
		move: {frames: [0,1], rate: 1/1},
		die: {frames: [2], rate: 1/15}
	});

	Q.Sprite.extend("Bloopa", {
		init: function(p) {
			this._super(p, {
				sprite: 'bloopa',
				sheet: 'bloopa',
				frame: 3,
				x: 300,
				y: 380,
				gravity: 0.1,
				alive: true
			});
			this.add('2d, aiBounce, animation, defaultEnemy');
			this.on("bump.bottom", function(collision) {
				if (!collision.obj.isA('Mario')) {
					this.p.vy = -150;
				}
			});
		},
		step: function(dt){
			if(this.p.alive)
				this.play("move");
			else{
				this.p.vx = 0;
				var that = this;
				setTimeout(function(){that.destroy();}, 1000);
			}
		}
	});

	Q.Sprite.extend("Princess", {
		init: function(p) {
			this._super(p, { asset: "princess.png", x: 2000, y: 380});
			this.add('2d, aiBounce');
			this.on("bump.left, bump.up",function(collision) {
				if (collision.obj.isA("Mario")) {
					collision.obj.play("jump_right");
					Q.stageScene("endGame", 2, { label: "You Win!" });
				}
			});
		}
	});

	Q.animations('coin',{
		coin: {frames: [2,1,0], rate: 1/2, loop: false}
	})

	Q.Sprite.extend("Coin", {
		init: function(p){
			this._super(p, {
				sprite: "coin",
				sheet: "coin",
				frame: 2,
				gravity: 0,
				sensor: true,
				pickup: false
			});
			this.add('animation, tween');
			this.on("sensor", function(collision){
				if(collision.isA("Mario")){
					if(!this.pickup){
						this.pickup = true;
						Q.state.inc("score", 100);
						var that = this;
						this.play('coin');
						this.animate({x: that.p.x, y: that.p.y - 50},1,Q.Easing.Linear, {callback: function(){that.destroy();}});
					}
				}
			});
		}
	});

	Q.UI.Text.extend("Score",{
		init: function(p){
			this._super({
				label: "score: 0",
				x: 0,
				y: 0
			});
			Q.state.on("change.score", this, "score");
		},
		score: function(score){
			this.p.label = "Score: " + score;
		}
	});

	Q.scene("hud", function(stage){
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height - 400
		}));
		var text = container.insert(new Q.Score());
	});

	Q.scene("level1", function(stage) {

		Q.stageTMX("level.tmx", stage);

		Q.state.set("score", 0);

		var mario = stage.insert(new Q.Mario());
		stage.insert(new Q.Goomba());
		stage.insert(new Q.Bloopa());
		stage.insert(new Q.Princess());

		for(let i = 0; i < 3; ++i){
			stage.insert(new Q.Coin({x: 100+i*50, y: 500}));
		}

		stage.add("viewport").follow(mario);
		stage.viewport.offsetY = 155;
		stage.viewport.offsetX = -10;

		Q.stageScene("hud", 3);
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
		setTimeout(function(){Q.stage(1).pause();}, 50);
	});

	Q.scene('mainTitle', function(stage){
		var container = stage.insert(new Q.UI.Container({
			x: Q.width/2, y: Q.height/2, fill: "rgba(0,0,0,0.5)"
		}));

		var button = container.insert(new Q.UI.Button({
			x: 0, y: 0, fill: "#CCCCCC", asset: "mainTitle.png", keyActionName: "fire"
		}));

		button.on("click,",function(){
			Q.clearStages();
			Q.stageScene('level1',1);
		});
		container.fit(20);

	});

	Q.load("mario_small.png, mario_small.json, bloopa.png, bloopa.json, goomba.png, goomba.json, princess.png, mainTitle.png, coin.png, coin.json", function() {
		Q.compileSheets("mario_small.png", "mario_small.json");
		Q.compileSheets("bloopa.png", "bloopa.json");
		Q.compileSheets("coin.png", "coin.json");
		Q.compileSheets("goomba.png", "goomba.json");
		Q.loadTMX("level.tmx", function(){
			Q.stageScene("mainTitle");
		});
	});
}
