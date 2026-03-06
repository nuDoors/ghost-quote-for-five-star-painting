// Serviceable zip codes
export const serviceableZips = [
  "90210", "90211", "90212", "90024", "90025", "90049", "90077",
  "10001", "10002", "10003", "10004", "10005", "10006", "10007",
  "60601", "60602", "60603", "60604", "60605", "60606", "60607",
  "75201", "75202", "75203", "75204", "75205", "75206", "75207",
  "33101", "33102", "33109", "33125", "33126", "33127", "33128",
  "98101", "98102", "98103", "98104", "98105", "98106", "98107",
  "30301", "30302", "30303", "30304", "30305", "30306", "30307",
  "85001", "85002", "85003", "85004", "85005", "85006", "85007"
];

// Territory owners with zip coverage
export const territoryOwners = [
  { name: "Michael Rodriguez", location: "Los Angeles West", zips: ["90210", "90211", "90212", "90024", "90025", "90049", "90077"] },
  { name: "Sarah Chen", location: "Manhattan", zips: ["10001", "10002", "10003", "10004", "10005", "10006", "10007"] },
  { name: "David Thompson", location: "Chicago Downtown", zips: ["60601", "60602", "60603", "60604", "60605", "60606", "60607"] },
  { name: "Jennifer Martinez", location: "Dallas Central", zips: ["75201", "75202", "75203", "75204", "75205", "75206", "75207"] },
  { name: "Robert Williams", location: "Miami Metro", zips: ["33101", "33102", "33109", "33125", "33126", "33127", "33128"] },
  { name: "Emily Davis", location: "Seattle Metro", zips: ["98101", "98102", "98103", "98104", "98105", "98106", "98107"] },
  { name: "James Wilson", location: "Atlanta Metro", zips: ["30301", "30302", "30303", "30304", "30305", "30306", "30307"] },
  { name: "Lisa Anderson", location: "Phoenix Valley", zips: ["85001", "85002", "85003", "85004", "85005", "85006", "85007"] }
];

// Paint color libraries
export const paintColors = {
  "Sherwin-Williams": [
    { code: "SW 7006", name: "Extra White", hex: "#F1F0EB" },
    { code: "SW 7015", name: "Repose Gray", hex: "#B8AFA7" },
    { code: "SW 7016", name: "Mindful Gray", hex: "#A49E96" },
    { code: "SW 7029", name: "Agreeable Gray", hex: "#CBC5BA" },
    { code: "SW 6119", name: "Antique White", hex: "#F2E4D3" },
    { code: "SW 7043", name: "Worldly Gray", hex: "#ACA89F" },
    { code: "SW 6106", name: "Kilim Beige", hex: "#C5AC8E" },
    { code: "SW 7036", name: "Accessible Beige", hex: "#CFBFA8" },
    { code: "SW 6990", name: "Caviar", hex: "#2E2E2C" },
    { code: "SW 6244", name: "Naval", hex: "#283B4E" },
    { code: "SW 6258", name: "Tricorn Black", hex: "#2F2E2D" },
    { code: "SW 7048", name: "Urbane Bronze", hex: "#544E46" },
    { code: "SW 9171", name: "Felted Wool", hex: "#B4ADA2" },
    { code: "SW 7012", name: "Creamy", hex: "#F4EBD9" },
    { code: "SW 6385", name: "Dover White", hex: "#F0E8D8" },
    { code: "SW 7063", name: "Nebulous White", hex: "#E3DCD3" }
  ],
  "Benjamin Moore": [
    { code: "OC-17", name: "White Dove", hex: "#F0EBE1" },
    { code: "HC-172", name: "Revere Pewter", hex: "#C4B8A6" },
    { code: "2163-40", name: "Sea Salt", hex: "#C5D4CF" },
    { code: "HC-158", name: "Newburyport Blue", hex: "#4A5B6A" },
    { code: "2111-60", name: "Barren Plain", hex: "#D6CFC4" },
    { code: "OC-65", name: "Chantilly Lace", hex: "#F5F2EC" },
    { code: "HC-85", name: "Fairmont Green", hex: "#7B9C8D" },
    { code: "2062-10", name: "Hale Navy", hex: "#3C4C5A" },
    { code: "OC-45", name: "Swiss Coffee", hex: "#EEEAE0" },
    { code: "AF-685", name: "Thunder", hex: "#6E6E6C" },
    { code: "2167-10", name: "Wrought Iron", hex: "#484848" },
    { code: "HC-173", name: "Edgecomb Gray", hex: "#D5CBBE" },
    { code: "AF-20", name: "Mascarpone", hex: "#F4EEE2" },
    { code: "HC-81", name: "Manchester Tan", hex: "#C9BC9C" },
    { code: "2152-50", name: "Gray Owl", hex: "#C5C5BD" },
    { code: "OC-52", name: "Gray Mist", hex: "#D8DDD8" }
  ],
  "Farrow & Ball": [
    { code: "No.2001", name: "Strong White", hex: "#F4F0E6" },
    { code: "No.201", name: "Shaded White", hex: "#E8E1D4" },
    { code: "No.88", name: "Lamp Room Gray", hex: "#A5A097" },
    { code: "No.274", name: "Ammonite", hex: "#D6D0C5" },
    { code: "No.31", name: "Railings", hex: "#3A3B3D" },
    { code: "No.265", name: "Manor House Gray", hex: "#5A5751" },
    { code: "No.47", name: "Green Smoke", hex: "#8B9A8A" },
    { code: "No.26", name: "Down Pipe", hex: "#6A6865" },
    { code: "No.281", name: "Stiffkey Blue", hex: "#4D5B6A" },
    { code: "No.2005", name: "All White", hex: "#FEFEFE" },
    { code: "No.229", name: "Elephant's Breath", hex: "#C6C0B5" },
    { code: "No.18", name: "French Gray", hex: "#B5B1AA" },
    { code: "No.245", name: "Middleton Pink", hex: "#E8D5CA" },
    { code: "No.2003", name: "Pointing", hex: "#F6F0E4" },
    { code: "No.275", name: "Purbeck Stone", hex: "#C1BBB0" },
    { code: "No.30", name: "Hague Blue", hex: "#3B4B58" }
  ]
};

