var game = new Phaser.Game(800, 600, Phaser.AUTO, document.getElementById('game'), {
  preload: preload,
  create: create,
  update: update
}, false, false);

var ball;
var paddle;
var bricks;

var ballOnPaddle = true;

var lives = 3;
var score = 0;

var scoreText;
var livesText;
var introText;

function preload() {
  game.load.image('paddle', 'sprites/paddle_blue.png');
  game.load.image('ball', 'sprites/ball_grey.png');
  game.load.image('background', 'sprites/background.png');
  game.load.image('block-blue', 'sprites/element_blue_rectangle.png');
  game.load.image('block-green', 'sprites/element_green_rectangle.png');
  game.load.image('block-red', 'sprites/element_red_rectangle.png');
  game.load.image('block-yellow', 'sprites/element_yellow_rectangle.png');
  game.load.image('block-purple', 'sprites/element_purple_rectangle.png');
}

function create() {
  // Simple physics handles basic collisions, but no rotation (e.g. Mario)
  game.physics.startSystem(Phaser.Physics.ARCADE);

  //  We check bounds collisions against all walls other than the bottom one
  game.physics.arcade.checkCollision.down = false;

  // Add a background and stretch to fit the page
  var background = game.add.sprite(0, 0, 'background');
  background.width = 800;
  background.height = 600;

  // Add a group of elements with physics enabled
  bricks = game.add.group();
  bricks.enableBody = true;
  bricks.physicsBodyType = Phaser.Physics.ARCADE;

  // Brick colours
  var colours = ['blue', 'green', 'red', 'yellow', 'purple'];

  // Make a bunch of bricks
  var brick;
  for (var y = 0; y < 5; y++) {
    for (var x = 0; x < 8; x++) {
      brick = bricks.create(120 + (x * 70), 100 + (y * 60), 'block-' + colours[y]);
      brick.body.bounce.set(1);
      brick.body.immovable = true;
    }
  }

  paddle = game.add.sprite(game.world.centerX, 500, 'paddle');
  paddle.anchor.setTo(0.5, 0.5);

  game.physics.enable(paddle, Phaser.Physics.ARCADE);

  paddle.body.collideWorldBounds = true;
  paddle.body.bounce.set(1);
  paddle.body.immovable = true;

  ball = game.add.sprite(game.world.centerX, paddle.y, 'ball');
  ball.anchor.set(0.5, 0.5);
  ball.checkWorldBounds = true;

  game.physics.enable(ball, Phaser.Physics.ARCADE);

  ball.body.collideWorldBounds = true;
  ball.body.bounce.set(1);

  ball.events.onOutOfBounds.add(ballLost, this);

  scoreText = game.add.text(32, 550, 'Score: 0', { font: "20px ActionMan", fill: "#ffffff", align: "left" });
  livesText = game.add.text(680, 550, 'Lives: 3', { font: "20px ActionMan", fill: "#ffffff", align: "left" });
  introText = game.add.text(game.world.centerX, 420, 'Click to start', { font: "40px ActionMan", fill: "#ffffff", align: "center" });
  introText.anchor.setTo(0.5, 0.5);

  game.input.onDown.add(releaseBall, this);

}

function update() {
  paddle.x = game.input.x;

  if (paddle.x < paddle.width / 2) {
    paddle.x = paddle.width / 2;
  } else if (paddle.x > game.width - paddle.width / 2) {
    paddle.x = game.width - paddle.width / 2;
  }

  if (ballOnPaddle) {
    ball.body.x = paddle.x - ball.width / 2;
    ball.body.y = paddle.y - paddle.height - ball.height / 2;
  } else {
    game.physics.arcade.collide(ball, paddle, ballHitPaddle, null, this);
    game.physics.arcade.collide(ball, bricks, ballHitBrick, null, this);
  }
}

function releaseBall() {
  if (ballOnPaddle) {
    ballOnPaddle = false;
    ball.body.velocity.y = -360;
    ball.body.velocity.x = -75;
    introText.visible = false;
  }
}

function ballLost() {
  lives--;
  livesText.text = 'Lives: ' + lives;

  if (lives === 0) {
    gameOver();
  } else {
    ballOnPaddle = true;
  }
}

function gameOver() {
  ball.body.velocity.setTo(0, 0);

  introText.text = 'Game over!';
  introText.visible = true;
}

function ballHitBrick(ball, brick) {
  brick.kill();

  score += 10;

  scoreText.text = 'Score: ' + score;

  if (bricks.countLiving() == 0) {
    score += 1000;
    scoreText.text = 'Score: ' + score;
    introText.text = 'Next Level';
    introText.visible = true;

    ballOnPaddle = true;

    bricks.callAll('revive');
  }
}

function ballHitPaddle(ball, paddle) {
  ball.body.velocity.x = (10 * (ball.x -paddle.x));

  var speed = Math.sqrt(
    Math.pow(ball.body.velocity.x, 2) +
    Math.pow(ball.body.velocity.y, 2)
  );

  ball.body.velocity.x *= 400 / speed;
  ball.body.velocity.y *= 400 / speed;
}
