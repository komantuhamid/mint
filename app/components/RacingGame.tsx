'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Car, Trophy, Play } from 'lucide-react';
interface RacingGameProps {
  onGameOver?: (score: number) => void;
}

interface GameObject {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  image: string;
  type: 'car' | 'barrel' | 'roadblock';
}

interface PlayerCar {
  x: number;
  y: number;
  width: number;
  height: number;
  speedX: number;
  speedY: number;
}

const CANVAS_WIDTH = 424;
const CANVAS_HEIGHT = 695;
const PLAYER_START_X = 180;
const PLAYER_START_Y = 380;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 70;
const LANE_WIDTH = 90;
const NUM_LANES = 4;
const BASE_OBSTACLE_SPEED = 5;
const SPAWN_INTERVAL = 70;

const OBSTACLE_TYPES = [
  { image: '/racing/car1.png', type: 'car' as const, width: 40, height: 70 },
  { image: '/racing/car2.png', type: 'car' as const, width: 40, height: 70 },
  { image: '/racing/car3.png', type: 'car' as const, width: 40, height: 70 },
  { image: '/racing/car4.png', type: 'car' as const, width: 40, height: 70 },
  { image: '/racing/car5.png', type: 'car' as const, width: 40, height: 70 },
  { image: '/racing/barrel.png', type: 'barrel' as const, width: 50, height: 50 },
  { image: '/racing/roadblock.png', type: 'roadblock' as const, width: 80, height: 40 },
];

