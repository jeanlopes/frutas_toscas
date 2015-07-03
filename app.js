// EXEMPLOS USADOS
// http://phaser.io/examples/v2/input/virtual-gamecontroller
// http://jsbin.com/cumubejoji/1/edit?js,output
// http://phaser.io/examples/v2/p2-physics/platformer-material
/*jshint strict: false */
/*global Phaser, window*/

var GameTrab = (function  () {
	
	'use strict';
	function GameTrab(fase, pontos, vidas) {

		this.fase = fase;
		this.pontos = pontos;
		this.vidas = vidas;
		this.gameOver = false;
		this.player = null;
		this.platforms = [];
		this.trees = [];
		this.apples = [];
		this.applesNumber = 0;
		this.motoBug = null;
		this.cursors = null;
		this.facing = 'idle';
		this.jumpTimer = 0;
		this.game = new Phaser.Game(640, 480, Phaser.CANVAS, 'game');
		this.game.state.add('Game', this, true);
	}

	// ********************* Criação do cenário e características do jogo ***********

	GameTrab.prototype.init =  function  () {
		
		// ???
		this.game.renderer.renderSession.roundPixels = true;
		this.game.physics.startSystem(Phaser.Physics.P2JS);
		this.game.physics.p2.gravity.y = 800;
		this.game.physics.p2.setBoundsToWorld(true, true, true, false, false);
	};

	GameTrab.prototype.preload = function () {
		this.game.load.image('background', 'assets/background.png');
        this.game.load.spritesheet('dude', 'assets/dude.png', 32, 48);
        this.load.image('platform', 'assets/platform.png');
        this.load.image('tree1', 'assets/tree1.png');
        this.load.image('tree2', 'assets/tree2.png');
        this.load.image('tree3', 'assets/tree3.png');
        this.load.image('greenapple', 'assets/greenapple.png');
        this.load.image('ripeapple', 'assets/ripeapple.png');
        this.load.image('motobug_right', 'assets/motobug_right.png');
        this.load.image('motobug_left', 'assets/motobug_left.png');
	};

	GameTrab.prototype.create = function () {

		this.game.add.sprite(0, 0, 'background');

		// ************ personagem **************
		
		this.player = this.game.add.sprite(80, 200, 'dude');
		this.player.animations.add('left', [0, 1, 2, 3], 10, true);
    	this.player.animations.add('turn', [4], 20, true);
    	this.player.animations.add('right', [5, 6, 7, 8], 10, true);
		this.game.physics.p2.enable(this.player);
		this.player.body.collideWorldBounds = true;
        this.player.body.fixedRotation = true;
        var spriteMaterial = this.game.physics.p2.createMaterial('spriteMaterial', this.player.body);
        this.cursors = this.game.input.keyboard.createCursorKeys();

		// ************ fim personagem **********

		// ************ cenário *****************

		this.platforms[0] = this.game.add.sprite(80, 370, 'platform');
		this.platforms[1] = this.game.add.sprite(250, 300, 'platform');
		this.platforms[2] = this.game.add.sprite(450, 250, 'platform');
		this.platforms[3] = this.game.add.sprite(250, 150, 'platform');

		var self = this;
		this.platforms.forEach(function(platform) {
			self.game.physics.p2.enable(platform);
			platform.body.static = true;
			platform.body.setMaterial(spriteMaterial);
		});

		this.trees[0] = this.game.add.sprite(200, 190, 'tree1');
		this.trees[1] = this.game.add.sprite(455, 142, 'tree2');
		this.trees[2] = this.game.add.sprite(160, 24, 'tree3');

		this.apples[0] = this.game.add.sprite(255, 262, 'greenapple');
		this.apples[1] = this.game.add.sprite(520, 190, 'greenapple');
		this.apples[2] = this.game.add.sprite(165, 80, 'greenapple');
		this.apples[3] = this.game.add.sprite(200, 30, 'greenapple');

		var random =  [];

		random[0] = Math.random();
		random[1] = Math.random();
		random[2] = Math.random();
		random[3] = Math.random();

		var i = 0;
		this.apples.forEach(function(apple) {

			self.game.physics.p2.enable(apple);
			apple.body.static = false;
			apple.body.data.gravityScale = 0;
			apple.body.onBeginContact.add(self.spoonFruit, self);

			self.game.time.events.add(random[i++] * 30 * 1000, self.matureFruit, self, apple);
			self.applesNumber++;

		});

		// ************ fim cenário *************

		
		// ************ inseto ******************
		
		//if (this.fase == 2) {

		this.motoBug = this.game.add.sprite(400, 180, 'motobug_left');
		this.game.physics.p2.enable(this.motoBug);
		this.motoBug.body.static = false;
		this.motoBug.body.data.gravityScale = 0;
		this.motoBug.body.data.shapes[0].sensor = true;
		this.motoBug.body.onBeginContact.add(this.bugAttacksDude, this);
		
		//} 
		
		// ************ fim inseto **************

	};

	GameTrab.prototype.update = function () {

		this.runPlayerBasicMotion();
		this.gameWillOverByFall();
		this.chasingDude();

	};

	// **************** Ações do personagem ****
	
	GameTrab.prototype.spoonFruit = function (body, shape1, shape2, equation) { 

		if (equation.length === 0) return;
		
		var obj1 = equation[0].bodyA.parent;
		var obj2 = equation[0].bodyB.parent;


			if (obj1 && obj1.sprite.key == 'dude')
			{
				if (obj2 && obj2.sprite.key == 'greenapple') {
					this.rottingFruit(obj2.sprite);
					this.applesNumber--;
				}
				else {
					obj2.sprite.destroy();
					document.querySelector('#pontos').innerText = ++this.pontos;
					this.applesNumber--;
				}
			}
			else if (obj2 && obj2.sprite.key == 'dude')
			{
				if (obj1 && obj1.sprite.key == 'greenapple') {
					this.rottingFruit(obj1.sprite);
					this.applesNumber--;
				}
				else {
					obj1.sprite.destroy();
					document.querySelector('#pontos').innerText = ++this.pontos;
					this.applesNumber--;
				}
			}

			this.nextFaseOrGameOver();
			
	};

	GameTrab.prototype.nextFaseOrGameOver = function () {
		if (this.applesNumber === 0 && this.pontos < 3) {
				this.gameOver = true;
				window.alert('Game Over: Pontos insuficientes!');
				window.localStorage.setItem('fase', 1);
				window.location.reload();
			} else if (this.applesNumber === 0 && this.fase != 2) {
				window.alert('Fase 2!');
				window.localStorage.setItem('fase', 2);
				window.location.reload();
			} else if (this.applesNumber === 0 && this.fase == 2) {
				window.alert('Parabéns, vc virou o jogo e perdeu seu tempo!! kkkkkk');
				window.localStorage.setItem('fase', 1);
				window.location.reload();
			}
	};
	
	GameTrab.prototype.runPlayerBasicMotion = function () {	

		if (this.cursors.left.isDown)
	    {
	        this.player.body.moveLeft(200);

	        if (this.facing != 'left')
	        {
	            this.player.animations.play('left');
	            this.facing = 'left';
	        }
	    }
	    else if (this.cursors.right.isDown)
	    {
	        this.player.body.moveRight(200);

	        if (this.facing != 'right')
	        {
	            this.player.animations.play('right');
	            this.facing = 'right';
	        }
	    }
	    else
	    {
	        this.player.body.velocity.x = 0;

	        if (this.facing != 'idle')
	        {
	            this.player.animations.stop();

	            if (this.facing == 'left')
	            {
	                this.player.frame = 0;
	            }
	            else
	            {
	                this.player.frame = 5;
	            }

	            this.facing = 'idle';
	        }
	    }


        if (this.cursors.up.isDown && this.game.time.now > this.jumpTimer ) 
	    {
	        this.player.body.moveUp(400);
	        this.jumpTimer = this.game.time.now + 1500; // da tempo dele pular e cair
	    }	    
	};
	
	GameTrab.prototype.gameWillOverByFall = function  () {
		
		if (this.player.position.y > 500 && !this.gameOver) {

			this.dudeLosesLife('o boneco caiu, seu tonto!');
		}
		
	};

	GameTrab.prototype.dudeLosesLife = function(message) {

		if (this.vidas > 1) {

				this.player.kill();
				this.player.reset(80, 200);
			}
			else {
				this.gameOver = true;
				window.alert('Game Over: ' + message);
				window.localStorage.setItem('fase', 1);
				window.location.reload();
			}
			document.querySelector('#vidas').innerText = --this.vidas;
	};
        
	// **************** Fim ações personagem ***
	
	// **************** Ações da fruta *********
	
	GameTrab.prototype.matureFruit = function (apple) {

		// testar se a fruta já foi colhida para não dar erro
		if (apple.body) {
				apple.loadTexture('ripeapple', 0, false);

			this.game.time.events.add(20 * 1000, this.rottingFruit, this, apple);
		}
	};	

	GameTrab.prototype.rottingFruit = function (apple) {

		if (apple.body) {

			apple.body.data.gravityScale = 1;
			this.game.time.events.add(5 * 1000, this.disappearFruit, this, apple);
		}
	};

	GameTrab.prototype.disappearFruit = function (apple) {
		apple.destroy();
		this.applesNumber--;
		this.nextFaseOrGameOver();
	};
	
	// **************** Fim ações fruta *******
	
	// **************** Ações do inseto *******
	
	GameTrab.prototype.chasingDude = function  () {
		
		var x = this.player.x;
		var y = this.player.y;
		this.motoBug.body.velocity.x = 0;

		if (y > this.motoBug.y)
		{
			this.motoBug.body.moveDown(10);
		}
		else if (y < this.motoBug.y)
		{
			this.motoBug.body.moveUp(10);
		}

		if (x < this.motoBug.x) {
			this.motoBug.loadTexture('motobug_left', 0, false);
			this.motoBug.body.moveLeft(10);
		}
		else if (x > this.motoBug.x) {
			this.motoBug.loadTexture('motobug_right', 0, false);
			this.motoBug.body.moveRight(10);
		}
	};

	GameTrab.prototype.bugAttacksDude = function (body) {

		if (body.sprite.key == 'dude')
		{
			this.dudeLosesLife('boneco foi atingido pelo inseto..');
			this.motoBug.kill();
			this.motoBug.reset(400, 180);
		}
	};

	return GameTrab;

})();

window.onload = function  () {

	var fase = window.localStorage.getItem('fase');
	var pontos = 0;
	var vidas = 3;

	if (!fase) {
		fase = 1;
		window.localStorage.setItem('fase', fase);
	}
		document.querySelector('#fase').innerText = fase;
		document.querySelector('#pontos').innerText = pontos;
		document.querySelector('#vidas').innerText = vidas;

 	window.gameTrab = new GameTrab(fase, pontos, vidas);
};