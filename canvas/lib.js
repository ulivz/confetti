class ConfettiParticle {
  constructor ({
    ctx,
    color,
    canvas,
    mp,
    blur,
    size
  }) {
    this.ctx = ctx
    this.x = Math.random() * canvas.width;         // x-coordinate
    this.y = (Math.random() * canvas.height) - canvas.height;   // y-coordinate

    const [width, height] = size
    this.width = width;
    this.height = height;
    this.r = this.width; // RandomFromTo(10, 30);      // radius;
    this.d = (Math.random() * mp) + 10; // density;
    this.color = color;
    this.tilt = Math.floor(Math.random() * 10) - 10;
    this.tiltAngleIncremental = (Math.random() * 0.07) + .05;
    this.tiltAngle = 0;
    this.blur = blur || 0;
  }

  draw () {
    this.ctx.beginPath();
    this.ctx.lineWidth = this.r / 2;
    this.ctx.strokeStyle = this.color;
    this.ctx.moveTo(this.x + this.tilt + (this.r / 4), this.y);
    this.ctx.lineTo(this.x + this.tilt, this.y + this.tilt + (this.r / 4));
    if (this.blur !== 0) {
      this.ctx.filter = `blur(${this.blur}px)`;
    }
    return this.ctx.stroke();
  }
}

class Confetti {
  constructor ({
    el,
    width,
    height,
    colors,
    blurs,
    sizes,
    velocity
  }) {
    this.canvas = el;
    this.ctx = this.canvas.getContext('2d');
    this.W = width | this.canvas.width | window.innerWidth;
    this.H = height | this.canvas.height | window.innerHeight;
    this.mp = 15; // max particles
    this.particles = [];
    this.angle = 0;
    this.tiltAngle = 0;
    this.confettiActive = true;
    this.animationComplete = true;
    this.deactivationTimerHandler = null;
    this.reactivationTimerHandler = null;
    this.animationHandler = null;
    this.colors = colors || ["DodgerBlue", "OliveDrab", "Gold", "pink", "SlateBlue", "lightblue", "Violet", "PaleGreen", "SteelBlue", "SandyBrown", "Chocolate", "Crimson"];
    this.blurs = blurs || [0];
    this.sizes = sizes || [[10, 20], [20, 40], [10, 30]];
    this.velocity = velocity || 1;
    this.init();
  }

  init () {
    $.documentReady(() => {
      this.canvas.width = this.W;
      this.canvas.height = this.H;
      this.initializeConfetti();

      $.on(window, 'resize', () => {
        this.W = width | this.canvas.width | window.innerWidth;
        this.H = height | this.canvas.height | window.innerHeight;
        this.canvas.width = this.W;
        this.canvas.height = this.H;
      });
    });

    $.on($('#stopButton'), 'click', this.deactivateConfetti.bind(this))
    $.on($('#startButton'), 'click', this.restartConfetti.bind(this))
  }

  initializeConfetti () {
    this.animationComplete = false;
    for (let i = 0; i < this.mp; i++) {
      const particleColor = indexGetter(i, this.colors);
      this.particles.push(new ConfettiParticle({
        ctx: this.ctx,
        color: particleColor,
        canvas: this.canvas,
        mp: this.mp,
        blur: indexGetter(i, this.blurs),
        size: indexGetter(i, this.sizes)
      }));
    }
    this.startConfetti();
  }

  startConfetti () {
    const animloop = () => {
      if (this.animationComplete) return null;
      this.animationHandler = requestAnimFrame(animloop);
      return this.draw();
    }
    animloop();
  }

  draw () {
    this.ctx.clearRect(0, 0, this.W, this.H);
    const results = [];
    for (let i = 0; i < this.mp; i++) {
      results.push(this.particles[i].draw());
    }
    this.update();
    return results;
  }

  update () {
    let remainingFlakes = 0;
    let particle;
    this.angle += 0.01;
    if (this.angle > Math.PI) {
      this.angle = 0;
    }
    this.tiltAngle += 0.01;

    for (let i = 0; i < this.mp; i++) {
      particle = this.particles[i];
      if (this.animationComplete) return;

      if (!this.confettiActive && particle.y < -15) {
        particle.y = this.H + 100;
        continue;
      }

      this.stepParticle(particle, i);

      if (particle.y <= this.H) {
        remainingFlakes++;
      }

      this.checkForReposition(particle, i);
    }

    if (remainingFlakes === 0) {
      this.stopConfetti();
    }
  }

  stepParticle (particle, particleIndex) {
    particle.tiltAngle += particle.tiltAngleIncremental;
    particle.y += ((Math.cos(this.angle + particle.d) + 3 + particle.r / 2) / 2) * this.velocity;
    // particle.x += Math.sin(this.angle);
    particle.tilt = (Math.sin(particle.tiltAngle - (particleIndex / 3))) * 15;
  }

  checkForReposition (particle, index) {
    if ((particle.x > this.W + 20 || particle.x < -20 || particle.y > this.H) && this.confettiActive) {
      if (index % 5 > 0 || index % 2 == 0) //66.67% of the flakes
      {
        this.repositionParticle(particle, Math.random() * this.W, -10, Math.floor(Math.random() * 10) - 10);
      } else {
        if (Math.sin(this.angle) > 0) {
          // Enter from the left
          this.repositionParticle(particle, -5, Math.random() * this.H, Math.floor(Math.random() * 10) - 10);
        } else {
          // Enter from the right
          this.repositionParticle(particle, this.W + 5, Math.random() * this.H, Math.floor(Math.random() * 10) - 10);
        }
      }
    }
  }

  repositionParticle (particle, xCoordinate, yCoordinate, tilt) {
    particle.x = xCoordinate;
    particle.y = yCoordinate;
    particle.tilt = tilt;
  }

  clearTimers () {
    clearTimeout(this.reactivationTimerHandler);
    clearTimeout(this.animationHandler);
  }

  deactivateConfetti () {
    this.confettiActive = false;
    this.clearTimers();
  }

  stopConfetti () {
    this.animationComplete = true;
    if (this.ctx == undefined) return;
    this.ctx.clearRect(0, 0, this.W, this.H);
  }

  restartConfetti () {
    this.clearTimers();
    this.stopConfetti();
    this.reactivationTimerHandler = setTimeout(() => {
      this.confettiActive = true;
      this.animationComplete = false;
      this.initializeConfetti();
    }, 100);
  }
}