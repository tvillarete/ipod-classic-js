type Dimensions = { width: number; height: number };
type Coordinates = { x: number; y: number };
type BrickColor = "RED" | "ORANGE" | "YELLOW" | "GREEN" | "BLUE";
type GamePhase = "waiting" | "playing" | "gameOver";
type GameOverMenuItem = "newGame" | "quit";

const GAME_OVER_ITEMS: GameOverMenuItem[] = ["newGame", "quit"];

const gameOverMenuItemLabel = (item: GameOverMenuItem): string => {
  switch (item) {
    case "newGame":
      return "New Game";
    case "quit":
      return "Quit";
  }
};

const BASE_CANVAS = {
  WIDTH: 340,
  HEIGHT: 260,
};

const GAME_CONSTANTS = {
  PLAYER: {
    BOTTOM_OFFSET: 3, // Distance from bottom of screen
    INITIAL_LIVES: 3,
    WIDTH: 70,
    HEIGHT: 8,
    SPEED: 3,
    SPEED_MULTIPLIER: 1,
    FRICTION: 0.85,
    VELOCITY_STOP_THRESHOLD: 0.1,
  },
  BALL: {
    LEFT_OFFSET: 8, // Distance from left edge
    RADIUS: 6,
    SPEED: 2,
    INITIAL_ANGLE: Math.PI / 4,
    LIGHT_OFFSET: 0.25,
    LIGHT_INNER_RADIUS: 0.05,
    GRADIENT_MID_STOP: 0.3,
  },
  BRICK: {
    TOP_MARGIN: 6,
    SPACING: 3,
    HEIGHT: 12,
    ROWS: 5,
    COLS: 8,
    COLORS: {
      RED: {
        TOP: "rgb(255, 196, 196)",
        BOTTOM: "rgb(239, 26, 26)",
        POINTS: 7,
      },
      ORANGE: {
        TOP: "rgb(255, 202, 161)",
        BOTTOM: "rgb(255, 120, 30)",
        POINTS: 5,
      },
      YELLOW: {
        TOP: "rgb(254, 242, 189)",
        BOTTOM: "rgb(240, 195, 31)",
        POINTS: 3,
      },
      GREEN: {
        TOP: "rgb(167, 255, 209)",
        BOTTOM: "rgb(23, 200, 112)",
        POINTS: 1,
      },
      BLUE: {
        TOP: "rgb(140, 200, 255)",
        BOTTOM: "rgb(0, 100, 222)",
        POINTS: 1,
      },
    },
  },
  CANVAS: {
    BACKGROUND: {
      TOP: "rgb(64, 162, 247)",
      BOTTOM: "rgb(141, 204, 254)",
    },
    COLORS: {
      PLAYER: {
        TOP: "rgb(199, 199, 199)",
        MIDDLE: "rgb(85, 85, 85)",
        BOTTOM: "rgb(111, 111, 111)",
      },
      BALL: {
        CENTER: "rgb(171, 171, 171)",
        MIDDLE: "rgb(98, 98, 98)",
        EDGE: "rgb(67, 67, 67)",
      },
    },
    SHADOW: {
      COLOR: "rgba(0, 0, 0, 0.4)",
      BRICK_COLOR: "rgba(0, 0, 0, 0.3)",
      BLUR: 4,
      BRICK_BLUR: 3,
      OFFSET_Y: 2,
    },
    BORDER: {
      PLAYER_COLOR: "rgba(0, 0, 0, 0.5)",
      LINE_WIDTH: 1,
    },
  },
  COLLISION: {
    MIN_BOUNCE_ANGLE: Math.PI / 6,
    MAX_BOUNCE_ANGLE: (5 * Math.PI) / 6,
  },
} as const;

const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number => {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
};

const checkAABBCollision = (
  obj1Pos: Coordinates,
  obj1Size: Dimensions,
  obj2Pos: Coordinates,
  obj2Size: Dimensions
): boolean => {
  return !(
    obj1Pos.y + obj1Size.height < obj2Pos.y ||
    obj1Pos.y > obj2Pos.y + obj2Size.height ||
    obj1Pos.x > obj2Pos.x + obj2Size.width ||
    obj1Pos.x + obj1Size.width < obj2Pos.x
  );
};

