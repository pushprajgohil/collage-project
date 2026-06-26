"use client";

import React from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCollection, Car } from "@/context/CollectionContext";

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
                      <Link
                        href={brand.link || "#"}
                        className="flex-grow py-3 bg-transparent border-2 border-primary-container text-on-surface font-jetbrains-mono text-xs uppercase tracking-widest flex justify-between items-center px-4 hover:shadow-[0_0_15px_rgba(255,85,64,0.45)] hover:text-primary-container transition-all"
                      >
                        <span>{brand.link ? "ACCESS DATABANK" : "SCHEMATICS LOADED"}</span>
                        <span className="material-symbols-outlined text-xs font-bold text-[#e2e2e2] group-hover:text-primary-container transition-colors">arrow_forward_ios</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
