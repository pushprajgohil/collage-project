"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Atelier() {
  const [logs, setLogs] = useState<string[]>([
    "> INIT KERNEL... OK",
    "> MOUNTING SENSORS... OK",
  ]);
  const [calibrating, setCalibrating] = useState(false);
  const loadingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const calibrationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const logLines = [
    "> CALIBRATING YAW_RATE... [WAIT]",
    "> CALIBRATING YAW_RATE... OK",
    "> ESTABLISHING TELEMETRY LINK...",
    "> STREAM_ACTIVE // 1000HZ",
    "> TEMP_CORE: 94C | PRESS_OIL: 4.2BAR",
    "> RPM_LIMIT: UNLOCKED",
    "> SYSTEM ARMED // STANDBY MODE"
  ];

  useEffect(() => {
    let index = 0;
    loadingIntervalRef.current = setInterval(() => {
      if (index < logLines.length) {
        setLogs((prev) => [...prev, logLines[index]]);
        index++;
      } else {
        if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
      }
    }, 1200);

    return () => {
      if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
      if (calibrationIntervalRef.current) clearInterval(calibrationIntervalRef.current);
    };
  }, []);

  const runCalibration = () => {
    if (calibrating) return;
    
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    if (calibrationIntervalRef.current) clearInterval(calibrationIntervalRef.current);

    setCalibrating(true);
    setLogs(["> REBOOTING TELEMETRY LINK...", "> RE-INITIALIZING SENSORS... OK"]);
    
    let index = 0;
    calibrationIntervalRef.current = setInterval(() => {
      if (index < logLines.length) {
        setLogs((prev) => [...prev, logLines[index]]);
        index++;
      } else {
        setCalibrating(false);
        if (calibrationIntervalRef.current) clearInterval(calibrationIntervalRef.current);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-black text-on-background antialiased font-sans">
      <Header />

      <main className="flex-grow flex flex-col md:flex-row relative z-10 w-full max-w-[1440px] mx-auto">
        <div className="flex-grow w-full relative ghost-grid min-h-screen border-l border-r border-primary/10">
          
          {/* Hero Section */}
          <section className="px-6 md:px-16 py-20 md:py-32 relative border-b border-primary/10">
            <div 
              className="absolute inset-0 z-0 opacity-20 pointer-events-none mix-blend-screen bg-cover bg-center bg-no-repeat" 
              style={{ 
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDvU2xLLNJic7AyUCTnhM14MDCDJayn71wZEW0aM3Q_tunklgQ13kaRNAUu7tWQToKpfTKjiGk3ZLV9c6R-LNk6KnN_U-gG19aCNCzmyR9Zv1rWOW-92ZAvcRGvpKVvDWpkdc5X62c6RG6sbt81dQJo0dztgk0Q4TiQZlX0mpCu6TzElaeeXyBUCnvq2fogweKp-EcKhJIFYTc35rMBJPxwEDYthIJomeAp6bmO1j1vjuArsi2PG4kG_A_G2t6ospIsW11QVUS4oAW1')` 
              }}
            />
            
            <div className="relative z-10 max-w-4xl">
              <div className="inline-block border border-primary px-3 py-1 mb-8 text-primary font-jetbrains-mono text-xs uppercase tracking-widest bg-black shadow-[0_0_15px_rgba(227,24,55,0.3)]">
                SYS.DOC // ATELIER_MANIFESTO
              </div>
              <h1 className="font-anybody text-4xl md:text-7xl font-black text-on-background mb-10 leading-none tracking-tighter uppercase">
                ENGINEERED <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-inverse-primary drop-shadow-[0_0_20px_rgba(227,24,55,0.5)]">
                  UNCOMPROMISING
                </span>
              </h1>
              <p className="font-sans text-base md:text-lg text-secondary max-w-2xl border-l-2 border-primary/50 pl-6 md:pl-8 leading-relaxed">
                HyperDrive Garage is not a workshop. It is a high-performance atelier where brutalist engineering meets precision telemetry. We strip away the superfluous to expose the raw mechanics of speed.
              </p>
            </div>

            {/* Hero Telemetry Overlay (Desktop only) */}
            <div className="absolute top-32 right-16 hidden lg:flex flex-col gap-4 font-jetbrains-mono text-xs text-secondary">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-none shadow-[0_0_10px_#e31837] animate-ping" />
                <span className="text-primary font-bold drop-shadow-[0_0_5px_rgba(227,24,55,0.5)]">STATUS: OPTIMAL</span>
              </div>
              <div className="flex items-center gap-4 border-b border-primary/20 pb-2">
                <span>LAT: 47.6062</span>
                <span>LON: -122.3321</span>
              </div>
              <div className="flex flex-col">
                <span>VERSION: 9.4.2_BETA</span>
                <span className="text-tertiary">BUILD_DATE: 2026.06.25</span>
              </div>
            </div>
          </section>

          {/* Philosophy Bento Grid */}
          <section className="px-6 md:px-16 py-20 md:py-32 border-b border-primary/10">
            <div className="flex items-center gap-4 mb-16">
              <span className="material-symbols-outlined text-primary text-3xl drop-shadow-[0_0_8px_rgba(227,24,55,0.8)]">
                precision_manufacturing
              </span>
              <h2 className="font-anybody text-2xl md:text-3xl text-on-background uppercase tracking-tight font-black">
                Core Directives
              </h2>
              <div className="flex-grow h-[1px] bg-primary/20 ml-4 shadow-[0_0_10px_rgba(227,24,55,0.3)]" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              {/* Directive 1 */}
              <div className="col-span-1 lg:col-span-7 bg-black border border-primary/30 p-8 md:p-10 relative clipped-corner-tr group hover:border-primary shadow-[0_0_20px_rgba(227,24,55,0.1)] hover:shadow-[0_0_30px_rgba(227,24,55,0.3)] transition-all duration-300">
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-transparent group-hover:border-primary transition-colors" />
                <span className="font-jetbrains-mono text-xs text-primary mb-6 block drop-shadow-[0_0_5px_rgba(227,24,55,0.5)]">
                  01 // STRUCTURAL INTEGRITY
                </span>
                <h3 className="font-anybody text-xl md:text-2xl font-bold text-on-background mb-6 uppercase">
                  Brutalist Mechanics
                </h3>
                <p className="font-sans text-sm text-secondary mb-10 leading-relaxed">
                  Function dictates form absolutely. We employ carbon composites, aerospace-grade titanium, and unapologetic geometries. Every component is exposed, inspected, and optimized for maximum lateral G-force endurance.
                </p>
                <div className="w-full h-56 bg-black border border-primary/20 relative overflow-hidden">
                  <div className="absolute inset-0 carbon-pattern opacity-30" />
                  <img 
                    className="w-full h-full object-cover mix-blend-luminosity opacity-50 grayscale group-hover:opacity-75 transition-opacity" 
                    alt="Raw titanium components" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9ggLXKMykjhYq7JwaR5nAui9d31gQqqbQYt9VDinpaiu4pdzdE4uelz3_dQFd91GPFD89RK0vxhkHVdOMWhA74OK-nctWgsM97SBqDBmxauYg3w1fcVFiR18ObArx7iuslVt_whgcRuCUGrK4RNg2fNcFecVFDy6jHHBFpn7NjTIm5F7aa0fVTPf3pfA39RQQGfhHTulffOC_5XsUoRMIvpQ9wO0MEZ131StAgXxpmMb60vL9pefq1reYzNhp6ByvtptcY6FbNrmU"
                  />
                </div>
              </div>

              {/* Directive 2 */}
              <div className="col-span-1 lg:col-span-5 bg-black border border-primary/30 p-8 md:p-10 relative clipped-corner-tr group hover:border-primary shadow-[0_0_20px_rgba(227,24,55,0.1)] hover:shadow-[0_0_30px_rgba(227,24,55,0.3)] transition-all duration-300 flex flex-col justify-between">
                <div>
                  <span className="font-jetbrains-mono text-xs text-primary mb-6 block drop-shadow-[0_0_5px_rgba(227,24,55,0.5)]">
                    02 // AERODYNAMICS
                  </span>
                  <h3 className="font-anybody text-xl md:text-2xl font-bold text-on-background mb-6 uppercase">
                    Fluid Dynamics
                  </h3>
                  <p className="font-sans text-sm text-secondary leading-relaxed">
                    Drag is the enemy of velocity. Our active aero systems continuously adjust to optimize downforce-to-drag ratios in real-time, calculating environmental variables at 1000Hz.
                  </p>
                </div>
                <div className="mt-10 font-jetbrains-mono text-xs">
                  <div className="flex justify-between text-secondary mb-3 border-b border-primary/20 pb-2">
                    <span>COEFFICIENT</span>
                    <span className="text-primary font-bold drop-shadow-[0_0_5px_rgba(227,24,55,0.5)]">0.24 Cd</span>
                  </div>
                  <div className="flex justify-between text-secondary mb-3 border-b border-primary/20 pb-2">
                    <span>DOWNFORCE @ 200KM/H</span>
                    <span className="text-primary font-bold drop-shadow-[0_0_5px_rgba(227,24,55,0.5)]">450 KG</span>
                  </div>
                </div>
              </div>

              {/* Directive 3 */}
              <div className="col-span-1 lg:col-span-12 bg-black border border-primary/30 border-l-4 border-l-primary p-8 md:p-10 mt-8 relative shadow-[0_0_20px_rgba(227,24,55,0.1)] hover:shadow-[0_0_30px_rgba(227,24,55,0.3)] transition-all duration-300">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
                  <div className="w-full lg:w-1/2">
                    <span className="font-jetbrains-mono text-xs text-primary mb-4 block drop-shadow-[0_0_5px_rgba(227,24,55,0.5)]">
                      03 // NEURAL LINK
                    </span>
                    <h3 className="font-anybody text-xl md:text-2xl font-bold text-on-background mb-6 uppercase">
                      Garage_OS Telemetry
                    </h3>
                    <p className="font-sans text-sm text-secondary mb-10 leading-relaxed">
                      The vehicle is not a separate entity; it is an extension of the operator. Garage_OS is a proprietary telemetry kernel that feeds direct mechanical feedback into a high-visibility HUD, stripping away latency between intention and action.
                    </p>
                    <button 
                      onClick={runCalibration}
                      className="bg-black text-primary font-jetbrains-mono text-xs uppercase px-6 py-4 font-bold border border-primary shadow-[0_0_15px_rgba(227,24,55,0.2)] hover:bg-primary hover:text-black hover:shadow-[0_0_25px_rgba(227,24,55,0.5)] transition-all duration-300 active:scale-95 clipped-corner-br"
                    >
                      {calibrating ? "RUNNING_DIAGNOSTICS..." : "ACCESS_DOCUMENTATION // RUN CALIBRATION"}
                    </button>
                  </div>

                  <div className="w-full lg:w-1/2 h-72 border border-primary/30 relative p-6 font-jetbrains-mono text-xs text-secondary bg-black overflow-hidden shadow-[inset_0_0_20px_rgba(227,24,55,0.1)]">
                    {/* Simulated Telemetry Feed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none z-10" />
                    
                    <div className="h-full overflow-y-auto flex flex-col justify-end opacity-85 z-0 relative pr-6">
                      {logs.map((log, i) => {
                        let colorClass = "text-secondary";
                        if (log && log.includes("OK")) colorClass = "text-green-500";
                        if (log && (log.includes("LINK") || log.includes("STREAM"))) colorClass = "text-primary font-bold drop-shadow-[0_0_5px_rgba(227,24,55,0.5)]";
                        if (log && log.includes("WAIT")) colorClass = "text-tertiary animate-pulse";
                        return (
                          <div key={i} className={`mb-2 font-mono ${colorClass}`}>
                            {log}
                          </div>
                        );
                      })}
                    </div>

                    <div className="absolute top-6 right-6 w-12 h-12 border border-primary/50 rounded-full flex items-center justify-center z-20">
                      <div className="w-10 h-10 border border-primary rounded-full animate-ping opacity-30 shadow-[0_0_10px_rgba(227,24,55,0.5)]" />
                      <div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_15px_#e31837]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
