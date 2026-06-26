"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import { useCollection, Car } from "@/context/CollectionContext";

interface SchematicDetails {
  model: string;
  chassis: string;
  aero: string;
  suspension: string;
  brakes: string;
  tires: string;
  weight: string;
  driveType: string;
}

const BRAND_SCHEMATICS: Record<string, SchematicDetails> = {
  "ferrari-sf90": {
    model: "SF90 STRADALE",
    chassis: "Carbon Fiber & Aluminum Spaceframe hybrid",
    aero: "0.32 Cd (Active rear wing & vortex generators)",
    suspension: "Magnetorheological active damping dampers",
    brakes: "Brembo Carbon Ceramic (398mm / 360mm)",
    tires: "Michelin Pilot Sport Cup 2R",
    weight: "1,570 kg (3,461 lbs)",
    driveType: "e4WD (Triple Electric Motors + Twin-Turbo V8)"
  },
  "lamborghini-revuelto": {
    model: "REVUELTO V12 PHEV",
    chassis: "Full Carbon Fiber Monofuselage structure",
    aero: "0.34 Cd (Active rear spoiler with 3 dynamic tilt angles)",
    suspension: "Double wishbone pushrod suspension front & rear",
    brakes: "Carbon Ceramic Brakes (410mm / 390mm)",
    tires: "Bridgestone Potenza Sport custom spec",
    weight: "1,772 kg (3,907 lbs)",
    driveType: "e-AWD (Twin front motors + rear transverse motor + V12)"
  },
  "bugatti-bolide": {
    model: "BOLIDE TRACK APEX",
    chassis: "LMP1-spec pre-preg Carbon Fiber monocoque",
    aero: "0.39 Cd (Active roof scoop + carbon diffuser generating 1,800kg downforce)",
    suspension: "Pushrod double wishbones with horizontal Öhlins dampers",
    brakes: "AP Racing ventilated Carbon-Carbon brake discs (390mm)",
    tires: "Michelin Racing slick compounds",
    weight: "1,240 kg (2,734 lbs)",
    driveType: "Permanent mechanical AWD (Quad-Turbo W16)"
  },
  "mclaren-senna": {
    model: "SENNA PERFORMANCE MONSTER",
    chassis: "MonoCage III Carbon Fiber cell with aluminum subframes",
    aero: "0.35 Cd (Hydraulically actuated active wing and front splitters)",
    suspension: "RaceActive Chassis Control II with interconnected hydraulics",
    brakes: "Brembo CCMR Carbon Ceramic discs (390mm / 390mm)",
    tires: "Pirelli P Zero Trofeo R",
    weight: "1,198 kg (2,641 lbs)",
    driveType: "Rear Wheel Drive (7-speed Dual-Clutch + V8 Twin-Turbo)"
  },
  "koenigsegg-jesko": {
    model: "JESKO ABSOLUT",
    chassis: "Carbon Fiber monocoque with integrated fuel tank & Kevlar",
    aero: "0.278 Cd (Aerodynamically smoothed rear with dual active tail fins)",
    suspension: "Double wishbones with active Triplex dampers front & rear",
    brakes: "Koenigsegg carbon ceramic ventilated discs (410mm / 395mm)",
    tires: "Michelin Pilot Sport Cup 2",
    weight: "1,390 kg (3,064 lbs)",
    driveType: "Rear Wheel Drive (9-speed LST + Twin-Turbo V8 E85)"
  }
};

interface BrandCard {
  id: string;
  name: string;
  subName: string;
  image: string;
  powerplant: string;
  peakOutput: string;
  facility: string;
  status: string;
  price: string;
  accel: string;
  topSpeed: string;
  description?: string;
  spansTwo?: boolean;
  link?: string;
  icon?: string;
}

