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
  animationFrameId: number | null;
  canvasWidth: number;
  canvasHeight: number;
  private eventListeners: Array<{ event: string; handler: EventListener }>;

  constructor() {
    this.initialized = false;
    this.waiting = true;
    this.player = new Player(this);
    this.ball = new Ball(this);
    this.bricks = [];
    this.canvas = document.querySelector("#brickBreakerCanvas");
    this.context = this.canvas ? this.canvas.getContext("2d") : null;
    this.timeout = 33;
    this.inStasis = false;
    this.animationFrameId = null;
    this.canvasWidth = this.canvas?.width ?? 0;
    this.canvasHeight = this.canvas?.height ?? 0;
    this.eventListeners = [];
  }

  init = () => {
    if (!this.context) {
      console.error("Error getting application context");
      return;
    }

    const centerClickHandler = this.handleCenterClick;
    window.addEventListener("centerclick", centerClickHandler);
    this.eventListeners.push({
      event: "centerclick",
      handler: centerClickHandler,
    });

    this.inStasis = false;

    if (!this.initialized) {
      const forwardScrollHandler = () => this.player.moveRight();
      const backwardScrollHandler = () => this.player.moveLeft();
      const menuClickHandler = () => {
        this.inStasis = true;
      };

      window.addEventListener("forwardscroll", forwardScrollHandler, true);
      window.addEventListener("backwardscroll", backwardScrollHandler, true);
      window.addEventListener("menuclick", menuClickHandler);

      this.eventListeners.push(
        { event: "forwardscroll", handler: forwardScrollHandler },
        { event: "backwardscroll", handler: backwardScrollHandler },
        { event: "menuclick", handler: menuClickHandler }
      );

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

    this.animationFrameId = requestAnimationFrame(() => {
      this.update();
    });
  };

  clearContext = () => {
    if (this.context && this.canvas) {
      this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
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

  cleanup = () => {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.eventListeners.forEach(({ event, handler }) => {
      window.removeEventListener(event, handler);
    });
    this.eventListeners = [];

    this.initialized = false;
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

    this.app.context.fillStyle = "black";
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

    if (this.position.x < this.app.canvasWidth - this.size.width) {
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
  readonly radius: number = 10;

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

    context.beginPath();
    context.arc(centerX, centerY, this.radius, 0, 2 * Math.PI, false);
    context.fillStyle = "black";
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = "black";
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

    if (this.position.x < 0 || this.position.x > this.app.canvasWidth)
      this.direction.x = -this.direction.x;
    if (this.position.y < 0) this.direction.y = -this.direction.y;
    if (this.position.y > this.app.canvasHeight) this.app.die();

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
    const mapValue = (
      value: number,
      inMin: number,
      inMax: number,
      outMin: number,
      outMax: number
    ) => {
      return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    };
    // Moving up with a custom angle, based on where the ball is hit
    const hitPosition = this.position.x - this.app.player.position.x;
    const angle = mapValue(
      hitPosition,
      0,
      this.app.player.size.width,
      0 + 0.5,
      Math.PI - 0.5
    );
    const vx = Math.cos(angle);
    const vy = Math.sin(angle);
    this.direction.x = -vx;
    this.direction.y = -vy;
  };

  checkCollisionWithBricks = () => {
    for (let i = this.app.bricks.length - 1; i >= 0; i--) {
      const brick = this.app.bricks[i];

      if (this.position.y + this.size.height < brick.position.y) continue;
      if (this.position.y > brick.position.y + brick.size.height) continue;
      if (this.position.x > brick.position.x + brick.size.width) continue;
      if (this.position.x + this.size.width < brick.position.x) continue;

      brick.health -= 1;

      this.app.player.score += 20;

      if (brick.health < 1) this.app.bricks.splice(i, 1);

      if (this.direction.x > 0 && this.direction.y > 0) {
        if (this.position.y > brick.position.y)
          this.direction.x = -this.direction.x;
        else this.direction.y = -this.direction.y;
      } else if (this.direction.x < 0 && this.direction.y > 0) {
        if (this.position.y > brick.position.y)
          this.direction.x = -this.direction.x;
        else this.direction.y = -this.direction.y;
      } else if (this.direction.x > 0 && this.direction.y < 0) {
        if (this.position.x > brick.position.x)
          this.direction.y = -this.direction.y;
        else this.direction.x = -this.direction.x;
      } else if (this.direction.x < 0 && this.direction.y < 0) {
        if (this.position.x > brick.position.x + brick.size.width)
          this.direction.x = -this.direction.x;
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
    if (!this.app.context || this.health < 1) {
      return;
    }

    switch (this.health) {
      case 3:
        this.app.context.fillStyle = "rgb(0, 240, 0)";
        break;
      case 2:
        this.app.context.fillStyle = "rgb(255, 140, 0)";
        break;
      case 1:
        this.app.context.fillStyle = "rgb(200, 0, 0)";
        break;
      default:
        break;
    }

    this.app.context.fillRect(
      this.position.x,
      this.position.y,
      this.size.width - 5,
      this.size.height - 5
    );
  };
}

export default App;
