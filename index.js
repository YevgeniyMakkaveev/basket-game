class MainScene extends Phaser.Scene {
  constructor() {
    super("Main");
    console.log("Scene".this);
  }
  init() {
    this.centerX = 320;
    this.centerY = 320;
    this.scoreCount = null;
    this.recordCount = this.game.data.recordCount || 0;
    this.basketCount = this.game.data.basketCount || 0;
    this.bonus = null;
    this.initFont();
  }
  initFont() {
    this.countStyle = {
      font: "10em montserrat",
      fill: "white",
    };
    this.miniCountStyle = {
      font: "3em montserrat",
      fill: "white",
    };
    this.bonusStyle = {
      font: "4em montserrat",
      fill: "#FFDA87",
    };
  }
  preload() {
    this.load.image("shield", "assets/sprites/shield.png");
    this.load.image("floor", "assets/sprites/floor.png");
    this.load.image("ball", "assets/sprites/ball.png");
    this.load.image("ball_shadow", "./assets/sprites/ball_shadow.png");
    this.load.image("ring", "./assets/sprites/ring.png");
    this.load.image("menu", "./assets/sprites/menu.png");
    this.load.audio("aaaaa", "./assets/sound/aaaaa.mp3");

    this.load.audio("ball_bounce", "./assets/sound/ball_bounce.mp3");
    this.load.audio("bell", "./assets/sound/bell.mp3");
    this.load.audio("clean_goal", "./assets/sound/clean_goal.mp3");
    this.load.audio("dirty_goal", "./assets/sound/dirty_goal.mp3");
    this.load.audio("ring_impact", "./assets/sound/ring_impact.mp3");
    this.load.audio("woosh", "./assets/sound/woosh.mp3");
    this.load.plugin(
      "rexdragplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexdragplugin.min.js",
      true
    );
  }
  create() {
    this.shield = this.add.image(80, 200, "shield").setOrigin(0);
    this.ring = this.add
      .image(this.centerX, this.centerY + 136, "ring")
      .setOrigin(0.5, 0)
      .setDepth(10);
    this.floor = this.add.image(this.centerX, this.centerY + 620, "floor");
    this.shadow = this.add.image(this.centerX - 10, 950, "ball_shadow");
    this.createBall();
    this.createPins();
    this.ballReset();
    this.addColide();
    this.addCounter();
    this.createSound();
  }

  createPins() {
    this.leftPin = this.add
      .circle(this.ring.x + 35, this.ring.y + 127)
      .setName("leftPin");
    this.rightPin = this.add
      .circle(this.ring.x + 210, this.ring.y + 127)
      .setName("rightPin");
    this.physics.add.existing(this.leftPin);
    this.physics.add.existing(this.rightPin);
    this.leftPin.body.setCircle(6).setImmovable();
    this.leftPin.body.allowGravity = false;
    this.rightPin.body.setCircle(6).setImmovable();
    this.rightPin.body.allowGravity = false;
  }
  createSound() {
    this.sounds = {
      ball_bounce: this.sound.add("ball_bounce", { volume: 0.5 }),
      aaaaa: this.sound.add("aaaaa", { volume: 0.5 }),
      bell: this.sound.add("bell", { volume: 0.5 }),
      clean_goal: this.sound.add("clean_goal", { volume: 0.5 }),
      dirty_goal: this.sound.add("dirty_goal", { volume: 0.5 }),
      ring_impact: this.sound.add("ring_impact", { volume: 0.5 }),
      woosh: this.sound.add("woosh", { volume: 0.5 }),
    };
  }

  addColide() {
    this.physics.add.collider(
      this.ball,
      this.leftPin,
      this.pinCollide,
      this.targetCollideControl,
      this
    );
    this.physics.add.collider(
      this.ball,
      this.rightPin,
      this.pinCollide,
      this.targetCollideControl,
      this
    );
  }
  pinCollide() {
    this.isPinCollide = true;
    this.sounds.ring_impact.play();
    let ringStartY = this.centerY + 138;
    let ringOffsetY = -10;
    this.tweens.add({
      targets: this.ring,
      y: ringStartY + ringOffsetY,
      ease: "Linear",
      repeat: 0,
      yoyo: true,
      duration: 20,
      onCompleate: () => {
        this.ring.y = ringStartY;
      },
    });
  }
  targetCollideControl() {
    if (this.ball.depth === 20) {
      return false;
    }
  }
  addCounter() {
    this.scoreCounter = this.add
      .text(320, 290, this.scoreCount, this.countStyle)
      .setOrigin(0.5);
    this.bonusCounter = this.add
      .text(320, 420, this.bonus, this.bonusStyle)
      .setOrigin(0.5);
    this.recordCounter = this.add
      .text(145, 472, this.recordCount, this.miniCountStyle)
      .setOrigin(0, 0.5)
      .setAlign("left");
    this.basketCounter = this.add
      .text(145, 502, this.basketCount, this.miniCountStyle)
      .setOrigin(0, 0.5)
      .setAlign("left");
  }
  createBall() {
    this.BallStartPointX = this.centerX;
    this.BallStartPointY = 872;
    this.ball = this.physics.add.image(
      this.BallStartPointX,
      this.BallStartPointY,
      "ball"
    );
    this.ballRadius = 90;
    this.ball.body.setCircle(this.ballRadius, 0, 0);
    this.ballSetInterective();
    this.ball.body.setBounce(0.8);
  }

  ballSetInterective = () => {
    this.drag = this.plugins
      .get("rexdragplugin")
      .add(this.ball, { enable: true });
    this.ball
      .on("dragstart", (pointer, dragX, dragY) => {
        this.timeDragStart = 0;
        // console.log(pointer, dragX, dragY);
      })
      .on("drag", (pointer, dragX, dragY) => {
        if (this.timeDragStart === 0) {
          this.timeDragStart = Date.now();
        }
        // console.log(pointer, dragX, dragY);
        if (this.BallStartPointY - this.ball.y > 60) this.ballMove();
      })
      .on("dragend", (pointer, dragX, dragY, droped) => {
        // console.log(pointer, dragX, dragY);
        if (!this.isBallMoving) {
          this.ballRelease();
        }
        // this.ball.body.velocity.y = 200;
      });
  };
  ballRelease = () => {
    console.log(this.ball);
    this.tweens.add({
      targets: this.ball,
      x: this.centerX,
      y: 872,
      ease: "Linear",
      duration: 500,
      repeat: 0,
    });
  };
  ballMove() {
    this.drag.dragend();
    this.drag.setEnable(false);
    this.ball.setActive(false);
    this.ball.body.allowGravity = true;
    let timeDrag = Date.now() - this.timeDragStart;
    let speedDrag = timeDrag * 10;
    if (speedDrag > 1000) {
      speedDrag = 1000;
    }
    this.ball.body.velocity.y = -2700 + speedDrag;
    this.ball.body.velocity.x = (this.ball.x - this.BallStartPointX) * 20;
    this.ball.setAngularVelocity(this.ball.body.velocity.x);
    this.isBallMoving = true;
    this.sounds.woosh.play();
  }
  ballReset = () => {
    this.ball.setActive(false);
    this.ball.body.allowGravity = false;
    this.isBallMoving = false;
    this.ball.depth = 20;
    if (this.isGoal) {
      this.isGoal = false;
    } else {
      this.resetCount();
      this.ringReset();
      this.bonus = null;
    }
    if (this.isPinCollide) this.isPinCollide = false;
    this.tweens.add({
      targets: this.ball,
      // alpha: 0,
      ease: "Linear",
      duration: 100,
      onCompleate: () => {
        this.ball.body.velocity.x = 0;
        this.ball.body.velocity.y = 0;
        this.ball.setAngularVelocity(0);
        this.ball.setAlpha(0);
        this.tweens.add({
          targets: this.ball,
          x: this.centerX,
          y: 872,
          ease: "Linear",
          duration: 100,
          onCompleate: () => {
            this.ball.setAlpha(1);
            this.ball.setActive(true);
            this.drag.setEnable(true);
            this.ball.setScale(1);
          },
        });
      },
    });
  };
  moveRing = () => {
    console.log(this.ring.x);
    if (this.ring.x < 100 || this.ring.x > 550) {
      this.ringReset();
    } else {
      const plusOrMinus = Math.random() < 0.5 ? -1 : 1;
      const randomOffset = Math.floor(Math.random() * 10 + 15) * plusOrMinus;
      this.ring.x = this.ring.x + randomOffset;
      this.rightPin.x += randomOffset;
      this.leftPin.x += randomOffset;
    }
  };
  ringReset() {
    this.ring.x = this.centerX;
    this.leftPin.x = this.centerX + 35;
    this.rightPin.x = this.centerX + 210;
  }
  goal = () => {
    const res = this.bonus ? this.bonus : 1;
    console.log("GOAL");
    if (this.isPinCollide) {
      this.scoreCount = (this.scoreCount + 2) * res;
      this.sounds.dirty_goal.play();
      this.bonus = null;
    } else {
      this.scoreCount = (this.scoreCount + 3) * res;
      this.sounds.clean_goal.play();
      if (!this.bonus) {
        this.bonus = 2;
      } else {
        this.bonus *= 2;
      }
    }
    this.isGoal = true;
    this.updateScore();
    this.sounds.bell.play();
    this.moveRing();
  };
  updateScore = () => {
    this.basketCount++;
    this.basketCounter.setText(this.basketCount);
    this.game.data.basketCount = this.basketCount;
    this.scoreCounter.setText(this.scoreCount);
    this.bonusCounter.setText(this.bonus);
    if (this.scoreCount > this.recordCount) {
      this.recordCount = this.scoreCount;
      this.recordCounter.setText(this.scoreCount);
      this.game.data.recordCount = this.recordCount;
    }
    console.log(this);
    this.game.saveUserData();
  };
  resetCount = () => {
    if (this.scoreCount) {
      this.sounds.aaaaa.play();
      this.scoreCount = null;
      this.bonusCounter.setText("");
      this.scoreCounter.setText(this.scoreCount);
    }
  };

  update() {
    this.shadow.x = this.ball.x;
    if (
      this.isBallMoving &&
      this.ball.body.velocity.y > 0 &&
      this.ball.y > this.BallStartPointY - 300
    ) {
      this.ballReset();
    }
    if (
      this.ball.depth === 20 &&
      this.ball.body.velocity.y > 0 &&
      this.ball.y < this.ring.y - this.ballRadius
    ) {
      this.ball.depth = 5;
    }
    let delta = this.BallStartPointY - this.ball.y;
    let ballScale = 1 - delta / 1500;
    if (delta > 0) {
      if (delta < 500 && ballScale < this.ball.scale) {
        this.ball.setScale(ballScale);
        if (delta < 200) {
          this.shadow.setAlpha(1 - delta / 200);
        }
      }
    }
    if (
      !this.isGoal &&
      this.ball.depth === 5 &&
      this.ball.body.velocity.y > 0 &&
      this.ball.y > this.ring.y + 30 &&
      this.ball.x >= this.leftPin.x - 100 &&
      this.ball.x <= this.rightPin.x - 100
    ) {
      this.goal();
    }
  }
}

console.log("Phaser", Phaser);
let config = {
  type: Phaser.AUTO,
  width: 640,
  height: 1136,
  scale: {
    mode: Phaser.WIDTH_CONTROLS_HEIGHT,
    autoCenter: Phaser.Scale.NO_CENTER,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 4000 },
      debug: false,
    },
  },
  backgroundColor: 0xa8dad9,
  scene: MainScene,
};
// localStorage.clear("backet-scorebins");
let storageData = localStorage.getItem("backet-scorebins");
console.log("saved", storageData);
if (storageData) {
  storageData = JSON.parse(storageData);
} else {
  storageData = {};
}

const Game = new Phaser.Game(config);
Game.data = storageData;
Game.saveUserData = function () {
  console.log(Game.data, "сейв");
  localStorage.setItem("backet-scorebins", JSON.stringify(Game.data));
};