export default function RacingGame({ onGameOver }: RacingGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('playing');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const playerRef = useRef<PlayerCar>({
    x: PLAYER_START_X,
    y: PLAYER_START_Y,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    speedX: 0,
    speedY: 0
  });

  const obstaclesRef = useRef<GameObject[]>([]);
  const frameCountRef = useRef(0);
  const keysRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef(0);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const roadOffsetRef = useRef(0);

  const preloadImages = useCallback(() => {
    const imagesToLoad = [
      '/racing/car6.png',
      ...OBSTACLE_TYPES.map(o => o.image)
    ];

    imagesToLoad.forEach(src => {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        imagesRef.current.set(src, img);
      };
    });
  }, []);

  const checkCollision = useCallback((obj1: { x: number; y: number; width: number; height: number },
                                       obj2: { x: number; y: number; width: number; height: number }): boolean => {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }, []);

  const spawnObstacle = useCallback(() => {
    const obstacleType = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
    const lane = Math.floor(Math.random() * NUM_LANES);
    const x = 40 + (lane * LANE_WIDTH) + (LANE_WIDTH - obstacleType.width) / 2;
    const speedMultiplier = 1 + (frameCountRef.current / 1000);

    const obstacle: GameObject = {
      x,
      y: -obstacleType.height,
      width: obstacleType.width,
      height: obstacleType.height,
      speed: BASE_OBSTACLE_SPEED * speedMultiplier,
      image: obstacleType.image,
      type: obstacleType.type
    };

    obstaclesRef.current.push(obstacle);
  }, []);

  const drawRoad = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = '#444';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, 30, CANVAS_HEIGHT);
    ctx.fillRect(CANVAS_WIDTH - 30, 0, 30, CANVAS_HEIGHT);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 20]);

    roadOffsetRef.current += 8;
    if (roadOffsetRef.current > 40) roadOffsetRef.current = 0;

    ctx.save();
    ctx.translate(0, roadOffsetRef.current);

    for (let i = 1; i < NUM_LANES; i++) {
      const x = 40 + i * LANE_WIDTH;
      ctx.beginPath();
      ctx.moveTo(x, -40);
      ctx.lineTo(x, CANVAS_HEIGHT + 40);
      ctx.stroke();
    }

    ctx.restore();
    ctx.setLineDash([]);
  }, []);

  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== 'playing') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    drawRoad(ctx);

    const player = playerRef.current;

    const MOVE_SPEED = 10;
    if (keysRef.current.has('ArrowLeft') && player.x > 40) {
      player.x -= MOVE_SPEED;
    }
    if (keysRef.current.has('ArrowRight') && player.x < CANVAS_WIDTH - 70) {
      player.x += MOVE_SPEED;
    }
    if (keysRef.current.has('ArrowUp') && player.y > 50) {
      player.y -= MOVE_SPEED;
    }
    if (keysRef.current.has('ArrowDown') && player.y < CANVAS_HEIGHT - 100) {
      player.y += MOVE_SPEED;
    }

    const playerImg = imagesRef.current.get('/racing/car6.png');
    if (playerImg) {
      ctx.drawImage(playerImg, player.x, player.y, player.width, player.height);
    } else {
      ctx.fillStyle = '#00f';
      ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    frameCountRef.current++;
    if (frameCountRef.current % SPAWN_INTERVAL === 0) {
      spawnObstacle();
    }

    const obstacles = obstaclesRef.current;
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i];

      obstacle.y += obstacle.speed;

      if (obstacle.y > CANVAS_HEIGHT) {
        obstacles.splice(i, 1);
        continue;
      }

      if (checkCollision(player, obstacle)) {
        setGameState('gameover');
        if (score > highScore) {
          setHighScore(score);
          localStorage.setItem('racingHighScore', score.toString());
        }
        return;
      }

      const obstacleImg = imagesRef.current.get(obstacle.image);
      if (obstacleImg) {
        ctx.drawImage(obstacleImg, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      } else {
        ctx.fillStyle = '#f00';
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
      }
    }

    setScore(Math.floor(frameCountRef.current / 10));

    ctx.fillStyle = 'white';
    ctx.font = 'bold 30px Arial';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 3;
    ctx.strokeText(`Score: ${score}`, 20, 40);
    ctx.fillText(`Score: ${score}`, 20, 40);

    const speed = Math.floor(BASE_OBSTACLE_SPEED * (1 + frameCountRef.current / 1000));
    ctx.font = 'bold 20px Arial';
    ctx.strokeText(`Speed: ${speed}`, 20, 70);
    ctx.fillText(`Speed: ${speed}`, 20, 70);

    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, score, highScore, drawRoad, checkCollision, spawnObstacle]);

  const startGame = useCallback(() => {
    playerRef.current = {
      x: PLAYER_START_X,
      y: PLAYER_START_Y,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      speedX: 0,
      speedY: 0
    };

    obstaclesRef.current = [];
    frameCountRef.current = 0;
    roadOffsetRef.current = 0;
    setScore(0);
    setGameState('playing');

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault();
        keysRef.current.add(e.key);
      }
      if (e.key === ' ' && gameState === 'gameover') {
        startGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, startGame]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;

    const player = playerRef.current;

    const dx = touchX - (player.x + player.width / 2);
    const dy = touchY - (player.y + player.height / 2);
    const TOUCH_SPEED = 12;

    if (Math.abs(dx) > 10) {
      player.x += Math.sign(dx) * TOUCH_SPEED;
      player.x = Math.max(40, Math.min(CANVAS_WIDTH - 70, player.x));
    }
    if (Math.abs(dy) > 10) {
      player.y += Math.sign(dy) * TOUCH_SPEED;
      player.y = Math.max(50, Math.min(CANVAS_HEIGHT - 100, player.y));
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    preloadImages();

    const saved = localStorage.getItem('racingHighScore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, [preloadImages]);

  useEffect(() => {
    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, gameLoop]);

  if (!isMounted) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
        Loading...
      </div>
    );
  }

  if (gameState === 'gameover') {
    return (
      <div style={{
        minHeight: '100vh',
        background: `url('https://up6.cc/2025/10/176116251220711.png') center/cover no-repeat`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {/* Header */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.4)'
            }}>
              <Car size={24} color="white" />
            </div>
            <div>
              <p style={{ 
                color: 'white', 
                fontSize: '20px', 
                fontWeight: '900', 
                margin: 0,
                letterSpacing: '1px',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
              }}>
                DRIVING ROAD
              </p>
              <p style={{ 
                color: '#feca57', 
                fontSize: '10px', 
                margin: 0,
                fontWeight: '700',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                RACE & EARN
              </p>
            </div>
          </div>
        </div>

        {/* Game Over Content */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '28px',
          padding: '40px 32px',
          textAlign: 'center',
          maxWidth: '400px',
          width: '100%',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          marginTop: '60px'
        }}>
          {/* Game Over Title */}
          <div style={{
            fontSize: '32px',
            fontWeight: '900',
            color: '#ff6b6b',
            marginBottom: '24px',
            textShadow: '0 0 20px rgba(255, 107, 107, 0.5)',
            letterSpacing: '2px'
          }}>
            GAME OVER
          </div>

          {/* Score Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <p style={{ 
              color: 'rgba(255,255,255,0.8)', 
              fontSize: '16px', 
              marginBottom: '12px',
              fontWeight: '600'
            }}>
              Your Score
            </p>
            <div style={{
              fontSize: '48px',
              fontWeight: '900',
              color: '#feca57',
              textShadow: '0 0 20px rgba(254, 202, 87, 0.5)',
              marginBottom: '16px'
            }}>
              {score}
            </div>

            {/* High Score */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '12px 20px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <Trophy size={16} color="#feca57" fill="#feca57" />
              <p style={{ 
                color: 'rgba(255,255,255,0.9)', 
                fontSize: '14px', 
                margin: 0,
                fontWeight: '700'
              }}>
                High Score: {highScore}
              </p>
            </div>

            {/* New High Score Badge */}
            {score >= highScore && score > 0 && (
              <div style={{
                background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '800',
                marginTop: '16px',
                display: 'inline-block',
                boxShadow: '0 4px 15px rgba(254, 202, 87, 0.4)'
              }}>
                🎉 New High Score! 🎉
              </div>
            )}
          </div>

          {/* Buttons */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <button
              onClick={() => {
                setScore(0);
                startGame();
              }}
              style={{
                background: 'linear-gradient(135deg, #feca57 0%, #ff9ff3 100%)',
                color: 'white',
                fontWeight: '800',
                padding: '18px 32px',
                borderRadius: '20px',
                fontSize: '16px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: '0 6px 25px rgba(254, 202, 87, 0.4)',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
                letterSpacing: '1px'
              }}
            >
              <Play size={20} fill="white" />
              Try Again
            </button>

            <button
              onClick={() => {
                if (onGameOver) onGameOver(score);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255,255,255,0.9)',
                fontWeight: '700',
                padding: '16px 32px',
                borderRadius: '20px',
                fontSize: '14px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                backdropFilter: 'blur(10px)'
              }}
            >
              Back to Menu
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              background: '#1dd1a1',
              borderRadius: '50%'
            }} />
            <p style={{ 
              color: 'rgba(255,255,255,0.8)', 
              fontSize: '12px', 
              fontWeight: '600', 
              margin: 0 
            }}>
              Driving Road - Race & Earn
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0',
      margin: '0',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onTouchMove={handleTouchMove}
        onTouchStart={(e) => e.preventDefault()}
        style={{
          touchAction: 'none',
          cursor: 'none',
          display: 'block',
          background: '#333',
          width: '100%',
          height: '100%',
          objectFit: 'contain'
        }}
      />
    </div>
  );
}