class App {
  initialized: boolean;
  phase: GamePhase;
  level: number;
  gameOverMenuIndex: number;
  player: Player;
  ball: Ball;
  bricks: Array<Brick>;
  canvas: HTMLCanvasElement | null;
  context: CanvasRenderingContext2D | null;
  animationFrameId: number | null;
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
  private onQuit: (() => void) | null;
  private eventListeners: Array<{ event: string; handler: EventListener }>;

  constructor(
    canvasWidth?: number,
    canvasHeight?: number,
    onQuit?: () => void
  ) {
    this.initialized = false;
    this.phase = "waiting";
    this.level = 1;
    this.gameOverMenuIndex = 0;
    this.canvas = document.querySelector("#brickBreakerCanvas");
    this.context = this.canvas ? this.canvas.getContext("2d") : null;
    this.canvasWidth = canvasWidth ?? this.canvas?.width ?? 0;
    this.canvasHeight = canvasHeight ?? this.canvas?.height ?? 0;
    this.scale = this.canvasWidth / BASE_CANVAS.WIDTH;
    this.player = new Player(this);
    this.ball = new Ball(this);
    this.bricks = [];
    this.animationFrameId = null;
    this.onQuit = onQuit ?? null;
    this.eventListeners = [];
  }

  init = () => {
    if (!this.context) {
      console.error("Error getting application context");
      return;
    }

    this.context.imageSmoothingEnabled = true;
    this.context.imageSmoothingQuality = "high";

    if (!this.initialized) {
      const centerClickHandler = this.handleCenterClick;
      const forwardScrollHandler = () => this.handleScroll("forward");
      const backwardScrollHandler = () => this.handleScroll("backward");

      window.addEventListener("centerclick", centerClickHandler);
      window.addEventListener("forwardscroll", forwardScrollHandler, true);
      window.addEventListener("backwardscroll", backwardScrollHandler, true);

      this.eventListeners.push(
        { event: "centerclick", handler: centerClickHandler },
        { event: "forwardscroll", handler: forwardScrollHandler },
        { event: "backwardscroll", handler: backwardScrollHandler }
      );

      this.setupBricks();
      this.player.draw();
      this.drawBricks();
      this.ball.update();
      this.update();

      this.initialized = true;
    }
  };

  private handleScroll = (direction: "forward" | "backward") => {
    if (this.phase === "gameOver") {
      if (direction === "forward") {
        this.gameOverMenuIndex = Math.min(
          this.gameOverMenuIndex + 1,
          GAME_OVER_ITEMS.length - 1
        );
      } else {
        this.gameOverMenuIndex = Math.max(this.gameOverMenuIndex - 1, 0);
      }
      return;
    }

    if (this.phase === "playing" || this.phase === "waiting") {
      direction === "forward"
        ? this.player.moveRight()
        : this.player.moveLeft();
    }
  };

  handleCenterClick = () => {
    if (this.phase === "gameOver") {
      this.handleGameOverMenuSelect();
      return;
    }

    if (this.phase === "waiting") {
      this.phase = "playing";
    }
  };

  private handleGameOverMenuSelect = () => {
    const selected = GAME_OVER_ITEMS[this.gameOverMenuIndex];
    switch (selected) {
      case "newGame":
        this.reset();
        break;
      case "quit":
        this.onQuit?.();
        break;
    }
  };

  update = () => {
    this.clearContext();

    if (this.phase !== "gameOver") {
      this.player.update();
    }

    this.player.draw();
    this.drawBricks();

    if (this.phase !== "gameOver") {
      this.ball.update();
    } else {
      this.ball.draw();
    }

    this.drawHud();

    if (this.phase === "gameOver") {
      this.drawGameOverOverlay();
    }

    this.animationFrameId = requestAnimationFrame(() => {
      this.update();
    });
  };

