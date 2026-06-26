"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCollection, Car } from "@/context/CollectionContext";

// Complete static copy of the hypercars database for search consistency
const CHATBOT_DATABASE: Car[] = [
  {
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
  },
  {
    id: "bugatti-chiron-ss-300",
    name: "Bugatti Chiron Super Sport 300+",
    subName: "BUGATTI SPECIFICATION",
    price: "$3.9M",
    accel: "2.2s",
    topSpeed: "304 mph",
    power: "1578 HP",
    specLabel: "POWERPLANT",
    specValue: "8.0L QUAD-TURBO W16",
    image: "/images/cars/bugatti-chiron-ss-300.jpg",
    tag: "AERODYNAMIC APEX",
  },
  {
    id: "ssc-tuatara",
    name: "SSC Tuatara",
    subName: "SSC SPECIFICATION",
    price: "$1.9M",
    accel: "2.5s",
    topSpeed: "295 mph",
    power: "1750 HP",
    specLabel: "POWERPLANT",
    specValue: "5.9L TWIN-TURBO V8",
    image: "/images/cars/ssc-tuatara.jpg",
    tag: "DRAG REDUCED",
  },
  {
    id: "hennessey-venom-f5",
    name: "Hennessey Venom F5",
    subName: "HENNESSEY SPECIFICATION",
    price: "$2.1M",
    accel: "2.6s",
    topSpeed: "311 mph",
    power: "1817 HP",
    specLabel: "POWERPLANT",
    specValue: "6.6L TWIN-TURBO V8",
    image: "/images/cars/hennessey-venom-f5.jpg",
    tag: "AMERICAN SPEED",
  },
  {
    id: "rimac-nevera",
    name: "Rimac Nevera",
    subName: "RIMAC SPECIFICATION",
    price: "$2.4M",
    accel: "1.81s",
    topSpeed: "258 mph",
    power: "1914 HP",
    specLabel: "POWERPLANT",
    specValue: "QUAD ELECTRIC MOTORS",
    image: "/images/cars/rimac-nevera.jpg",
    tag: "MOST POWERFUL",
  },
  {
    id: "mclaren-speedtail",
    name: "McLaren Speedtail",
    subName: "MCLAREN SPECIFICATION",
    price: "$2.25M",
    accel: "2.9s",
    topSpeed: "250 mph",
    power: "1035 HP",
    specLabel: "POWERPLANT",
    specValue: "4.0L V8 HYBRID TT",
    image: "/images/cars/mclaren-speedtail.jpg",
    tag: "AERO STREAMLINE",
  },
  {
    id: "aston-martin-valkyrie",
    name: "Aston Martin Valkyrie",
    subName: "ASTON MARTIN SPECIFICATION",
    price: "$3.2M",
    accel: "2.6s",
    topSpeed: "250 mph",
    power: "1160 HP",
    specLabel: "POWERPLANT",
    specValue: "6.5L COSWORTH V12 NA",
    image: "/images/cars/aston-martin-valkyrie.jpg",
    tag: "DOWNFORCE KING",
  },
  {
    id: "ferrari-sf90-xx-stradale",
    name: "Ferrari SF90 XX Stradale",
    subName: "FERRARI SPECIFICATION",
    price: "$890K",
    accel: "2.3s",
    topSpeed: "199 mph",
    power: "1030 HP",
    specLabel: "POWERPLANT",
    specValue: "V8 HYBRID TT",
    image: "/images/cars/ferrari-sf90-xx-stradale.jpg",
    tag: "BEST HYBRID",
  },
  {
    id: "lamborghini-revuelto",
    name: "Lamborghini Revuelto",
    subName: "LAMBORGHINI SPECIFICATION",
    price: "$608K",
    accel: "2.5s",
    topSpeed: "217 mph",
    power: "1001 HP",
    specLabel: "POWERPLANT",
    specValue: "V12 PHEV",
    image: "/images/cars/lamborghini-revuelto.jpg",
    tag: "BEST V12 SOUND",
  },
  {
    id: "pagani-utopia",
    name: "Pagani Utopia",
    subName: "PAGANI SPECIFICATION",
    price: "$2.5M",
    accel: "3.0s",
    topSpeed: "230 mph",
    power: "852 HP",
    specLabel: "POWERPLANT",
    specValue: "6.0L AMG V12 TT",
    image: "/images/cars/pagani-utopia.jpg",
    tag: "KINETIC ART",
  },
  {
    id: "ferrari-laferrari",
    name: "Ferrari LaFerrari",
    subName: "FERRARI SPECIFICATION",
    price: "$1.4M",
    accel: "2.4s",
    topSpeed: "217 mph",
    power: "950 HP",
    specLabel: "POWERPLANT",
    specValue: "6.3L V12 HYBRID",
    image: "/images/cars/ferrari-laferrari.jpg",
    tag: "HYBRID TRINITY",
  },
  {
    id: "mclaren-p1",
    name: "McLaren P1",
    subName: "MCLAREN SPECIFICATION",
    price: "$1.3M",
    accel: "2.8s",
    topSpeed: "217 mph",
    power: "903 HP",
    specLabel: "POWERPLANT",
    specValue: "3.8L V8 HYBRID TT",
    image: "/images/cars/mclaren-p1.jpg",
    tag: "HYBRID TRINITY",
  },
  {
    id: "porsche-918-spyder",
    name: "Porsche 918 Spyder",
    subName: "PORSCHE SPECIFICATION",
    price: "$1.1M",
    accel: "2.2s",
    topSpeed: "214 mph",
    power: "887 HP",
    specLabel: "POWERPLANT",
    specValue: "4.6L V8 HYBRID",
    image: "/images/cars/porsche-918-spyder.jpg",
    tag: "HYBRID TRINITY",
  },
  {
    id: "bugatti-veyron-ss",
    name: "Bugatti Veyron Super Sport",
    subName: "BUGATTI SPECIFICATION",
    price: "$2.7M",
    accel: "2.5s",
    topSpeed: "268 mph",
    power: "1200 HP",
    specLabel: "POWERPLANT",
    specValue: "8.0L W16 QUAD-TURBO",
    image: "/images/cars/bugatti-veyron-ss.jpg",
    tag: "RECORD BREAKER",
  },
  {
    id: "koenigsegg-regera",
    name: "Koenigsegg Regera",
    subName: "KOENIGSEGG SPECIFICATION",
    price: "$2.1M",
    accel: "2.6s",
    topSpeed: "255 mph",
    power: "1500 HP",
    specLabel: "TRANSMISSION",
    specValue: "DIRECT DRIVE HYBRID",
    image: "/images/cars/koenigsegg-regera.jpg",
    tag: "DIRECT DRIVE",
  },
  {
    id: "ferrari-daytona-sp3",
    name: "Ferrari Daytona SP3",
    subName: "FERRARI SPECIFICATION",
    price: "$2.2M",
    accel: "2.85s",
    topSpeed: "211 mph",
    power: "829 HP",
    specLabel: "POWERPLANT",
    specValue: "6.5L V12 NA",
    image: "/images/cars/ferrari-daytona-sp3.jpg",
    tag: "RETRO MODERN",
  },
  {
    id: "lamborghini-aventador-svj",
    name: "Lamborghini Aventador SVJ",
    subName: "LAMBORGHINI SPECIFICATION",
    price: "$517K",
    accel: "2.8s",
    topSpeed: "217 mph",
    power: "770 HP",
    specLabel: "POWERPLANT",
    specValue: "6.5L V12 NA",
    image: "/images/cars/lamborghini-aventador-svj.jpg",
    tag: "NURBURGRING APEX",
  },
  {
    id: "lamborghini-sian-fkp37",
    name: "Lamborghini Sian FKP 37",
    subName: "LAMBORGHINI SPECIFICATION",
    price: "$3.6M",
    accel: "2.8s",
    topSpeed: "217 mph",
    power: "819 HP",
    specLabel: "POWERPLANT",
    specValue: "V12 SUPERCONDENSER",
    image: "/images/cars/lamborghini-sian-fkp37.jpg",
    tag: "SUPER CAPACITOR",
  },
  {
    id: "mclaren-765lt",
    name: "McLaren 765LT",
    subName: "MCLAREN SPECIFICATION",
    price: "$382K",
    accel: "2.7s",
    topSpeed: "205 mph",
    power: "755 HP",
    specLabel: "POWERPLANT",
    specValue: "4.0L V8 TWIN-TURBO",
    image: "/images/cars/mclaren-765lt.jpg",
    tag: "LONGTAIL",
  },
  {
    id: "ferrari-812-competizione",
    name: "Ferrari 812 Competizione",
    subName: "FERRARI SPECIFICATION",
    price: "$600K",
    accel: "2.85s",
    topSpeed: "211 mph",
    power: "830 HP",
    specLabel: "POWERPLANT",
    specValue: "6.5L V12 NA",
    image: "/images/cars/ferrari-812-competizione.jpg",
    tag: "9500 RPM REDLINE",
  },
  {
    id: "porsche-911-gt2-rs",
    name: "Porsche 911 GT2 RS",
    subName: "PORSCHE SPECIFICATION",
    price: "$293K",
    accel: "2.7s",
    topSpeed: "211 mph",
    power: "700 HP",
    specLabel: "POWERPLANT",
    specValue: "3.8L FLAT-6 TWIN-TURBO",
    image: "/images/cars/porsche-911-gt2-rs.jpg",
    tag: "WIDOWMAKER",
  },
  {
    id: "mercedes-amg-one",
    name: "Mercedes-AMG One",
    subName: "MERCEDES SPECIFICATION",
    price: "$2.7M",
    accel: "2.9s",
    topSpeed: "219 mph",
    power: "1063 HP",
    specLabel: "POWERPLANT",
    specValue: "1.6L F1 HYBRID V6",
    image: "/images/cars/mercedes-amg-one.jpg",
    tag: "BEST TRACK MONSTER",
  },
  {
    id: "gordon-murray-t50",
    name: "Gordon Murray T.50",
    subName: "GMA SPECIFICATION",
    price: "$3.0M",
    accel: "2.8s",
    topSpeed: "226 mph",
    power: "654 HP",
    specLabel: "AERO FEATURE",
    specValue: "400mm FAN ASSISTED",
    image: "/images/cars/gordon-murray-t50.jpg",
    tag: "ANALOG PURIST",
  },
  {
    id: "maserati-mc20",
    name: "Maserati MC20",
    subName: "MASERATI SPECIFICATION",
    price: "$215K",
    accel: "2.9s",
    topSpeed: "202 mph",
    power: "621 HP",
    specLabel: "POWERPLANT",
    specValue: "3.0L NETTUNO V6 TT",
    image: "/images/cars/maserati-mc20.jpg",
    tag: "NETTUNO V6",
  },
  {
    id: "chevrolet-corvette-z06",
    name: "Chevrolet Corvette Z06",
    subName: "CORVETTE SPECIFICATION",
    price: "$106K",
    accel: "2.6s",
    topSpeed: "195 mph",
    power: "670 HP",
    specLabel: "POWERPLANT",
    specValue: "5.5L LT6 V8 NA",
    image: "/images/cars/chevrolet-corvette-z06.jpg",
    tag: "SUPERCAR KILLER",
  },
  {
    id: "ford-gt",
    name: "Ford GT",
    subName: "FORD SPECIFICATION",
    price: "$500K",
    accel: "3.0s",
    topSpeed: "216 mph",
    power: "660 HP",
    specLabel: "POWERPLANT",
    specValue: "3.5L ECOBOOST V6 TT",
    image: "/images/cars/ford-gt.jpg",
    tag: "LE MANS CHAMP",
  },
  {
    id: "nissan-gt-r-nismo",
    name: "Nissan GT-R Nismo",
    subName: "NISMO SPECIFICATION",
    price: "$220K",
    accel: "2.5s",
    topSpeed: "205 mph",
    power: "600 HP",
    specLabel: "POWERPLANT",
    specValue: "3.8L VR38DETT V6 TT",
    image: "/images/cars/nissan-gt-r-nismo.jpg",
    tag: "GODZILLA",
  },
  {
    id: "audi-r8-v10-performance",
    name: "Audi R8 V10 Performance",
    subName: "AUDI SPECIFICATION",
    price: "$196K",
    accel: "3.1s",
    topSpeed: "205 mph",
    power: "620 HP",
    specLabel: "POWERPLANT",
    specValue: "5.2L V10 NA",
    image: "/images/cars/audi-r8-v10-performance.jpg",
    tag: "V10 GATEWAY",
  },
  {
    id: "lexus-lfa",
    name: "Lexus LFA",
    subName: "LEXUS SPECIFICATION",
    price: "$375K",
    accel: "3.6s",
    topSpeed: "202 mph",
    power: "553 HP",
    specLabel: "POWERPLANT",
    specValue: "4.8L 1LR-GUE V10 NA",
    image: "/images/cars/lexus-lfa.jpg",
    tag: "YAMAHA SOUND ENGINE",
  },
  {
    id: "jaguar-xj220",
    name: "Jaguar XJ220",
    subName: "JAGUAR SPECIFICATION",
    price: "$580K",
    accel: "3.6s",
    topSpeed: "217 mph",
    power: "542 HP",
    specLabel: "POWERPLANT",
    specValue: "3.5L V6 TWIN-TURBO",
    image: "/images/cars/jaguar-xj220.jpg",
    tag: "90S RECORD",
  }
];

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: Date;
  cars?: Car[]; // Attached cars logic
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const { collection, addToCollection, removeFromCollection, isInCollection } = useCollection();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        id: "init",
        sender: "bot",
        text: "System activated. I am the HYPERDRIVE HUD Assistant. Ask me about our hypercar showroom, speed statistics, Atelier customization, or query your active garage collection. How can I assist your acceleration today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateBotResponse(textToSend);
      setMessages((prev) => [...prev, response]);
      setIsTyping(false);
    }, 1200);
  };

  // Chat Engine responding logic
  const generateBotResponse = (query: string): Message => {
    const cleanQuery = query.toLowerCase().trim();
    const responseId = Math.random().toString();
    const timestamp = new Date();

    // 1. FASTEST CARS QUERY
    if (cleanQuery.includes("fastest") || cleanQuery.includes("top speed") || cleanQuery.includes("speed record")) {
      // Find top 3 fastest
      const sorted = [...CHATBOT_DATABASE].sort((a, b) => {
        const speedA = parseInt(a.topSpeed.replace(/[^0-9]/g, "")) || 0;
        const speedB = parseInt(b.topSpeed.replace(/[^0-9]/g, "")) || 0;
        return speedB - speedA;
      });

      return {
        id: responseId,
        sender: "bot",
        text: `Here are the top speed leaders currently cataloged in the HYPERDRIVE Garage:
1. **${sorted[0].name}** — ${sorted[0].topSpeed} (Power: ${sorted[0].power})
2. **${sorted[1].name}** — ${sorted[1].topSpeed} (Power: ${sorted[1].power})
3. **${sorted[2].name}** — ${sorted[2].topSpeed} (Power: ${sorted[2].power})`,
        timestamp,
        cars: sorted.slice(0, 3),
      };
    }

    // 2. MOST EXPENSIVE QUERY
    if (cleanQuery.includes("expensive") || cleanQuery.includes("price") || cleanQuery.includes("cost") || cleanQuery.includes("value") || cleanQuery.includes("million")) {
      const sorted = [...CHATBOT_DATABASE].sort((a, b) => {
        const priceA = parseFloat(a.price.replace(/[^0-9.]/g, "")) * (a.price.includes("M") ? 1000 : 1);
        const priceB = parseFloat(b.price.replace(/[^0-9.]/g, "")) * (b.price.includes("M") ? 1000 : 1);
        return speedSortCompare(priceB, priceA);
      });

      function speedSortCompare(valB: number, valA: number) {
        return valB - valA;
      }

      return {
        id: responseId,
        sender: "bot",
        text: `Here are the most premium hypercars by price point in the showroom:
1. **${sorted[0].name}** — ${sorted[0].price}
2. **${sorted[1].name}** — ${sorted[1].price}
3. **${sorted[2].name}** — ${sorted[2].price}`,
        timestamp,
        cars: sorted.slice(0, 3),
      };
    }

    // 3. ELECTRIC HYPERCARS
    if (cleanQuery.includes("electric") || cleanQuery.includes("battery") || cleanQuery.includes("ev ") || cleanQuery.includes("evs") || cleanQuery.includes("nevera")) {
      const electric = CHATBOT_DATABASE.filter(c => c.id === "rimac-nevera");
      return {
        id: responseId,
        sender: "bot",
        text: "The **Rimac Nevera** is our premier all-electric hypercar, propelled by quad electric motors that generate a staggering 1914 HP. It holds the record for the quickest acceleration, hitting 0-60 mph in a mere 1.81 seconds.",
        timestamp,
        cars: electric,
      };
    }

    // 4. HYBRID HYPERCARS
    if (cleanQuery.includes("hybrid") || cleanQuery.includes("phev") || cleanQuery.includes("supercapacitor")) {
      const hybrids = CHATBOT_DATABASE.filter(c => 
        c.specValue?.toLowerCase().includes("hybrid") || 
        c.specValue?.toLowerCase().includes("phev") ||
        c.specValue?.toLowerCase().includes("supercondenser") ||
        c.tag?.toLowerCase().includes("hybrid") ||
        c.id === "mclaren-speedtail" || 
        c.id === "aston-martin-valkyrie" || 
        c.id === "ferrari-sf90-xx-stradale" ||
        c.id === "lamborghini-revuelto" ||
        c.id === "ferrari-laferrari" ||
        c.id === "mclaren-p1" ||
        c.id === "porsche-918-spyder" ||
        c.id === "mercedes-amg-one"
      );

      return {
        id: responseId,
        sender: "bot",
        text: `We feature a range of elite hybrid powertrains, combining screaming internal combustion engines with electrical assist. This includes the famous 'Hybrid Holy Trinity' (Ferrari LaFerrari, McLaren P1, and Porsche 918 Spyder), plus active F1-inspired powerplants like the Mercedes-AMG One. Here are some options:`,
        timestamp,
        cars: hybrids.slice(0, 4),
      };
    }

    // 5. ATELIER / CUSTOMIZATION
    if (cleanQuery.includes("atelier") || cleanQuery.includes("custom") || cleanQuery.includes("paint") || cleanQuery.includes("wheel") || cleanQuery.includes("caliper") || cleanQuery.includes("aero") || cleanQuery.includes("color") || cleanQuery.includes("carbon")) {
      return {
        id: responseId,
        sender: "bot",
        text: "You can design and configure your dream hypercar inside our custom **Atelier**. Choose active carbon aerodynamics, carbon monoblock wheels, premium paints (like *Liquid Carbon*, *Satin Gold*, or *Viola Parsifae*), and colored brakes. Click below to start customizing!",
        timestamp,
        // Optional link buttons in chatbot are handled in layout
      };
    }

    // 6. RECORD TIMELINE / HISTORY
    if (cleanQuery.includes("timeline") || cleanQuery.includes("history") || cleanQuery.includes("record") || cleanQuery.includes("old") || cleanQuery.includes("classic") || cleanQuery.includes("year")) {
      return {
        id: responseId,
        sender: "bot",
        text: "Our Speed Timeline outlines the historic battle of speed, starting from the legendary Jaguar XJ220 (217 mph in 1992) and the analog masterpiece McLaren F1 (240.1 mph in 1998), to the groundbreaking Bugatti Chiron breaking 300 mph, up to the modern Koenigsegg Jesko Absolut. Check out the interactive speed chart on our timeline page!",
        timestamp,
      };
    }

    // 7. CURRENT COLLECTION / MY CARS
    if (cleanQuery.includes("collection") || cleanQuery.includes("my cars") || cleanQuery.includes("my garage") || cleanQuery.includes("saved") || cleanQuery.includes("bookmarks")) {
      const savedIds = collection.map(c => c.id);
      const savedCars = CHATBOT_DATABASE.filter(c => savedIds.includes(c.id));

      if (savedCars.length === 0) {
        return {
          id: responseId,
          sender: "bot",
          text: "Your saved collection is currently empty. Explore our showroom, query cars here, and add them to your garage collection to keep track of them!",
          timestamp,
        };
      }

      return {
        id: responseId,
        sender: "bot",
        text: `You have **${savedCars.length}** hypercar${savedCars.length > 1 ? "s" : ""} saved in your active garage collection:`,
        timestamp,
        cars: savedCars,
      };
    }

    // 8. BRANDS LIST
    if (cleanQuery.includes("brand") || cleanQuery.includes("manufacturer") || cleanQuery.includes("make") || cleanQuery.includes("makes")) {
      const brands = Array.from(new Set(CHATBOT_DATABASE.map(c => c.name.split(" ")[0])));
      return {
        id: responseId,
        sender: "bot",
        text: `We catalog speed records and specifications from the world's most elite manufacturers: **${brands.join(", ")}**. Search any brand name to see their vehicles.`,
        timestamp,
      };
    }

    // 9. SEARCH CARS SPECIFIC MATCH
    const matchedCars = CHATBOT_DATABASE.filter((car) => {
      const nameParts = car.name.toLowerCase().split(" ");
      return nameParts.some(part => part.length > 2 && cleanQuery.includes(part)) || cleanQuery.includes(car.id.replace(/-/g, " "));
    });

    if (matchedCars.length > 0) {
      return {
        id: responseId,
        sender: "bot",
        text: `Retrieved calibration details for **${matchedCars.length}** hypercar${matchedCars.length > 1 ? "s" : ""} matching your search:`,
        timestamp,
        cars: matchedCars.slice(0, 4),
      };
    }

    // 10. DEFAULT RESPOND
    return {
      id: responseId,
      sender: "bot",
      text: "Unable to parse inquiry details. I can assist with:\n\n• **Specific Cars:** 'Specs on Jesko', 'Tell me about Rimac Nevera', 'Bugatti Chiron price'\n• **Performance Leaderboards:** 'Fastest car', 'Electric hypercars', 'Hybrids'\n• **Features:** 'How do I customize?', 'Speed timeline history'\n• **Garage:** 'Show my collection'",
      timestamp,
    };
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-surface/90 border border-outline-variant/60 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hud-glow-red hover:scale-105 shadow-[0_0_20px_rgba(255,85,64,0.25)] hover:border-primary-container group"
        aria-label="Toggle Hyperdrive Assistant"
      >
        <span className={`material-symbols-outlined text-primary-container text-2xl transition-transform duration-300 ${isOpen ? "rotate-90 text-primary" : "group-hover:rotate-12"}`}>
          {isOpen ? "close" : "smart_toy"}
        </span>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-container"></span>
          </span>
        )}
      </button>

      {/* Glassmorphic Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[400px] h-[550px] max-h-[80vh] flex flex-col bg-[#131313]/95 border border-[#ff5540]/30 rounded-xl overflow-hidden backdrop-blur-md transition-all duration-300 shadow-[0_0_30px_rgba(255,85,64,0.25)] clip-corner">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface-container border-b border-outline-variant/20">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-primary-container animate-pulse">
                terminal
              </span>
              <div>
                <h3 className="text-sm font-bold font-anybody text-on-surface tracking-wider">HYPERDRIVE HUD</h3>
                <span className="text-[10px] text-green-500 font-jetbrains-mono flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-ping"></span>
                  DIAGNOSTICS ONLINE
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Messages Logs */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 ghost-grid scrollbar-thin">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
              >
                {/* Text Bubble */}
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-lg text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-primary-container text-white rounded-br-none shadow-[0_0_10px_rgba(255,85,64,0.15)] font-medium"
                      : "bg-surface-container text-secondary border border-outline-variant/20 rounded-bl-none"
                  }`}
                  style={{ whiteSpace: "pre-line" }}
                >
                  {msg.text}
                </div>

                {/* Specs Cards Grid (if hypercars are attached) */}
                {msg.cars && msg.cars.length > 0 && (
                  <div className="mt-3 w-full space-y-2.5">
                    {msg.cars.map((car) => {
                      const saved = isInCollection(car.id);
                      return (
                        <div
                          key={car.id}
                          className="w-full bg-[#1b1b1b]/90 border border-outline-variant/40 rounded-lg p-3 hover:border-[#ff5540]/40 transition-all duration-200"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] text-primary-container font-bold tracking-wider font-jetbrains-mono">
                                {car.tag || car.subName}
                              </span>
                              <h4 className="text-xs font-bold text-on-surface font-anybody mt-0.5">{car.name}</h4>
                            </div>
                            <span className="text-xs font-bold text-primary font-jetbrains-mono bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30">
                              {car.price}
                            </span>
                          </div>

                          {/* Spec metrics grid */}
                          <div className="grid grid-cols-3 gap-2 my-2.5 text-[10px] bg-surface-container-low p-2 rounded border border-outline-variant/10">
                            <div>
                              <span className="block text-[9px] text-secondary-container font-medium uppercase">0-60 MPH</span>
                              <span className="font-bold font-jetbrains-mono text-on-surface">{car.accel}</span>
                            </div>
                            <div>
                              <span className="block text-[9px] text-secondary-container font-medium uppercase">TOP SPEED</span>
                              <span className="font-bold font-jetbrains-mono text-on-surface">{car.topSpeed}</span>
                            </div>
                            <div>
                              <span className="block text-[9px] text-secondary-container font-medium uppercase">POWER</span>
                              <span className="font-bold font-jetbrains-mono text-on-surface">{car.power}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 text-[10px] font-bold">
                            <button
                              onClick={() => {
                                if (saved) {
                                  removeFromCollection(car.id);
                                } else {
                                  addToCollection(car);
                                }
                              }}
                              className={`flex-1 py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer ${
                                saved
                                  ? "bg-surface border border-red-500/40 text-red-400 hover:bg-red-500/10"
                                  : "bg-primary-container text-white hover:bg-primary-container/80 shadow-[0_0_8px_rgba(255,85,64,0.2)]"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[12px] font-bold">
                                {saved ? "delete" : "bookmark"}
                              </span>
                              {saved ? "Remove Garage" : "Add to Garage"}
                            </button>

                            {car.id === "koenigsegg-jesko-absolut" && (
                              <Link
                                href={`/showroom/${car.id}`}
                                className="px-2 bg-surface-container border border-outline-variant/50 text-secondary hover:text-white rounded flex items-center justify-center"
                              >
                                <span className="material-symbols-outlined text-xs">open_in_new</span>
                              </Link>
                            )}

                            <Link
                              href="/atelier"
                              className="px-2 py-1.5 bg-surface-container border border-outline-variant/50 hover:border-primary-container/60 text-secondary hover:text-white rounded flex items-center justify-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[12px]">palette</span>
                              Design
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                
                <span className="text-[9px] text-secondary-container mt-1 px-1 font-jetbrains-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {/* Simulated typing indicator */}
            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="bg-surface-container border border-outline-variant/20 px-4 py-3 rounded-lg rounded-bl-none flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-primary-container rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Quick Reply Pills */}
          <div className="px-4 py-2 bg-surface-container-lowest border-t border-outline-variant/10 overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1.5">
            <button
              onClick={() => handleSend("🏎️ What is the fastest car?")}
              className="text-[10px] font-bold bg-surface border border-outline-variant/40 text-secondary hover:text-white hover:border-primary-container/60 px-2.5 py-1 rounded-full cursor-pointer transition-all duration-150 inline-block"
            >
              🏎️ Fastest
            </button>
            <button
              onClick={() => handleSend("💰 Show me the most expensive hypercar")}
              className="text-[10px] font-bold bg-surface border border-outline-variant/40 text-secondary hover:text-white hover:border-primary-container/60 px-2.5 py-1 rounded-full cursor-pointer transition-all duration-150 inline-block"
            >
              💰 Pricey
            </button>
            <button
              onClick={() => handleSend("⚡ Tell me about electric hypercars")}
              className="text-[10px] font-bold bg-surface border border-outline-variant/40 text-secondary hover:text-white hover:border-primary-container/60 px-2.5 py-1 rounded-full cursor-pointer transition-all duration-150 inline-block"
            >
              ⚡ Electric
            </button>
            <button
              onClick={() => handleSend("🎨 How do I customize a car?")}
              className="text-[10px] font-bold bg-surface border border-outline-variant/40 text-secondary hover:text-white hover:border-primary-container/60 px-2.5 py-1 rounded-full cursor-pointer transition-all duration-150 inline-block"
            >
              🎨 Atelier
            </button>
            <button
              onClick={() => handleSend("Show my collection")}
              className="text-[10px] font-bold bg-surface border border-outline-variant/40 text-secondary hover:text-white hover:border-primary-container/60 px-2.5 py-1 rounded-full cursor-pointer transition-all duration-150 inline-block"
            >
              📁 My Collection
            </button>
            <button
              onClick={() => handleSend("Tell me about the Speed Timeline")}
              className="text-[10px] font-bold bg-surface border border-outline-variant/40 text-secondary hover:text-white hover:border-primary-container/60 px-2.5 py-1 rounded-full cursor-pointer transition-all duration-150 inline-block"
            >
              📅 Timeline
            </button>
          </div>

          {/* Chat Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(inputVal);
            }}
            className="p-3 bg-surface-container border-t border-outline-variant/20 flex gap-2"
          >
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Ask about specs, speeds, customizer..."
              className="flex-1 bg-surface border border-outline-variant/40 rounded px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary-container placeholder-secondary-container"
            />
            <button
              type="submit"
              disabled={!inputVal.trim() || isTyping}
              className="bg-primary-container text-white px-3 py-2 rounded flex items-center justify-center hover:bg-primary-container/85 disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-[0_0_8px_rgba(255,85,64,0.15)]"
            >
              <span className="material-symbols-outlined text-sm font-bold">send</span>
            </button>
          </form>

        </div>
      )}
    </>
  );
}
