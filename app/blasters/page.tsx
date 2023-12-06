"use client";
// pages/index.tsx
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

type Bullet = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  radius: number;
  damage: number;
};

type KeyState = {
  ArrowUp: boolean;
  ArrowDown: boolean;
  ArrowLeft: boolean;
  ArrowRight: boolean;
  " ": boolean;
};

const Home = () => {
  const [playing, setPlaying] = useState(false);
  const [guys, setGuys] = useState(1);
  const [score, setScore] = useState(0);

  return (
    <div className="bg-[url('/blasters-bg.png')]">
      {playing && (
        <GameScreen
          guys={guys}
          setPlaying={setPlaying}
          score={score}
          setScore={setScore}
        />
      )}
      {!playing && (
        <LoadingScreen
          setPlaying={setPlaying}
          guys={guys}
          setGuys={setGuys}
          score={score}
          setScore={setScore}
        />
      )}
    </div>
  );
};

export default Home;

function LoadingScreen({
  score,
  guys,
  setScore,
  setGuys,
  setPlaying,
}: {
  score: number;
  setScore: Dispatch<SetStateAction<number>>;
  guys: number;
  setGuys: (guys: number) => void;
  setPlaying: (playing: boolean) => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        setPlaying(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [setPlaying]);

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-72 flex-col flex gap-3">
        {score > 0 && (
          <div className="px-10 py-6 bg-gray-600 text-white rounded-xl">
            <div className="font-black italic uppercase">Game Over</div>
            <div className="text-xl">Score: {score}</div>
            <div className="text-white/50">Play Again?</div>
          </div>
        )}
        <div className="bg-white rounded px-10 py-8 w-full">
          <div className="text-xl font-black italic">Blasters</div>
          <div className="font-semibold">Baddies</div>
          <select
            value={guys}
            onChange={(e) => setGuys(Number(e.currentTarget.value))}
            className="border-gray-400 border-2 rounded py-1 pl-4 cursor-pointer w-full mb-2"
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="13">13</option>
            <option value="14">14</option>
            <option value="15">15</option>
            <option value="16">16</option>
            <option value="17">17</option>
            <option value="18">18</option>
            <option value="19">19</option>
            <option value="20">20</option>
          </select>
          <div
            className="bg-black rounded px-5 py-3 text-white cursor-pointer text-center"
            onClick={() => {
              setScore(0);
              setPlaying(true);
            }}
          >
            🚀 Play
          </div>
        </div>
      </div>
    </div>
  );
}