// Garage floor coating flake colors
export const garageFlakeColors = [
  { code: "GF-01", name: "Orbit Flake", hex: "#5a6a8a", description: "Blue, white & black blend" },
  { code: "GF-02", name: "Creekbed Flake", hex: "#b0a898", description: "Neutral tan & gray blend" },
  { code: "GF-03", name: "Domino Flake", hex: "#4a4a4a", description: "Black & white high-contrast" },
  { code: "GF-04", name: "Gravel Flake", hex: "#8a8a8a", description: "Classic gray granite look" },
  { code: "GF-05", name: "Nightfall Flake", hex: "#3a3a4a", description: "Dark charcoal & black" },
  { code: "GF-06", name: "Cabin Fever Flake", hex: "#c8c0b8", description: "Light gray & white mix" },
  { code: "GF-07", name: "Outback Flake", hex: "#a07850", description: "Warm tan & brown earth tones" },
  { code: "GF-08", name: "Shoreline Flake", hex: "#c8bca8", description: "Sandy beige & cream blend" },
  { code: "GF-09", name: "Tidal Wave Flake", hex: "#7898b8", description: "Cool blue-gray coastal blend" },
  { code: "GF-10", name: "Wombat Flake", hex: "#909090", description: "Mid-tone gray blend" },
];

// Stain colors for deck/fence
export const stainColors = [
  { code: "STN-01", name: "Natural", hex: "#C8922A", description: "Enhances natural wood grain" },
  { code: "STN-02", name: "Cedar", hex: "#A0522D", description: "Warm reddish-brown tone" },
  { code: "STN-03", name: "Light Walnut", hex: "#8B6343", description: "Medium warm brown" },
  { code: "STN-04", name: "Dark Walnut", hex: "#4A2E1A", description: "Deep rich brown" },
  { code: "STN-05", name: "Driftwood Gray", hex: "#A8A89A", description: "Weathered gray-silver tone" },
];

// Stain finish options
export const stainFinishOptions = [
  { id: "transparent", name: "Transparent", description: "Full grain visibility" },
  { id: "semi-transparent", name: "Semi-Trans", description: "Slight color, grain shows" },
  { id: "solid", name: "Solid", description: "Full color coverage" },
];

// Sheen options
export const sheenOptions = [
  { id: "flat", name: "Flat", description: "No shine, hides imperfections" },
  { id: "eggshell", name: "Eggshell", description: "Low luster, easy to clean" },
  { id: "satin", name: "Satin", description: "Subtle shine, durable" },
  { id: "semi-gloss", name: "Semi-Gloss", description: "Noticeable shine, very durable" }
];

