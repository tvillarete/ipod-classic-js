const app = {
  init: function() {
    this.canvas = document.querySelector("#brickBreakerCanvas");
    this.context = this.canvas ? this.canvas.getContext("2d") : null;
    this.context.scale(0.39, 0.53);

    if (!this.context) {
      console.log("Error getting application context");
      return; //TODO: notify user
    }

    window.addEventListener("forwardscroll", () => player.moveRight(), true);
    window.addEventListener("backwardscroll", () => player.moveLeft(), true);

    this.setupBricks();
    this.update();

    return;
  },

  destroy: function() {
    app.clearContext();
    window.removeEventListener("forwardscroll", () => player.moveRight());
    window.removeEventListener("backwardscroll", () => player.moveLeft());
  },

  update: function() {
    app.clearContext();

    app.drawBricks();
    player.draw();
    ball.update();

    requestAnimationFrame(app.update);
  },

  clearContext: function() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return;
  },

  die: function() {
    //TODO: better death!
    player.lives -= 1;

    if (player.lives < 1) this.reset();

    ball.reset();
  },

  drawBricks: function() {
    this.bricks.forEach(function(brick) {
      brick.draw();
    });
  },

  //TODO: this will change per level
  setupBricks: function() {
    this.bricks = [];

    var i = 0;
    var brickTop = 50;

    //Setup back row:
    for (i = 0; i < 10; i++) {
      const brick = new Brick();
      brick.position.x = 150 + i * brick.size.width + i;
      brick.position.y = brickTop;
      brick.health = 1;
      this.bricks.push(brick);
    }

    //Setup middle row:
    for (i = 0; i < 8; i++) {
      const brick = new Brick();
      brick.position.x = 201 + i * brick.size.width + i;
      brick.position.y = brickTop + brick.size.height + 1;
      brick.health = 2;
      this.bricks.push(brick);
    }

    //Setup front row:
    for (i = 0; i < 6; i++) {
      var brick = new Brick();
      brick.position.x = 252 + i * brick.size.width + i;
      brick.position.y = brickTop + 2 * brick.size.height + 1;
      brick.health = 3;
      this.bricks.push(brick);
    }
  },

  reset: function() {
    player.reset();
    ball.reset();
    this.setupBricks();
  },

  bricks: [],

  canvas: null,
  context: null,
  timeout: 33
};

// var controller = {
//   keypress: function(event) {
//     switch (event.keyCode) {
//       case 37:
//         player.moveLeft();
//         break;
//       case 39:
//         player.moveRight();
//         break;
//     }
//   }
// };

var player = {
  // Defines initial position
  position: {
    x: 375,
    y: 480
  },

  score: 0,

  lives: 3,

  physics: {
    speed: 10
  },

  size: {
    height: 10,
    width: 50
  },

  draw: function() {
    app.context.fillStyle = "rgb(200, 0, 0)";
    app.context.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    );

    app.context.textAlign = "center";
    app.context.fillStyle = "rgba(0, 0, 0, .2)";

    app.context.font = "18px sans-serif";
    app.context.fillText("Lives", 40, 20);
    app.context.fillText("Score", 40, 120);

    app.context.font = "48px sans-serif";
    app.context.fillText(this.lives, 40, 75);
    app.context.fillText(this.score, 40, 175);
  },

  moveLeft: function() {
    if (this.position.x > 0) this.position.x -= this.physics.speed;
  },

  moveRight: function() {
    if (this.position.x < app.canvas.width - this.size.width)
      this.position.x += this.physics.speed;
  },

  reset: function() {
    this.lives = 3;
    this.score = 0;
    this.position.x = 100;
  }
};

var ball = {
  position: {
    x: 50,
    y: 50
  },

  size: {
    height: 10,
    width: 10
  },

  physics: {
    speed: 5
  },

  direction: {
    x: 1, //Moving right
    y: 1 //Moving down
  },

  draw: function() {
    app.context.fillStyle = "rgb(200, 0, 0)";
    app.context.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    );
  },

  reset: function() {
    this.position.x = 50;
    this.position.y = 50;
    this.direction.x = 1;
    this.direction.y = 1;
  },

  update: function() {
    if (this.position.x <= 0)
      //Left Bounds
      this.direction.x = 1;
    if (this.position.x >= app.canvas.width)
      //Right Bounds
      this.direction.x = -1;
    if (this.position.y <= 0)
      //Top Bounds
      this.direction.y = 1;
    if (this.position.y >= app.canvas.height)
      //Bottom Bounds
      app.die(); //TODO: die

    this.checkCollisionWithPlayer();
    this.checkCollisionWithBricks();

    this.position.x += this.physics.speed * this.direction.x;
    this.position.y += this.physics.speed * this.direction.y;

    this.draw();
  },

  checkCollisionWithPlayer: function() {
    if (this.position.y + this.size.height < player.position.y) return;
    if (this.position.y > player.position.y + player.size.height) return;
    if (this.position.x > player.position.x + player.size.width) return;
    if (this.position.x + this.size.width < player.position.x) return;

    this.direction.y = -1; //Moving up now
  },

  checkCollisionWithBricks: function() {
    var i = 0;
    for (i = 0; i < app.bricks.length; i++) {
      var brick = app.bricks[i];

      if (this.position.y + this.size.height < brick.position.y) continue;
      if (this.position.y > brick.position.y + brick.size.height) continue;
      if (this.position.x > brick.position.x + brick.size.width) continue;
      if (this.position.x + this.size.width < brick.position.x) continue;

      /* If the loop makes it this far, we have a collision */
      brick.health -= 1;

      player.score += 20;

      if (brick.health < 1) app.bricks.splice(i, 1);

      //Update direction based on where we hit the brick

      //Moving towards lower right
      if (this.direction.x === 1 && this.direction.y === 1) {
        if (this.position.y > brick.position.y) this.direction.x = -1;
        else this.direction.y = -1;
      }
      //Moving towards lower left
      else if (this.direction.x === -1 && this.direction.y === 1) {
        if (this.position.y > brick.position.y) this.direction.x = 1;
        else this.direction.y = -1;
      }
      //Moving towards upper right
      else if (this.direction.x === 1 && this.direction.y === -1) {
        if (this.position.y > brick.position.y) this.direction.x = -1;
        else this.direction.y = -1;
      }
      //Moving towards upper-left
      else if (this.direction.x === -1 && this.direction.y === -1) {
        if (this.position.y > brick.position.y) this.direction.x = 1;
        else this.direction.y = -1;
      }
    }
  }
};

var Brick = function() {
  this.health = 3;

  this.size = {
    height: 30,
    width: 50
  };

  //Will be determined on setup
  this.position = {
    x: 0,
    y: 0
  };
};

Brick.prototype.draw = function() {
  // eslint-disable-next-line default-case
  switch (this.health) {
    case 3:
      app.context.fillStyle = "rgb(0, 200, 0)"; //Green
      break;
    case 2:
      app.context.fillStyle = "rgb(200, 200, 0)"; //Orange?
      break;
    case 1:
      app.context.fillStyle = "rgb(200, 0, 0)"; //Red
      break;
  }

  if (this.health > 0)
    app.context.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    );
};

export default app;