function GameScreen({
  guys,
  setPlaying,
  score,
  setScore,
}: {
  guys: number;
  setPlaying: (playing: boolean) => void;
  score: number;
  setScore: Dispatch<SetStateAction<number>>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bullets = useRef<Bullet[]>([]);
  const rocketAngle = useRef(0); // Angle in degrees
  const rocketX = useRef(50);
  const rocketY = useRef(50); // Starting X position of the rocket
  const spaceBarPressed = useRef(false);
  const [automatic, setAutomatic] = useState(false);
  const automaticRef = useRef(automatic);
  const targetCountRef = useRef(guys);

  const [level, setLevel] = useState(1);
  const updateLevel = () => {
    setLevel((prev) => prev + 1);
  };

  const lives = useRef(3); // Ref for rocket lives
  const [displayLives, setDisplayLives] = useState(lives.current); // State for displaying lives in UI
  const updateLifeDisplay = () => {
    setDisplayLives(lives.current); // Update the displayed life count
  };

  const invulnerable = useRef(false); // Ref for invulnerability
  const invulnerabilityTimer = useRef<NodeJS.Timeout | null>(null); // Timer reference

  useEffect(() => {
    return () => {
      if (invulnerabilityTimer.current) {
        clearTimeout(invulnerabilityTimer.current); // Clear timer on component unmount
      }
    };
  }, []);

  const rocketWidth = 152 / 4;
  const rocketHeight = 320 / 4;

  useEffect(() => {
    automaticRef.current = automatic;
  }, [automatic]);

  const keyStates = useRef<KeyState>({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    " ": false,
  }).current;

  const createNewTarget = () => {
    return {
      x: Math.random() * ((canvasRef.current?.width || 500) - 50), // Random X position
      y: Math.random() * ((canvasRef.current?.height || 500) - 50), // Random Y position
      width: 100,
      height: 100,
      initialLife: 5,
      life: 5,
      isAlive: true,
      velocityX: (Math.random() - 0.5) * 4, // Random X velocity
      velocityY: (Math.random() - 0.5) * 4, // Random Y velocity
    };
  };

  const targets = useRef(
    Array(guys)
      .fill(0)
      .map(() => createNewTarget())
  ).current;

  const playSound = (file: string, vol = 1) => {
    const sound = new Audio(file);
    sound.volume = vol;
    sound.play();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drawrocket = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      if (invulnerable.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        // Make the rocket flash by toggling its visibility
        const flashInterval = 100; // Flash interval in milliseconds
        if (Math.floor(Date.now() / flashInterval) % 2 === 0) {
          ctx.globalAlpha = 0.5; // Set transparency for the flash effect
        } else {
          ctx.globalAlpha = 1;
        }
      }

      const rocketSprite = new Image();
      rocketSprite.src = "rocket.png"; // Assuming the sprite is in the same directory
      const rocketBaseX = rocketX.current; // Starting X position of the rocket
      const rocketBaseY = rocketY.current; // Starting Y position of the rocket
      const spriteIndex = keyStates.ArrowUp ? 1 : 0; // If up arrow is pressed, use the second sprite

      // Save the current drawing state
      ctx.save();

      // Translate to the pivot point
      ctx.translate(rocketBaseX, rocketBaseY);

      // Rotate the context according to the current angle
      ctx.rotate((rocketAngle.current * Math.PI) / 180);

      // Draw the rocket using the sprite
      ctx.drawImage(
        rocketSprite,
        spriteIndex * rocketWidth,
        0, // Source X and Y
        rocketWidth,
        rocketHeight, // Source width and height
        -rocketWidth / 2,
        -rocketHeight / 2, // Destination X and Y, adjusted to rotate from the center
        rocketWidth,
        rocketHeight // Destination width and height
      );

      // Restore the original state
      ctx.restore();
    };

    const drawTargets = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      targets.forEach((target) => {
        if (target.isAlive) {
          // Draw the target
          const img = new Image();
          img.src = "baddie.png";
          ctx.drawImage(img, target.x, target.y, target.width, target.height);

          // Draw the life bar above the target
          const lifeBarHeight = 5; // Height of the life bar
          const lifeBarY = target.y - lifeBarHeight - 3; // Position the life bar above the target

          const lifePercent = target.life / target.initialLife;
          const lifeBarWidth = lifePercent * 100; // Width proportional to target's life

          ctx.fillStyle = lifePercent < 0.2 ? "red" : "#00cc00"; // Slightly darker green
          ctx.fillRect(target.x, lifeBarY, lifeBarWidth, lifeBarHeight);
        }
      });
    };

    const updateTargets = () => {
      targets.forEach((target) => {
        if (target.isAlive) {
          // Update position based on velocity
          target.x += target.velocityX;
          target.y += target.velocityY;

          // Bounce off the edges of the canvas
          if (
            target.x <= 0 ||
            target.x + target.width >= (canvasRef.current?.width || 500)
          ) {
            target.velocityX *= -1;
          }
          if (
            target.y <= 0 ||
            target.y + target.height >= (canvasRef.current?.height || 500)
          ) {
            target.velocityY *= -1;
          }
        }
      });
    };

    const checkCollisions = () => {
      bullets.current.forEach((bullet) => {
        targets.forEach((target) => {
          // Check for collision with each target
          const hasCollided =
            bullet.x > target.x &&
            bullet.x < target.x + target.width &&
            bullet.y > target.y &&
            bullet.y < target.y + target.height;

          if (hasCollided) {
            playSound("/hit.mp3");
            if (target.life === 0) playSound("/explosion.mp3");
            target.life -= bullet.damage;
            if (target.life <= 0) {
              setScore((prev) => prev + 1);
              target.isAlive = false;
            }
            // Remove the bullet on collision
            bullets.current = bullets.current.filter((b) => b !== bullet);
          }
        });
      });

      // Remove dead targets and respawn new ones
      targets.forEach((target) => {
        if (!target.isAlive) {
          targets.splice(targets.indexOf(target), 1);
          playSound("/explosion.mp3");
        }
      });

      if (targets.filter((target) => target.isAlive).length === 0) {
        makeRocketInvulnerable();
        updateLevel();
        targetCountRef.current += 1;
        targets.push(
          ...Array(targetCountRef.current)
            .fill(0)
            .map(() => createNewTarget())
        );
      }
    };

    const drawBullets = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext("2d");
      if (!ctx) return;

      // Iterate through each bullet
      for (const bullet of bullets.current) {
        // Update bullet position
        bullet.x += bullet.velocityX;
        bullet.y += bullet.velocityY;

        // Draw bullet
        ctx.beginPath();
        ctx.arc(bullet.x, bullet.y, bullet.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "red";
        ctx.fill();
        ctx.closePath();
      }

      // Optional: Remove bullets that go off screen
      bullets.current = bullets.current.filter((bullet) => {
        if (!canvasRef.current) return false;
        return (
          bullet.x >= 0 &&
          bullet.x <= canvasRef.current.width &&
          bullet.y >= 0 &&
          bullet.y <= canvasRef.current.height
        );
      });
    };

    const handleActions = () => {
      const speedFactor = 5;
      if (keyStates.ArrowLeft) rocketAngle.current -= speedFactor;
      if (keyStates.ArrowRight) rocketAngle.current += speedFactor;

      if (keyStates.ArrowUp) {
        rocketX.current +=
          speedFactor * Math.sin((rocketAngle.current * Math.PI) / 180);
        rocketY.current -=
          speedFactor * Math.cos((rocketAngle.current * Math.PI) / 180);
      }
      if (keyStates.ArrowDown) {
        rocketX.current -=
          speedFactor * Math.sin((rocketAngle.current * Math.PI) / 180);
        rocketY.current +=
          speedFactor * Math.cos((rocketAngle.current * Math.PI) / 180);
      }
      if (automaticRef.current && keyStates[" "]) shoot();
      if (!automaticRef.current && keyStates[" "] && !spaceBarPressed.current) {
        shoot();
        spaceBarPressed.current = true; // Set to prevent continuous shooting
      }
    };

    const shoot = () => {
      if (!canvasRef.current) return;

      playSound("/shoot.mp3", 0.2);

      // Constants for bullet
      const bulletSpeed = 5;
      const bulletRadius = 5;

      // Calculate the bullet's velocity components based on the rocket's angle
      const angleInRadians = ((90 - rocketAngle.current) * Math.PI) / 180;

      const velocityX = bulletSpeed * Math.cos(angleInRadians);
      const velocityY = -bulletSpeed * Math.sin(angleInRadians);

      // Create a new bullet object
      const bullet = {
        x: rocketX.current, // Initial X position (same as the rocket's base)
        y: rocketY.current, // Initial Y position (same as the rocket's base)
        velocityX,
        velocityY,
        radius: bulletRadius,
        damage: 1,
      };

      // Add the new bullet to the bullets array
      bullets.current.push(bullet);
    };

    const isKeyOfKeyState = (key: string): key is keyof KeyState => {
      return key in keyStates;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playSound("/game-over.mp3");
        setPlaying(false);
      }

      if (isKeyOfKeyState(e.key)) {
        keyStates[e.key] = true;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (isKeyOfKeyState(e.key)) {
        keyStates[e.key] = false;
        if (e.key === " ") {
          spaceBarPressed.current = false; // Reset shooting state
        }
      }
    };

    const makeRocketInvulnerable = () => {
      invulnerable.current = true;
      if (invulnerabilityTimer.current)
        clearTimeout(invulnerabilityTimer.current); // Clear existing timer if any

      invulnerabilityTimer.current = setTimeout(() => {
        invulnerable.current = false;
        ctx.globalAlpha = 1; // Reset transparency
      }, 2000); // Set invulnerability for 2 seconds
    };

    const checkRocketCollision = () => {
      if (invulnerable.current) return; // Skip collision check if invulnerable

      const rocketCollisionWidth = rocketWidth * 0.6;
      const rocketCollisionHeight = rocketHeight * 0.6;

      targets.forEach((target) => {
        if (target.isAlive) {
          const collision =
            rocketX.current + rocketCollisionWidth / 2 > target.x &&
            rocketX.current - rocketCollisionWidth / 2 <
              target.x + target.width &&
            rocketY.current + rocketCollisionHeight / 2 > target.y &&
            rocketY.current - rocketCollisionHeight / 2 <
              target.y + target.height;

          if (collision) {
            lives.current -= 1;
            updateLifeDisplay();
            makeRocketInvulnerable(); // Make rocket invulnerable after collision

            if (lives.current <= 0) {
              playSound("/game-over.mp3");
              setPlaying(false);
            } else {
              playSound("/lose-life.wav");
            }
          }
        }
      });
    };

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      handleActions();
      checkCollisions();
      checkRocketCollision();
      drawTargets();
      updateTargets();
      drawBullets();
      drawrocket();
      requestAnimationFrame(update);
    };
    update();

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    // ... in your cleanup logic ...
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };

    // ... rest of the game updating logic ...
  }, [keyStates, setPlaying, targets]);

  return (
    <div className="">
      <div className="fixed top-4 right-4 flex flex-col gap-4 w-36 items-end">
        <div className="flex">
          <div className="bg-black rounded p-4 text-white">Level: {level}</div>
        </div>
        <div className="flex">
          <div className="bg-black rounded p-4 text-white">Score: {score}</div>
        </div>
        <div className="flex">
          <div className="bg-black rounded p-4 text-white">
            Lives: {displayLives}
          </div>
        </div>
        <div
          className=" cursor-pointer rounded bg-green-600 text-white px-3 py-2 select-none"
          onClick={() => setAutomatic((prev) => !prev)}
        >
          {automatic ? "Auto" : "Manual"}
        </div>
      </div>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
