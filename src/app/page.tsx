"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCollection, Car } from "@/context/CollectionContext";

const defaultJesko: Car = {
  id: "koenigsegg-jesko-absolut",
  name: "Koenigsegg Jesko Absolut",
  subName: "KOENIGSEGG SPECIFICATION",
  price: "$3.0M",
  accel: "2.5s",
  topSpeed: "330+ mph",
  power: "1600 HP",
  specLabel: "POWERPLANT",
  specValue: "5.0L TWIN-TURBO V8",
  image: "/images/cars/koenigsegg-jesko-absolut.jpg",
  tag: "FASTEST OVERALL",
};

// Pseudo-3D Road Constants
const SEGMENT_LENGTH = 200;
const ROAD_WIDTH = 2000;
const CAMERA_HEIGHT = 800;
const CAMERA_DEPTH = 0.8; 
const DRAW_DISTANCE = 220; 
const TOTAL_SEGMENTS = 1000;

interface Segment {
  index: number;
  p1: { x: number; y: number; z: number };
  p2: { x: number; y: number; z: number };
  curve: number;
  hill: number;
  color: string;
}

interface RainLine {
  x: number;
  y: number;
  vy: number;
  length: number;
  opacity: number;
}

interface WindshieldDrop {
  x: number;
  y: number;
  r: number;
  vy: number;
}

interface TrafficCar {
  x: number;
  z: number;
  speed: number;
  sideOffset: number;
}

interface WarpLine {
  angle: number;
  radius: number;
  speed: number;
  length: number;
  color: string;
}

