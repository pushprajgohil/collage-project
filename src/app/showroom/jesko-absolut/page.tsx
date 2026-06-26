"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCollection, Car } from "@/context/CollectionContext";

export default function JeskoAbsolut() {
  const { addToCollection, removeFromCollection, isInCollection } = useCollection();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIgniting, setIsIgniting] = useState(false);
  const [activeGear, setActiveGear] = useState("GEAR 5");
  const [hoverData, setHoverData] = useState({ speed: "302 km/h", rpm: "8200", gear: "6" });
  
  // New States for Acoustic Matrix Cockpit HUD
  const [rpm, setRpm] = useState(1000);
  const [driveMode, setDriveMode] = useState<"CRUISING" | "TRACK" | "CORSA">("TRACK");

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Sparks particle system interface & ref
  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    alpha: number;
    size: number;
    color: string;
  }
  const particlesRef = useRef<Particle[]>([]);

  const carData: Car = {
    id: "koenigsegg-jesko-absolut",
    name: "JESKO ABSOLUT",
    subName: "KOENIGSEGG SPECIFICATION",
    price: "3.0M",
    accel: "2.5s",
    topSpeed: "330+ mph",
    power: "1600 HP",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDug_n1ctyQ2DKg7G-ISUWOPmxRtOkzSGTnSo3aMeH4OMzoOj8ffAx24c0Xe4s6Bd_uWyouo-9mJ_UrqSLWIHi0ZGRmkSU-IIzJ6AsiXEfpLaXvoEG3CJLBOMax9eBEhzVtYOaLkIyZTdqAU3MyjFTD0ogSBEZDcm3O67WNvgkHgSDoJeCuvpaQLtZKqieslly7B932xiRdg36wvdQYjhvNU9l0PuN1Iz-aMSgc0FSfiNdBfeqcbrVbCS3FUSparLrvXFJm_326WkWm",
    specLabel: "POWERPLANT",
    specValue: "V8 LST E85",
    tag: "PROTOTYPE",
  };

  const isSaved = isInCollection(carData.id);

  // V8 engine wave distortion generator
  const makeDistortionCurve = (amount = 15) => {
    const k = amount;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  };

  // Update engine audio parameters in real time based on RPM and mode
  const updateEngineParams = (targetRpm: number, mode: "CRUISING" | "TRACK" | "CORSA") => {
    if (!audioCtxRef.current || oscillatorsRef.current.length === 0) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    
    const rps = targetRpm / 60;
    const f_fund = rps * 4; // V8 fundamental frequency (4 combustions per rev for a bank)
    
    // Set frequency values using exponential ramps for smoothness
    if (oscillatorsRef.current[0]) {
      oscillatorsRef.current[0].frequency.exponentialRampToValueAtTime(f_fund, now + 0.05);
    }
    if (oscillatorsRef.current[1]) {
      oscillatorsRef.current[1].frequency.exponentialRampToValueAtTime(f_fund * 1.015, now + 0.05);
    }
    if (oscillatorsRef.current[2]) {
      oscillatorsRef.current[2].frequency.exponentialRampToValueAtTime(f_fund * 2.0, now + 0.05);
    }
    if (oscillatorsRef.current[3]) {
      oscillatorsRef.current[3].frequency.exponentialRampToValueAtTime(f_fund * 4.0, now + 0.05);
    }
    if (oscillatorsRef.current[4]) {
      oscillatorsRef.current[4].frequency.exponentialRampToValueAtTime(f_fund * 8.0, now + 0.05);
    }
    if (oscillatorsRef.current[5]) {
      oscillatorsRef.current[5].frequency.exponentialRampToValueAtTime(f_fund * 0.5, now + 0.05);
    }
    
    // Update lowpass filter cutoff frequency based on drive mode
    if (filterRef.current) {
      let multiplier = 4.2;
      if (mode === "CRUISING") multiplier = 2.2;
      else if (mode === "TRACK") multiplier = 4.2;
      else if (mode === "CORSA") multiplier = 6.2;
      
      const filterCutoff = Math.min(20000, Math.max(120, f_fund * multiplier));
      filterRef.current.frequency.exponentialRampToValueAtTime(filterCutoff, now + 0.05);
    }

    // Update LFO frequency for engine jitter
    if (lfoRef.current) {
      const lfoFreq = rps * 0.5; // cylinder rate modulation
      lfoRef.current.frequency.setValueAtTime(lfoFreq, now);
    }

    // Scale LFO depth with RPM
    if (lfoGainRef.current) {
      const depth = 2.0 + (targetRpm / 8500) * 8.0;
      lfoGainRef.current.gain.setValueAtTime(depth, now);
    }

    // Scale turbo air hiss gain with RPM
    if (noiseGainRef.current) {
      let maxTurboGain = 0.04;
      if (mode === "CRUISING") maxTurboGain = 0.01;
      else if (mode === "TRACK") maxTurboGain = 0.05;
      else if (mode === "CORSA") maxTurboGain = 0.08;
      
      const tGain = targetRpm < 2500 ? 0.0 : ((targetRpm - 2500) / 6000) * maxTurboGain;
      noiseGainRef.current.gain.linearRampToValueAtTime(tGain, now + 0.05);
    }
  };

  // V8 Engine Sound Synthesis using Web Audio API
  const startEngine = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create Analyser Node for Visualizations
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyserRef.current = analyser;

      // Filter Node (lowpass) to sound deep
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 400;
      filterRef.current = filter;

      // Master Gain Node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1);
      masterGainRef.current = masterGain;

      // Harmonics Gain (before distortion)
      const harmonicsGain = ctx.createGain();
      harmonicsGain.gain.value = 0.25;

      // Waveshaper Node (combustion grit distortion)
      const waveshaper = ctx.createWaveShaper();
      let distAmount = 16;
      if (driveMode === "CRUISING") distAmount = 5;
      else if (driveMode === "TRACK") distAmount = 16;
      else if (driveMode === "CORSA") distAmount = 26;
      waveshaper.curve = makeDistortionCurve(distAmount);
      waveshaper.oversample = "4x";

      // Create V8 oscillators
      const oscBase1 = ctx.createOscillator();
      const oscBase2 = ctx.createOscillator();
      const oscHarm2 = ctx.createOscillator();
      const oscHarm4 = ctx.createOscillator();
      const oscHarm8 = ctx.createOscillator();
      const oscSub = ctx.createOscillator();

      oscBase1.type = "sawtooth";
      oscBase2.type = "sawtooth";
      oscHarm2.type = "sawtooth";
      oscHarm4.type = "sawtooth";
      oscHarm8.type = "sawtooth";
      oscSub.type = "triangle";

      // LFO modulation to simulate cylinder firing rumbles
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 8;
      lfoGain.gain.value = 3;
      lfoRef.current = lfo;
      lfoGainRef.current = lfoGain;

      lfo.connect(lfoGain);
      lfoGain.connect(oscBase1.frequency);
      lfoGain.connect(oscBase2.frequency);
      lfoGain.connect(oscHarm2.frequency);

      // Connect oscillators to individual gains for volume mixing
      const gainBase1 = ctx.createGain();
      gainBase1.gain.value = 0.35;
      const gainBase2 = ctx.createGain();
      gainBase2.gain.value = 0.35;
      const gainHarm2 = ctx.createGain();
      gainHarm2.gain.value = 0.22;
      const gainHarm4 = ctx.createGain();
      gainHarm4.gain.value = 0.12;
      const gainHarm8 = ctx.createGain();
      gainHarm8.gain.value = 0.08;
      const gainSub = ctx.createGain();
      gainSub.gain.value = 0.65;

      oscBase1.connect(gainBase1);
      oscBase2.connect(gainBase2);
      oscHarm2.connect(gainHarm2);
      oscHarm4.connect(gainHarm4);
      oscHarm8.connect(gainHarm8);
      oscSub.connect(gainSub);

      // Mix harmonics together into the distortion waveshaper
      gainBase1.connect(harmonicsGain);
      gainBase2.connect(harmonicsGain);
      gainHarm2.connect(harmonicsGain);
      gainHarm4.connect(harmonicsGain);
      gainHarm8.connect(harmonicsGain);

      harmonicsGain.connect(waveshaper);
      waveshaper.connect(filter);

      // Sub bypasses distortion to keep the bass clean and heavy
      gainSub.connect(filter);

      // Setup White Noise for Turbo Air Hiss
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = noiseBuffer;
      noiseNode.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = 6500;
      noiseFilter.Q.value = 2.0;

      const noiseGain = ctx.createGain();
      noiseGain.gain.value = 0;
      noiseNodeRef.current = noiseNode;
      noiseGainRef.current = noiseGain;

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(filter);

      // Filter connects to analyser and master gain
      filter.connect(analyser);
      analyser.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Start all sources
      oscBase1.start();
      oscBase2.start();
      oscHarm2.start();
      oscHarm4.start();
      oscHarm8.start();
      oscSub.start();
      lfo.start();
      noiseNode.start();

      oscillatorsRef.current = [
        oscBase1,
        oscBase2,
        oscHarm2,
        oscHarm4,
        oscHarm8,
        oscSub
      ];

      setIsPlaying(true);
      
      // Initialize to idle parameters
      updateEngineParams(1000, driveMode);
      setRpm(1000);
    } catch (e) {
      console.error("Audio Context failed to initialize", e);
    }
  };

  const stopEngine = () => {
    if (masterGainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      masterGainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
      
      setTimeout(() => {
        oscillatorsRef.current.forEach((osc) => {
          try { osc.stop(); } catch (e) {}
        });
        if (lfoRef.current) {
          try { lfoRef.current.stop(); } catch (e) {}
          lfoRef.current = null;
        }
        if (noiseNodeRef.current) {
          try { noiseNodeRef.current.stop(); } catch (e) {}
          noiseNodeRef.current = null;
        }
        oscillatorsRef.current = [];
        setIsPlaying(false);
        setRpm(1000);
      }, 350);
    }
  };

  // Startup engine rev-up animation
  const animateRpmStartup = () => {
    const startTime = Date.now();
    const duration1 = 450; // rise to 4500 RPM
    const duration2 = 1200; // settle to 1000 RPM (idle)
    const totalDuration = duration1 + duration2;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration1) {
        const progress = elapsed / duration1;
        const currentVal = Math.floor(1000 + (4500 - 1000) * (1 - (1 - progress) * (1 - progress)));
        setRpm(currentVal);
        updateEngineParams(currentVal, driveMode);
      } else if (elapsed < totalDuration) {
        const progress = (elapsed - duration1) / duration2;
        const currentVal = Math.floor(4500 - (4500 - 1000) * (progress * progress * (3 - 2 * progress)));
        setRpm(currentVal);
        updateEngineParams(currentVal, driveMode);
      } else {
        setRpm(1000);
        updateEngineParams(1000, driveMode);
        clearInterval(interval);
      }
    }, 16);
  };

  const handleIgnition = () => {
    if (isIgniting || isPlaying) return;
    
    setIsIgniting(true);
    
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Cranking synthesis: 12Hz starter hum pulsing at 7.5Hz (chug-chug-chug)
      const crankOsc = ctx.createOscillator();
      crankOsc.type = "sawtooth";
      crankOsc.frequency.setValueAtTime(32, ctx.currentTime);

      const crankFilter = ctx.createBiquadFilter();
      crankFilter.type = "lowpass";
      crankFilter.frequency.setValueAtTime(100, ctx.currentTime);

      const crankGain = ctx.createGain();
      crankGain.gain.setValueAtTime(0, ctx.currentTime);

      const crankMod = ctx.createOscillator();
      crankMod.type = "square";
      crankMod.frequency.setValueAtTime(7.5, ctx.currentTime);

      const crankModGain = ctx.createGain();
      crankModGain.gain.setValueAtTime(0.35, ctx.currentTime);

      crankMod.connect(crankModGain);
      crankModGain.connect(crankGain.gain);

      crankOsc.connect(crankFilter);
      crankFilter.connect(crankGain);
      crankGain.connect(ctx.destination);

      crankOsc.start();
      crankMod.start();

      crankGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.1);

      setTimeout(() => {
        try {
          crankOsc.stop();
          crankMod.stop();
          crankOsc.disconnect();
          crankMod.disconnect();
        } catch (e) {}

        // Engine catches and roars to life
        startEngine();
        animateRpmStartup();
        setIsIgniting(false);
      }, 900);

    } catch (err) {
      console.error(err);
      setIsIgniting(false);
    }
  };

  const toggleEngineSound = () => {
    if (isPlaying) {
      stopEngine();
    } else {
      handleIgnition();
    }
  };

  // Monitor RPM and Mode changes to adjust parameters in real time
  useEffect(() => {
    if (isPlaying && !isIgniting) {
      updateEngineParams(rpm, driveMode);
    }
  }, [rpm, driveMode, isPlaying]);

  // Particles and Canvas visualizer loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      if (!isPlaying || !analyserRef.current) return;
      
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserRef.current.getByteFrequencyData(dataArray);

      // Bass energy amplitude
      let sum = 0;
      for (let i = 0; i < 8; i++) {
        sum += dataArray[i];
      }
      const bassIntensity = sum / 8 / 255;

      // Dark semi-transparent trails
      ctx.fillStyle = "rgba(10, 10, 10, 0.22)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const innerRadius = 55 + bassIntensity * 8;

      let color1 = "#ff5540";
      let color2 = "#ff8500";
      let particlesColor = "rgba(255, 110, 60, ";
      
      if (driveMode === "CRUISING") {
        color1 = "#00f0ff";
        color2 = "#0066ff";
        particlesColor = "rgba(0, 240, 255, ";
      } else if (driveMode === "CORSA") {
        color1 = "#ff0055";
        color2 = "#ff3300";
        particlesColor = "rgba(255, 0, 85, ";
      }

      // Outer glow pulse
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = color2;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 12 + bassIntensity * 18;
      ctx.shadowColor = color1;
      ctx.stroke();
      ctx.restore();

      // Draw frequency rays
      const barCount = 48;
      for (let i = 0; i < barCount; i++) {
        const binIndex = Math.floor((i / barCount) * (bufferLength * 0.75));
        const value = dataArray[binIndex] || 0;
        const percent = value / 255;
        const barLength = Math.max(2, percent * 45);

        const angle = (i / barCount) * Math.PI * 2;
        const xStart = centerX + innerRadius * Math.cos(angle);
        const yStart = centerY + innerRadius * Math.sin(angle);
        const xEnd = centerX + (innerRadius + barLength) * Math.cos(angle);
        const yEnd = centerY + (innerRadius + barLength) * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(xStart, yStart);
        ctx.lineTo(xEnd, yEnd);
        ctx.strokeStyle = color1;
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      // Spawn combustion particles proportional to RPM
      const spawnCount = Math.floor(1 + (rpm / 8500) * 5);
      for (let j = 0; j < spawnCount; j++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.2 + (rpm / 8500) * 4.0 + Math.random() * 2;
        particlesRef.current.push({
          x: centerX + innerRadius * Math.cos(angle),
          y: centerY + innerRadius * Math.sin(angle),
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.8,
          vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.8,
          alpha: 1.0,
          size: 1.2 + Math.random() * 2.5,
          color: particlesColor,
        });
      }

      // Draw and clean particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.025;
        
        if (p.alpha <= 0) return false;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = color1;
        ctx.fill();
        ctx.restore();

        return true;
      });

      animationFrameIdRef.current = requestAnimationFrame(draw);
    };

    animationFrameIdRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isPlaying, driveMode, rpm]);

  useEffect(() => {
    return () => {
      // Clean up audio on unmount
      oscillatorsRef.current.forEach((osc) => {
        try { osc.stop(); } catch (e) {}
      });
      if (lfoRef.current) {
        try { lfoRef.current.stop(); } catch (e) {}
      }
      if (noiseNodeRef.current) {
        try { noiseNodeRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const handleWishlistToggle = () => {
    if (isSaved) {
      removeFromCollection(carData.id);
    } else {
      addToCollection(carData);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface text-secondary antialiased font-sans">
      <Header />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-16 py-8 flex flex-col gap-6 z-10">
        
        {/* Hero Banner Section */}
        <section className="relative w-full h-[500px] md:h-[650px] border-2 border-outline-variant bg-surface-container-high overflow-hidden group">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-80 mix-blend-luminosity group-hover:opacity-100 transition-opacity duration-700" 
            style={{ 
              backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuD-7N7EkrLKfZJx7QNlgNQ4boy2SIrM1f-_4hF6P7mDVI1acjvfh-XZeteFVB8UI3iAepvE-dAYhEzoWl-llWY7V-HwZsvtEIxkZEJKQLHEjZR3og9LFtPlbEtQ_Deo0ftTK6TSZrBAEhXPq1_vf3B5fhtJLCu6Ep2gIKOdc04eqtsXUfJfah-qPhtxvcw9wc3kNYTy1fSeMFGoziUHm3z8J--8R2Q_Eesf2zjHZW-kgV-ba32FYuR1BzQnOgEL7jOSKhBqyzn_GB7f')` 
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="absolute inset-0 ghost-grid opacity-30 pointer-events-none" />
          
          <div className="absolute top-6 left-6 z-20 bg-background/80 px-3 py-1.5 border border-outline-variant backdrop-blur-sm flex items-center gap-3">
            <span className="font-jetbrains-mono text-xs text-primary uppercase tracking-widest">PROJECT.ABSOLUT</span>
            <button 
              onClick={handleWishlistToggle}
              className="text-primary hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
              title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
            >
              <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
                favorite
              </span>
            </button>
          </div>

          <div className="absolute bottom-0 left-0 p-6 md:p-12 w-full flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="flex flex-col gap-2">
              <span className="font-jetbrains-mono text-xs text-primary uppercase border border-primary/40 px-2 py-0.5 w-max">
                SYS.TARGET // JESKO
              </span>
              <h1 className="font-anybody text-3xl md:text-5xl lg:text-6xl font-black text-on-surface uppercase tracking-tighter m-0 leading-none">
                KOENIGSEGG<br />
                <span className="text-primary-container drop-shadow-[0_0_12px_rgba(255,85,64,0.6)]">JESKO ABSOLUT</span>
              </h1>
            </div>

            <button 
              onClick={handleIgnition}
              disabled={isIgniting}
              className={`font-jetbrains-mono text-sm uppercase px-8 py-4 border border-primary-container transition-all duration-300 flex items-center gap-2 clip-corner -skew-x-6 hover:shadow-[0_0_20px_#ff5540] ${
                isIgniting 
                  ? "bg-transparent text-primary-container animate-pulse border-primary/30" 
                  : "bg-primary-container text-black font-bold hover:bg-transparent hover:text-primary-container"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {isIgniting ? "cycle" : "play_arrow"}
              </span>
              <span>{isIgniting ? "IGNITING..." : "IGNITION SEQUENCE"}</span>
            </button>
          </div>
        </section>

        {/* Technical Specification Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {[
            { label: "V.MAX", value: "330+", unit: "MPH (EST)", icon: "speed" },
            { label: "PWR.OUT", value: "1600", unit: "HP @ 8500 RPM", icon: "bolt" },
            { label: "TRQ.MAX", value: "1106", unit: "LB-FT @ 5100 RPM", icon: "model_training" },
            { label: "ACCEL", value: "2.5", unit: "0-100 KM/H (S)", icon: "timer" }
          ].map((spec, i) => (
            <div 
              key={i} 
              className="bg-surface-container-high border border-outline-variant clipped-corner p-6 flex flex-col gap-4 carbon-pattern hover:border-primary-container transition-colors duration-300"
            >
              <div className="flex justify-between items-center w-full border-b border-outline-variant/30 pb-2">
                <span className="font-jetbrains-mono text-xs text-tertiary">{spec.label}</span>
                <span className="material-symbols-outlined text-primary text-base">{spec.icon}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-anybody text-3xl md:text-4xl text-secondary tracking-tighter font-black">{spec.value}</span>
                <span className="font-jetbrains-mono text-[10px] text-primary mt-1">{spec.unit}</span>
              </div>
            </div>
          ))}
        </section>

        {/* Interactive Telemetry Graph & Audio Engine */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
          
          {/* Graph Card */}
          <div className="lg:col-span-2 bg-surface-container-highest border-2 border-outline-variant p-6 relative overflow-hidden flex flex-col justify-between min-h-[350px]">
            <div className="absolute inset-0 ghost-grid opacity-20 pointer-events-none" />
            
            <div className="flex justify-between items-start z-10 relative">
              <div className="flex flex-col">
                <span className="font-jetbrains-mono text-sm text-primary uppercase">TELEMETRY_DYNAMICS</span>
                <span className="font-jetbrains-mono text-xs text-tertiary uppercase">DRAG COEFFICIENT: 0.278 Cd</span>
              </div>
              <div className="border border-primary px-3 py-1 text-primary font-jetbrains-mono text-xs bg-surface-container-low flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span>DYNAMIC FEED</span>
              </div>
            </div>

            {/* Interactive SVG graph */}
            <div className="w-full h-48 mt-6 border-b border-l border-outline-variant/50 relative flex items-end px-2 z-10">
              <div className="absolute inset-0 flex flex-col justify-between py-2 pointer-events-none opacity-10">
                <div className="w-full h-[1px] bg-secondary" />
                <div className="w-full h-[1px] bg-secondary" />
                <div className="w-full h-[1px] bg-secondary" />
              </div>
              
              <svg 
                className="w-full h-full text-primary cursor-crosshair" 
                preserveAspectRatio="none" 
                viewBox="0 0 100 100"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = ((e.clientX - rect.left) / rect.width) * 100;
                  const speed = Math.floor(100 + x * 4.3);
                  const rpm = Math.floor(4000 + x * 45);
                  const gear = Math.floor(2 + x / 12);
                  setHoverData({ speed: `${speed} km/h`, rpm: `${rpm}`, gear: `${gear}` });
                }}
              >
                {/* Background area gradient */}
                <path 
                  d="M0,95 Q25,85 50,55 T85,25 T100,10 L100,100 L0,100 Z" 
                  fill="url(#gradient-area)" 
                  className="opacity-20"
                />
                {/* Main line */}
                <path 
                  d="M0,95 Q25,85 50,55 T85,25 T100,10" 
                  fill="none" 
                  stroke="#ff5540" 
                  strokeWidth="3"
                  className="drop-shadow-[0_0_8px_rgba(255,85,64,0.8)]"
                />
                
                {/* SVG Definitions */}
                <defs>
                  <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff5540" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Hover details display */}
            <div className="flex justify-between items-center font-jetbrains-mono text-xs text-tertiary mt-4 z-10 border-t border-outline-variant/30 pt-3">
              <div className="flex gap-4">
                <span>SPEED: <strong className="text-secondary">{hoverData.speed}</strong></span>
                <span>RPM: <strong className="text-secondary">{hoverData.rpm}</strong></span>
                <span>GEAR: <strong className="text-primary-container">{hoverData.gear}</strong></span>
              </div>
              <div className="flex gap-3 text-[10px]">
                <button onClick={() => setActiveGear("GEAR 1")} className={`px-2 py-0.5 border ${activeGear === "GEAR 1" ? "border-primary text-primary" : "border-outline-variant/30"}`}>G1</button>
                <button onClick={() => setActiveGear("GEAR 5")} className={`px-2 py-0.5 border ${activeGear === "GEAR 5" ? "border-primary text-primary" : "border-outline-variant/30"}`}>G5</button>
                <button onClick={() => setActiveGear("GEAR 9")} className={`px-2 py-0.5 border ${activeGear === "GEAR 9" ? "border-primary text-primary" : "border-outline-variant/30"}`}>G9</button>
              </div>
            </div>
          </div>

          {/* Engine Audio / Acoustic Card */}
          <div className="bg-surface-container-high border border-outline-variant p-6 flex flex-col gap-5 carbon-pattern relative justify-between min-h-[420px] transition-all duration-300">
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary m-2 opacity-50" />
            
            <div>
              <h3 className="font-jetbrains-mono text-sm text-secondary uppercase border-b border-outline-variant/30 pb-2">
                ACOUSTIC MATRIX
              </h3>
              <p className="font-sans text-[11px] text-tertiary mt-2">
                Synthesize the raw exhaust note harmonics of Koenigsegg's flat-plane twin-turbo V8 in real-time.
              </p>
            </div>

            {/* Interactive Visualizer Canvas & Play Button */}
            <div className="flex flex-col items-center justify-center my-2 relative">
              <div className="relative w-36 h-36 flex items-center justify-center">
                {/* Visualizer Canvas */}
                <canvas 
                  ref={canvasRef} 
                  width={240} 
                  height={240} 
                  className="absolute inset-0 w-full h-full pointer-events-none z-0" 
                />
                
                {/* Control Button */}
                <button 
                  onClick={toggleEngineSound}
                  disabled={isIgniting}
                  className={`relative z-10 w-24 h-24 rounded-full border flex flex-col items-center justify-center gap-1 bg-surface/90 backdrop-blur-md hover:bg-surface-variant transition-all duration-300 group cursor-pointer ${
                    isPlaying 
                      ? "border-primary-container shadow-[0_0_20px_rgba(255,85,64,0.25)] scale-105" 
                      : "border-outline-variant hover:border-primary-container"
                  }`}
                  title={isPlaying ? "Stop engine sound" : "Start engine sound"}
                >
                  <span className={`material-symbols-outlined text-3xl transition-transform ${
                    isPlaying ? "text-primary-container animate-pulse" : "text-primary group-hover:scale-110"
                  }`} style={{ fontVariationSettings: isPlaying ? "'FILL' 1" : "'FILL' 0" }}>
                    {isIgniting ? "cycle" : isPlaying ? "volume_up" : "volume_down"}
                  </span>
                  <span className="font-jetbrains-mono text-[9px] text-secondary uppercase tracking-widest font-bold">
                    {isIgniting ? "CRANKING" : isPlaying ? "ACTIVE" : "START_V8"}
                  </span>
                </button>
              </div>
            </div>

            {/* Drive Mode Selector */}
            <div className="flex flex-col gap-1.5 w-full">
              <span className="font-jetbrains-mono text-[10px] text-tertiary uppercase tracking-wider">DRIVE_MODE:</span>
              <div className="grid grid-cols-3 gap-2">
                {(["CRUISING", "TRACK", "CORSA"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDriveMode(mode)}
                    className={`font-jetbrains-mono text-[10px] py-1 border transition-all duration-200 cursor-pointer ${
                      driveMode === mode 
                        ? mode === "CRUISING"
                          ? "border-[#00f0ff] text-[#00f0ff] bg-[#00f0ff]/10 font-bold"
                          : mode === "TRACK"
                            ? "border-[#ff8500] text-[#ff8500] bg-[#ff8500]/10 font-bold"
                            : "border-[#ff0055] text-[#ff0055] bg-[#ff0055]/10 font-bold"
                        : "border-outline-variant/30 text-tertiary hover:border-outline-variant hover:text-secondary"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Throttle Input Slider */}
            <div className="flex flex-col gap-1.5 w-full">
              <div className="flex justify-between font-jetbrains-mono text-[10px]">
                <span className="text-tertiary uppercase tracking-wider">THROTTLE INPUT:</span>
                <span className={isPlaying ? "text-primary-container font-bold" : "text-tertiary"}>
                  {isPlaying ? `${rpm} RPM` : "OFFLINE"}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="8500"
                step="50"
                value={rpm}
                onChange={(e) => {
                  if (isPlaying && !isIgniting) {
                    setRpm(parseInt(e.target.value));
                  }
                }}
                disabled={!isPlaying || isIgniting}
                className="w-full h-1 bg-surface-container-lowest border border-outline-variant/20 appearance-none cursor-pointer accent-primary-container disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: isPlaying
                    ? `linear-gradient(to right, ${
                        driveMode === "CRUISING" ? "#00f0ff" : driveMode === "TRACK" ? "#ff8500" : "#ff0055"
                      } 0%, ${
                        driveMode === "CRUISING" ? "#00f0ff" : driveMode === "TRACK" ? "#ff8500" : "#ff0055"
                      } ${((rpm - 1000) / 7500) * 100}%, #1f1f1f ${((rpm - 1000) / 7500) * 100}%, #1f1f1f 100%)`
                    : "#1f1f1f",
                }}
              />
            </div>

            {/* Dynamic Telemetry Feed */}
            <div className="flex flex-col gap-1 font-jetbrains-mono text-[10px] text-tertiary border-t border-outline-variant/30 pt-3">
              <div className="flex justify-between py-0.5">
                <span>EXHAUST PROFILE</span>
                <span className="text-secondary">
                  {driveMode === "CRUISING" ? "GT COMFORT" : driveMode === "TRACK" ? "V8 SPORT" : "CORSA F1 SCREAM"}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>FUNDAMENTAL FREQ</span>
                <span className={isPlaying ? "text-secondary" : "text-tertiary"}>
                  {isPlaying ? `${(rpm / 60 * 4).toFixed(1)} Hz` : "0.0 Hz"}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>COMBUSTION HARMONICS</span>
                <span className={isPlaying ? "text-primary-container" : "text-tertiary"}>
                  {isPlaying ? "1x 2x 4x 8x ACTIVE" : "STANDBY"}
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
