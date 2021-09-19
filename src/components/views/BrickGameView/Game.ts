type Dimensions = { width: number; height: number };
type Coordinates = { x: number; y: number };

class App {
  initialized: boolean;
  waiting: boolean;
  player: Player;
  ball: Ball;
  bricks: Array<Brick>;
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  timeout: number;
  inStasis: boolean;

  constructor() {
    this.initialized = false;
    this.waiting = true;
    this.player = new Player(this);
    this.ball = new Ball(this);
    this.bricks = [];
    this.canvas = document.querySelector('#brickBreakerCanvas');
    this.context = this.canvas ? this.canvas.getContext('2d') : null;
    this.timeout = 33;
    this.inStasis = false;
  }

  init = () => {
    if (!this.context) {
      console.log('Error getting application context');
      return; //TODO: notify user
    }

    window.addEventListener('centerclick', this.handleCenterClick);
    this.inStasis = false;

    if (!this.initialized) {
      window.addEventListener(
        'forwardscroll',
        () => this.player.moveRight(),
        true
      );
      window.addEventListener(
        'backwardscroll',
        () => this.player.moveLeft(),
        true
      );
      window.addEventListener('menuclick', () => {
        this.inStasis = true;
      });

      this.setupBricks();
      this.player.draw();
      this.drawBricks();
      this.ball.update();
      this.update();

      this.initialized = true;
    }
  };

  handleCenterClick = () => {
    if (this.waiting && !this.inStasis) {
      this.waiting = false;
    }
  };

  update = () => {
    this.clearContext();
    this.player.draw();
    this.drawBricks();

    this.ball.update();

    requestAnimationFrame(() => {
      this.update();
    });
  };

  clearContext = () => {
    if (this.context && this.canvas) {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    return;
  };

  die = () => {
    //TODO: better death!
    this.player.position.x = 200;
    this.player.lives -= 1;

    if (this.player.lives < 1) this.reset();

    this.ball.reset();
    this.waiting = true;
  };

  drawBricks = () => {
    for (const brick of this.bricks) {
      brick.draw();
    }
  };

  //TODO: this will change per level
  setupBricks = () => {
    this.bricks = [];

    const brickTop = 50;

    //Setup back row:
    for (let i = 0; i < 10; i++) {
      const brick = new Brick(this);
      brick.position.x = 100 + i * brick.size.width + i;
      brick.position.y = brickTop;
      brick.health = 1;
      this.bricks.push(brick);
    }

    //Setup middle row:
    for (let i = 0; i < 8; i++) {
      const brick = new Brick(this);
      brick.position.x = 150 + i * brick.size.width + i;
      brick.position.y = brickTop + brick.size.height + 1;
      brick.health = 2;
      this.bricks.push(brick);
    }

    //Setup front row:
    for (let i = 0; i < 6; i++) {
      const brick = new Brick(this);
      brick.position.x = 200 + i * brick.size.width + i;
      brick.position.y = brickTop + 2 * brick.size.height + 1;
      brick.health = 3;
      this.bricks.push(brick);
    }
  };

  reset = () => {
    this.player.reset();
    this.ball.reset();
    this.setupBricks();
  };
}

class Player {
  app: App;
  position: Coordinates;
  score: number;
  lives: number;
  physics: { speed: number };
  size: Dimensions;

  constructor(app: App) {
    this.app = app;
    this.position = { x: 200, y: 480 };
    this.score = 0;
    this.lives = 3;
    this.physics = { speed: 10 };
    this.size = { height: 20, width: 150 };
  }

  draw = () => {
    if (!this.app.context) {
      return;
    }

    this.app.context.fillStyle = 'black';
    this.app.context.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    );
  };

  moveLeft = () => {
    if (this.position.x > 0) {
      this.position.x -= this.physics.speed * 1.5;
    }
  };

  moveRight = () => {
    if (!this.app.canvas) {
      return;
    }

    if (this.position.x < this.app.canvas.width - this.size.width) {
      this.position.x += this.physics.speed * 1.5;
    }
  };

  reset = () => {
    this.lives = 3;
    this.score = 0;
    this.resetPosition();
  };

  resetPosition = () => {
    this.position.x = 200;
  };
}

class Ball {
  app: App;
  position: Coordinates;
  size: Dimensions;
  physics: { speed: number };
  direction: Coordinates;

  constructor(app: App) {
    this.app = app;
    this.position = { x: 0, y: 250 };
    this.size = { height: 10, width: 10 };
    this.physics = { speed: 5 };
    this.direction = { x: Math.cos(Math.PI / 4), y: Math.sin(Math.PI / 4) };
  }

