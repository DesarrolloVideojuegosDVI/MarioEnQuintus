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
	Q.Sprite.extend("Mario",{
		init: function(p) {
			this._super(p, {
				sheet: "marioR",
				x: 150,
				y: 380
			});
			this.add("2d, platformerControls");
		},
		step: function(dt){
			if(this.p.y >= 1000){
				this.p.x = 150;
				this.p.y = 380;
			}
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
			this._super(p, { sheet: 'bloopa' });
			this.add('2d, aiBounce');
			this.on("bump.left, bump.right, bump.bottom", function(collision) {
				if (collision.obj.isA("Mario")) {
					Q.stageScene("endGame", 1, { label: "You Died" });
					collision.obj.destroy();
				} else {
					this.p.vy = -350;
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

	Q.scene("level1", function(stage) {
		Q.stageTMX("level.tmx", stage);

		var mario = stage.insert(new Q.Mario());
		stage.insert(new Q.Goomba({ x: 1400, y: 0 }));
		stage.insert(new Q.Bloopa({ x: 300, y: 380 }));

		stage.add("viewport").follow(mario);
		stage.viewport.offsetY = 155;
		stage.viewport.offsetX = -10;
	})
	Q.loadTMX("level.tmx", function(){
		Q.stageScene("level1");
	})
}