// Pricing constants
export const pricingConstants = {
  interior: {
    basePerRoom: 450,
    ceiling: 150,
    trim: 120,
    stairs: 350,
    paintTier: { good: 1, better: 1.25, best: 1.5 }
  },
  exterior: {
    basePerStory: { 1: 2500, 2: 4000, 3: 6000 },
    sidingMultiplier: { wood: 1.2, vinyl: 1, stucco: 1.1, "fiber-cement": 1.15 },
    condition: { excellent: 0.9, good: 1, fair: 1.2 },
    trim: 400,
    doors: 150
  },
  cabinet: {
    kitchenSize: { small: 2500, medium: 4000, large: 6000 },
    perDoor: 75,
    frames: 800,
    boxes: 1200,
    finishTier: { standard: 1, premium: 1.4 }
  },
  trim: {
    basePrice: 800,
    perLinearFoot: 4
  },
  deck: {
    basePrice: 600,
    perSquareFoot: 3.5
  },
  garage: {
    basePrice: 400,
    perSquareFoot: 4.5
  }
};

// Mock availability for calendar
export const mockAvailability = {
  // Returns available time slots for a given date
  getSlots: (date) => {
    const day = new Date(date).getDay();
    if (day === 0) return []; // No Sunday slots
    if (day === 6) return ["9:00 AM", "10:00 AM", "11:00 AM"]; // Limited Saturday
    return ["9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];
  }
};

// Helper functions
export const isZipServiceable = (zip) => serviceableZips.includes(zip);

export const getTerritoryOwner = (zip) => {
  return territoryOwners.find(owner => owner.zips.includes(zip)) || null;
};

export const calculateEstimate = (service, details) => {
  const pricing = pricingConstants[service];
  let low = 0;
  let high = 0;

  switch (service) {
    case "interior": {
      const rooms = details.rooms || 1;
      const tierMultiplier = pricing.paintTier[details.paintTier] || 1;
      let base = rooms * pricing.basePerRoom;
      if (details.ceilings) base += rooms * pricing.ceiling;
      if (details.trim) base += rooms * pricing.trim;
      if (details.stairs) base += pricing.stairs;
      base *= tierMultiplier;
      low = Math.round(base * 0.85);
      high = Math.round(base * 1.15);
      break;
    }
    case "exterior": {
      const stories = details.stories || 1;
      const sidingMult = pricing.sidingMultiplier[details.sidingType] || 1;
      const condMult = pricing.condition[details.condition] || 1;
      let base = pricing.basePerStory[stories] || pricing.basePerStory[1];
      base *= sidingMult * condMult;
      if (details.trim) base += pricing.trim;
      if (details.doors) base += pricing.doors * (details.doorCount || 2);
      low = Math.round(base * 0.85);
      high = Math.round(base * 1.15);
      break;
    }
    case "cabinet": {
      const sizeBase = pricing.kitchenSize[details.kitchenSize] || pricing.kitchenSize.medium;
      const doorCount = details.doorCount || 20;
      const finishMult = pricing.finishTier[details.finishTier] || 1;
      let base = sizeBase + (doorCount * pricing.perDoor);
      if (details.paintFrames) base += pricing.frames;
      if (details.paintBoxes) base += pricing.boxes;
      base *= finishMult;
      low = Math.round(base * 0.85);
      high = Math.round(base * 1.15);
      break;
    }
    case "trim": {
      const linearFeet = details.linearFeet || 200;
      const base = pricing.basePrice + (linearFeet * pricing.perLinearFoot);
      low = Math.round(base * 0.85);
      high = Math.round(base * 1.15);
      break;
    }
    case "deck": {
      const sqft = details.squareFeet || 300;
      const base = pricing.basePrice + (sqft * pricing.perSquareFoot);
      low = Math.round(base * 0.85);
      high = Math.round(base * 1.15);
      break;
    }
    case "garage": {
      const sqft = details.squareFeet || 400;
      const base = pricing.basePrice + (sqft * pricing.perSquareFoot);
      low = Math.round(base * 0.85);
      high = Math.round(base * 1.15);
      break;
    }
  }

  return { low, high };
};

export const calculateConfidence = (photoCount, detailsComplete) => {
  let score = 50;
  score += Math.min(photoCount * 8, 30);
  if (detailsComplete) score += 20;
  return Math.min(score, 100);
};