  clearContext = () => {
    if (this.context && this.canvas) {
      const gradient = this.context.createLinearGradient(
        0,
        0,
        0,
        this.canvasHeight
      );
      gradient.addColorStop(0.5, GAME_CONSTANTS.CANVAS.BACKGROUND.TOP);
      gradient.addColorStop(1, GAME_CONSTANTS.CANVAS.BACKGROUND.BOTTOM);
      this.context.fillStyle = gradient;
      this.context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
  };

  die = () => {
    this.player.lives -= 1;

    if (this.player.lives < 1) {
      this.phase = "gameOver";
      this.gameOverMenuIndex = 0;
      return;
    }

    this.player.resetPosition();
    this.ball.resetToPlayer(this.player);
    this.phase = "waiting";
  };

  drawBricks = () => {
    for (const brick of this.bricks) {
      brick.draw();
    }
  };

  setupBricks = () => {
    this.bricks = [];

    const brickConfigs: Array<{ color: BrickColor; rowIndex: number }> = [
      { color: "RED", rowIndex: 0 },
      { color: "ORANGE", rowIndex: 1 },
      { color: "YELLOW", rowIndex: 2 },
      { color: "GREEN", rowIndex: 3 },
      { color: "BLUE", rowIndex: 4 },
    ];

    const rightMargin = 4 * this.scale;
    const leftMargin = 60 * this.scale;
    const availableWidth = this.canvasWidth - rightMargin - leftMargin;
    const spacing = GAME_CONSTANTS.BRICK.SPACING * this.scale;
    const totalSpacing = (GAME_CONSTANTS.BRICK.COLS - 1) * spacing;
    const brickWidth =
      (availableWidth - totalSpacing) / GAME_CONSTANTS.BRICK.COLS;
    const brickHeight = GAME_CONSTANTS.BRICK.HEIGHT * this.scale;
    const startX = leftMargin;

    brickConfigs.forEach(({ color, rowIndex }) => {
      for (let i = 0; i < GAME_CONSTANTS.BRICK.COLS; i++) {
        const brick = new Brick(this, color);
        brick.size.width = brickWidth;
        brick.size.height = brickHeight;
        brick.position.x = startX + i * (brickWidth + spacing);
        brick.position.y =
          GAME_CONSTANTS.BRICK.TOP_MARGIN * this.scale +
          rowIndex * (brickHeight + spacing);
        this.bricks.push(brick);
      }
    });
  };

  advanceLevel = () => {
    this.level += 1;
    this.setupBricks();
    this.ball.setSpeed(
      (GAME_CONSTANTS.BALL.SPEED + (this.level - 1) * 0.3) * this.scale
    );
    this.player.resetPosition();
    this.ball.resetToPlayer(this.player);
    this.phase = "waiting";
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
    this.level = 1;
    this.player.reset();
    this.ball.setSpeed(GAME_CONSTANTS.BALL.SPEED * this.scale);
    this.ball.resetToPlayer(this.player);
    this.setupBricks();
    this.phase = "waiting";
  };

  private drawHud = () => {
    if (!this.context) return;
    const ctx = this.context;
    const s = this.scale;

    ctx.save();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    const marginCenterX = 30 * s;

    const scoreFontSize = Math.round(10 * s);
    ctx.font = `bold ${scoreFontSize}px -apple-system, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(`${this.player.score}`, marginCenterX, 8 * s);

    const ballRadius = 2.5 * s;
    const ballSpacing = 8 * s;
    const livesStartY = 24 * s;
    const totalLivesWidth = (this.player.lives - 1) * ballSpacing;
    const startX = marginCenterX - totalLivesWidth / 2;

    for (let i = 0; i < this.player.lives; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * ballSpacing, livesStartY, ballRadius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.fill();
    }

    ctx.restore();
  };

  private drawGameOverOverlay = () => {
    if (!this.context) return;
    const ctx = this.context;
    const s = this.scale;

    ctx.save();
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    const panelWidth = 160 * s;
    const titleHeight = 28 * s;
    const scoreHeight = 20 * s;
    const itemHeight = 22 * s;
    const bottomPad = 8 * s;
    const panelHeight =
      titleHeight + scoreHeight + GAME_OVER_ITEMS.length * itemHeight + bottomPad;
    const panelX = (this.canvasWidth - panelWidth) / 2;
    const panelY = (this.canvasHeight - panelHeight) / 2;
    const cornerRadius = 8 * s;

    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, cornerRadius);
    ctx.fill();

    const titleFontSize = Math.round(14 * s);
    ctx.font = `bold ${titleFontSize}px -apple-system, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Game Over", this.canvasWidth / 2, panelY + titleHeight / 2);

    const scoreFontSize = Math.round(11 * s);
    ctx.font = `${scoreFontSize}px -apple-system, "Helvetica Neue", sans-serif`;
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText(
      `Score: ${this.player.score}`,
      this.canvasWidth / 2,
      panelY + titleHeight + scoreHeight / 2
    );

    const itemFontSize = Math.round(12 * s);
    const itemsStartY = panelY + titleHeight + scoreHeight;
    const itemPaddingX = 10 * s;

    GAME_OVER_ITEMS.forEach((item, index) => {
      const itemY = itemsStartY + index * itemHeight;

      if (index === this.gameOverMenuIndex) {
        ctx.fillStyle = "rgba(64, 162, 247, 0.9)";
        ctx.beginPath();
        ctx.roundRect(
          panelX + itemPaddingX,
          itemY,
          panelWidth - itemPaddingX * 2,
          itemHeight - 2 * s,
          4 * s
        );
        ctx.fill();
      }

      ctx.font = `${itemFontSize}px -apple-system, "Helvetica Neue", sans-serif`;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        gameOverMenuItemLabel(item),
        this.canvasWidth / 2,
        itemY + (itemHeight - 2 * s) / 2
      );
    });

    ctx.restore();
  };
}