export default function Brands() {
  const { addToCollection, removeFromCollection, isInCollection } = useCollection();
  const router = useRouter();

  // Decryption scan states
  const [activeScanBrand, setActiveScanBrand] = useState<BrandCard | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [showDecryptResult, setShowDecryptResult] = useState(false);

  const startDecryption = (brand: BrandCard, e: React.MouseEvent) => {
    e.preventDefault();
    setActiveScanBrand(brand);
    setScanProgress(0);
    setScanLogs(["INITIALIZING SCHEMATICS UPLINK..."]);
    setShowDecryptResult(false);
  };

  useEffect(() => {
    if (!activeScanBrand) return;

    const logSequence = [
      { progress: 12, log: "CONNECTION SECURED. ACCESSING MANUFACTURER CORE..." },
      { progress: 28, log: "DECRYPTING CHASSIS BLUEPRINTS & MONOCOQUE SPECS..." },
      { progress: 52, log: "RETRIEVING DYNAMIC SUSPENSION STIFFNESS DATA..." },
      { progress: 74, log: "MAPPING AERODYNAMIC DOWNFORCE STRESS CURVES..." },
      { progress: 88, log: "EXTRACTING POWERPLANT BRAKING COEFFICIENTS..." },
      { progress: 100, log: "DATA DECRYPTION SUCCESSFUL. INJECTING GRAPHICS..." }
    ];

    const updateInterval = setInterval(() => {
      setScanProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 5;
        if (next >= 100) {
          clearInterval(updateInterval);
          
          setScanLogs(logs => {
            if (!logs.includes("DATA DECRYPTION SUCCESSFUL. INJECTING GRAPHICS...")) {
              return [...logs, "DATA DECRYPTION SUCCESSFUL. INJECTING GRAPHICS..."];
            }
            return logs;
          });

          // Wait a small bit before redirect or blueprint modal show
          setTimeout(() => {
            if (activeScanBrand.link) {
              router.push(activeScanBrand.link);
              setActiveScanBrand(null);
            } else {
              setShowDecryptResult(true);
            }
          }, 700);

          return 100;
        }

        // Add logs dynamically as progress advances
        const matchedLog = logSequence.find(item => prev < item.progress && next >= item.progress);
        if (matchedLog) {
          setScanLogs(logs => [...logs, matchedLog.log]);
        }

        return next;
      });
    }, 100);

    return () => {
      clearInterval(updateInterval);
    };
  }, [activeScanBrand, router]);

  const brandsList: BrandCard[] = [
    {
      id: "ferrari-sf90",
      name: "Ferrari",
      subName: "SF90 STRADALE",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKeT76h5Hr2SsYY2xK_4V5rfl_8xr24ezJPvpJh_HXf2g3BC13GbnGsJqsphVxhh8NxiqR_8M8qaXjACoU7d7B5WYFA_o0jP1GTYYRWfeYMHYdG_D8Ex-HIvLmwV2FgqOQoyo7SOLH7zyTHsjpDz_nCzgKcpKn8RCH4UTQ6fhrPZIloGRqKkbugPmtc5HlLwiQNlFNpJcAfjPoTh0PheiyQzOaVZqIYya2oy94PYIqQwp7pgyThzgTNM_kBL52f5oNiwmNfnKzdKa4",
      powerplant: "V8 HYBRID TT",
      peakOutput: "986 HP",
      facility: "MARANELLO",
      status: "ACTIVE",
      price: "507K",
      accel: "2.5s",
      topSpeed: "340 kph",
      icon: "speed",
    },
    {
      id: "lamborghini-revuelto",
      name: "Lamborghini",
      subName: "REVUELTO",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8O63smAzMdE5Hp3Sf0sFHfHcoX9Y0bukv_1RsMyH3SfuyDVBB3cOeATKegbEKxM_5__RGeBO9iGvyzZZMD44e-rSbxZG0Cteo8I3Ni5VnRp3zea12c_U4hI0Nno9QeqmAC6IHJVEy8Y4VtkXweMha7oDPuSlwlyJ8A2qFFBQxAoWwRGnhcR1Uyn0uYFLKNLXilXZzPLwqwvClxzVZX4aVn_HqWcuvWxBLgq6y8XI3XsKVXLCQUdRJ5aFS3sRjY5Zm-ZqCyFmgOdmJ",
      powerplant: "V12 PHEV",
      peakOutput: "1001 HP",
      facility: "SANT'AGATA",
      status: "ACTIVE",
      price: "608K",
      accel: "2.5s",
      topSpeed: "350 kph",
      description: "Uncompromising aggressive geometry paired with naturally aspirated V12 hybrid architectures. Engineered for maximum visceral impact and structural dominance.",
      spansTwo: true,
      icon: "bolt",
    },
    {
      id: "bugatti-bolide",
      name: "Bugatti",
      subName: "BOLIDE",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB6wG6yQNJo_mSuL5NguA3hd0ZkK5MBzOU30l2tzsMhpE74YJdZu4GnOg1hRveB66L0olH6_5orBZRR-IZ7_VIgc67OCBaQ2F6eIa5wge1byuFwANftDea3BrEhpgObq893PZGDOKSyCrVT3HDZSXBYirNrXgBwk4JwyCcWMXZOx3PRHJ2GOK3pCHZ7IW--2n8pXY0d6-osepHU4DFAEMvd5fSur_cjxGXx6ezpXYskjO0E2QELfR0MSClekXdxk5RtjSRBuO3HL4BG",
      powerplant: "W16 QUAD-TURBO",
      peakOutput: "1578 HP",
      facility: "MOLSHEIM",
      status: "RESTRICTED",
      price: "4.7M",
      accel: "2.1s",
      topSpeed: "500 kph",
      icon: "precision_manufacturing",
    },
    {
      id: "mclaren-senna",
      name: "McLaren",
      subName: "SENNA",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFIBands2h8zSiwPuNn11vFMtQm_ajPu38MYTf6S8T6RWdzvmkC_odpGz5NgH7V-IdFitkUGepl24OHJHQE-KyxoAiAXgcFWPt6IJeRCQfCgHrDEIdX9ZZkddHzdkDOc1OPlArnpoOQwu4BWMvBFBxmZH4_lksjy8izUHTbQuaI0w3z7Efuq83aOEYGe0WcdaB-jpun01qg8Z44GnsYvk_82qt7xoJ8yYt9C5C99VVC6KtagBcld4mQQRkGR6dC_2_Sczu5z6lQ8Jh",
      powerplant: "V8 TWIN-TURBO",
      peakOutput: "814 HP",
      facility: "WOKING",
      status: "ACTIVE",
      price: "1.3M",
      accel: "2.8s",
      topSpeed: "340 kph",
      icon: "analytics",
    },
    {
      id: "koenigsegg-jesko",
      name: "Koenigsegg",
      subName: "JESKO ABSOLUT",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDug_n1ctyQ2DKg7G-ISUWOPmxRtOkzSGTnSo3aMeH4OMzoOj8ffAx24c0Xe4s6Bd_uWyouo-9mJ_UrqSLWIHi0ZGRmkSU-IIzJ6AsiXEfpLaXvoEG3CJLBOMax9eBEhzVtYOaLkIyZTdqAU3MyjFTD0ogSBEZDcm3O67WNvgkHgSDoJeCuvpaQLtZKqieslly7B932xiRdg36wvdQYjhvNU9l0PuN1Iz-aMSgc0FSfiNdBfeqcbrVbCS3FUSparLrvXFJm_326WkWm",
      powerplant: "V8 LST E85",
      peakOutput: "1600 HP",
      facility: "ÄNGELHOLM",
      status: "PROTOTYPE",
      price: "3.0M",
      accel: "2.5s",
      topSpeed: "530 kph",
      link: "/showroom/jesko-absolut",
      icon: "rocket_launch",
    },
  ];

  const handleWishlistToggle = (brand: BrandCard) => {
    if (isInCollection(brand.id)) {
      removeFromCollection(brand.id);
    } else {
      const carToAdd: Car = {
        id: brand.id,
        name: brand.subName,
        subName: `${brand.name} SPECIFICATION`,
        price: brand.price,
        accel: brand.accel,
        topSpeed: brand.topSpeed,
        power: brand.peakOutput,
        image: brand.image,
        specLabel: "POWERPLANT",
        specValue: brand.powerplant,
        tag: brand.status,
      };
      addToCollection(carToAdd);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface text-secondary antialiased font-sans">
      <Header />

      <main className="flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-16 py-12 relative">
        {/* Ghost Lines Background */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-12 gap-6 px-6 md:px-16 opacity-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="col-span-1 border-r border-white h-full" />
          ))}
        </div>

        {/* Page Header */}
        <div className="mb-16 border-l-4 border-primary-container pl-6 relative z-10">
          <p className="font-jetbrains-mono text-sm text-tertiary tracking-widest mb-2 flex items-center gap-2">
            <span className="w-8 h-[1px] bg-tertiary block" /> DIRECTIVE: 004
          </p>
          <h1 className="font-anybody text-4xl md:text-6xl font-black text-on-surface uppercase tracking-tighter">
            MANUFACTURER<br />
            <span className="text-primary-container drop-shadow-[0_0_10px_rgba(255,85,64,0.3)]">SYNDICATE</span>
          </h1>
          <p className="font-sans text-base md:text-lg text-secondary mt-4 max-w-2xl">
            Access complete telemetry, structural schematics, and performance matrices for tier-one automotive contractors.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {brandsList.map((brand) => {
            const isSaved = isInCollection(brand.id);
            return (
              <div
                key={brand.id}
                className={`group relative bg-surface-container-highest border-2 border-outline-variant hover:border-primary-container transition-all duration-300 rounded-none overflow-hidden ${
                  brand.spansTwo ? "lg:col-span-2" : ""
                }`}
                style={{ clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 0 100%)" }}
              >
                {/* Focus Corner Indicator */}
                <div className="absolute top-0 right-0 w-8 h-8 bg-primary-container opacity-0 group-hover:opacity-100 transition-opacity z-20" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} />

                {/* Car Image Area */}
                <div className="h-64 relative border-b-2 border-outline-variant group-hover:border-primary-container transition-colors">
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest via-transparent to-transparent z-10" />
                  <img
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 transform group-hover:scale-105"
                    alt={`${brand.name} ${brand.subName}`}
                    src={brand.image}
                  />
                  <div className="absolute top-4 left-4 z-20 bg-background/80 px-2 py-1 border border-outline-variant backdrop-blur-sm flex items-center gap-2">
                    <span className="font-jetbrains-mono text-xs text-primary tracking-widest">ID: {brand.id.substring(0, 4).toUpperCase()}</span>
                    <button
                      onClick={() => handleWishlistToggle(brand)}
                      className="text-primary hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
                      title={isSaved ? "Remove from wishlist" : "Add to wishlist"}
                    >
                      <span className="material-symbols-outlined text-sm font-bold" style={{ fontVariationSettings: isSaved ? "'FILL' 1" : "'FILL' 0" }}>
                        favorite
                      </span>
                    </button>
                  </div>
                </div>

                {/* Card Details */}
                <div className={`p-6 carbon-pattern ${brand.spansTwo ? "grid grid-cols-1 md:grid-cols-2 gap-8" : ""}`}>
                  <div>
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <h2 className="font-anybody text-2xl md:text-3xl text-on-surface uppercase tracking-tight">{brand.name}</h2>
                        <p className="font-jetbrains-mono text-xs text-primary">{brand.subName}</p>
                      </div>
                      {!brand.spansTwo && brand.icon && (
                        <span className="material-symbols-outlined text-outline-variant text-[32px] group-hover:text-primary transition-colors">
                          {brand.icon}
                        </span>
                      )}
                    </div>
                    {brand.description && (
                      <p className="font-sans text-sm text-secondary mb-4 hidden md:block leading-relaxed">
                        {brand.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col justify-between gap-6">
                    <div className={`grid grid-cols-2 gap-4 font-jetbrains-mono text-xs text-secondary ${
                      brand.spansTwo ? "border-t md:border-t-0 md:border-l border-outline-variant/30 pt-4 md:pt-0 md:pl-4" : "border-t border-outline-variant/30 pt-4"
                    }`}>
                      <div>
                        <span className="block text-outline text-[10px] tracking-widest mb-1">POWERPLANT</span>
                        <span className="text-on-surface">{brand.powerplant}</span>
                      </div>
                      <div>
                        <span className="block text-outline text-[10px] tracking-widest mb-1">PEAK OUTPUT</span>
                        <span className="text-primary">{brand.peakOutput}</span>
                      </div>
                      <div>
                        <span className="block text-outline text-[10px] tracking-widest mb-1">FACILITY</span>
                        <span className="text-on-surface">{brand.facility}</span>
                      </div>
                      <div>
                        <span className="block text-outline text-[10px] tracking-widest mb-1">STATUS</span>
                        <span className={`border px-1.5 py-0.5 inline-block text-[10px] ${
                          brand.status === "ACTIVE" 
                            ? "text-green-500 border-green-500/30 bg-green-500/10" 
                            : brand.status === "RESTRICTED" 
                              ? "text-primary border-primary/30 bg-primary/10 animate-pulse" 
                              : "text-tertiary border-tertiary/30 bg-tertiary/10"
                        }`}>
                          {brand.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => startDecryption(brand, e)}
                        className="flex-grow py-3 bg-transparent border-2 border-primary-container text-on-surface font-jetbrains-mono text-xs uppercase tracking-widest flex justify-between items-center px-4 hover:shadow-[0_0_15px_rgba(255,85,64,0.45)] hover:text-primary-container transition-all cursor-pointer select-none"
                      >
                        <span>{brand.link ? "ACCESS DATABANK" : "SCHEMATICS LOADED"}</span>
                        <span className="material-symbols-outlined text-xs font-bold text-[#e2e2e2] group-hover:text-primary-container transition-colors">arrow_forward_ios</span>
                      </button>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Futuristic Cyberpunk Schematics Decryption Overlay */}
      {activeScanBrand && (
        <div className="fixed inset-0 bg-[#07050a]/96 z-50 flex items-center justify-center backdrop-blur-lg px-4 select-none animate-fade-in">
          {/* Diagnostic Grid Background */}
          <div className="absolute inset-0 pointer-events-none ghost-grid opacity-20" />
          
          {/* Laser scanning sweep line (only during scanning phase) */}
          {!showDecryptResult && (
            <div 
              className="absolute inset-x-0 h-1 bg-primary-container/80 shadow-[0_0_15px_#ff5540] pointer-events-none animate-pulse"
              style={{
                animation: 'scanLine 2.2s infinite ease-in-out',
                top: '0%'
              }}
            />
          )}

          {/* Add CSS keyframes for scan line dynamically */}
          <style>{`
            @keyframes scanLine {
              0% { top: 0%; opacity: 0.3; }
              50% { top: 100%; opacity: 0.9; }
              100% { top: 0%; opacity: 0.3; }
            }
          `}</style>

          {/* HUD Content Container */}
          <div 
            className="w-full max-w-2xl bg-surface border-2 border-primary-container/40 p-6 md:p-8 flex flex-col items-center justify-between relative shadow-[0_0_30px_rgba(255,85,64,0.15)] overflow-hidden"
            style={{ clipPath: "polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 0 100%)" }}
          >
            {/* Corner Bracket decorations */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary-container/60" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary-container/60" />

            {!showDecryptResult ? (
              // PHASE 1: SCANNING PROGRESS HUD
              <div className="w-full flex flex-col items-center py-8">
                <span className="material-symbols-outlined text-[#ff5540] text-5xl animate-spin mb-4" style={{ animationDuration: '3s' }}>
                  progress_activity
                </span>
                
                <h2 className="font-anybody text-lg md:text-xl font-bold tracking-widest text-on-surface uppercase text-center mb-1">
                  DECRYPTING STRUCTURAL SCHEMATICS
                </h2>
                <p className="font-jetbrains-mono text-[9px] text-[#ffb4a8] tracking-widest uppercase opacity-75 mb-6">
                  CONTRACTOR: {activeScanBrand.name.toUpperCase()} // SOURCE: SECURE_UPLINK
                </p>

                {/* Progress Bar */}
                <div className="w-full max-w-md h-3.5 bg-surface-container border border-outline-variant/30 rounded-none overflow-hidden p-0.5 mb-6">
                  <div 
                    className="h-full bg-gradient-to-r from-[#ff5500] to-[#ffaa00] transition-all duration-75 shadow-[0_0_8px_#ff5500]"
                    style={{ width: `${scanProgress}%` }}
                  />
                </div>

                {/* Simulated Telemetry Terminal Logs */}
                <div className="w-full max-w-md h-32 bg-[#09070c] border border-outline-variant/30 p-3 font-mono text-[9px] text-[#ffb4a8]/90 overflow-y-auto space-y-1.5 scrollbar-thin">
                  {scanLogs.map((log, index) => (
                    <div key={index} className="flex gap-2 animate-fade-in">
                      <span className="text-zinc-600">[{index + 1}]</span>
                      <span className="text-primary-container">»</span>
                      <span className="text-on-surface truncate">{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // PHASE 2: SPECS BLUEPRINT SCHEMATIC CONSOLE
              <div className="w-full">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-outline-variant/30 pb-4 mb-6">
                  <div>
                    <span className="text-[10px] text-primary font-bold tracking-widest font-jetbrains-mono uppercase">
                      SCHEMATICS DECRYPTED // DATA_LOCK_OFF
                    </span>
                    <h2 className="font-anybody text-2xl md:text-3xl text-on-surface uppercase tracking-tight mt-1">
                      {activeScanBrand.name} {activeScanBrand.subName}
                    </h2>
                  </div>
                  <span className="font-jetbrains-mono text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 border border-green-500/20">
                    DECRYPTED
                  </span>
                </div>

                {/* Content columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  
                  {/* Left Column: Car visual schema & Wishlist */}
                  <div className="flex flex-col gap-4">
                    <div className="relative border border-outline-variant/30 aspect-video rounded overflow-hidden bg-black/60 flex items-center justify-center">
                      <div className="absolute inset-0 ghost-grid opacity-30 pointer-events-none" />
                      
                      {/* Scanning wireframe mock silhouette */}
                      <svg className="w-44 h-auto text-primary-container/40 opacity-70 animate-pulse" viewBox="0 0 100 60" fill="none" stroke="currentColor" strokeWidth="0.8">
                        {/* Wheel 1 */}
                        <circle cx="25" cy="40" r="10" />
                        <circle cx="25" cy="40" r="4" />
                        {/* Wheel 2 */}
                        <circle cx="75" cy="40" r="10" />
                        <circle cx="75" cy="40" r="4" />
                        {/* Body contours */}
                        <path d="M 5,40 L 15,40 Q 20,25 35,23 L 55,20 Q 70,20 75,30 L 95,40 L 95,43 L 5,43 Z" />
                        <path d="M 35,23 Q 48,15 62,20 L 70,30" />
                        {/* Radar line */}
                        <line x1="50" y1="5" x2="50" y2="55" stroke="#ff5540" strokeWidth="1" strokeDasharray="2 2" />
                      </svg>
                      
                      <div className="absolute top-2 left-2 text-[8px] font-mono text-zinc-500">SCHEMATIC_RENDER v1.0</div>
                      <div className="absolute bottom-2 right-2 text-[8px] font-mono text-zinc-400">FACILITY: {activeScanBrand.facility}</div>
                    </div>

                    <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed italic border-l border-outline-variant pl-2">
                      {activeScanBrand.description || "Decrypted CAD blueprints, aerodynamic wind tunnel flow profiles, and direct mechanical layouts are now unlocked."}
                    </p>

                    <button
                      onClick={() => handleWishlistToggle(activeScanBrand)}
                      className={`py-2 w-full font-jetbrains-mono text-[10px] uppercase font-bold tracking-widest rounded flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
                        isInCollection(activeScanBrand.id)
                          ? "bg-surface border border-red-500/40 text-red-400 hover:bg-red-500/10"
                          : "bg-primary-container text-white hover:bg-primary-container/85 shadow-[0_0_10px_rgba(255,85,64,0.25)]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px] font-bold">
                        {isInCollection(activeScanBrand.id) ? "delete" : "bookmark"}
                      </span>
                      {isInCollection(activeScanBrand.id) ? "Remove Wishlist" : "Save to Wishlist"}
                    </button>
                  </div>

                  {/* Right Column: Spec Blueprint details */}
                  <div className="font-jetbrains-mono text-[10px] space-y-2 border-t md:border-t-0 md:border-l border-outline-variant/30 pt-4 md:pt-0 md:pl-6 text-secondary">
                    {(() => {
                      const specs = BRAND_SCHEMATICS[activeScanBrand.id] || {
                        model: activeScanBrand.subName,
                        chassis: "Advanced carbon composites monocoque",
                        aero: "High downforce track geometry",
                        suspension: "Active ride control dampers",
                        brakes: "High friction carbon ceramic discs",
                        tires: "High performance racing tires",
                        weight: "Ultralight aerodynamic chassis",
                        driveType: activeScanBrand.powerplant
                      };
                      return (
                        <>
                          <div className="border-b border-outline-variant/10 pb-1.5">
                            <span className="block text-outline text-[9px] tracking-wider uppercase mb-0.5">TECHNICAL MODEL</span>
                            <span className="text-on-surface font-bold">{specs.model}</span>
                          </div>
                          <div className="border-b border-outline-variant/10 pb-1.5">
                            <span className="block text-outline text-[9px] tracking-wider uppercase mb-0.5">COMPOSITE CHASSIS</span>
                            <span className="text-on-surface">{specs.chassis}</span>
                          </div>
                          <div className="border-b border-outline-variant/10 pb-1.5">
                            <span className="block text-outline text-[9px] tracking-wider uppercase mb-0.5">AERODYNAMIC INDEX</span>
                            <span className="text-on-surface">{specs.aero}</span>
                          </div>
                          <div className="border-b border-outline-variant/10 pb-1.5">
                            <span className="block text-outline text-[9px] tracking-wider uppercase mb-0.5">SUSPENSION SYSTEM</span>
                            <span className="text-on-surface">{specs.suspension}</span>
                          </div>
                          <div className="border-b border-outline-variant/10 pb-1.5">
                            <span className="block text-outline text-[9px] tracking-wider uppercase mb-0.5">BRAKING ASSEMBLY</span>
                            <span className="text-on-surface">{specs.brakes}</span>
                          </div>
                          <div className="border-b border-outline-variant/10 pb-1.5">
                            <span className="block text-outline text-[9px] tracking-wider uppercase mb-0.5">TIRE COMPOUND</span>
                            <span className="text-on-surface">{specs.tires}</span>
                          </div>
                          <div className="border-b border-outline-variant/10 pb-1.5">
                            <span className="block text-outline text-[9px] tracking-wider uppercase mb-0.5">CURB WEIGHT</span>
                            <span className="text-on-surface">{specs.weight}</span>
                          </div>
                          <div>
                            <span className="block text-outline text-[9px] tracking-wider uppercase mb-0.5">POWERTRAIN DRIVE</span>
                            <span className="text-primary font-bold">{specs.driveType}</span>
                          </div>
                        </>
                      );
                    })()}
                  </div>

                </div>

                {/* Footer Controls */}
                <div className="flex justify-end gap-3 border-t border-[#353535] pt-6 mt-6">
                  <button
                    onClick={() => {
                      setActiveScanBrand(null);
                      setShowDecryptResult(false);
                    }}
                    className="px-6 py-2.5 bg-[#1f1f1f] border border-outline-variant/40 hover:border-primary-container text-secondary hover:text-white font-jetbrains-mono text-[10px] uppercase font-bold tracking-widest transition-colors cursor-pointer"
                  >
                    DISMISS TERMINAL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