  draw = () => {
    if (!this.app.context) {
      return;
    }

    const context = this.app.context;
    const centerX = this.position.x;
    const centerY = this.position.y;
    const radius = 10;

    context.fillStyle = 'transparent';
    context.beginPath();
    context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'black';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = 'black';
    context.stroke();
  };

  reset = () => {
    this.position.x = 0;
    this.position.y = 250;
    this.direction.x = Math.cos(Math.PI / 4);
    this.direction.y = Math.sin(Math.PI / 4);
  };

  update = () => {
    if (!this.app.canvas) {
      return;
    }

    if (this.position.x < 0 || this.position.x > this.app.canvas.width)
      //Left and Right Bounds
      this.direction.x = -this.direction.x;
    if (this.position.y < 0)
      //Top Bounds
      this.direction.y = -this.direction.y;
    if (this.position.y > this.app.canvas.height)
      //Bottom Bounds
      this.app.die(); //TODO: die

    if (!this.app.waiting && !this.app.inStasis) {
      this.checkCollisionWithPlayer();
      this.checkCollisionWithBricks();

      this.position.x += this.physics.speed * this.direction.x;
      this.position.y += this.physics.speed * this.direction.y;
    }

    this.draw();
  };

  checkCollisionWithPlayer = () => {
    if (this.position.y + this.size.height < this.app.player.position.y) return;
    if (
      this.position.y >
      this.app.player.position.y + this.app.player.size.height
    )
      return;
    if (
      this.position.x >
      this.app.player.position.x + this.app.player.size.width
    )
      return;
    if (this.position.x + this.size.width < this.app.player.position.x) return;

    // Maps a value from the "in" range to the "out" range. Maybe this should go in a Mathy utils file?
    const mapValue = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
      return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }
    // Moving up with a custom angle, based on where the ball is hit
    const hitPosition = this.position.x - this.app.player.position.x;
    const angle = mapValue(hitPosition, 0, this.app.player.size.width, 0 + 0.5, Math.PI - 0.5);
    const vx = Math.cos(angle);
    const vy = Math.sin(angle);
    this.direction.x = -vx;
    this.direction.y = -vy;
  };

  checkCollisionWithBricks = () => {
    for (let i = 0; i < this.app.bricks.length; i++) {
      const brick = this.app.bricks[i];

      if (this.position.y + this.size.height < brick.position.y) continue;
      if (this.position.y > brick.position.y + brick.size.height) continue;
      if (this.position.x > brick.position.x + brick.size.width) continue;
      if (this.position.x + this.size.width < brick.position.x) continue;

      /* If the loop makes it this far, we have a collision */
      brick.health -= 1;

      this.app.player.score += 20;

      if (brick.health < 1) this.app.bricks.splice(i, 1);

      //Update direction based on where we hit the brick

      //Moving towards lower right
      if (this.direction.x > 0 && this.direction.y > 0) {
        if (this.position.y > brick.position.y) this.direction.x = -this.direction.x;
        else this.direction.y = -this.direction.y;
      }
      //Moving towards lower left
      else if (this.direction.x < 0 && this.direction.y > 0) {
        if (this.position.y > brick.position.y) this.direction.x = -this.direction.x;
        else this.direction.y = -this.direction.y;
      }
      //Moving towards upper right
      else if (this.direction.x > 0 && this.direction.y < 0) {
        if (this.position.x > brick.position.x) this.direction.y = -this.direction.y;
        else this.direction.x = -this.direction.x;
      }
      //Moving towards upper-left
      else if (this.direction.x < 0 && this.direction.y < 0) {
        if (this.position.x > brick.position.x + brick.size.width) this.direction.x = -this.direction.x;
        else this.direction.y = -this.direction.y;
      }
    }
  };
}

class Brick {
  app: App;
  health: number;
  size: Dimensions;
  position: Coordinates;

  constructor(app: App) {
    this.app = app;
    this.health = 3;
    this.size = { height: 20, width: 60 };
    this.position = { x: 0, y: 0 };
  }

  draw = () => {
    if (!this.app.context) {
      return;
    }

    switch (this.health) {
      case 3:
        this.app.context.fillStyle = 'rgb(0, 240, 0)'; //Green
        break;
      case 2:
        this.app.context.fillStyle = 'rgb(255, 140, 0)'; //Orange
        break;
      case 1:
        this.app.context.fillStyle = 'rgb(200, 0, 0)'; //Red
        break;
      default:
        break;
    }

    if (this.health > 0) {
      this.app.context.fillRect(
        this.position.x,
        this.position.y,
        this.size.width - 5,
        this.size.height - 5
      );
    }
  };
}

export default App;
