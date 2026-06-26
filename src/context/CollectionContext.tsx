"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Car {
  id: string;
  name: string;
  subName: string;
  price: string;
  accel: string;
  topSpeed: string;
  power: string;
  specLabel?: string;
  specValue?: string;
  image: string;
  tag?: string;
}

interface CollectionContextType {
  collection: Car[];
  addToCollection: (car: Car) => void;
  removeFromCollection: (id: string) => void;
  isInCollection: (id: string) => boolean;
}

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

const defaultCars: Car[] = [
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

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [collection, setCollection] = useState<Car[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("hyperdrive_collection_v5");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Car[];
        const merged = [...parsed];
        defaultCars.forEach((defCar) => {
          if (!merged.some((c) => c.id === defCar.id)) {
            merged.push(defCar);
          }
        });
        setCollection(merged);
        localStorage.setItem("hyperdrive_collection_v5", JSON.stringify(merged));
      } catch (e) {
        setCollection(defaultCars);
      }
    } else {
      setCollection(defaultCars);
      localStorage.setItem("hyperdrive_collection_v5", JSON.stringify(defaultCars));
    }
  }, []);

  const addToCollection = (car: Car) => {
    if (!collection.some((c) => c.id === car.id)) {
      const updated = [...collection, car];
      setCollection(updated);
      localStorage.setItem("hyperdrive_collection_v5", JSON.stringify(updated));
    }
  };

  const removeFromCollection = (id: string) => {
    const updated = collection.filter((c) => c.id !== id);
    setCollection(updated);
    localStorage.setItem("hyperdrive_collection_v5", JSON.stringify(updated));
  };

  const isInCollection = (id: string) => {
    return collection.some((c) => c.id === id);
  };

  return (
    <CollectionContext.Provider
      value={{ collection, addToCollection, removeFromCollection, isInCollection }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const context = useContext(CollectionContext);
  if (context === undefined) {
    throw new Error("useCollection must be used within a CollectionProvider");
  }
  return context;
}
