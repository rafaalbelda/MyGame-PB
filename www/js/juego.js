var app={
	
  inicio: function(){
    DIAMETRO_BOLA = 36;
    dificultad = 0;
    velocidadX = 0;
    velocidadY = 0;
    puntuacion = 0;
    numStars = 3;
    numRocks = 3;
    
    alto  = document.documentElement.clientHeight;
    ancho = document.documentElement.clientWidth;
    
    app.vigilaSensores();
    app.iniciaJuego();
  },

  iniciaJuego: function(){

    function preload() {
      game.physics.startSystem(Phaser.Physics.ARCADE);

      //game.stage.backgroundColor = '#f27d0c';
      game.load.spritesheet('nave', 'assets/nave.png', 36, 23);
      game.load.image('star', 'assets/star2.png');
      game.load.image('roca1', 'assets/asteroid1.png');
      game.load.image('roca2', 'assets/asteroid2.png');
      game.load.image('roca3', 'assets/asteroid3.png');
      game.load.image('fondo', 'assets/starfield.png');
      game.load.spritesheet('explosion', 'assets/explode.png', 128, 128); // 16 frames
      game.load.audio('hit', 'assets/blaster.mp3');
      game.load.audio('bad', 'assets/explosion.mp3');
      
    }

    function create() {

      // do not allow screen off
      window.plugins.insomnia.keepAwake();

      // fondo
      fondo = game.add.sprite(0, 0, 'fondo');
      fondo.height = alto;
      fondo.width = ancho;
      
      scoreText = game.add.text(16, 16, puntuacion, { fontSize: '30px', fill: '#AA7676' });

//      game.physics.arcade.gravity.y = 100; // No gravity
      
      // Stars Group
      stars = game.add.group();
      stars.enableBody = true;
      stars.physicsBodyType = Phaser.Physics.ARCADE;
      
      // Add Stars
      for (i = 0; i < numStars; i++)
      {
    	  star = stars.create(app.inicioX(), 0, 'star');
    	  star.name = 'star' + star.body.x;
    	  star.checkWorldBounds = true;
    	  star.events.onOutOfBounds.add(app.spriteOut, this);
    	  star.body.velocity.y = app.velocidad();
//      star.body.collideWorldBounds = true;
//      star.body.onWorldBounds = new Phaser.Signal();
//      star.body.onWorldBounds.add(app.restartstar, this);
//      star.body.bounce.y = 0.8;
      }

      // Rocks group
      rocks = game.add.group();
      rocks.enableBody = true;
      rocks.physicsBodyType = Phaser.Physics.ARCADE;
      
      // Add Rocks
      for (i = 0; i < numRocks; i++) 
      {
	      roca = rocks.create(app.inicioX(), 0, 'roca' + (((i + 1) % numRocks)+1));
	      roca.name = 'rock1' + star.body.x;
	      roca.checkWorldBounds = true;
	      roca.events.onOutOfBounds.add(app.spriteOut, this);
	      roca.body.velocity.y = app.velocidad();
      }
      

      // Nave
      nave = game.add.sprite(app.inicioX(), app.inicioY(), 'nave');
      nave.animations.add('left', 1, 10, false);
      nave.animations.add('right', 2, 10, false);
      nave.animations.currentFrame = 0;
      // Explosion Animation
      explosion = game.add.sprite(-50, -50, 'explosion');
      explosion.visible = false;
      explosion.animations.add('boom', [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], 10, false);
      
      // Sounds
      hit = game.add.audio('hit');
      bad = game.add.audio('bad');

      // Misc game settings
      game.physics.arcade.enable(nave);
      game.physics.arcade.enable(stars);
      game.physics.arcade.enable(rocks);
      game.physics.arcade.enable(scoreText, false);

      nave.body.allowGravity = false;
      nave.body.collideWorldBounds = true;
      //nave.body.onWorldBounds = new Phaser.Signal();
      //nave.body.onWorldBounds.add(app.decrementaPuntuacion, this);
    
    }

    function update(){
      var factorDificultad = (300 + (dificultad * 100));
      
      if (puntuacion >= 0)
      {
	      nave.body.velocity.y = (velocidadY * factorDificultad);
	      nave.body.velocity.x = (velocidadX * (-1 * factorDificultad));
	      if (velocidadX > 2) {
	    	  nave.animations.currentFrame = 2;
	      } if (velocidadX < -2) {
	    	  nave.animations.currentFrame = 1;
	      } else {
	    	  nave.animations.currentFrame = 0;
	      }
	      
      
	      //game.physics.arcade.collide(nave, stars);
	      //game.physics.arcade.collide(nave, rocks);
	      game.physics.arcade.overlap(nave, stars, app.incrementaPuntuacion, null, this);
	      game.physics.arcade.overlap(nave, rocks, app.decrementaPuntuacion, null, this);
      } else {
	      nave.body.velocity.y = 0;
	      nave.body.velocity.x = 0;
      }
    }

    var estados = { preload: preload, create: create, update: update };
    var game = new Phaser.Game(ancho, alto, Phaser.CANVAS, 'phaser',estados);
  },

  spriteOut: function(sprite){
	  sprite.reset(app.inicioX(), 0)
	  sprite.body.velocity.y = app.velocidad();
  },

  
  decrementaPuntuacion: function(nave, roca){

    bad.play();
	puntuacion = puntuacion-1;
  
	if (puntuacion < 0  )
	{
		console.log('Booooom!');
		puntuacion = -1
	    scoreText.text = 'GAME OVER!!!!';
		scoreText.x = ancho/2;
		scoreText.y = alto/2;
	    scoreText.anchor.x = 0.5;
	    scoreText.anchor.y = 0.5;
		nave.visible = false;
		explosion.reset(nave.body.x - nave.body.width, nave.body.y - (nave.body.height*2));
		explosion.visible = true;
		explosion.play('boom');
		nave.kill();
	} else {
	    scoreText.text = puntuacion;
	}

	// hide and restart sprite
    app.spriteOut(roca);
    
  },

  incrementaPuntuacion: function(nave, star){
    puntuacion = puntuacion+1;
    scoreText.text = puntuacion;
    
    hit.play();
	// hide and restart sprite
    app.spriteOut(star);
  },
  
  
  inicioX: function(){
    return app.numeroAleatorioHasta(ancho - DIAMETRO_BOLA );
  },

  inicioY: function(){
    return app.numeroAleatorioHasta(alto - DIAMETRO_BOLA );
  },
  
  
  velocidad: function(){
    return app.numeroAleatorioEntre(10, 300);
  },
  

  numeroAleatorioHasta: function(limite){
    return Math.floor(Math.random() * limite);
  },

  numeroAleatorioEntre: function(min, max){
	    return (min + Math.floor(Math.random() * (max-min)));
  },

  vigilaSensores: function(){
    
    function onError() {
        console.log('onError!');
    }

    function onSuccess(datosAceleracion){
      app.detectaAgitacion(datosAceleracion);
      app.registraDireccion(datosAceleracion);
    }

    navigator.accelerometer.watchAcceleration(onSuccess, onError,{ frequency: 10 });
  },

  detectaAgitacion: function(datosAceleracion){
    var agitacionX = datosAceleracion.x > 10;
    var agitacionY = datosAceleracion.y > 10;

    if (agitacionX || agitacionY){
      setTimeout(app.recomienza, 1000);
    }
  },

  recomienza: function(){
    document.location.reload(true);
  },

  registraDireccion: function(datosAceleracion){
    velocidadX = datosAceleracion.x ;
    velocidadY = datosAceleracion.y ;
  }

};

if ('addEventListener' in document) {
    document.addEventListener('deviceready', function() {
        app.inicio();
    }, false);
}