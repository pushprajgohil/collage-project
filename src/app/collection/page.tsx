"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCollection, Car } from "@/context/CollectionContext";

export default function Collection() {
  const { collection, removeFromCollection } = useCollection();
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleCompare = (id: string) => {
    if (compareIds.includes(id)) {
      setCompareIds(compareIds.filter((cid) => cid !== id));
    } else {
      setCompareIds([...compareIds, id]);
    }
  };

  const getCompareList = () => {
    return collection.filter((car) => compareIds.includes(car.id));
  };

  const getMaxValues = () => {
    const list = getCompareList();
    let maxSpeed = 1;
    let maxPower = 1;
    let minAccel = 100;
    
    list.forEach((car) => {
      const speed = parseFloat(car.topSpeed) || 1;
      const power = parseFloat(car.power) || 1;
      const accel = parseFloat(car.accel) || 100;
      
      if (speed > maxSpeed) maxSpeed = speed;
      if (power > maxPower) maxPower = power;
      if (accel < minAccel) minAccel = accel;
    });
    
    return { maxSpeed, maxPower, minAccel };
  };

  const getWinnerId = (spec: "accel" | "topSpeed" | "power") => {
    const list = getCompareList();
    if (list.length === 0) return null;

    let bestValue: number | null = null;
    let winnerId: string | null = null;

    list.forEach((car) => {
      let val = 0;
      if (spec === "accel") {
        val = parseFloat(car.accel);
      } else if (spec === "topSpeed") {
        val = parseFloat(car.topSpeed);
      } else if (spec === "power") {
        val = parseFloat(car.power);
      }

      if (isNaN(val)) return;

      if (bestValue === null) {
        bestValue = val;
        winnerId = car.id;
      } else {
        if (spec === "accel") {
          // Lowest is best for 0-100 kph
          if (val < bestValue) {
            bestValue = val;
            winnerId = car.id;
          }
        } else {
          // Highest is best for top speed and power
          if (val > bestValue) {
            bestValue = val;
            winnerId = car.id;
          }
        }
      }
    });

    return winnerId;
  };

  const { maxSpeed, maxPower, minAccel } = getMaxValues();
  const accelWinner = getWinnerId("accel");
  const speedWinner = getWinnerId("topSpeed");
  const powerWinner = getWinnerId("power");

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface text-secondary antialiased font-sans ghost-grid">
      <Header />

      <div className="flex flex-1 relative max-w-[1440px] mx-auto w-full">
        {/* SideNavBar (Desktop) */}
        <aside className="hidden md:flex flex-col z-40 w-64 border-r-2 border-outline-variant bg-surface-container-highest min-h-[calc(100vh-80px)] sticky top-20">
          <div className="p-6 border-b border-outline-variant/30">
            <h2 className="font-anybody text-xl text-primary font-black italic">GARAGE_CORE</h2>
            <div className="font-jetbrains-mono text-[10px] text-secondary tracking-widest mt-1">SYSTEM_ACTIVE</div>
          </div>
          <nav className="flex flex-col mt-4 font-jetbrains-mono text-xs uppercase tracking-widest">
            <Link 
              href="/"
              className="flex items-center gap-3 text-tertiary px-6 py-4 hover:bg-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">analytics</span>
              TELEMETRY
            </Link>
            <Link 
              href="/brands"
              className="flex items-center gap-3 text-tertiary px-6 py-4 hover:bg-surface-variant hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
              SPECS
            </Link>
            <Link 
              href="/collection"
              className="flex items-center gap-3 text-primary bg-secondary-container border-l-4 border-primary px-6 py-4 transition-transform font-bold"
            >
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                favorite
              </span>
              WISHLIST
            </Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-grow px-6 md:px-16 py-12">
          {/* Header Section */}
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-outline-variant/30 pb-6">
            <div>
              <h1 className="font-anybody text-4xl md:text-5xl font-black text-on-surface uppercase tracking-tighter">
                SAVED_ASSETS
              </h1>
              <p className="font-jetbrains-mono text-xs text-secondary mt-2 tracking-widest uppercase">
                {collection.length} {collection.length === 1 ? "VEHICLE" : "VEHICLES"} CURRENTLY IN QUEUE
              </p>
            </div>
            
            {collection.length > 0 && (
              <div className="flex gap-4">
                <button 
                  onClick={() => {
                    setCompareIds(collection.map((c) => c.id));
                    setIsModalOpen(true);
                  }}
                  className="bg-primary-container text-black font-jetbrains-mono text-xs uppercase px-6 py-3 border border-primary-container font-bold hover:bg-transparent hover:text-primary-container transition-all hover:shadow-[0_0_15px_#ff5540] active:scale-95 flex items-center gap-2 clip-corner -skew-x-6"
                >
                  <span className="material-symbols-outlined text-sm">compare_arrows</span>
                  COMPARE ALL
                </button>
              </div>
            )}
          </div>

          {/* Grid Layout */}
          {collection.length === 0 ? (
            <div className="text-center py-20 font-jetbrains-mono text-sm text-tertiary border border-dashed border-outline-variant/30">
              YOUR WISHLIST IS CURRENTLY EMPTY. <br />
              <Link href="/brands" className="text-primary hover:underline mt-4 inline-block">
                EXPLORE MANUFACTURER SYNDICATE
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collection.map((car) => {
                const isComparing = compareIds.includes(car.id);
                return (
                  <article 
                    key={car.id} 
                    className="bg-[#1a1a1a] carbon-pattern border border-outline-variant/50 clip-corner flex flex-col group relative overflow-hidden transition-all duration-300 hover:border-primary-container"
                  >
                    {/* Corner Tag */}
                    <div className="absolute top-0 right-0 w-8 h-8 bg-surface-container-highest flex items-center justify-center z-10" style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }} />
                    
                    {/* Image */}
                    <div className="h-48 relative overflow-hidden bg-surface-container-lowest border-b border-outline-variant/30">
                      <img 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 grayscale group-hover:grayscale-0" 
                        alt={car.name} 
                        src={car.image}
                      />
                      <div className="absolute top-3 left-3 bg-surface border border-outline-variant px-2 py-1 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="font-jetbrains-mono text-[10px] text-secondary tracking-widest">{car.tag || "SPEC_LOADED"}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-jetbrains-mono text-[10px] text-tertiary mb-1 tracking-wider">{car.subName}</div>
                          <h3 className="font-anybody text-xl font-bold text-on-surface leading-tight uppercase">
                            {car.name}
                          </h3>
                        </div>
                        <div className="font-anybody text-base text-primary font-bold">{car.price}</div>
                      </div>

                      {/* Specs */}
                      <div className="grid grid-cols-2 gap-4 mb-6 border-t border-outline-variant/20 pt-4 font-jetbrains-mono text-xs">
                        <div className="border-l-2 border-outline-variant pl-2">
                          <div className="text-[10px] text-secondary uppercase">{car.specLabel || "ACCEL"}</div>
                          <div className="text-sm text-on-surface font-bold">{car.specValue || car.accel}</div>
                        </div>
                        <div className="border-l-2 border-outline-variant pl-2">
                          <div className="text-[10px] text-secondary uppercase">TOP SPEED</div>
                          <div className="text-sm text-on-surface font-bold">{car.topSpeed}</div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 border-t border-outline-variant/20 pt-4">
                        <button 
                          onClick={() => toggleCompare(car.id)}
                          className={`flex-1 font-jetbrains-mono text-xs py-2 uppercase transition-all flex items-center justify-center gap-2 border ${
                            isComparing 
                              ? "bg-primary-container text-black font-bold border-primary-container"
                              : "bg-transparent border-outline-variant text-on-surface hover:border-primary hover:text-primary"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {isComparing ? "check_circle" : "add"}
                          </span>
                          <span>{isComparing ? "COMPARING" : "COMPARE"}</span>
                        </button>
                        
                        <button 
                          onClick={() => removeFromCollection(car.id)}
                          className="w-10 flex items-center justify-center border border-outline-variant text-secondary hover:text-primary hover:border-primary transition-all duration-200" 
                          title="Remove from Collection"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Active Comparison Bar (Floating) */}
          {compareIds.length > 0 && !isModalOpen && (
            <div className="fixed bottom-6 right-6 z-40 bg-black/90 border border-primary/30 p-4 shadow-[0_0_20px_rgba(255,85,64,0.3)] backdrop-blur-md flex items-center gap-4 animate-fade-in max-w-sm">
              <div className="font-jetbrains-mono text-xs">
                <span className="text-primary font-bold">{compareIds.length}</span> {compareIds.length === 1 ? "Asset" : "Assets"} selected for telemetry overlay.
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary-container text-black px-3 py-1.5 font-jetbrains-mono text-xs uppercase font-bold hover:shadow-[0_0_10px_#ff5540] transition-shadow duration-200"
                >
                  Overlay
                </button>
                <button 
                  onClick={() => setCompareIds([])}
                  className="text-secondary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-base mt-1">close</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Comparison Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-surface-container-high border-2 border-outline-variant p-6 md:p-8 max-w-5xl w-full relative overflow-y-auto max-h-[90vh] carbon-pattern">
            {/* Corner accents */}
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary-container m-2" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-outline-variant m-2" />

            <div className="flex justify-between items-start border-b border-outline-variant pb-4 mb-6">
              <div>
                <h2 className="font-anybody text-2xl font-black text-primary">TELEMETRY COMPARISON LABORATORY</h2>
                <p className="font-jetbrains-mono text-[10px] text-tertiary tracking-widest mt-1">DIRECT SIDE-BY-SIDE EXTRAPOLATION & APEX HIGHLIGHTING</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-secondary hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {getCompareList().length === 0 ? (
              <p className="font-jetbrains-mono text-sm text-tertiary text-center py-10">NO VEHICLES SELECTED FOR COMPARISON.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getCompareList().map((car) => {
                  const isAccelWinner = car.id === accelWinner;
                  const isSpeedWinner = car.id === speedWinner;
                  const isPowerWinner = car.id === powerWinner;
                  
                  const speedVal = parseFloat(car.topSpeed) || 1;
                  const powerVal = parseFloat(car.power) || 1;
                  const accelVal = parseFloat(car.accel) || 100;
                  
                  const speedPercent = (speedVal / maxSpeed) * 100;
                  const powerPercent = (powerVal / maxPower) * 100;
                  const accelPercent = (minAccel / accelVal) * 100;

                  return (
                    <div 
                      key={car.id} 
                      className={`border p-5 bg-black/60 flex flex-col gap-4 transition-all duration-300 ${
                        isSpeedWinner || isPowerWinner || isAccelWinner 
                          ? "border-primary-container/60 shadow-[0_0_15px_rgba(255,85,64,0.15)]" 
                          : "border-outline-variant/40"
                      }`}
                    >
                      <div className="relative h-36 border border-outline-variant/30 overflow-hidden">
                        <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                        <div className="absolute bottom-2 right-2 bg-black/85 px-2 py-0.5 border border-outline-variant/45 text-[10px] font-jetbrains-mono text-primary font-bold">
                          {car.price}
                        </div>
                      </div>

                      <div>
                        <h3 className="font-anybody text-lg font-bold text-on-surface uppercase leading-none">{car.name}</h3>
                        <span className="font-jetbrains-mono text-[9px] text-tertiary tracking-wider mt-1 block uppercase">{car.subName}</span>
                      </div>

                      <div className="flex flex-col gap-4 font-jetbrains-mono text-xs border-t border-outline-variant/20 pt-4">
                        
                        {/* Power Spec */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-secondary">PEAK OUTPUT</span>
                            <span className={`font-bold flex items-center gap-1 ${isPowerWinner ? "text-primary-container" : "text-on-surface"}`}>
                              {car.power}
                              {isPowerWinner && <span className="text-[10px] bg-primary-container/15 px-1 inline-block text-primary-container">APEX</span>}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container-lowest relative">
                            <div 
                              className={`h-full transition-all duration-500 ${isPowerWinner ? "bg-primary-container" : "bg-outline"}`}
                              style={{ width: `${powerPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Top Speed Spec */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-secondary">TOP SPEED</span>
                            <span className={`font-bold flex items-center gap-1 ${isSpeedWinner ? "text-primary-container" : "text-on-surface"}`}>
                              {car.topSpeed}
                              {isSpeedWinner && <span className="text-[10px] bg-primary-container/15 px-1 inline-block text-primary-container">APEX</span>}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container-lowest relative">
                            <div 
                              className={`h-full transition-all duration-500 ${isSpeedWinner ? "bg-primary-container" : "bg-outline"}`}
                              style={{ width: `${speedPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Acceleration Spec */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-secondary">0-100 KPH ACCEL</span>
                            <span className={`font-bold flex items-center gap-1 ${isAccelWinner ? "text-primary-container" : "text-on-surface"}`}>
                              {car.accel}
                              {isAccelWinner && <span className="text-[10px] bg-primary-container/15 px-1 inline-block text-primary-container">APEX</span>}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container-lowest relative">
                            <div 
                              className={`h-full transition-all duration-500 ${isAccelWinner ? "bg-primary-container" : "bg-outline"}`}
                              style={{ width: `${accelPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* General Spec label */}
                        <div className="flex justify-between border-t border-outline-variant/10 pt-2 text-[10px]">
                          <span className="text-tertiary uppercase">{car.specLabel || "POWERPLANT"}</span>
                          <span className="text-secondary text-right truncate font-bold">{car.specValue || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-primary-container text-black font-jetbrains-mono text-xs px-6 py-3 font-bold border border-primary-container hover:bg-transparent hover:text-primary-container transition-all"
              >
                CLOSE OVERLAY
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