class Player {
  app: App;
  position: Coordinates;
  score: number;
  lives: number;
  physics: { speed: number; velocity: number; friction: number };
  size: Dimensions;

  constructor(app: App) {
    this.app = app;
    this.size = {
      height: GAME_CONSTANTS.PLAYER.HEIGHT * app.scale,
      width: GAME_CONSTANTS.PLAYER.WIDTH * app.scale,
    };
    this.position = {
      x: (app.canvasWidth - this.size.width) / 2, // Center horizontally
      y:
        app.canvasHeight -
        this.size.height -
        GAME_CONSTANTS.PLAYER.BOTTOM_OFFSET * app.scale,
    };
    this.score = 0;
    this.lives = GAME_CONSTANTS.PLAYER.INITIAL_LIVES;
    this.physics = {
      speed: GAME_CONSTANTS.PLAYER.SPEED * app.scale,
      velocity: 0,
      friction: GAME_CONSTANTS.PLAYER.FRICTION,
    };
  }

  draw = () => {
    if (!this.app.context) {
      return;
    }

    const context = this.app.context;

    // Create vertical linear gradient for paddle
    const gradient = context.createLinearGradient(
      this.position.x,
      this.position.y,
      this.position.x,
      this.position.y + this.size.height
    );
    gradient.addColorStop(0, GAME_CONSTANTS.CANVAS.COLORS.PLAYER.TOP);
    gradient.addColorStop(0.5, GAME_CONSTANTS.CANVAS.COLORS.PLAYER.MIDDLE);
    gradient.addColorStop(1, GAME_CONSTANTS.CANVAS.COLORS.PLAYER.BOTTOM);

    // Add shadow
    context.shadowColor = GAME_CONSTANTS.CANVAS.SHADOW.COLOR;
    context.shadowBlur = GAME_CONSTANTS.CANVAS.SHADOW.BLUR * this.app.scale;
    context.shadowOffsetX = 0;
    context.shadowOffsetY =
      GAME_CONSTANTS.CANVAS.SHADOW.OFFSET_Y * this.app.scale;

    context.fillStyle = gradient;
    context.fillRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    );

    // Clear shadow for border
    context.shadowColor = "transparent";
    context.shadowBlur = 0;

