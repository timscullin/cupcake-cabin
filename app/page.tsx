"use client";

import { HeartIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";

type Obstacle = {
  x: number;
  y: number;
  type: "tree" | "obstacle" | "star";
  color: string;
  height: number;
};

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lives, setLives] = useState(3); // New state to track the number of lives
  const [score, setScore] = useState(0); // New state to track the score
  const [gameOver, setGameOver] = useState(true); // New state to track if the game is over

  const [playerY, setPlayerY] = useState(0); // Player's Y position when on the ground
  const [playerVelocity, setPlayerVelocity] = useState(0); // Player's vertical velocity
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [isJumping, setIsJumping] = useState(false);
  const playerHeight = 100;
  const playerWidth = 100;
  const playerX = 400; // X position of the player
  const [jumpCount, setJumpCount] = useState(0); // State to track the number of jumps
  const maxJumps = 2; // Maximum number of jumps allowed before landing

  const gravity = 2;
  const jumpPower = 30; // Positive because it's an upward force
  const groundY = 350; // Y position of the ground measured from the top of the canvas

  const [level, setLevel] = useState(1); // New state to track the level
  useEffect(() => {
    if (score > 0 && score % 5 === 0) {
      setLevel((prevLevel) => prevLevel + 1); // Increase the level every 5 points
    }
  }, [score]);

  const [obstacleSpeed, setObstacleSpeed] = useState(5); // New state to track the obstacle speed
  useEffect(() => {
    if (level > 1) {
      setObstacleSpeed((prevSpeed) => prevSpeed + 1.5); // Increase the obstacle speed with the level
    }
  }, [level]);

  const resetGame = () => {
    setPlayerY(playerHeight);
    setPlayerVelocity(0);
    setObstacles([]);
    setIsJumping(false);
    setLives(3);
    setScore(0);
    setLevel(1);
    setGameOver(false);
    setObstacleSpeed(10);
  };

  const playStarSound = () => {
    const sound = new Audio("/get-star.wav");
    sound.play();
  };

  const playLoseLifeSound = () => {
    const sound = new Audio("/lose-life.wav");
    sound.play();
  };

  const playGameOverSound = () => {
    const sound = new Audio("/game-over.mp3");
    sound.play();
  };

  // Function to check collision with obstacles
  const checkCollision = (
    playerX: number,
    playerY: number,
    obstacle: Obstacle
  ) => {
    if (obstacle.type === "tree") return false;

    // The right edge of the player
    const playerRight = playerX + playerWidth / 2;
    // The left edge of the player
    const playerLeft = playerX - playerWidth / 2;
    // The bottom edge of the player
    const playerDistOffGround = playerY - playerHeight;

    // Check for overlap between player and obstacle
    if (
      playerRight > obstacle.x &&
      playerLeft < obstacle.x + 20 &&
      playerDistOffGround < obstacle.height + obstacle.y
    ) {
      return true; // Collision detected
    }
    return false; // No collision
  };

  const unicornSprite = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new Image();
      img.src = "/unicorn-sprite.png"; // Path to your image
      img.onload = () => {
        // Image loaded
      };
      unicornSprite.current = img;
    }
  }, []);

  const monsterImage = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new Image();
      img.src = "/monster.png"; // Path to your image
      img.onload = () => {
        // Image loaded
      };
      monsterImage.current = img;
    }
  }, []);

  const frameWidth = 200; // Width of each frame in the sprite sheet
  const frameHeight = 200; // Height of each frame in the sprite sheet
  const totalFrames = 4; // Total number of frames in the sprite sheet
  let currentFrame = 0; // Current frame to be drawn

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const gameLoop = setInterval(() => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height); // Clear canvas

      // Draw ground
      ctx.fillStyle = "green";
      ctx.fillRect(0, groundY, ctx.canvas.width, 20);

      // Draw obstacles

      obstacles.forEach((obstacle, index) => {
        if (checkCollision(playerX, playerY, obstacle)) {
          if (obstacle.type === "obstacle") {
            setLives((prevLives) => prevLives - 1); // Lose a life
            playLoseLifeSound();
            setPlayerY(playerHeight); // Reset player position
            setObstacles([]); // Remove all obstacles
            if (lives <= 1) {
              playGameOverSound();
              setGameOver(true); // End the game
            }
          } else if (obstacle.type === "star") {
            playStarSound();
            setScore((prevScore) => prevScore + 1); // Gain a point
            setObstacles((prevObstacles) => {
              // Remove the star
              const newObstacles = [...prevObstacles];
              newObstacles.splice(index, 1);
              return newObstacles;
            });
          }
        }

        if (obstacle.type === "tree") {
          // Draw tree
          ctx.fillStyle = obstacle.color;
          // Draw the trunk
          ctx.fillRect(obstacle.x, groundY - obstacle.height, 20, 80);
          // Draw the foliage as a triangle
          ctx.beginPath();
          ctx.moveTo(obstacle.x - 20, groundY - obstacle.height);
          ctx.lineTo(obstacle.x + 40, groundY - obstacle.height);
          ctx.lineTo(obstacle.x + 10, groundY - obstacle.height - 50);
          ctx.fill();
        } else if (obstacle.type === "star") {
          // Draw star
          ctx.fillStyle = obstacle.color;
          ctx.beginPath();
          ctx.moveTo(obstacle.x, groundY - obstacle.height - obstacle.y);
          ctx.lineTo(
            obstacle.x + 10,
            groundY - obstacle.height - obstacle.y - 20
          );
          ctx.lineTo(obstacle.x + 20, groundY - obstacle.height - obstacle.y);
          ctx.lineTo(obstacle.x + 40, groundY - obstacle.height - obstacle.y);
          ctx.lineTo(
            obstacle.x + 20,
            groundY - obstacle.height - obstacle.y + 10
          );
          ctx.lineTo(
            obstacle.x + 30,
            groundY - obstacle.height - obstacle.y + 30
          );
          ctx.lineTo(
            obstacle.x + 10,
            groundY - obstacle.height - obstacle.y + 20
          );
          ctx.lineTo(obstacle.x, groundY - obstacle.height - obstacle.y + 40);
          ctx.lineTo(
            obstacle.x - 10,
            groundY - obstacle.height - obstacle.y + 20
          );
          ctx.lineTo(
            obstacle.x - 30,
            groundY - obstacle.height - obstacle.y + 30
          );
          ctx.lineTo(
            obstacle.x - 20,
            groundY - obstacle.height - obstacle.y + 10
          );
          ctx.lineTo(obstacle.x - 40, groundY - obstacle.height - obstacle.y);
          ctx.lineTo(obstacle.x - 20, groundY - obstacle.height - obstacle.y);
          ctx.lineTo(
            obstacle.x - 10,
            groundY - obstacle.height - obstacle.y - 20
          );
          ctx.fill();
        } else {
          // Draw monster using monster image
          if (monsterImage.current) {
            ctx.drawImage(
              monsterImage.current,
              obstacle.x,
              groundY - obstacle.height,
              obstacle.height,
              obstacle.height
            );
          }
        }

        // Move the obstacle towards the player
        obstacle.x -= obstacleSpeed;

        // Remove the obstacle if it goes off screen
        if (obstacle.x < -obstacle.height) {
          obstacles.splice(index, 1);
        }
      });

      // Draw the current frame of the unicorn
      if (unicornSprite.current)
        ctx.drawImage(
          unicornSprite.current,
          currentFrame * frameWidth,
          0, // x, y position on the sprite sheet
          frameWidth,
          frameHeight, // width and height of the frame
          playerX - playerWidth / 2,
          groundY - playerY, // x, y position on the canvas
          playerWidth,
          playerHeight // width and height on the canvas
        );

      // Update the frame
      currentFrame = (currentFrame + 1) % totalFrames;

      // Jumping mechanics
      if (isJumping) {
        setPlayerVelocity((v) => v - gravity); // Gravity reduces the upward velocity
        setPlayerY((y) => y + playerVelocity); // Apply velocity to Y position

        if (playerY < playerHeight) {
          setPlayerY(playerHeight); // Land on the ground
          setPlayerVelocity(0); // Reset velocity
          setIsJumping(false); // End jump
          setJumpCount(0); // Reset jump count on landing
        }
      }

      // Spawn new tree
      if (Math.random() < 0.01) {
        setObstacles((prevObstacles) => [
          ...prevObstacles,
          {
            x: ctx.canvas.width,
            type: "tree",
            color: "green",
            height: 80,
            y: 0,
          }, // New obstacle at the edge
        ]);
      }

      // Spawn new star
      if (Math.random() < 0.1) {
        setObstacles((prevObstacles) => [
          ...prevObstacles,
          {
            x: ctx.canvas.width,
            type: "star",
            color: "yellow",
            height: 40,
            y: 0,
          }, // New obstacle at the edge
        ]);
      }

      // Spawn new obstacle
      if (Math.random() < 0.01) {
        setObstacles((prevObstacles) => [
          ...prevObstacles,
          {
            x: ctx.canvas.width,
            color: "red",
            type: "obstacle",
            height: 50,
            y: 0,
          }, // New obstacle at the edge
        ]);
      }
    }, 20); // The interval rate can be adjusted for smoother animation

    return () => {
      clearInterval(gameLoop);
    };
  }, [
    playerY,
    playerVelocity,
    isJumping,
    obstacles,
    obstacleSpeed,
    lives,
    gravity,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Jump when spacebar is pressed
      if (event.key === " " && jumpCount < maxJumps) {
        setPlayerVelocity(jumpPower);
        setIsJumping(true);
        setJumpCount((prevCount) => prevCount + 1); // Increment the jump count
      }

      // Restart the game when return is pressed
      if (event.key === "Enter" && gameOver) {
        resetGame();
        setGameOver(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [playerY, gameOver, jumpCount]);

  if (gameOver)
    return (
      <div className="flex w-screen h-screen items-center justify-center">
        <div className="">
          <div className="text-3xl font-bold text-center mb-10">
            Cupcake Cabin
          </div>
          {score > 0 && (
            <div className="text-center text-xl font-bold mb-2">
              High Score: {score} 🎉
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/home-screen.png" alt="" className="w-[450px]" />
          <div className="flex justify-center mt-4">
            <div
              className="bg-gradient-to-b from-green-400 to-green-300 border-2 border-green-500 py-1.5 px-7 rounded-xl font-bold text-white cursor-pointer"
              onClick={() => resetGame()}
            >
              Play
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="">
      <div className="flex justify-center fixed w-screen mt-2 z-20">
        <div className="flex gap-2 bg-black text-white p-4 rounded-lg shadow-lg">
          <div className="text-2xl font-pixel flex w-24 gap-1">
            {lives > 0 && <HeartIcon className="text-red-500"></HeartIcon>}
            {lives > 1 && <HeartIcon className="text-red-500"></HeartIcon>}
            {lives > 2 && <HeartIcon className="text-red-500"></HeartIcon>}
          </div>
          <div className="text-2xl font-pixel">
            Score: <span className="text-green-500">{score}</span>
          </div>
          <div className="text-2xl font-pixel">
            Level: <span className="text-blue-500">{level}</span>
          </div>
        </div>
      </div>
      <ReactCanvasConfetti
        fire={score > 0 && score % 50 === 0}
        className="fixed top-0 left-0 w-screen h-screen z-10"
        colors={[
          "#26ccff",
          "#a25afd",
          "#ff5e7e",
          "#88ff5a",
          "#fcff42",
          "#ffa62d",
          "#ff36ff",
        ]}
        spread={220}
        startVelocity={80}
        decay={0.8}
        origin={{
          x: 0.5,
          y: -0.2,
        }}
        angle={270}
        particleCount={score * 3}
        shapes={["circle", "square"]}
        zIndex={1}
      />
      <canvas ref={canvasRef} width={1440} height={400} />
    </div>
  );
};

export default Game;
