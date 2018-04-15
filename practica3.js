var game = function(){
	var Q = window.Q = Quintus()
			.include("Sprites, Scenes, Input, 2D, Touch, UI, TMX, Anim")
			.setup({
	        	width: 320,
	        	height: 480
	        }).controls().touch();

	Q.load("princess.png, mario_small.png, mario_small.json", function(){
		Q.compileSheets("mario_small.png", "mario_small.json");
	});

	Q.Sprite.extend("Player",{
		init: function(p){
			this._super(p, {
				x: 150,
				y: 380,
				sheet: "marioR"
			});
			this.add("2d, platformerControls");
		},
		step: function(dt){
			if(this.p.y >= 1000){
				this.p.x = 150;
				this.p.y = 380;
			}
			console.log(this.p.y);
		}
	});

	Q.scene("level1", function(stage){

		Q.stageTMX("level.tmx", stage);
		var mario = stage.insert(new Q.Player());
		stage.add("viewport").follow(mario);
		stage.viewport.offsetY = 155;
		stage.viewport.offsetX = -10;

	})


	Q.loadTMX("level.tmx", function(){
		Q.stageScene("level1");
	})
}