    // Add border
    context.strokeStyle = GAME_CONSTANTS.CANVAS.BORDER.PLAYER_COLOR;
    context.lineWidth =
      GAME_CONSTANTS.CANVAS.BORDER.LINE_WIDTH * this.app.scale;
    context.strokeRect(
      this.position.x,
      this.position.y,
      this.size.width,
      this.size.height
    );
  };

  update = () => {
    // Apply velocity to position
    this.position.x += this.physics.velocity;

    // Apply friction to slow down
    this.physics.velocity *= this.physics.friction;

    // Stop if velocity is very small
    if (
      Math.abs(this.physics.velocity) <
      GAME_CONSTANTS.PLAYER.VELOCITY_STOP_THRESHOLD
    ) {
      this.physics.velocity = 0;
    }

    // Clamp position to canvas bounds
    const maxX = this.app.canvasWidth - this.size.width;
    this.position.x = Math.max(0, Math.min(maxX, this.position.x));
  };

  moveLeft = () => {
    const moveAmount =
      this.physics.speed * GAME_CONSTANTS.PLAYER.SPEED_MULTIPLIER;
    this.physics.velocity -= moveAmount;

    // Cap maximum velocity
    const maxVelocity = this.physics.speed * 3;
    this.physics.velocity = Math.max(-maxVelocity, this.physics.velocity);
  };

  moveRight = () => {
    const moveAmount =
      this.physics.speed * GAME_CONSTANTS.PLAYER.SPEED_MULTIPLIER;
    this.physics.velocity += moveAmount;

    // Cap maximum velocity
    const maxVelocity = this.physics.speed * 3;
    this.physics.velocity = Math.min(maxVelocity, this.physics.velocity);
  };

  reset = () => {
    this.lives = GAME_CONSTANTS.PLAYER.INITIAL_LIVES;
    this.score = 0;
    this.resetPosition();
  };

  resetPosition = () => {
    this.position.x = (this.app.canvasWidth - this.size.width) / 2;
    this.position.y =
      this.app.canvasHeight -
      this.size.height -
      GAME_CONSTANTS.PLAYER.BOTTOM_OFFSET * this.app.scale;
  };
}

class Ball {
  app: App;
  position: Coordinates;
  size: Dimensions;
  physics: { speed: number };
  direction: Coordinates;
  radius: number;

  constructor(app: App) {
    this.app = app;
    this.radius = GAME_CONSTANTS.BALL.RADIUS * app.scale;
    this.size = {
      height: this.radius * 2,
      width: this.radius * 2,
    };
    this.physics = { speed: GAME_CONSTANTS.BALL.SPEED * app.scale };
    this.position = {
      x: app.player.position.x + app.player.size.width / 2,
      y:
        app.player.position.y - this.radius - 1,
    };
    this.direction = {
      x: Math.cos(GAME_CONSTANTS.BALL.INITIAL_ANGLE),
      y: -Math.abs(Math.sin(GAME_CONSTANTS.BALL.INITIAL_ANGLE)),
    };
  }

  draw = () => {
    if (!this.app.context) {
      return;
    }

    const context = this.app.context;

    // Use sub-pixel positioning for smoother rendering
    const x = this.position.x;
    const y = this.position.y;

    // Create radial gradient for ball with subtle light source from top-left
    const gradient = context.createRadialGradient(
      x - this.radius * GAME_CONSTANTS.BALL.LIGHT_OFFSET,
      y - this.radius * GAME_CONSTANTS.BALL.LIGHT_OFFSET,
      this.radius * GAME_CONSTANTS.BALL.LIGHT_INNER_RADIUS,
      x,
      y,
      this.radius
    );
    gradient.addColorStop(0, GAME_CONSTANTS.CANVAS.COLORS.BALL.CENTER);
    gradient.addColorStop(
      GAME_CONSTANTS.BALL.GRADIENT_MID_STOP,
      GAME_CONSTANTS.CANVAS.COLORS.BALL.MIDDLE
    );
    gradient.addColorStop(1, GAME_CONSTANTS.CANVAS.COLORS.BALL.EDGE);

    // Add shadow
    context.shadowColor = GAME_CONSTANTS.CANVAS.SHADOW.COLOR;
    context.shadowBlur = GAME_CONSTANTS.CANVAS.SHADOW.BLUR * this.app.scale;
    context.shadowOffsetX = 0;
    context.shadowOffsetY =
      GAME_CONSTANTS.CANVAS.SHADOW.OFFSET_Y * this.app.scale;

    context.beginPath();
    context.arc(x, y, this.radius, 0, 2 * Math.PI, false);
    context.fillStyle = gradient;
    context.fill();

    // Clear shadow
    context.shadowColor = "transparent";
    context.shadowBlur = 0;
  };

  resetToPlayer = (player: Player) => {
    this.position.x = player.position.x + player.size.width / 2;
    this.position.y = player.position.y - this.radius - 1;
    this.direction.x = Math.cos(GAME_CONSTANTS.BALL.INITIAL_ANGLE);
    this.direction.y = -Math.abs(Math.sin(GAME_CONSTANTS.BALL.INITIAL_ANGLE));
  };

