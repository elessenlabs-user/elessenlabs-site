"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

type Ball = {
  x: number;
  y: number;
  radius: number;
  velocityX: number;
  velocityY: number;
  squash: number;
};

type Impact = {
  x: number;
  y: number;
  life: number;
};

const ORANGE = "#FE5E04";

export default function AboutMotionPanel() {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const pausedRef = useRef(false);

  const [isPaused, setIsPaused] =
    useState(false);

  const [hitCount, setHitCount] =
    useState(0);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let animationFrame = 0;
    let lastTime = performance.now();

    let width = 0;
    let height = 230;
    let devicePixelRatio = 1;

    const paddleWidth = 6;
    const paddleHeight = 64;
    const paddleMargin = 18;

    let leftPaddleY =
      height / 2 - paddleHeight / 2;

    let rightPaddleY =
      height / 2 - paddleHeight / 2;

    let leftImpactFlash = 0;
    let rightImpactFlash = 0;

    let impacts: Impact[] = [];
    let trail: Array<{
      x: number;
      y: number;
    }> = [];

    const ball: Ball = {
      x: 0,
      y: 0,
      radius: 7,
      velocityX: 190,
      velocityY: 92,
      squash: 0,
    };

    const clamp = (
      value: number,
      minimum: number,
      maximum: number,
    ) =>
      Math.max(
        minimum,
        Math.min(maximum, value),
      );

    const resetBall = (
      direction: 1 | -1 = 1,
    ) => {
      ball.x = width / 2;
      ball.y = height / 2;

      ball.velocityX =
        direction *
        Math.max(
          165,
          Math.min(210, width * 0.46),
        );

      ball.velocityY = 92;
      ball.squash = 0;

      trail = [];
    };

    const resizeCanvas = () => {
      const bounds =
        canvas.getBoundingClientRect();

      width = bounds.width;
      height = bounds.height;

      devicePixelRatio = Math.min(
        window.devicePixelRatio || 1,
        2,
      );

      canvas.width = Math.round(
        width * devicePixelRatio,
      );

      canvas.height = Math.round(
        height * devicePixelRatio,
      );

      context.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0,
      );

      leftPaddleY =
        height / 2 - paddleHeight / 2;

      rightPaddleY =
        height / 2 - paddleHeight / 2;

      resetBall(1);
    };

    const registerImpact = (
      side: "left" | "right",
      x: number,
      y: number,
    ) => {
      impacts.push({
        x,
        y,
        life: 1,
      });

      ball.squash = 1;

      if (side === "left") {
        leftImpactFlash = 1;
      } else {
        rightImpactFlash = 1;
      }

      setHitCount(
        (current) => current + 1,
      );
    };

    const update = (delta: number) => {
      const leftPaddleX = paddleMargin;

      const rightPaddleX =
        width -
        paddleMargin -
        paddleWidth;

      /*
       * Each paddle tracks the incoming ball.
       * The collision still occurs against its
       * actual measured rectangle.
       */

      const targetPaddleY = clamp(
        ball.y - paddleHeight / 2,
        12,
        height - paddleHeight - 12,
      );

      const trackingSpeed = Math.min(
        1,
        delta * 8,
      );

      if (ball.velocityX < 0) {
        leftPaddleY +=
          (targetPaddleY -
            leftPaddleY) *
          trackingSpeed;

        rightPaddleY +=
          (height / 2 -
            paddleHeight / 2 -
            rightPaddleY) *
          Math.min(1, delta * 2);
      } else {
        rightPaddleY +=
          (targetPaddleY -
            rightPaddleY) *
          trackingSpeed;

        leftPaddleY +=
          (height / 2 -
            paddleHeight / 2 -
            leftPaddleY) *
          Math.min(1, delta * 2);
      }

      ball.x += ball.velocityX * delta;
      ball.y += ball.velocityY * delta;

      /*
       * Top and bottom wall collisions.
       */

      if (ball.y - ball.radius <= 10) {
        ball.y = 10 + ball.radius;
        ball.velocityY =
          Math.abs(ball.velocityY);
      }

      if (
        ball.y + ball.radius >=
        height - 10
      ) {
        ball.y =
          height - 10 - ball.radius;

        ball.velocityY =
          -Math.abs(ball.velocityY);
      }

      /*
       * Real left-paddle collision.
       */

      const touchesLeftPaddle =
        ball.velocityX < 0 &&
        ball.x - ball.radius <=
          leftPaddleX + paddleWidth &&
        ball.x + ball.radius >=
          leftPaddleX &&
        ball.y + ball.radius >=
          leftPaddleY &&
        ball.y - ball.radius <=
          leftPaddleY + paddleHeight;

      if (touchesLeftPaddle) {
        ball.x =
          leftPaddleX +
          paddleWidth +
          ball.radius;

        ball.velocityX =
          Math.min(
            Math.abs(ball.velocityX) *
              1.015,
            260,
          );

        const impactPosition =
          (ball.y -
            (leftPaddleY +
              paddleHeight / 2)) /
          (paddleHeight / 2);

        ball.velocityY +=
          impactPosition * 62;

        registerImpact(
          "left",
          leftPaddleX + paddleWidth,
          ball.y,
        );
      }

      /*
       * Real right-paddle collision.
       */

      const touchesRightPaddle =
        ball.velocityX > 0 &&
        ball.x + ball.radius >=
          rightPaddleX &&
        ball.x - ball.radius <=
          rightPaddleX +
            paddleWidth &&
        ball.y + ball.radius >=
          rightPaddleY &&
        ball.y - ball.radius <=
          rightPaddleY +
            paddleHeight;

      if (touchesRightPaddle) {
        ball.x =
          rightPaddleX - ball.radius;

        ball.velocityX =
          -Math.min(
            Math.abs(ball.velocityX) *
              1.015,
            260,
          );

        const impactPosition =
          (ball.y -
            (rightPaddleY +
              paddleHeight / 2)) /
          (paddleHeight / 2);

        ball.velocityY +=
          impactPosition * 62;

        registerImpact(
          "right",
          rightPaddleX,
          ball.y,
        );
      }

      /*
       * Safety reset if the browser was inactive
       * long enough for the ball to escape.
       */

      if (
        ball.x < -40 ||
        ball.x > width + 40
      ) {
        resetBall(
          ball.x < 0 ? 1 : -1,
        );
      }

      ball.squash = Math.max(
        0,
        ball.squash - delta * 7,
      );

      leftImpactFlash = Math.max(
        0,
        leftImpactFlash - delta * 4,
      );

      rightImpactFlash = Math.max(
        0,
        rightImpactFlash - delta * 4,
      );

      impacts = impacts
        .map((impact) => ({
          ...impact,
          life:
            impact.life - delta * 2.3,
        }))
        .filter(
          (impact) => impact.life > 0,
        );

      trail.push({
        x: ball.x,
        y: ball.y,
      });

      if (trail.length > 11) {
        trail.shift();
      }
    };

    const drawGrid = () => {
      context.save();

      context.strokeStyle =
        "rgba(255,255,255,0.055)";

      context.lineWidth = 1;

      for (
        let x = 0;
        x <= width;
        x += 32
      ) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }

      for (
        let y = 0;
        y <= height;
        y += 32
      ) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      context.strokeStyle =
        "rgba(255,255,255,0.09)";

      context.beginPath();
      context.moveTo(width / 2, 0);
      context.lineTo(
        width / 2,
        height,
      );
      context.stroke();

      context.beginPath();
      context.moveTo(0, height / 2);
      context.lineTo(
        width,
        height / 2,
      );
      context.stroke();

      context.restore();
    };

    const drawCentreSignal = (
      time: number,
    ) => {
      const pulse =
        1 +
        Math.sin(time * 2.4) *
          0.08;

      context.save();

      context.strokeStyle =
        "rgba(254,94,4,0.28)";

      context.lineWidth = 1;

      context.beginPath();

      context.arc(
        width / 2,
        height / 2,
        22 * pulse,
        0,
        Math.PI * 2,
      );

      context.stroke();

      context.strokeStyle =
        "rgba(255,255,255,0.08)";

      context.beginPath();

      context.arc(
        width / 2,
        height / 2,
        38,
        0,
        Math.PI * 2,
      );

      context.stroke();

      context.restore();
    };

    const drawPaddle = (
      x: number,
      y: number,
      flash: number,
    ) => {
      context.save();

      context.shadowColor =
        flash > 0
          ? `rgba(254,94,4,${
              flash * 0.8
            })`
          : "rgba(255,255,255,0.12)";

      context.shadowBlur =
        flash > 0
          ? 22
          : 8;

      context.fillStyle =
        flash > 0
          ? ORANGE
          : "rgba(255,255,255,0.38)";

      context.beginPath();

      context.roundRect(
        x,
        y,
        paddleWidth,
        paddleHeight,
        4,
      );

      context.fill();
      context.restore();
    };

    const drawImpacts = () => {
      impacts.forEach((impact) => {
        const progress =
          1 - impact.life;

        context.save();

        context.strokeStyle =
          `rgba(254,94,4,${
            impact.life * 0.72
          })`;

        context.lineWidth = 2;

        context.beginPath();

        context.arc(
          impact.x,
          impact.y,
          8 + progress * 24,
          0,
          Math.PI * 2,
        );

        context.stroke();
        context.restore();
      });
    };

    const drawTrail = () => {
      trail.forEach(
        (point, index) => {
          const opacity =
            ((index + 1) /
              trail.length) *
            0.2;

          const radius =
            ball.radius *
            ((index + 1) /
              trail.length) *
            0.72;

          context.save();

          context.fillStyle =
            `rgba(254,94,4,${opacity})`;

          context.beginPath();

          context.arc(
            point.x,
            point.y,
            radius,
            0,
            Math.PI * 2,
          );

          context.fill();
          context.restore();
        },
      );
    };

    const drawBall = () => {
      const horizontalScale =
        1 - ball.squash * 0.34;

      const verticalScale =
        1 + ball.squash * 0.34;

      context.save();

      context.translate(
        ball.x,
        ball.y,
      );

      context.scale(
        horizontalScale,
        verticalScale,
      );

      context.shadowColor =
        "rgba(254,94,4,0.7)";

      context.shadowBlur = 18;

      context.fillStyle = ORANGE;

      context.beginPath();

      context.arc(
        0,
        0,
        ball.radius,
        0,
        Math.PI * 2,
      );

      context.fill();
      context.restore();
    };

    const draw = (time: number) => {
      context.clearRect(
        0,
        0,
        width,
        height,
      );

      drawGrid();
      drawCentreSignal(time);

      drawPaddle(
        paddleMargin,
        leftPaddleY,
        leftImpactFlash,
      );

      drawPaddle(
        width -
          paddleMargin -
          paddleWidth,
        rightPaddleY,
        rightImpactFlash,
      );

      drawImpacts();
      drawTrail();
      drawBall();
    };

    const renderFrame = (
      currentTime: number,
    ) => {
      const delta = Math.min(
        (currentTime - lastTime) /
          1000,
        0.033,
      );

      lastTime = currentTime;

      if (!pausedRef.current) {
        update(delta);
      }

      draw(currentTime / 1000);

      animationFrame =
        window.requestAnimationFrame(
          renderFrame,
        );
    };

    const resizeObserver =
      new ResizeObserver(resizeCanvas);

    resizeObserver.observe(canvas);
    resizeCanvas();

    animationFrame =
      window.requestAnimationFrame(
        renderFrame,
      );

    return () => {
      resizeObserver.disconnect();

      window.cancelAnimationFrame(
        animationFrame,
      );
    };
  }, []);

  return (
    <div className="relative mt-10 overflow-hidden rounded-[30px] border border-white/15 bg-white/[0.06] p-5 shadow-[0_18px_50px_rgba(26,32,38,0.14)]">
      {/* Header */}

      <div className="relative z-10 flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FE5E04]">
            SIGNAL FIELD
          </p>

          <p className="mt-2 text-sm text-white/65">
            Less handoff. More progress.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
            {hitCount} hits
          </span>

          <button
            type="button"
            onClick={() =>
              setIsPaused(
                (current) => !current,
              )
            }
            className="rounded-full border border-white/15 bg-white/[0.06] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 transition hover:border-[#FE5E04] hover:text-[#FE5E04]"
          >
            {isPaused ? "Play" : "Pause"}
          </button>
        </div>
      </div>

      {/* Real collision field */}

      <div className="relative z-10 mt-6 h-[230px] overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.035]">
        <canvas
          ref={canvasRef}
          aria-label="Animated signal field with a ball colliding with two paddles"
          className="block h-full w-full"
        />
      </div>

      {/* Labels */}

      <div className="relative z-10 mt-5 flex flex-wrap gap-2">
        {[
          "Think",
          "Design",
          "Build",
          "Improve",
        ].map((item) => (
          <span
            key={item}
            className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-white/70"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}