export default function Home() {
  const { collection } = useCollection();
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const selectedCarRef = useRef<Car | null>(null);
  const speedDialMaxRef = useRef(240);

  // Sound states
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isAccelerating, setIsAccelerating] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // HUD values synced to DOM for 60fps performance
  const speedRef = useRef(75);
  const rpmRef = useRef(2000);
  const gearRef = useRef(3);
  const steerOffsetRef = useRef(0); // -1 to 1
  const steerTargetRef = useRef(0);
  const isShiftingRef = useRef(false);
  const isAcceleratingRef = useRef(false);

  // Sync selected car from collection (with Jesko fallback)
  useEffect(() => {
    if (collection && collection.length > 0) {
      const jesko = collection.find(c => c.id === "koenigsegg-jesko-absolut");
      setSelectedCar(jesko || collection[0]);
    } else {
      setSelectedCar(defaultJesko);
    }
  }, [collection]);

  useEffect(() => {
    selectedCarRef.current = selectedCar;
    if (selectedCar) {
      const carTopSpeed = parseInt(selectedCar.topSpeed.replace(/[^0-9]/g, "")) || 220;
      let maxScale = 240;
      if (carTopSpeed > 310) maxScale = 360;
      else if (carTopSpeed > 250) maxScale = 300;
      else if (carTopSpeed > 210) maxScale = 240;
      else maxScale = 200;
      speedDialMaxRef.current = maxScale;
    }
  }, [selectedCar]);

  // Canvas and audio references
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  // DOM Refs for direct updates to bypass React re-renders at 60 FPS
  const domSpeedText = useRef<HTMLSpanElement>(null);
  const domRpmText = useRef<HTMLSpanElement>(null);
  const domGearText = useRef<HTMLSpanElement>(null);
  const domYoke = useRef<SVGSVGElement>(null);
  const domGforceDot = useRef<HTMLDivElement>(null);
  
  // Analog needles
  const domSpeedNeedle = useRef<SVGLineElement>(null);
  const domRpmNeedle = useRef<SVGLineElement>(null);

  // Dash consoles
  const domTCIndicator = useRef<HTMLDivElement>(null);
  const domShiftAlert = useRef<HTMLDivElement>(null);
  const domCheckEngine = useRef<HTMLDivElement>(null);
  const domBatteryLight = useRef<HTMLDivElement>(null);

  // New Polish Refs
  const domRadioText = useRef<HTMLDivElement>(null);
  const domOscilloscopePath = useRef<SVGPathElement>(null);
  const domSpeedHalo = useRef<HTMLDivElement>(null);
  const domRpmHalo = useRef<HTMLDivElement>(null);
  const oscPhaseRef = useRef(0);

  // Gear Boundaries (mph)
  // Gear boundaries are computed dynamically based on the selected pilot car

  // Initialize Client check
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Web Audio Synth Engine
  const startEngineAudio = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Primary engine oscillator: Sawtooth for rich V8 acoustic grit
      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";

      // Secondary low-growl oscillator: Triangle detuned below fundamental
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";

      // lowpass filter to model acoustic exhaust muffling
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = 4.5;

      // Gain node for engine volume/power
      const gainNode = ctx.createGain();
      gainNode.gain.value = 0.12;

      // Connection Routing
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Start Synthesizer
      osc1.start(0);
      osc2.start(0);

      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      filterRef.current = filter;
      gainRef.current = gainNode;

      setAudioEnabled(true);
    } catch (e) {
      console.error("Failed to initialize Web Audio API engine sound:", e);
    }
  };

  const stopEngineAudio = () => {
    try {
      if (osc1Ref.current) osc1Ref.current.stop();
      if (osc2Ref.current) osc2Ref.current.stop();
    } catch (e) {}
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    osc1Ref.current = null;
    osc2Ref.current = null;
    filterRef.current = null;
    gainRef.current = null;
    setAudioEnabled(false);
  };

  const toggleSound = () => {
    if (audioCtxRef.current) {
      stopEngineAudio();
    } else {
      startEngineAudio();
    }
  };

  // Keyboard Event Listeners for Spacebar Throttle
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        setIsAccelerating(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsAccelerating(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      stopEngineAudio();
    };
  }, []);

  // Update Accelerating ref when state changes
  useEffect(() => {
    isAcceleratingRef.current = isAccelerating;
  }, [isAccelerating]);


  // Main canvas rendering & physics game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let position = 0; // Current distance along the road

    // Build the pseudo-3D road geometry
    const segments: Segment[] = [];
    let accumulatedCurve = 0;
    
    for (let i = 0; i < TOTAL_SEGMENTS; i++) {
      // Dynamic curves
      let curve = 0;
      if (i > 80 && i < 180) curve = 2.0;
      if (i > 220 && i < 320) curve = -2.5;
      if (i > 400 && i < 520) curve = 3.2;
      if (i > 600 && i < 720) curve = -1.8;
      if (i > 800 && i < 900) curve = 2.0;

      // Hills
      let hill = 0;
      if (i > 150 && i < 280) hill = Math.sin((i - 150) / 25) * 200;

      accumulatedCurve += curve;

      segments.push({
        index: i,
        p1: { x: (accumulatedCurve - curve) * 8, y: i > 0 ? segments[i - 1].p2.y : 0, z: i * SEGMENT_LENGTH },
        p2: { x: accumulatedCurve * 8, y: hill, z: (i + 1) * SEGMENT_LENGTH },
        curve,
        hill,
        color: i % 4 < 2 ? "even" : "odd"
      });
    }

    // Static random stars (dark sky)
    const stars: { x: number; y: number; size: number }[] = [];
    for (let i = 0; i < 40; i++) {
      stars.push({
        x: Math.random() * 2000,
        y: Math.random() * 200,
        size: Math.random() * 1.5
      });
    }

    // Windshield Rain Droplets (slow sliding)
    const windshieldDrops: WindshieldDrop[] = [];
    for (let i = 0; i < 45; i++) {
      windshieldDrops.push({
        x: Math.random() * 1920,
        y: Math.random() * 600,
        r: Math.random() * 2.5 + 1.2,
        vy: Math.random() * 0.4 + 0.1
      });
    }

    // Rain lines (fast streaks outside)
    const rainLines: RainLine[] = [];
    for (let i = 0; i < 60; i++) {
      rainLines.push({
        x: Math.random() * 2000,
        y: Math.random() * 800,
        vy: Math.random() * 25 + 20,
        length: Math.random() * 20 + 15,
        opacity: Math.random() * 0.12 + 0.05
      });
    }

    // Traffic Cars ahead of the player
    const trafficCars: TrafficCar[] = [
      { x: -450, z: 2200, speed: 65, sideOffset: -0.25 },
      { x: 550, z: 5800, speed: 68, sideOffset: 0.28 },
      { x: -150, z: 9500, speed: 58, sideOffset: -0.08 },
      { x: 350, z: 13000, speed: 72, sideOffset: 0.18 }
    ];

    // High speed laser warp lines
    const warpLines: WarpLine[] = [];
    for (let i = 0; i < 30; i++) {
      warpLines.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 800 + 100,
        speed: Math.random() * 18 + 12,
        length: Math.random() * 80 + 50,
        color: Math.random() > 0.5 ? "rgba(0, 240, 255, 0.45)" : "rgba(255, 0, 85, 0.45)"
      });
    }

    // Window resize handler
    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Helper polygon drawing
    const drawPolygon = (
      c: CanvasRenderingContext2D,
      x1: number, y1: number,
      x2: number, y2: number,
      x3: number, y3: number,
      x4: number, y4: number,
      fillColor: string
    ) => {
      c.fillStyle = fillColor;
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x2, y2);
      c.lineTo(x3, y3);
      c.lineTo(x4, y4);
      c.closePath();
      c.fill();
    };

    // Game loop tick
    const tick = () => {
      const w = canvas.width;
      const h = canvas.height;
      const horizonY = h * 0.42;

      // --- 1. PHYSICS & TELEMETRY CALCULATIONS ---
      const activeCar = selectedCarRef.current || defaultJesko;
      const carTopSpeed = parseInt(activeCar.topSpeed.replace(/[^0-9]/g, "")) || 220;
      const carAccelSecs = parseFloat(activeCar.accel.replace(/[^0-9.]/g, "")) || 2.5;
      const isElectric = activeCar.id === "rimac-nevera" || activeCar.power?.includes("ELECTRIC") || activeCar.specValue?.toLowerCase().includes("electric");

      const activeAccelerating = isAcceleratingRef.current;
      const targetSpeed = activeAccelerating ? carTopSpeed : 75;

      // Speed simulation
      if (isShiftingRef.current) {
        speedRef.current += (speedRef.current * -0.015);
      } else {
        // Lower 0-60s acceleration times lead to a higher speed increment factor
        const accelRate = activeAccelerating ? (0.028 / carAccelSecs) : 0.018;
        speedRef.current += (targetSpeed - speedRef.current) * accelRate;
      }
      
      // Safety cap at car's top speed limit
      if (speedRef.current > carTopSpeed) {
        speedRef.current -= (speedRef.current - carTopSpeed) * 0.05;
      }

      const currentSpeed = speedRef.current;

      // Dynamic Gear setup (e.g. 9-speed for Jesko, 7-speed for others, single drive D for EVs)
      const numGears = activeCar.id === "koenigsegg-jesko-absolut" ? 9 : 7;
      const speedStep = carTopSpeed / numGears;
      const dynamicGearRanges = Array.from({ length: numGears }).map((_, idx) => {
        return {
          min: idx === 0 ? 0 : Math.round(idx * speedStep - 5),
          max: Math.round((idx + 1) * speedStep + 5)
        };
      });

      let currentGear = gearRef.current;
      let gearRatio = 0;

      if (isElectric) {
        gearRef.current = 1; // EVs hold Direct Drive
        const targetRpmVal = 1000 + (currentSpeed / carTopSpeed) * 7500;
        rpmRef.current += (targetRpmVal - rpmRef.current) * 0.12;
        gearRatio = currentSpeed / carTopSpeed;
      } else {
        const currentRange = dynamicGearRanges[currentGear - 1] || { min: 0, max: 200 };

        // Upshift trigger
        if (currentSpeed > currentRange.max && currentGear < numGears && !isShiftingRef.current) {
          isShiftingRef.current = true;
          
          // Trigger Shift Visual indicator
          if (domShiftAlert.current) {
            domShiftAlert.current.classList.remove("opacity-0");
            domShiftAlert.current.classList.add("opacity-100", "scale-105");
          }

          // Trigger upshift audio cut if sound is enabled
          if (audioCtxRef.current && gainRef.current) {
            const now = audioCtxRef.current.currentTime;
            gainRef.current.gain.setValueAtTime(gainRef.current.gain.value, now);
            gainRef.current.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
            gainRef.current.gain.exponentialRampToValueAtTime(0.28, now + 0.13);
          }

          setTimeout(() => {
            gearRef.current += 1;
            isShiftingRef.current = false;
            if (domShiftAlert.current) {
              domShiftAlert.current.classList.remove("opacity-100", "scale-105");
              domShiftAlert.current.classList.add("opacity-0");
            }
          }, 140);
        } 
        // Downshift trigger
        else if (currentSpeed < currentRange.min && currentGear > 1 && !isShiftingRef.current) {
          isShiftingRef.current = true;
          setTimeout(() => {
            gearRef.current -= 1;
            isShiftingRef.current = false;
          }, 110);
        }

        currentGear = gearRef.current;
        const activeRange = dynamicGearRanges[currentGear - 1] || { min: 0, max: 200 };
        gearRatio = (currentSpeed - activeRange.min) / (activeRange.max - activeRange.min);

        // RPM calculations
        let targetRpm = 1800 + Math.max(0, Math.min(1, gearRatio)) * 6200;
        if (isShiftingRef.current) {
          targetRpm = 4000;
        }
        rpmRef.current += (targetRpm - rpmRef.current) * 0.16;
      }

      const currentRpm = rpmRef.current;

      // Audio engine frequency synch
      if (audioCtxRef.current && osc1Ref.current && osc2Ref.current && filterRef.current && gainRef.current) {
        if (isElectric) {
          // Electric Whine Synth (Continuous sine + triangle pitch slide)
          const synthFreq = 120 + (currentSpeed / carTopSpeed) * 650;
          osc1Ref.current.frequency.setTargetAtTime(synthFreq, audioCtxRef.current.currentTime, 0.06);
          osc2Ref.current.frequency.setTargetAtTime(synthFreq * 1.5, audioCtxRef.current.currentTime, 0.06);
          
          const filterCutoff = 400 + (currentSpeed / carTopSpeed) * 2000;
          filterRef.current.frequency.setTargetAtTime(filterCutoff, audioCtxRef.current.currentTime, 0.06);
          
          const volume = activeAccelerating ? 0.14 : 0.04;
          gainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.08);

          if (osc1Ref.current.type !== "sine") osc1Ref.current.type = "sine";
          if (osc2Ref.current.type !== "triangle") osc2Ref.current.type = "triangle";
        } else {
          // Combustion Engine Synth (Rich sawtooth V8 growl)
          if (osc1Ref.current.type !== "sawtooth") osc1Ref.current.type = "sawtooth";
          if (osc2Ref.current.type !== "triangle") osc2Ref.current.type = "triangle";

          const baseFreq = (currentRpm / 60) * 1.5;
          osc1Ref.current.frequency.setTargetAtTime(baseFreq, audioCtxRef.current.currentTime, 0.06);
          osc2Ref.current.frequency.setTargetAtTime(baseFreq * 0.5 + (activeAccelerating ? 2.5 : 0), audioCtxRef.current.currentTime, 0.06);

          const filterCutoff = 170 + (currentRpm / 8500) * 750;
          filterRef.current.frequency.setTargetAtTime(filterCutoff, audioCtxRef.current.currentTime, 0.06);

          if (!isShiftingRef.current) {
            const volume = activeAccelerating 
              ? 0.28 + (currentRpm / 8500) * 0.2 
              : 0.09 + (currentRpm / 8500) * 0.06;
            gainRef.current.gain.setTargetAtTime(volume, audioCtxRef.current.currentTime, 0.09);
          }
        }
      }

      // Steering & Curvature Offset Easing
      steerOffsetRef.current += (steerTargetRef.current - steerOffsetRef.current) * 0.07;
      const steerOffset = steerOffsetRef.current;

      // Update position along the road based on speed
      position += (currentSpeed * 0.42);

      // --- 2. RENDER THE ENVIRONMENT BACKGROUND (Canvas) ---
      // Clear screen (Pitch black night sky)
      ctx.fillStyle = "#020106";
      ctx.fillRect(0, 0, w, h);

      // Camera vibration shake at high speeds
      let cameraShakeX = 0;
      let cameraShakeY = 0;
      if (currentSpeed > 130) {
        const intensity = ((currentSpeed - 130) / 110) * 2.2;
        cameraShakeX = (Math.random() - 0.5) * intensity;
        cameraShakeY = (Math.random() - 0.5) * intensity;
      }
      ctx.save();
      ctx.translate(cameraShakeX, cameraShakeY);

      // Render Starfield background with steering offset panning (very dim)
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      stars.forEach((star) => {
        const panX = (star.x - steerOffset * 60 + w) % w;
        ctx.fillRect(panX, star.y, star.size, star.size);
      });

      // Render Beautiful Glowing Sunset Sun
      const sunX = w / 2 - steerOffset * 90;
      const sunY = horizonY - 5;
      const sunR = Math.min(80, w * 0.07);
      const sunGrad = ctx.createLinearGradient(sunX, sunY - sunR, sunX, sunY + 20);
      sunGrad.addColorStop(0, "#ff3700");   // Deep sunset red
      sunGrad.addColorStop(0.5, "#ff8c00"); // Rich orange
      sunGrad.addColorStop(1, "#ffa200");   // Warm golden yellow
      
      ctx.save();
      ctx.fillStyle = sunGrad;
      ctx.shadowColor = "#ff3700";
      ctx.shadowBlur = 35;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render Parallax Far Mountains (Slow scrolling)
      ctx.fillStyle = "#08060d";
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      const farMountainPoints = [
        { x: 0, y: 0.05 },
        { x: 0.15, y: 0.16 },
        { x: 0.35, y: 0.07 },
        { x: 0.55, y: 0.22 },
        { x: 0.75, y: 0.11 },
        { x: 0.9, y: 0.18 },
        { x: 1.0, y: 0.05 }
      ];
      const farScroll = (steerOffset * 0.03) % 1.0;
      for (let i = 0; i <= 2; i++) {
        const shift = (i - 1 + farScroll) * w;
        farMountainPoints.forEach((p, idx) => {
          const px = shift + p.x * w;
          const py = horizonY - p.y * 120;
          if (idx === 0 && i === 0) ctx.moveTo(px, horizonY);
          else ctx.lineTo(px, py);
        });
      }
      ctx.lineTo(w, horizonY);
      ctx.closePath();
      ctx.fill();

      // Render Parallax Near Mountains (Medium scrolling, darker peaks)
      ctx.fillStyle = "#0c0a13";
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      const nearMountainPoints = [
        { x: 0, y: 0.07 },
        { x: 0.2, y: 0.24 },
        { x: 0.4, y: 0.12 },
        { x: 0.6, y: 0.28 },
        { x: 0.75, y: 0.16 },
        { x: 0.9, y: 0.22 },
        { x: 1.0, y: 0.07 }
      ];
      const nearScroll = (steerOffset * 0.07) % 1.0;
      for (let i = 0; i <= 2; i++) {
        const shift = (i - 1 + nearScroll) * w;
        nearMountainPoints.forEach((p, idx) => {
          const px = shift + p.x * w;
          const py = horizonY - p.y * 100;
          if (idx === 0 && i === 0) ctx.moveTo(px, horizonY);
          else ctx.lineTo(px, py);
        });
      }
      ctx.lineTo(w, horizonY);
      ctx.closePath();
      ctx.fill();

      // Horizon base filling
      ctx.fillStyle = "#0d0b14";
      ctx.fillRect(0, horizonY, w, h - horizonY);

      // --- 3. PROJECT PSEUDO-3D ROAD SEGMENTS WITH ABSOLUTE WORLD COORDINATES ---
      const startSegment = Math.floor(position / SEGMENT_LENGTH);
      const baseSegment = segments[startSegment % segments.length];
      const percent = (position % SEGMENT_LENGTH) / SEGMENT_LENGTH;
      
      // Calculate absolute camera trajectory position on the road
      const cameraX = baseSegment.p1.x + percent * (baseSegment.p2.x - baseSegment.p1.x);
      const cameraY = CAMERA_HEIGHT + baseSegment.p1.y + percent * (baseSegment.p2.y - baseSegment.p1.y);
      const playerX = steerOffset * ROAD_WIDTH;

      interface ProjectedPoint {
        x: number;
        y: number;
        w: number;
        scale: number;
        z: number;
        segment: Segment;
      }

      const projectedPoints: ProjectedPoint[] = [];
      
      for (let n = 0; n < DRAW_DISTANCE; n++) {
        const segment = segments[(startSegment + n) % segments.length];
        const loopZ = (startSegment + n >= segments.length) ? segments.length * SEGMENT_LENGTH : 0;
        const zDepth = segment.p1.z + loopZ - position;

        // Clip segments behind or too close to the camera to avoid division by zero (Infinity scale)
        if (zDepth <= 50) continue;

        const p1 = {
          x: segment.p1.x - cameraX - playerX,
          y: segment.p1.y - cameraY,
          z: zDepth
        };

        const scale = CAMERA_DEPTH / p1.z;
        if (!isFinite(scale) || scale <= 0) continue;

        // Map sY relative to horizonY so the road vanishing point converges exactly at the horizon line
        const sX = Math.round((w / 2) + (scale * p1.x * w / 2));
        const sY = Math.round(horizonY - (scale * p1.y * h / 2));
        const sW = Math.round(scale * ROAD_WIDTH * w / 2);

        projectedPoints.push({
          x: sX,
          y: sY,
          w: sW,
          scale: scale,
          z: zDepth,
          segment: segment
        });
      }

      // --- 4. RENDER PSEUDO-3D ROAD SEGMENTS (Painter's Algorithm: Far to Near) ---
      for (let n = projectedPoints.length - 2; n >= 0; n--) {
        const p1 = projectedPoints[n];     // Nearer point
        const p2 = projectedPoints[n + 1]; // Farther point
        const segment = p1.segment;

        if (p2.y >= p1.y) continue; // Clip behind hills / backward projection clip

        // Headlight range mapping: lights illuminate up to Z = 5000 units (longer range)
        const lightAlpha = Math.max(0, 1 - p1.z / 5000);
        
        // Base dark asphalt color, with a minimum ambient lighting (0.12) so it never becomes completely invisible
        const roadAlpha = 0.12 + lightAlpha * 0.88;
        const ar = 16 + lightAlpha * 35;
        const ag = 14 + lightAlpha * 30;
        const ab = 26 + lightAlpha * 15;
        const roadColor = `rgba(${Math.floor(ar)}, ${Math.floor(ag)}, ${Math.floor(ab)}, ${roadAlpha})`;
        drawPolygon(ctx, p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y, roadColor);

        // Render Roadside Guardrails (Grey barriers with illuminated reflectors)
        const barrierW1 = p1.w * 0.07;
        const barrierW2 = p2.w * 0.07;
        const barrierAlpha = 0.15 + lightAlpha * 0.85;
        const barrierColor = `rgba(135, 135, 140, ${barrierAlpha})`;
        
        // Left barrier
        drawPolygon(
          ctx, 
          p1.x - p1.w - barrierW1, p1.y, 
          p1.x - p1.w, p1.y, 
          p2.x - p2.w, p2.y, 
          p2.x - p2.w - barrierW2, p2.y, 
          barrierColor
        );
        // Right barrier
        drawPolygon(
          ctx, 
          p1.x + p1.w, p1.y, 
          p1.x + p1.w + barrierW1, p1.y, 
          p2.x + p2.w + barrierW2, p2.y, 
          p2.x + p2.w, p2.y, 
          barrierColor
        );

        // Render Center Paint Lane (yellow dashed markings, visible through ambient lighting)
        if (segment.color === "even") {
          const dashW1 = p1.w * 0.024;
          const dashW2 = p2.w * 0.024;
          const laneAlpha = 0.18 + lightAlpha * 0.82;
          drawPolygon(
            ctx,
            p1.x - dashW1, p1.y,
            p1.x + dashW1, p1.y,
            p2.x + dashW2, p2.y,
            p2.x - dashW2, p2.y,
            `rgba(255, 195, 0, ${laneAlpha})` // Glowing yellow lines
          );
        }

        // Render Roadside halogen streetlights on the left shoulder (every 22 segments)
        if (segment.index % 22 === 0) {
          const poleX = segment.p1.x - ROAD_WIDTH * 1.35 - playerX;
          const poleY = segment.p1.y - cameraY;
          
          const sX = Math.round((w / 2) + (p1.scale * poleX * w / 2));
          const sY = Math.round(horizonY - (p1.scale * poleY * h / 2));
          
          const poleH = p1.scale * 600 * h / 2;
          const armW = p1.scale * 130 * w / 2;

          if (sY > horizonY && p1.scale > 0.003) {
            // Dark metal streetlight pole
            ctx.strokeStyle = "rgba(45, 47, 52, " + Math.min(1, p1.scale * 50) + ")";
            ctx.lineWidth = Math.max(1, 2.5 * p1.scale * w / 2);
            ctx.beginPath();
            ctx.moveTo(sX, sY);
            ctx.lineTo(sX, sY - poleH);
            ctx.lineTo(sX + armW, sY - poleH); // Outreach arm over the road
            ctx.stroke();

            // Glowing streetlight bulb
            const bulbX = sX + armW;
            const bulbY = sY - poleH;
            ctx.fillStyle = "#ffaa33";
            ctx.shadowColor = "#ffa500";
            ctx.shadowBlur = Math.max(2, 22 * p1.scale);
            ctx.beginPath();
            ctx.arc(bulbX, bulbY, Math.max(1, 5 * p1.scale * w / 2), 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0; // reset shadow

            // Cast warm yellow light cone on the asphalt surface underneath
            const lightDist = Math.max(0, 1 - Math.abs(p1.z) / 1600);
            if (lightDist > 0) {
              const spotX = sX + armW;
              const spotY = sY;
              const spotW = p1.scale * 400 * w / 2;
              const spotH = p1.scale * 120 * h / 2;
              const spotAlpha = lightDist * 0.16;

              const spotGrad = ctx.createRadialGradient(spotX, spotY, 0, spotX, spotY, spotW);
              spotGrad.addColorStop(0, `rgba(255, 190, 80, ${spotAlpha})`);
              spotGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
              
              ctx.fillStyle = spotGrad;
              ctx.beginPath();
              ctx.ellipse(spotX, spotY, spotW, spotH, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // --- 5. RENDER DISTANT HIGHWAY TRAFFIC TAILLIGHTS ---
      trafficCars.forEach((car) => {
        car.z += (car.speed - currentSpeed) * 0.42;
        if (car.z < position) {
          car.z = position + 16000 + Math.random() * 4000;
        }

        const targetZ = car.z - position;
        if (targetZ > 0 && targetZ < DRAW_DISTANCE * SEGMENT_LENGTH) {
          const scale = CAMERA_DEPTH / targetZ;
          const segmentIndex = Math.floor(car.z / SEGMENT_LENGTH) % segments.length;
          const segment = segments[segmentIndex];
          
          const carX = segment.p1.x + car.sideOffset * ROAD_WIDTH - playerX;
          const carY = segment.p1.y - cameraY;

          const sX = Math.round((w / 2) + (scale * carX * w / 2));
          const sY = Math.round(horizonY - (scale * carY * h / 2));
          const size = Math.max(1.5, 25 * scale * w / 2);

          if (sY > horizonY) {
            ctx.save();
            ctx.fillStyle = "rgba(255, 50, 50, 0.9)";
            ctx.shadowColor = "#ff0000";
            ctx.shadowBlur = Math.max(3, 15 * scale);
            
            // Left tail light dot
            ctx.beginPath();
            ctx.arc(sX - size * 0.35, sY - size * 0.12, size * 0.08, 0, Math.PI * 2);
            ctx.fill();

            // Right tail light dot
            ctx.beginPath();
            ctx.arc(sX + size * 0.35, sY - size * 0.12, size * 0.08, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      });

      // --- 6. RENDER HIGH-SPEED DYNAMIC LASER WARP TRAILS (Nitrous Effect) ---
      if (currentSpeed > 100) {
        const warpIntensity = Math.min(1, (currentSpeed - 100) / 200); // 0 at 100mph, 1 at 300mph
        warpLines.forEach((wl) => {
          // Travel outwards from center vanishing point
          wl.radius += wl.speed * (1 + warpIntensity * 2.2);

          const startX = w / 2 - steerOffset * 90 + Math.cos(wl.angle) * wl.radius;
          const startY = horizonY + Math.sin(wl.angle) * wl.radius * 0.55; // squashed Y for perspective
          const endX = w / 2 - steerOffset * 90 + Math.cos(wl.angle) * (wl.radius + wl.length * warpIntensity);
          const endY = horizonY + Math.sin(wl.angle) * (wl.radius + wl.length * warpIntensity) * 0.55;

          if (startY > 0 && startY < h && startX > 0 && startX < w) {
            ctx.save();
            ctx.strokeStyle = wl.color;
            ctx.lineWidth = Math.max(0.6, 2.0 * warpIntensity);
            ctx.globalAlpha = warpIntensity * 0.5;
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            ctx.restore();
          }

          // Reset when bounds exceeded
          if (wl.radius > w * 0.95) {
            wl.radius = Math.random() * 40 + 10;
            wl.angle = Math.random() * Math.PI * 2;
          }
        });
      }

      // --- 7. RENDER FALLING RAIN STREAKS (Atmosphere outside) ---
      ctx.strokeStyle = "rgba(160, 165, 180, 0.12)";
      ctx.lineWidth = 1;
      rainLines.forEach((rl) => {
        ctx.beginPath();
        ctx.moveTo(rl.x, rl.y);
        ctx.lineTo(rl.x - rl.vy * 0.08, rl.y + rl.length);
        ctx.stroke();

        rl.y += rl.vy;
        rl.x -= rl.vy * 0.12; // slant wind drift
        if (rl.y > h) {
          rl.y = -rl.length;
          rl.x = Math.random() * w;
        }
      });

      // --- 8. RENDER WINDSHIELD WATER DROPLETS (Aerodynamic wind-shear outward sliding) ---
      ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
      ctx.lineWidth = 0.5;
      
      const windCenterValX = w / 2 - steerOffset * 90;
      const speedFactor = Math.min(1, Math.max(0, (currentSpeed - 80) / 180)); // 0 to 1

      windshieldDrops.forEach((drop) => {
        // Calculate outward vectors from windshield center (sunX, horizonY)
        const dx = drop.x - windCenterValX;
        const dy = drop.y - horizonY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const ndx = dx / dist;
        const ndy = dy / dist;

        ctx.beginPath();
        if (speedFactor > 0.15) {
          // At high speed, draw windshield droplets as streaks matching wind-shear vector
          const streakLen = drop.r * 2.2 * speedFactor;
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x + ndx * streakLen, drop.y + ndy * streakLen);
          ctx.stroke();
        } else {
          ctx.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // Shift vector from vertical slide to outward slide at high speeds
        drop.x += (1 - speedFactor) * (steerOffset * 0.6) + speedFactor * ndx * 6.5;
        drop.y += (1 - speedFactor) * drop.vy + speedFactor * ndy * 6.5;

        // Reset when moving off screen bounds
        if (drop.y > h * 0.6 || drop.x < 0 || drop.x > w || drop.y < 0) {
          drop.y = Math.random() * (h * 0.15);
          drop.x = Math.random() * w;
        }
      });

      // --- 9. HIGH-SPEED TUNNEL-VISION DIMMING OVERLAY ---
      if (currentSpeed > 80) {
        const focusFactor = Math.min(1, (currentSpeed - 80) / 220); // 0 to 1
        const focusIntensity = focusFactor * 0.75; // max 75% dimming
        const innerRadius = w * (0.28 - focusFactor * 0.16); // shrinks from 28% to 12% width
        const outerRadius = w * (0.58 - focusFactor * 0.18); // shrinks from 58% to 40% width
        const focusGrad = ctx.createRadialGradient(w / 2, horizonY, innerRadius, w / 2, horizonY, outerRadius);
        focusGrad.addColorStop(0, "rgba(0, 0, 0, 0)");
        focusGrad.addColorStop(1, `rgba(2, 1, 5, ${focusIntensity})`);
        ctx.fillStyle = focusGrad;
        ctx.fillRect(0, 0, w, h);
      }

      // --- 10. WINDSHIELD COCKPIT GLASS REFLECTIONS ---
      // Faint glowing reflection overlay of analog dial cluster on the glass
      const reflectY = h * 0.56;
      const reflectAlpha = 0.045 + (currentRpm / 9000) * 0.06; // scales with RPM
      ctx.save();
      
      // Speedometer reflection (Left dial relative to center)
      const reflectGradL = ctx.createRadialGradient(w / 2 - 130, reflectY, 12, w / 2 - 130, reflectY, 120);
      reflectGradL.addColorStop(0, `rgba(255, 75, 0, ${reflectAlpha})`);
      reflectGradL.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = reflectGradL;
      ctx.beginPath();
      ctx.ellipse(w / 2 - 130, reflectY, 140, 48, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tachometer reflection (Right dial relative to center)
      const reflectGradR = ctx.createRadialGradient(w / 2 + 130, reflectY, 12, w / 2 + 130, reflectY, 120);
      reflectGradR.addColorStop(0, `rgba(255, 75, 0, ${reflectAlpha})`);
      reflectGradR.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = reflectGradR;
      ctx.beginPath();
      ctx.ellipse(w / 2 + 130, reflectY, 140, 48, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();

      ctx.restore(); // restore from camera shake translation

      // --- 11. HUD / DASHBOARD DIRECT REAL-TIME DOM MANIPULATION ---
      if (domSpeedText.current) {
        domSpeedText.current.innerText = Math.round(currentSpeed).toString();
      }
      if (domRpmText.current) {
        domRpmText.current.innerText = Math.round(currentRpm).toString();
      }
      if (domGearText.current) {
        domGearText.current.innerText = isElectric ? "D" : `${currentGear}`;
      }

      // Rotate Dashboard Speedometer Needle (scales dynamically with dial scale max)
      if (domSpeedNeedle.current) {
        const speedAngle = -225 + Math.min(1, currentSpeed / speedDialMaxRef.current) * 270;
        domSpeedNeedle.current.style.transform = `rotate(${speedAngle}deg)`;
      }

      // Rotate Dashboard Tachometer Needle
      if (domRpmNeedle.current) {
        const rpmAngle = -225 + Math.min(1, currentRpm / 9000) * 270;
        domRpmNeedle.current.style.transform = `rotate(${rpmAngle}deg)`;
      }

      // Rotate Steering Wheel (transform CSS)
      if (domYoke.current) {
        const rotAngle = steerOffset * 50; // Max 50 degree rotation
        domYoke.current.style.transform = `rotate(${rotAngle}deg)`;
      }

      // Update G-Force Widget dot position based on steerOffset
      if (domGforceDot.current) {
        const dotX = steerOffset * 22; 
        const dotY = Math.abs(steerOffset) * 11;
        domGforceDot.current.style.transform = `translate(${dotX}px, ${dotY}px)`;
      }

      // Update warning diagnostics
      if (domTCIndicator.current) {
        if (activeAccelerating && Math.abs(steerOffset) > 0.35) {
          domTCIndicator.current.classList.remove("opacity-20");
          domTCIndicator.current.classList.add("opacity-100", "text-amber-500");
        } else {
          domTCIndicator.current.classList.remove("opacity-100", "text-amber-500");
          domTCIndicator.current.classList.add("opacity-20");
        }
      }

      // Dynamically pulse circular backlights (neons) beneath the speed & RPM gauges
      if (domSpeedHalo.current) {
        const sIntensity = 0.3 + (currentSpeed / 240) * 0.7;
        domSpeedHalo.current.style.transform = `scale(${0.95 + (currentSpeed / 240) * 0.12})`;
        domSpeedHalo.current.style.opacity = sIntensity.toString();
        domSpeedHalo.current.style.boxShadow = `0 0 ${16 + (currentSpeed / 240) * 24}px rgba(255, 69, 0, ${0.15 + (currentSpeed / 240) * 0.25})`;
      }
      if (domRpmHalo.current) {
        const rIntensity = 0.3 + (currentRpm / 9000) * 0.7;
        domRpmHalo.current.style.transform = `scale(${0.95 + (currentRpm / 9000) * 0.12})`;
        domRpmHalo.current.style.opacity = rIntensity.toString();
        domRpmHalo.current.style.boxShadow = `0 0 ${16 + (currentRpm / 9000) * 24}px rgba(255, 69, 0, ${0.15 + (currentRpm / 9000) * 0.3})`;
      }

      // Dynamic Radio Telemetry Oscilloscope updates
      if (domOscilloscopePath.current) {
        oscPhaseRef.current += 0.15 * (1 + (currentRpm / 3200));
        const points: string[] = [];
        const isAcc = activeAccelerating;
        const amp = 8 * (isAcc ? 1.5 : 0.7);
        const phase = oscPhaseRef.current;
        
        for (let x = 0; x <= 150; x += 4) {
          const y = 16 + Math.sin(x * 0.11 + phase) * amp * Math.sin(x * 0.02);
          points.push(`${x},${y.toFixed(2)}`);
        }
        domOscilloscopePath.current.setAttribute("d", `M 0,16 L ${points.join(" L ")}`);
      }

      // Dynamic Radio Telemetry text updates
      if (domRadioText.current) {
        if (currentSpeed > 240) {
          domRadioText.current.innerText = `WARP DETECTED: ${(currentSpeed * 1.60934).toFixed(0)} KM/H`;
          domRadioText.current.style.color = "#ff3300";
        } else if (activeAccelerating) {
          domRadioText.current.innerText = `THR: ${Math.round(gearRatio * 100)}% // RPM: ${Math.round(currentRpm)}`;
          domRadioText.current.style.color = "#ff5500";
        } else {
          domRadioText.current.innerText = `SYS_STABLE // 108.0MHz`;
          domRadioText.current.style.color = "#ffaa00";
        }
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);

    // Mouse movement listener for steering offset target
    const handleMouseMove = (e: MouseEvent) => {
      const screenW = window.innerWidth;
      const xMouse = e.clientX;
      const ratio = (xMouse / screenW) * 2 - 1;
      steerTargetRef.current = ratio;
    };
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface text-secondary antialiased font-sans select-none overflow-x-hidden">
      <Header />

      {/* Main FP Simulation Viewport */}
      <main className="flex-grow relative w-full h-[calc(100vh-80px-70px)] min-h-[600px] overflow-hidden flex flex-col justify-between">
        
        {/* Canvas background rendering Pseudo-3D road */}
        <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Ambient Dark Overlay (adds headlight tunnel effect at horizon) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-transparent to-black/75 pointer-events-none z-10" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#050608] to-transparent pointer-events-none z-10" />

        {/* Dynamic Gear Shift Overlay Alert */}
        <div 
          ref={domShiftAlert} 
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 transition-all duration-100 ease-out opacity-0"
        >
          <span className="font-anybody text-4xl md:text-5xl font-black italic text-primary-container drop-shadow-[0_0_15px_#ff5540] tracking-widest uppercase">
            SHIFTING
          </span>
        </div>

        {/* Floating HUD Headers */}
        <div className="relative z-20 w-full max-w-[1440px] mx-auto px-6 md:px-16 pt-6 md:pt-10 pointer-events-none flex flex-col lg:flex-row gap-6 justify-between items-start">
          
          {/* Left: Hero Info */}
          <div className="w-full lg:w-1/2 flex flex-col gap-3 items-start">
            <div className="inline-flex items-center gap-2 border border-outline-variant/40 px-3 py-1 bg-black/80 backdrop-blur-md clip-corner pointer-events-auto">
              <div className={`w-2 h-2 rounded-full ${audioEnabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"}`} />
              <span className="font-jetbrains-mono text-[9px] text-primary-container tracking-widest">
                NIGHT_CRUISE // ACTIVE_DRIVE
              </span>
            </div>
            
            <h1 className="font-anybody text-3xl md:text-5xl font-black text-secondary uppercase leading-none drop-shadow-[0_3px_6px_rgba(0,0,0,0.9)] tracking-tighter">
              KINETIC <br />
              <span className="text-primary-container drop-shadow-[0_0_12px_rgba(255,85,64,0.4)]">PRECISION</span>
            </h1>

            <p className="font-sans text-[11px] md:text-xs text-on-surface-variant max-w-xs border-l border-outline-variant/50 pl-2 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              Experience dynamic V8 engine sound models, real steering feedback, and dual-clutch shift boundaries. Hold Spacebar or full throttle to drive.
            </p>

            {/* Driving Car Selector & Preview */}
            <div className="flex flex-col gap-2 w-full max-w-xs mt-1 pointer-events-auto bg-black/75 border border-outline-variant/35 p-2.5 rounded backdrop-blur-md shadow-lg">
              <div className="flex items-center justify-between">
                <span className="font-jetbrains-mono text-[8px] text-primary-container tracking-widest">PILOT_SELECT</span>
                {selectedCar && (
                  <span className="font-jetbrains-mono text-[8px] text-emerald-400 tracking-wider">
                    {selectedCar.topSpeed} LIMIT
                  </span>
                )}
              </div>
              <div className="flex gap-2.5 items-center">
                {selectedCar && (
                  <img 
                    src={selectedCar.image} 
                    alt={selectedCar.name} 
                    className="w-14 h-8 object-cover rounded border border-outline-variant/40 bg-zinc-900"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <select 
                  value={selectedCar?.id || ""} 
                  onChange={(e) => {
                    const car = collection.find(c => c.id === e.target.value) || defaultJesko;
                    setSelectedCar(car);
                  }}
                  className="flex-1 bg-surface border border-outline-variant/30 text-secondary hover:border-primary-container font-jetbrains-mono text-[9px] tracking-widest font-bold uppercase focus:outline-none cursor-pointer py-1 px-2 rounded"
                >
                  {collection.length > 0 ? (
                    collection.map(car => (
                      <option key={car.id} value={car.id} className="bg-surface text-secondary text-[9px]">
                        {car.name}
                      </option>
                    ))
                  ) : (
                    <option value={defaultJesko.id} className="bg-surface text-secondary text-[9px]">
                      {defaultJesko.name}
                    </option>
                  )}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5 mt-2 pointer-events-auto">
              <Link 
                href="/brands"
                className="bg-primary-container text-black font-jetbrains-mono text-[9px] tracking-widest font-bold px-4 py-3 hover:bg-transparent hover:text-primary-container border border-primary-container transition-all duration-300 uppercase flex items-center gap-1.5 clip-corner -skew-x-6"
              >
                <span>SHOWROOM</span>
                <span className="material-symbols-outlined text-xs font-bold">arrow_forward</span>
              </Link>
              <Link 
                href="/collection"
                className="bg-black/85 text-secondary font-jetbrains-mono text-[9px] tracking-widest font-bold px-4 py-3 border border-outline-variant hover:border-primary hover:text-primary transition-all duration-300 uppercase flex items-center gap-1.5 clip-corner -skew-x-6 backdrop-blur-sm"
              >
                <span className="material-symbols-outlined text-xs">favorite</span>
                <span>WISHLIST</span>
              </Link>
            </div>
          </div>

          {/* Right: Sound Control */}
          <div className="w-full lg:w-auto flex flex-col gap-3 items-end pointer-events-auto">
            <button 
              onClick={toggleSound}
              className={`flex items-center gap-2.5 px-4.5 py-3 border font-jetbrains-mono text-[9px] font-bold tracking-widest uppercase transition-all duration-300 -skew-x-6 clip-corner ${
                audioEnabled 
                  ? "bg-emerald-500/25 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.25)]"
                  : "bg-black/85 border-outline-variant text-secondary hover:border-primary-container hover:text-primary-container"
              }`}
            >
              <span className="material-symbols-outlined text-sm">
                {audioEnabled ? "volume_up" : "volume_off"}
              </span>
              <span>{audioEnabled ? "V8 ACOUSTICS: ON" : "START ENGINE"}</span>
            </button>

            <div className="font-jetbrains-mono text-[8px] text-tertiary tracking-widest bg-black/80 px-2.5 py-1.5 border border-outline-variant/20 rounded backdrop-blur-sm text-right">
              HOLD [SPACEBAR] OR ACCELERATE PEDAL
            </div>
          </div>
        </div>

        {/* BOTTOM REALISTIC CAR COCKPIT INTERIOR */}
        <div className="relative z-20 w-full mt-auto flex flex-col items-center">
          
          {/* Main Dashboard Housing Frame */}
          <div className="w-full max-w-5xl mx-auto px-4">
            <div className="bg-[#0b0c10] border-t-4 border-x-2 border-[#191a21] rounded-t-[40px] p-4 md:p-6 backdrop-blur-md shadow-[0_-15px_35px_rgba(0,0,0,0.95)] flex flex-col md:flex-row gap-6 items-center justify-between relative overflow-hidden">
              
              {/* Dashboard seam lighting */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff5500]/25 to-transparent" />

              {/* Left Column: Dual Circular Analog Instrument Gauges */}
              <div className="flex items-center gap-6 justify-center w-full md:w-3/5">
                
                {/* Speedometer Gauge Dial (Left) */}
                <div className="relative flex flex-col items-center">
                  {/* Glowing halo ring underneath */}
                  <div 
                    ref={domSpeedHalo}
                    className="absolute inset-2 rounded-full pointer-events-none transition-all duration-75"
                    style={{
                      background: "radial-gradient(circle, rgba(255, 69, 0, 0.22) 0%, rgba(255, 69, 0, 0.05) 50%, transparent 100%)",
                      filter: "blur(6px)"
                    }}
                  />
                  
                  <svg viewBox="0 0 200 200" className="w-28 md:w-36 h-28 md:h-36 relative z-10">
                    {/* Gauge Frame */}
                    <circle cx="100" cy="100" r="88" fill="#040406" stroke="#1c1d24" strokeWidth="4" />
                    <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255, 69, 0, 0.45)" strokeWidth="1" filter="drop-shadow(0 0 5px rgba(255,69,0,0.3))" />
                    <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(255, 85, 0, 0.08)" strokeWidth="1" />
                    
                    {/* Ticks and Text Values (scales dynamically to 200, 240, 300, or 360 based on selected car's top speed) */}
                    {(() => {
                      const carTopSpeed = selectedCar ? parseInt(selectedCar.topSpeed.replace(/[^0-9]/g, "")) || 220 : 330;
                      let maxScale = 240;
                      if (carTopSpeed > 310) maxScale = 360;
                      else if (carTopSpeed > 250) maxScale = 300;
                      else if (carTopSpeed > 210) maxScale = 240;
                      else maxScale = 200;

                      const step = maxScale / 12;

                      return Array.from({ length: 13 }).map((_, i) => {
                        const val = Math.round(i * step);
                        const angleDeg = -225 + (i / 12) * 270;
                        const angleRad = ((angleDeg - 90) * Math.PI) / 180;
                        
                        const tx1 = 100 + 72 * Math.cos(angleRad);
                        const ty1 = 100 + 72 * Math.sin(angleRad);
                        const tx2 = 100 + 80 * Math.cos(angleRad);
                        const ty2 = 100 + 80 * Math.sin(angleRad);

                        const lx = 100 + 58 * Math.cos(angleRad);
                        const ly = 100 + 58 * Math.sin(angleRad);

                        return (
                          <g key={i}>
                            <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#a1a1a9" strokeWidth="1.5" />
                            <text 
                              x={lx} 
                              y={ly} 
                              fill="#d1d1d6" 
                              fontSize="8.5" 
                              fontFamily="monospace"
                              textAnchor="middle" 
                              alignmentBaseline="middle"
                            >
                              {val}
                            </text>
                          </g>
                        );
                      });
                    })()}

                    {/* Speed Label */}
                    <text x="100" y="130" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace" textAnchor="middle">MPH</text>
                    <text x="100" y="145" fill="rgba(255,255,255,0.12)" fontSize="7" fontFamily="monospace" textAnchor="middle">VELOCITY</text>

                    {/* Sweeping Needle Group (Speedometer) */}
                    <g 
                      ref={domSpeedNeedle} 
                      className="origin-[100px_100px] transition-transform duration-75 ease-out" 
                      style={{ transform: "rotate(-225deg)", transformOrigin: "100px 100px" }}
                    >
                      <line 
                        x1="100" y1="100" 
                        x2="100" y2="24" 
                        stroke="#ff4500" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        filter="drop-shadow(0 0 3px #ff0000)" 
                      />
                      <circle cx="100" cy="100" r="7" fill="#08080a" stroke="#ff4500" strokeWidth="1.5" />
                    </g>
                  </svg>
                </div>

                {/* Center digital gear & speed readout */}
                <div className="flex flex-col items-center bg-black/60 px-4 py-3.5 border border-outline-variant/30 rounded-lg min-w-[80px] text-center shadow-inner">
                  <span className="font-jetbrains-mono text-[8px] text-tertiary tracking-widest uppercase">GEAR</span>
                  <span ref={domGearText} className="font-anybody text-xl font-black text-primary-container leading-none mt-1">3</span>
                  <div className="border-t border-outline-variant/20 w-full my-1.5" />
                  <span className="font-jetbrains-mono text-[8px] text-tertiary tracking-widest uppercase">SPEED</span>
                  <span className="font-anybody text-base text-secondary font-bold mt-0.5"><span ref={domSpeedText}>75</span></span>
                </div>

                {/* Tachometer Gauge Dial (Right) */}
                <div className="relative flex flex-col items-center">
                  {/* Glowing halo ring underneath */}
                  <div 
                    ref={domRpmHalo}
                    className="absolute inset-2 rounded-full pointer-events-none transition-all duration-75"
                    style={{
                      background: "radial-gradient(circle, rgba(255, 69, 0, 0.22) 0%, rgba(255, 69, 0, 0.05) 50%, transparent 100%)",
                      filter: "blur(6px)"
                    }}
                  />
                  
                  <svg viewBox="0 0 200 200" className="w-28 md:w-36 h-28 md:h-36 relative z-10">
                    {/* Gauge Frame */}
                    <circle cx="100" cy="100" r="88" fill="#040406" stroke="#1c1d24" strokeWidth="4" />
                    <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255, 69, 0, 0.45)" strokeWidth="1" filter="drop-shadow(0 0 5px rgba(255,69,0,0.3))" />
                    <circle cx="100" cy="100" r="82" fill="none" stroke="rgba(255, 85, 0, 0.08)" strokeWidth="1" />

                    {/* Redline Zone overlay segment (7.5 to 9 RPM) */}
                    <path 
                      d="M 148,52 A 68,68 0 0,1 157,148" 
                      fill="none" 
                      stroke="rgba(239, 68, 68, 0.45)" 
                      strokeWidth="5" 
                      strokeLinecap="round" 
                      filter="drop-shadow(0 0 3px #ef4444)"
                    />

                    {/* Ticks and Text Values */}
                    {Array.from({ length: 10 }).map((_, i) => {
                      const val = i; // x1000 RPM
                      const angleDeg = -225 + (i / 9) * 270;
                      const angleRad = ((angleDeg - 90) * Math.PI) / 180;
                      
                      const tx1 = 100 + 72 * Math.cos(angleRad);
                      const ty1 = 100 + 72 * Math.sin(angleRad);
                      const tx2 = 100 + 80 * Math.cos(angleRad);
                      const ty2 = 100 + 80 * Math.sin(angleRad);

                      const lx = 100 + 58 * Math.cos(angleRad);
                      const ly = 100 + 58 * Math.sin(angleRad);

                      const isRed = val >= 7;

                      return (
                        <g key={i}>
                          <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke={isRed ? "#ef4444" : "#a1a1a9"} strokeWidth="1.5" />
                          <text 
                            x={lx} 
                            y={ly} 
                            fill={isRed ? "#ef4444" : "#d1d1d6"} 
                            fontSize="8.5" 
                            fontFamily="monospace"
                            textAnchor="middle" 
                            alignmentBaseline="middle"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Tacho Labels */}
                    <text x="100" y="130" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace" textAnchor="middle">RPM x1000</text>
                    <text x="100" y="145" fill="rgba(255,255,255,0.12)" fontSize="7" fontFamily="monospace" textAnchor="middle">TACHOMETER</text>

                    {/* Sweeping Needle Group (Tachometer) */}
                    <g 
                      ref={domRpmNeedle} 
                      className="origin-[100px_100px] transition-transform duration-75 ease-out" 
                      style={{ transform: "rotate(-225deg)", transformOrigin: "100px 100px" }}
                    >
                      <line 
                        x1="100" y1="100" 
                        x2="100" y2="24" 
                        stroke="#ff4500" 
                        strokeWidth="2.5" 
                        strokeLinecap="round" 
                        filter="drop-shadow(0 0 3px #ff0000)" 
                      />
                      <circle cx="100" cy="100" r="7" fill="#08080a" stroke="#ff4500" strokeWidth="1.5" />
                    </g>
                  </svg>
                </div>
              </div>

              {/* Center Steering Wheel (Visual overlay in front of dashboard) */}
              <div className="relative flex flex-col items-center justify-center w-full md:w-1/5 py-4 md:py-0">
                <div className="relative h-28 md:h-32 flex items-center justify-center">
                  <svg 
                    ref={domYoke} 
                    viewBox="0 0 400 400" 
                    className="w-28 md:w-36 h-auto transition-transform duration-75 ease-out origin-[200px_200px] drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] z-30"
                    style={{ transform: "rotate(0deg)" }}
                  >
                    {/* Outer Leather Rim */}
                    <circle cx="200" cy="200" r="172" fill="none" stroke="#0a0a0c" strokeWidth="32" />
                    <circle cx="200" cy="200" r="172" fill="none" stroke="#15171d" strokeWidth="24" />
                    <circle cx="200" cy="200" r="182" fill="none" stroke="rgba(255, 69, 0, 0.12)" strokeWidth="1.5" strokeDasharray="4 12" />

                    {/* Grip panels */}
                    <path d="M 80,105 C 60,130, 52,165, 52,185" fill="none" stroke="#101115" strokeWidth="36" strokeLinecap="round" />
                    <path d="M 320,105 C 340,130, 348,165, 348,185" fill="none" stroke="#101115" strokeWidth="36" strokeLinecap="round" />

                    {/* Left Spoke */}
                    <path d="M 52,200 L 140,200 L 150,225 L 140,235 L 56,225 Z" fill="#15161b" stroke="#060709" strokeWidth="2.5" />
                    <circle cx="95" cy="212" r="3" fill="#ff5500" opacity="0.8" />
                    <circle cx="110" cy="212" r="3" fill="#ff5500" opacity="0.8" />

                    {/* Right Spoke */}
                    <path d="M 348,200 L 260,200 L 250,225 L 260,235 L 344,225 Z" fill="#15161b" stroke="#060709" strokeWidth="2.5" />
                    <circle cx="305" cy="212" r="3" fill="#ff5500" opacity="0.8" />
                    <circle cx="290" cy="212" r="3" fill="#ff5500" opacity="0.8" />

                    {/* Bottom Spoke */}
                    <path d="M 185,250 L 180,335 L 220,335 L 215,250 Z" fill="#15161b" stroke="#060709" strokeWidth="2.5" />
                    <line x1="200" y1="265" x2="200" y2="315" stroke="#07080a" strokeWidth="6" strokeLinecap="round" />

                    {/* Center Cap */}
                    <circle cx="200" cy="200" r="52" fill="#101115" stroke="#060709" strokeWidth="4" />
                    <circle cx="200" cy="200" r="42" fill="#17181e" />
                    {/* Badge */}
                    <circle cx="200" cy="200" r="18" fill="#050508" stroke="#ff4500" strokeWidth="2" className="shadow-[0_0_8px_#ff4500]" />
                    <text
                      x="200"
                      y="204"
                      fill="#ff4500"
                      fontSize="11"
                      fontFamily="var(--font-anybody)"
                      fontWeight="900"
                      textAnchor="middle"
                      filter="drop-shadow(0 0 2px #ff0000)"
                    >
                      {selectedCar ? selectedCar.name.split(" ")[0].substring(0, 2).toUpperCase() : "HP"}
                    </text>
                  </svg>
                </div>
              </div>

              {/* Right Column: Retro center console (Radio / warning lights / G-Force) */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between w-full md:w-2/5 border-t md:border-t-0 md:border-l border-[#1f202a] pt-4 md:pt-0 pl-0 md:pl-6">
                
                {/* Radio deck unit with dynamic oscilloscope wave */}
                <div className="flex flex-col bg-zinc-950 border border-zinc-800 p-2.5 rounded font-mono text-[9px] w-full max-w-[170px] shadow-md relative">
                  <div className="text-zinc-500 text-[8px] uppercase tracking-wider mb-1">VEHICLE TELEMETRY</div>
                  
                  {/* LCD Display Container */}
                  <div className="bg-[#100702] border border-[#ff5500]/25 rounded px-1.5 py-1 flex flex-col h-14 justify-between overflow-hidden shadow-[inset_0_0_8px_rgba(255,69,0,0.25)]">
                    <div ref={domRadioText} className="text-[#ff5500] text-[8px] font-bold text-center tracking-widest truncate leading-tight uppercase font-anybody">
                      {selectedCar ? selectedCar.name : "HYPERDRIVE"}
                    </div>
                    <div className="text-[#ffaa00] text-[7px] text-center tracking-wide font-jetbrains-mono opacity-80 mt-0.5 truncate">
                      {selectedCar ? `${selectedCar.power} | ${selectedCar.specValue}` : "SYS_ACTIVE"}
                    </div>
                    
                    {/* Live Oscilloscope Wave */}
                    <svg className="w-full h-6 mt-1 text-[#ff4500]" viewBox="0 0 150 32">
                      <path 
                        ref={domOscilloscopePath}
                        d="M 0,16 L 150,16" 
                        fill="none" 
                        stroke="#ff4500" 
                        strokeWidth="1.5" 
                        filter="drop-shadow(0 0 2px #ff2200)"
                      />
                    </svg>
                  </div>
                  
                  <div className="flex justify-between items-center mt-1.5 text-[7px] text-zinc-400">
                    <span className="w-1.5 h-1.5 bg-[#ff4500]/60 rounded-full animate-ping" />
                    <span>{selectedCar ? `${selectedCar.price} SPEC READY` : "LST POWER CORE ACTIVE"}</span>
                  </div>
                </div>

                {/* Status Warning indicator lights & G-Force Widget */}
                <div className="flex items-center gap-4 justify-between w-full md:w-auto">
                  
                  {/* Dashboard Indicator Bulbs (Orange / red warnings) */}
                  <div className="flex flex-col gap-1.5 bg-black/50 p-2 border border-zinc-800 rounded">
                    {/* Traction Control warning */}
                    <div ref={domTCIndicator} className="flex items-center gap-1.5 text-[8px] font-mono tracking-wider opacity-20 text-neutral-400">
                      <span className="material-symbols-outlined text-[9px]">warning</span>
                      <span>TC</span>
                    </div>
                    {/* Check Engine light */}
                    <div ref={domCheckEngine} className="flex items-center gap-1.5 text-[8px] font-mono tracking-wider text-amber-500/80">
                      <span className="material-symbols-outlined text-[9px]">build</span>
                      <span>CHECK</span>
                    </div>
                    {/* Battery indicator */}
                    <div ref={domBatteryLight} className="flex items-center gap-1.5 text-[8px] font-mono tracking-wider text-red-500/80">
                      <span className="material-symbols-outlined text-[9px]">battery_charging_full</span>
                      <span>BATT</span>
                    </div>
                  </div>

                  {/* Circular G-Force Indicator */}
                  <div className="flex flex-col items-center">
                    <span className="font-jetbrains-mono text-[8px] text-tertiary tracking-widest uppercase mb-1">G_FORCE</span>
                    <div className="w-11 h-11 rounded-full border border-zinc-800 relative flex items-center justify-center bg-black/40">
                      <div className="absolute inset-0 w-full h-full rounded-full border border-dashed border-zinc-900 scale-75" />
                      <div className="w-1 h-1 bg-zinc-800 rounded-full" />
                      <div 
                        ref={domGforceDot} 
                        className="w-2 h-2 bg-[#ff4500] rounded-full absolute shadow-[0_0_5px_#ff4500] transition-all duration-75" 
                      />
                    </div>
                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* Full Width Cockpit Footplate Bar with ACCELERATE HUD BUTTON */}
          <div className="w-full bg-[#050608] border-t border-[#121319] py-3.5 px-6 md:px-12 flex justify-between items-center">
            
            {/* Left side telemetry label */}
            <div className="hidden md:flex flex-col font-jetbrains-mono text-[8px] text-tertiary tracking-widest leading-relaxed">
              <span>CONTROLLER: KEYBOARD (SPACEBAR) OR PEDAL</span>
              <span>DRIVE_CORE PROTOTYPE // DETAILED COCKPIT MODE</span>
            </div>

            {/* Throttle Acceleration Pedal / Interactive Button */}
            <button 
              onMouseDown={() => setIsAccelerating(true)}
              onMouseUp={() => setIsAccelerating(false)}
              onMouseLeave={() => setIsAccelerating(false)}
              onTouchStart={() => setIsAccelerating(true)}
              onTouchEnd={() => setIsAccelerating(false)}
              className={`w-full md:w-60 bg-[#ff4500] text-black font-anybody font-black text-xs italic py-3 rounded border border-[#ff4500] transition-all duration-200 active:scale-95 uppercase text-center clip-corner -skew-x-6 flex items-center justify-center gap-1.5 select-none touch-none hover:shadow-[0_0_15px_#ff4500] ${
                isAccelerating 
                  ? "bg-transparent text-[#ff4500] shadow-[0_0_15px_#ff4500]" 
                  : "bg-[#ff4500] text-black hover:bg-transparent hover:text-[#ff4500]"
              }`}
            >
              <span className="material-symbols-outlined text-sm font-bold animate-bounce">arrow_upward</span>
              <span>{isAccelerating ? "FULL THROTTLE" : "ACCELERATE PEDAL"}</span>
            </button>
            
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