  setSpeed = (speed: number) => {
    this.physics.speed = speed;
  };

  update = () => {
    if (!this.app.canvas) {
      return;
    }

    if (this.position.x < 0 || this.position.x > this.app.canvasWidth)
      this.direction.x = -this.direction.x;
    if (this.position.y < 0) this.direction.y = -this.direction.y;
    if (this.position.y > this.app.canvasHeight) this.app.die();

    if (this.app.phase === "playing") {
      this.checkCollisionWithPlayer();
      this.checkCollisionWithBricks();

      if (this.app.phase === "playing") {
        this.position.x += this.physics.speed * this.direction.x;
        this.position.y += this.physics.speed * this.direction.y;
      }
    }

    this.draw();
  };

  checkCollisionWithPlayer = () => {
    if (
      !checkAABBCollision(
        this.position,
        this.size,
        this.app.player.position,
        this.app.player.size
      )
    ) {
      return;
    }

    const hitPosition = this.position.x - this.app.player.position.x;
    const angle = mapRange(
      hitPosition,
      0,
      this.app.player.size.width,
      GAME_CONSTANTS.COLLISION.MIN_BOUNCE_ANGLE,
      GAME_CONSTANTS.COLLISION.MAX_BOUNCE_ANGLE
    );
    this.direction.x = -Math.cos(angle);
    this.direction.y = -Math.sin(angle);
  };

  checkCollisionWithBricks = () => {
    for (let i = this.app.bricks.length - 1; i >= 0; i--) {
      const brick = this.app.bricks[i];

      if (
        !checkAABBCollision(
          this.position,
          this.size,
          brick.position,
          brick.size
        )
      ) {
        continue;
      }

      this.app.player.score += brick.pointValue;
      this.app.bricks.splice(i, 1);

      if (this.app.bricks.length === 0) {
        this.app.advanceLevel();
        return;
      }

      this.updateDirectionAfterBrickCollision(brick);
      break;
    }
  };

  private updateDirectionAfterBrickCollision = (brick: Brick) => {
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
  };
}

class Brick {
  app: App;
  color: BrickColor;
  pointValue: number;
  size: Dimensions;
  position: Coordinates;

  constructor(app: App, color: BrickColor) {
    this.app = app;
    this.color = color;
    this.pointValue = GAME_CONSTANTS.BRICK.COLORS[color].POINTS;
    this.size = {
      height: GAME_CONSTANTS.BRICK.HEIGHT * app.scale,
      width: 0,
    };
    this.position = { x: 0, y: 0 };
  }

  draw = () => {
    if (!this.app.context) {
      return;
    }

    const colorConfig = GAME_CONSTANTS.BRICK.COLORS[this.color];
    const spacing = GAME_CONSTANTS.BRICK.SPACING * this.app.scale;
    const brickWidth = this.size.width - spacing;
    const brickHeight = this.size.height - spacing;

    const gradient = this.app.context.createLinearGradient(
      this.position.x,
      this.position.y,
      this.position.x,
      this.position.y + brickHeight
    );
    gradient.addColorStop(0, colorConfig.TOP);
    gradient.addColorStop(0.5, colorConfig.BOTTOM);

    this.app.context.shadowColor = GAME_CONSTANTS.CANVAS.SHADOW.BRICK_COLOR;
    this.app.context.shadowBlur =
      GAME_CONSTANTS.CANVAS.SHADOW.BRICK_BLUR * this.app.scale;
    this.app.context.shadowOffsetX = 0;
    this.app.context.shadowOffsetY =
      GAME_CONSTANTS.CANVAS.SHADOW.OFFSET_Y * this.app.scale;

    this.app.context.fillStyle = gradient;
    this.app.context.beginPath();
    this.app.context.roundRect(
      this.position.x,
      this.position.y,
      brickWidth,
      brickHeight,
      0
    );
    this.app.context.fill();

    this.app.context.shadowColor = "transparent";
    this.app.context.shadowBlur = 0;

    this.app.context.strokeStyle = colorConfig.BOTTOM;
    this.app.context.lineWidth = GAME_CONSTANTS.CANVAS.BORDER.LINE_WIDTH;
    this.app.context.stroke();
  };
}

export default App;
