"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface TimelineNode {
  year: number;
  title: string;
  subTitle: string;
  description: string;
  specs: { label: string; value: string }[];
  categories: ("v12" | "hybrid" | "record")[];
  image?: string;
}

export default function Timeline() {
  const [filters, setFilters] = useState({
    v12: true,
    hybrid: true,
    record: true,
  });

  const timelineData: TimelineNode[] = [
    {
      year: 1992,
      title: "McLaren F1",
      subTitle: "SYS.NODE // NA_V12_APEX",
      description: "The legendary hypercar designed by Gordon Murray, employing a gold-leaf lined engine bay, central driving position, and active aerodynamics. Set the record for the world's fastest naturally aspirated production car.",
      specs: [
        { label: "POWERPLANT", value: "6.1L BMW V12 (S70/2)" },
        { label: "PEAK OUTPUT", value: "627 HP" },
        { label: "TOP SPEED", value: "386.4 KM/H (240.1 MPH)" },
      ],
      categories: ["v12", "record"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAFIBands2h8zSiwPuNn11vFMtQm_ajPu38MYTf6S8T6RWdzvmkC_odpGz5NgH7V-IdFitkUGepl24OHJHQE-KyxoAiAXgcFWPt6IJeRCQfCgHrDEIdX9ZZkddHzdkDOc1OPlArnpoOQwu4BWMvBFBxmZH4_lksjy8izUHTbQuaI0w3z7Efuq83aOEYGe0WcdaB-jpun01qg8Z44GnsYvk_82qt7xoJ8yYt9C5C99VVC6KtagBcld4mQQRkGR6dC_2_Sczu5z6lQ8Jh",
    },
    {
      year: 2013,
      title: "Ferrari LaFerrari",
      subTitle: "SYS.NODE // HYBRID_TRINITY",
      description: "Ferrari's first hybrid hypercar, combining a high-revving 6.3-liter V12 engine directly with an F1-derived KERS electric motor system to deliver instant torque fill and unrivaled track dynamics.",
      specs: [
        { label: "POWERPLANT", value: "6.3L V12 + KERS MOTOR" },
        { label: "COMBINED HP", value: "950 HP" },
        { label: "0-100 KM/H", value: "Under 2.6s" },
      ],
      categories: ["v12", "hybrid"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKeT76h5Hr2SsYY2xK_4V5rfl_8xr24ezJPvpJh_HXf2g3BC13GbnGsJqsphVxhh8NxiqR_8M8qaXjACoU7d7B5WYFA_o0jP1GTYYRWfeYMHYdG_D8Ex-HIvLmwV2FgqOQoyo7SOLH7zyTHsjpDz_nCzgKcpKn8RCH4UTQ6fhrPZIloGRqKkbugPmtc5HlLwiQNlFNpJcAfjPoTh0PheiyQzOaVZqIYya2oy94PYIqQwp7pgyThzgTNM_kBL52f5oNiwmNfnKzdKa4",
    },
    {
      year: 2020,
      title: "Koenigsegg Jesko Absolut",
      subTitle: "SYS.NODE // AERODYNAMIC_APEX",
      description: "Koenigsegg's absolute fastest car ever created, featuring an ultra-low drag coefficient of 0.278 Cd. Built specifically to shatter speed barriers and sustain lateral G-forces that redefine automotive stability.",
      specs: [
        { label: "POWERPLANT", value: "5.0L TWIN-TURBO V8" },
        { label: "PEAK OUTPUT", value: "1600 HP (E85)" },
        { label: "TOP SPEED", value: "531 KM/H (330+ MPH)" },
      ],
      categories: ["record", "hybrid"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDug_n1ctyQ2DKg7G-ISUWOPmxRtOkzSGTnSo3aMeH4OMzoOj8ffAx24c0Xe4s6Bd_uWyouo-9mJ_UrqSLWIHi0ZGRmkSU-IIzJ6AsiXEfpLaXvoEG3CJLBOMax9eBEhzVtYOaLkIyZTdqAU3MyjFTD0ogSBEZDcm3O67WNvgkHgSDoJeCuvpaQLtZKqieslly7B932xiRdg36wvdQYjhvNU9l0PuN1Iz-aMSgc0FSfiNdBfeqcbrVbCS3FUSparLrvXFJm_326WkWm",
    },
    {
      year: 2024,
      title: "Lamborghini Revuelto",
      subTitle: "SYS.NODE // V12_PHEV_HYBRID",
      description: "The successor to the Aventador, launching Lamborghini into its hybrid era. Integrates a completely redesigned 6.5L V12 engine with three electric motors powered by a structural lithium-ion battery tunnel.",
      specs: [
        { label: "POWERPLANT", value: "6.5L V12 + 3 TRIPLE MOTORS" },
        { label: "COMBINED HP", value: "1001 HP" },
        { label: "PEAK RPM", value: "9500 RPM" },
      ],
      categories: ["v12", "hybrid"],
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB8O63smAzMdE5Hp3Sf0sFHfHcoX9Y0bukv_1RsMyH3SfuyDVBB3cOeATKegbEKxM_5__RGeBO9iGvyzZZMD44e-rSbxZG0Cteo8I3Ni5VnRp3zea12c_U4hI0Nno9QeqmAC6IHJVEy8Y4VtkXweMha7oDPuSlwlyJ8A2qFFBQxAoWwRGnhcR1Uyn0uYFLKNLXilXZzPLwqwvClxzVZX4aVn_HqWcuvWxBLgq6y8XI3XsKVXLCQUdRJ5aFS3sRjY5Zm-ZqCyFmgOdmJ",
    },
  ];

  const handleFilterChange = (key: "v12" | "hybrid" | "record") => {
    setFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredTimeline = timelineData.filter((node) => {
    return node.categories.some((cat) => filters[cat]);
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface text-secondary antialiased font-sans">
      <Header />

      <main className="flex-grow flex flex-col md:flex-row max-w-[1440px] mx-auto w-full relative">
        {/* Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-64 border-r-2 border-outline-variant bg-black pt-8 h-[calc(100vh-80px)] sticky top-20">
          <div className="px-6 mb-8">
            <h2 className="font-anybody text-xl text-primary leading-tight font-black italic">GARAGE_CORE</h2>
            <div className="font-jetbrains-mono text-[10px] text-primary-container mt-1 animate-pulse tracking-widest">
              SYSTEM_ACTIVE
            </div>
          </div>

          <nav className="flex flex-col gap-2 w-full font-jetbrains-mono text-xs uppercase tracking-widest">
            <Link 
              href="/"
              className="flex items-center gap-3 text-tertiary px-6 py-4 hover:bg-surface-variant hover:text-primary transition-colors border-l-4 border-transparent hover:border-outline-variant"
            >
              <span className="material-symbols-outlined text-sm">analytics</span>
              TELEMETRY
            </Link>
            <Link 
              href="/brands"
              className="flex items-center gap-3 text-tertiary px-6 py-4 hover:bg-surface-variant hover:text-primary transition-colors border-l-4 border-transparent hover:border-outline-variant"
            >
              <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
              SPECS
            </Link>
            
            <div className="mt-8 px-6">
              <div className="h-[1px] bg-outline-variant/30 w-full mb-6" />
              <span className="text-tertiary-container text-[10px] tracking-widest uppercase mb-4 block font-bold">
                Timeline Filters
              </span>
              
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={filters.v12}
                    onChange={() => handleFilterChange("v12")}
                    className="form-checkbox bg-black border-outline-variant text-primary-container focus:ring-primary-container rounded-sm h-4 w-4"
                  />
                  <span className="text-tertiary group-hover:text-primary transition-colors">V12 Engines</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={filters.hybrid}
                    onChange={() => handleFilterChange("hybrid")}
                    className="form-checkbox bg-black border-outline-variant text-primary-container focus:ring-primary-container rounded-sm h-4 w-4"
                  />
                  <span className="text-tertiary group-hover:text-primary transition-colors">Hybrids</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={filters.record}
                    onChange={() => handleFilterChange("record")}
                    className="form-checkbox bg-black border-outline-variant text-primary-container focus:ring-primary-container rounded-sm h-4 w-4"
                  />
                  <span className="text-tertiary group-hover:text-primary transition-colors">Speed Records</span>
                </label>
              </div>
            </div>
          </nav>
        </aside>

        {/* Timeline Canvas */}
        <div className="w-full md:pl-16 px-6 py-12 flex-grow">
          {/* Page Header */}
          <header className="mb-16 border-b border-outline-variant pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div>
              <h1 className="font-anybody text-4xl md:text-5xl font-black text-on-surface uppercase tracking-tighter mb-2">
                EVOLUTION<br />
                <span className="text-primary-container drop-shadow-[0_0_10px_rgba(255,85,64,0.3)]">TIMELINE</span>
              </h1>
              <p className="font-sans text-base text-secondary max-w-2xl mt-2 leading-relaxed">
                Tracing the relentless pursuit of velocity and engineering perfection from 1990 to the present day.
              </p>
            </div>
            
            <div className="flex gap-2 font-jetbrains-mono text-xs">
              <span className="border border-outline-variant px-3 py-1.5 text-tertiary">SORT: CHRONOLOGICAL</span>
              <span className="border border-primary-container px-3 py-1.5 text-primary-container bg-primary-container/10">VIEW: TECHNICAL</span>
            </div>
          </header>

          {/* Vertical Timeline Structure */}
          <div className="relative pl-8 md:pl-16 w-full max-w-4xl">
            {/* The vertical connector line */}
            <div className="absolute left-[8px] md:left-[11.5px] top-0 bottom-0 w-[2px] bg-outline-variant/40" />

            {filteredTimeline.length === 0 ? (
              <div className="text-center py-12 font-jetbrains-mono text-sm text-tertiary border border-dashed border-outline-variant/30">
                NO NODES MATCH THE SELECTED FILTER DIRECTIVES.
              </div>
            ) : (
              filteredTimeline.map((node) => (
                <div key={node.year} className="relative mb-20 timeline-node group animate-fade-in">
                  
                  {/* Circle Indicator on the line */}
                  <div className="absolute -left-[35px] md:-left-[60px] top-2.5 w-[16px] h-[16px] bg-black border-2 border-primary-container rounded-full z-10 transition-transform duration-300 group-hover:scale-125 group-hover:bg-primary-container" />

                  {/* Year Label */}
                  <div className="absolute -left-[35px] md:-left-[60px] -top-6 font-anybody text-lg font-black text-outline-variant group-hover:text-primary transition-colors duration-300 md:hidden">
                    {node.year}
                  </div>
                  
                  {/* Desktop Year Label */}
                  <div className="absolute -left-[140px] top-1 font-anybody text-2xl font-black text-outline-variant group-hover:text-primary-container transition-colors duration-300 hidden md:block">
                    {node.year}
                  </div>

                  {/* Node Content Card */}
                  <div 
                    className="bg-black border border-outline-variant p-6 clip-corner hover:border-primary-container transition-all duration-300 relative overflow-hidden carbon-pattern hover:shadow-[0_0_20px_rgba(255,85,64,0.15)]"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      
                      {/* Left: Text Specs */}
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <span className="font-jetbrains-mono text-xs text-primary mb-2 block tracking-wider">
                            {node.subTitle}
                          </span>
                          <h3 className="font-anybody text-xl md:text-2xl text-on-surface mb-4 uppercase font-bold">
                            {node.title}
                          </h3>
                          <p className="font-sans text-sm text-secondary leading-relaxed mb-6">
                            {node.description}
                          </p>
                        </div>

                        {/* Specs grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-outline-variant/30 pt-4 font-jetbrains-mono text-xs">
                          {node.specs.map((spec, index) => (
                            <div key={index}>
                              <span className="block text-outline text-[10px] tracking-widest mb-1">{spec.label}</span>
                              <span className="text-on-surface">{spec.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Picture */}
                      {node.image && (
                        <div className="w-full lg:w-48 h-48 border border-outline-variant/50 relative overflow-hidden flex-shrink-0">
                          <img 
                            src={node.image}
                            alt={node.title}
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 transform group-hover:scale-105"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
