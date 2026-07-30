// ==========================================================
// HONG KONG INTERACTIVE METRO PLANNING SIMULATOR
// ==========================================================
//
// This map uses geographic coastline data and real-world
// longitude/latitude positions for its planning regions.
//
// Click on the map to place metro stations.
// Stations connect in the order that they are placed.
//
// Main planning goals:
// 1. Serve residents
// 2. Connect employment
// 3. Reach schools and universities
// 4. Reach hospitals
// 5. Connect important transport hubs
// 6. Avoid excessive cost
// 7. Avoid environmentally sensitive areas
// ==========================================================


// ----------------------------------------------------------
// CANVAS SETTINGS
// ----------------------------------------------------------

const canvasWidth = 1320;
const canvasHeight = 700;

const mapWidth = 1010;
const panelX = 1030;

// Geographic frame based on the Lands Department's published extent of Hong Kong.
const geoLonMin = 113.84;
const geoLonMax = 114.46;
const geoLatMin = 22.17;
const geoLatMax = 22.57;
const geoLeft = 20;
const geoTop = 30;
const pixelsPerLongitudeDegree = 1540;
const pixelsPerLatitudeDegree = 1600;
const hongKongLandPolygons = hkLandPolygons.concat([
  [
    [113.8950, 22.2950],
    [113.9050, 22.2890],
    [113.9500, 22.3190],
    [113.9400, 22.3270],
    [113.8950, 22.2950]
  ]
]);


// ----------------------------------------------------------
// ARRAYS
// ----------------------------------------------------------

let regions = [];
let stations = [];
let metroLines = [[], [], [], []];


// ----------------------------------------------------------
// METRO SETTINGS
// ----------------------------------------------------------

const stationCoverageRadius = 53;
const stationCost = 120;
const trackCostPerKilometer = 2.25;
const minimumStationDistance = 52;
const lineColors = [
  [210, 50, 55],
  [28, 82, 160],
  [30, 145, 88],
  [218, 155, 32]
];


// ----------------------------------------------------------
// INTERFACE
// ----------------------------------------------------------

let undoButton;
let resetButton;
let lineSelector;
let activeLineIndex = 0;

let showCoverage = true;
let showRegionNames = true;

let coverageCheckbox;
let namesCheckbox;

let message =
  "Click inside the Hong Kong map to place your first metro station.";


// ==========================================================
// SETUP
// ==========================================================

function setup() {
  createCanvas(canvasWidth, canvasHeight);
  textFont("Times New Roman");

  createHongKongRegions();

  lineSelector = createSelect();
  lineSelector.position(panelX + 115, 99);
  lineSelector.option("Line 1 — Red", 0);
  lineSelector.option("Line 2 — Blue", 1);
  lineSelector.option("Line 3 — Green", 2);
  lineSelector.option("Line 4 — Gold", 3);
  lineSelector.selected("0");
  lineSelector.changed(function () {
    activeLineIndex = Number(lineSelector.value());
    message =
      "Line " +
      (activeLineIndex + 1) +
      " selected. Click the map to add its next station.";
  });

  undoButton = createButton("Undo Last Station");
  undoButton.position(panelX, 535);
  undoButton.mousePressed(undoStation);

  resetButton = createButton("Reset Network");
  resetButton.position(panelX, 571);
  resetButton.mousePressed(resetNetwork);

  coverageCheckbox = createCheckbox(" Show station coverage", true);
  coverageCheckbox.position(panelX, 607);
  coverageCheckbox.changed(function () {
    showCoverage = coverageCheckbox.checked();
  });

  namesCheckbox = createCheckbox(" Show region names", true);
  namesCheckbox.position(panelX, 632);
  namesCheckbox.changed(function () {
    showRegionNames = namesCheckbox.checked();
  });
}


// ==========================================================
// DRAW
// ==========================================================

function draw() {
  background(232, 238, 242);

  drawWater();
  drawHongKongLand();
  drawRegionConnections();

  if (showCoverage) {
    drawCoverageAreas();
  }

  drawMetroTracks();
  drawRegions();
  drawStations();

  drawMapLabels();
  drawInformationPanel();
  showHoverInformation();
}


// ==========================================================
// CREATE HONG KONG REGIONS
// ==========================================================

function createHongKongRegions() {
  regions = [

    // ------------------------------------------------------
    // WESTERN LANTAU AND AIRPORT
    // ------------------------------------------------------

    {
      name: "Hong Kong International Airport",
      shortName: "Airport",
      type: "airport",

      x: 90,
      y: 470,
      w: 105,
      h: 60,

      residents: 0,
      jobs: 60000,
      students: 0,
      visitors: 125000,

      hospitals: 0,
      transportImportance: 5,
      environmentalValue: 20,
      constructionDifficulty: 45,

      functions: [
        "Airport terminals",
        "Airline employment",
        "Cargo and logistics",
        "Hotels",
        "International transport"
      ]
    },

    {
      name: "Tung Chung New Town",
      shortName: "Tung Chung",
      type: "newTown",

      x: 180,
      y: 475,
      w: 100,
      h: 72,

      residents: 12000,
      jobs: 31300,
      students: 29000,
      visitors: 49000,

      hospitals: 1,
      transportImportance: 3,
      environmentalValue: 30,
      constructionDifficulty: 48,

      functions: [
        "Residential housing",
        "Airport-support workers",
        "Shopping mall",
        "Schools",
        "Community facilities"
      ]
    },

    {
      name: "Southern Lantau",
      shortName: "South Lantau",
      type: "conservation",

      x: 225,
      y: 585,
      w: 220,
      h: 95,

      residents: 18000,
      jobs: 9500,
      students: 400,
      visitors: 10000,

      hospitals: 0,
      transportImportance: 1,
      environmentalValue: 95,
      constructionDifficulty: 90,

      functions: [
        "Country parks",
        "Villages",
        "Beaches",
        "Hiking",
        "Environmental conservation"
      ]
    },


    // ------------------------------------------------------
    // WESTERN NEW TERRITORIES
    // ------------------------------------------------------

    {
      name: "Tuen Mun",
      shortName: "Tuen Mun",
      type: "newTown",

      x: 170,
      y: 235,
      w: 110,
      h: 82,

      residents: 538700,
      jobs: 272200,
      students: 52000,
      visitors: 23000,

      hospitals: 1,
      transportImportance: 4,
      environmentalValue: 28,
      constructionDifficulty: 50,

      functions: [
        "Large residential new town",
        "Schools",
        "Hospital",
        "Light rail interchange",
        "Industrial employment"
      ]
    },

    {
      name: "Yuen Long and Tin Shui Wai",
      shortName: "Yuen Long",
      type: "newTown",

      x: 275,
      y: 120,
      w: 145,
      h: 90,

      residents: 674500,
      jobs: 354700,
      students: 70000,
      visitors: 28000,

      hospitals: 1,
      transportImportance: 4,
      environmentalValue: 35,
      constructionDifficulty: 48,

      functions: [
        "Residential new towns",
        "Schools",
        "Shopping centers",
        "Local business",
        "Cross-boundary transport"
      ]
    },

    {
      name: "Kwai Tsing and Container Port",
      shortName: "Kwai Tsing",
      type: "industrial",

      x: 330,
      y: 350,
      w: 105,
      h: 80,

      residents: 484900,
      jobs: 236300,
      students: 50000,
      visitors: 8000,

      hospitals: 1,
      transportImportance: 4,
      environmentalValue: 18,
      constructionDifficulty: 55,

      functions: [
        "Container terminals",
        "Warehouses",
        "Logistics",
        "Residential estates",
        "Rail and road interchange"
      ]
    },

    {
      name: "Tsuen Wan",
      shortName: "Tsuen Wan",
      type: "mixedUse",

      x: 365,
      y: 280,
      w: 95,
      h: 72,

      residents: 298800,
      jobs: 157200,
      students: 33000,
      visitors: 28000,

      hospitals: 1,
      transportImportance: 4,
      environmentalValue: 20,
      constructionDifficulty: 45,

      functions: [
        "Residential housing",
        "Shopping centers",
        "Older industrial buildings",
        "Offices",
        "Transport interchange"
      ]
    },


    // ------------------------------------------------------
    // CENTRAL AND EASTERN NEW TERRITORIES
    // ------------------------------------------------------

    {
      name: "Northern New Territories",
      shortName: "North District",
      type: "border",

      x: 470,
      y: 75,
      w: 155,
      h: 72,

      residents: 330000,
      jobs: 65000,
      students: 42000,
      visitors: 35000,

      hospitals: 1,
      transportImportance: 4,
      environmentalValue: 48,
      constructionDifficulty: 55,

      functions: [
        "Residential towns",
        "Cross-boundary movement",
        "Agricultural land",
        "Schools",
        "Railway connections"
      ]
    },

    {
      name: "Tai Po",
      shortName: "Tai Po",
      type: "newTown",

      x: 555,
      y: 165,
      w: 100,
      h: 75,

      residents: 326500,
      jobs: 167500,
      students: 30000,
      visitors: 19000,

      hospitals: 2,
      transportImportance: 3,
      environmentalValue: 45,
      constructionDifficulty: 52,

      functions: [
        "Residential new town",
        "Industrial estate",
        "Schools",
        "Hospital",
        "Waterfront recreation"
      ]
    },

    {
      name: "Sha Tin and Ma On Shan",
      shortName: "Sha Tin",
      type: "newTown",

      x: 515,
      y: 270,
      w: 125,
      h: 90,

      residents: 687300,
      jobs: 342800,
      students: 85000,
      visitors: 36000,

      hospitals: 6,
      transportImportance: 5,
      environmentalValue: 32,
      constructionDifficulty: 48,

      functions: [
        "Major residential new town",
        "University",
        "Hospitals",
        "Shopping centers",
        "Rail interchange"
      ]
    },

    {
      name: "Sai Kung and Country Parks",
      shortName: "Sai Kung",
      type: "conservation",

      x: 690,
      y: 205,
      w: 135,
      h: 130,

      residents: 501200,
      jobs: 273400,
      students: 12000,
      visitors: 65000,

      hospitals: 0,
      transportImportance: 2,
      environmentalValue: 95,
      constructionDifficulty: 88,

      functions: [
        "Country parks",
        "Villages",
        "Water recreation",
        "Tourism",
        "Environmental conservation"
      ]
    },


    // ------------------------------------------------------
    // KOWLOON
    // ------------------------------------------------------

    {
      name: "West Kowloon",
      shortName: "West Kowloon",
      type: "transportHub",

      x: 435,
      y: 420,
      w: 90,
      h: 74,

      residents: 700000,
      jobs: 3811300,
      students: 15000,
      visitors: 85000,

      hospitals: 5,
      transportImportance: 5,
      environmentalValue: 8,
      constructionDifficulty: 40,

      functions: [
        "High-speed rail station",
        "Airport Express",
        "Offices",
        "Luxury housing",
        "Cultural district"
      ]
    },

    {
      name: "Inner Kowloon",
      shortName: "Inner Kowloon",
      type: "mixedUse",

      x: 520,
      y: 395,
      w: 115,
      h: 90,

      residents: 610000,
      jobs: 230000,
      students: 90000,
      visitors: 150000,

      hospitals: 3,
      transportImportance: 5,
      environmentalValue: 5,
      constructionDifficulty: 40,

      functions: [
        "Dense housing",
        "Street markets",
        "Shopping",
        "Schools",
        "Major interchange stations"
      ]
    },

    {
      name: "East Kowloon and Kai Tak",
      shortName: "East Kowloon",
      type: "redevelopment",

      x: 635,
      y: 390,
      w: 120,
      h: 90,

      residents: 1079968,
      jobs: 550000,
      students: 130000,
      visitors: 70000,

      hospitals: 3,
      transportImportance: 5,
      environmentalValue: 10,
      constructionDifficulty: 43,

      functions: [
        "Office development",
        "Residential towers",
        "Former industrial areas",
        "Sports facilities",
        "Kai Tak redevelopment"
      ]
    },

    {
      name: "Tseung Kwan O",
      shortName: "Tseung Kwan O",
      type: "newTown",

      x: 720,
      y: 355,
      w: 100,
      h: 82,

      residents: 418000,
      jobs: 7260,
      students: 120000,
      visitors: 25000,

      hospitals: 2,
      transportImportance: 4,
      environmentalValue: 24,
      constructionDifficulty: 55,

      functions: [
        "High-density housing",
        "Schools",
        "Shopping malls",
        "Hospital",
        "Media and technology industries"
      ]
    },


    // ------------------------------------------------------
    // HONG KONG ISLAND
    // ------------------------------------------------------

    {
      name: "Central and Admiralty",
      shortName: "Central",
      type: "commercial",

      x: 470,
      y: 535,
      w: 105,
      h: 70,

      residents: 11000,
      jobs: 321853,
      students: 10000,
      visitors: 190000,

      hospitals: 0,
      transportImportance: 5,
      environmentalValue: 5,
      constructionDifficulty: 55,

      functions: [
        "Financial center",
        "Corporate offices",
        "Government offices",
        "Retail",
        "Major railway interchange"
      ]
    },

    {
      name: "Wan Chai and Causeway Bay",
      shortName: "Wan Chai",
      type: "commercial",

      x: 575,
      y: 545,
      w: 115,
      h: 75,

      residents: 16060,
      jobs: 92200,
      students: 16000,
      visitors: 175000,

      hospitals: 4,
      transportImportance: 5,
      environmentalValue: 5,
      constructionDifficulty: 50,

      functions: [
        "Offices",
        "Retail",
        "Convention facilities",
        "Hotels",
        "Entertainment"
      ]
    },

    {
      name: "Eastern Hong Kong Island",
      shortName: "Eastern Island",
      type: "mixedUse",

      x: 685,
      y: 530,
      w: 125,
      h: 82,

      residents: 503000,
      jobs: 260000,
      students: 13000,
      visitors: 43000,

      hospitals: 3,
      transportImportance: 4,
      environmentalValue: 15,
      constructionDifficulty: 52,

      functions: [
        "Dense housing",
        "Office centers",
        "Shopping",
        "Schools",
        "Harbor-front development"
      ]
    },

    {
      name: "Southern Hong Kong Island",
      shortName: "South Island",
      type: "mixedUse",

      x: 570,
      y: 635,
      w: 225,
      h: 70,

      residents: 251500,
      jobs: 134900,
      students: 33000,
      visitors: 95000,

      hospitals: 7,
      transportImportance: 3,
      environmentalValue: 60,
      constructionDifficulty: 75,

      functions: [
        "Residential communities",
        "Country parks",
        "Beaches",
        "Tourism",
        "Hospitals"
      ]
    }
  ];

  positionRegionsGeographically();
}


function longitudeToX(longitude) {
  return geoLeft +
    (longitude - geoLonMin) * pixelsPerLongitudeDegree;
}


function latitudeToY(latitude) {
  return geoTop +
    (geoLatMax - latitude) * pixelsPerLatitudeDegree;
}


function screenToGeo(x, y) {
  return {
    longitude:
      geoLonMin + (x - geoLeft) / pixelsPerLongitudeDegree,
    latitude:
      geoLatMax - (y - geoTop) / pixelsPerLatitudeDegree
  };
}


function positionRegionsGeographically() {
  const locations = {
    "Airport": [113.9185, 22.3080],
    "Tung Chung": [113.9420, 22.2890],
    "South Lantau": [113.9300, 22.2350],
    "Tuen Mun": [113.9770, 22.3910],
    "Yuen Long": [114.0220, 22.4450],
    "Kwai Tsing": [114.1260, 22.3540],
    "Tsuen Wan": [114.1140, 22.3720],
    "North District": [114.1500, 22.5000],
    "Tai Po": [114.1690, 22.4500],
    "Sha Tin": [114.1870, 22.3820],
    "Sai Kung": [114.2700, 22.3830],
    "West Kowloon": [114.1665, 22.3090],
    "Inner Kowloon": [114.1850, 22.3260],
    "East Kowloon": [114.2170, 22.3260],
    "Tseung Kwan O": [114.2520, 22.3075],
    "Central": [114.1550, 22.2760],
    "Wan Chai": [114.1760, 22.2770],
    "Eastern Island": [114.2250, 22.2750],
    "South Island": [114.1700, 22.2350]
  };

  for (let region of regions) {
    let location = locations[region.shortName];

    if (location) {
      region.longitude = location[0];
      region.latitude = location[1];
      region.anchorX = longitudeToX(region.longitude);
      region.anchorY = latitudeToY(region.latitude);
      region.x = region.anchorX;
      region.y = region.anchorY;

      // Compact boxes retain readable labels in Hong Kong's dense urban core.
      region.w = constrain(region.w, 68, 105);
      region.h = constrain(region.h, 48, 64);
    }
  }

  separateRegionBoxes();
}


function separateRegionBoxes() {
  const boxGap = 10;

  for (let pass = 0; pass < 120; pass++) {
    let moved = false;

    for (let i = 0; i < regions.length; i++) {
      for (let j = i + 1; j < regions.length; j++) {
        let first = regions[i];
        let second = regions[j];
        let deltaX = second.x - first.x;
        let deltaY = second.y - first.y;
        let overlapX =
          (first.w + second.w) / 2 + boxGap - abs(deltaX);
        let overlapY =
          (first.h + second.h) / 2 + boxGap - abs(deltaY);

        if (overlapX > 0 && overlapY > 0) {
          moved = true;

          if (overlapX < overlapY) {
            let direction = deltaX >= 0 ? 1 : -1;
            let shift = overlapX / 2 + 0.5;
            first.x -= direction * shift;
            second.x += direction * shift;
          } else {
            let direction = deltaY >= 0 ? 1 : -1;
            let shift = overlapY / 2 + 0.5;
            first.y -= direction * shift;
            second.y += direction * shift;
          }
        }
      }
    }

    for (let region of regions) {
      region.x = constrain(
        region.x,
        region.w / 2 + 12,
        mapWidth - region.w / 2 - 12
      );
      region.y = constrain(
        region.y,
        region.h / 2 + 12,
        canvasHeight - region.h / 2 - 12
      );
    }

    if (!moved) {
      break;
    }
  }
}


// ==========================================================
// DRAW WATER
// ==========================================================

function drawWater() {
  background(202, 224, 237);

  noStroke();
  fill(190, 217, 233);
  rect(0, 0, mapWidth, canvasHeight);
}


// ==========================================================
// DRAW GEOGRAPHIC LAND MASSES
// ==========================================================

function drawHongKongLand() {
  noStroke();

  fill(220, 228, 211);

  for (let polygon of hongKongLandPolygons) {
    beginShape();

    for (let coordinate of polygon) {
      vertex(
        longitudeToX(coordinate[0]),
        latitudeToY(coordinate[1])
      );
    }

    endShape(CLOSE);
  }
}


// ==========================================================
// DRAW LIGHT GUIDE CONNECTIONS
// ==========================================================

function drawRegionConnections() {
  // Geographic mode does not draw the old schematic guide corridors.
}


// ==========================================================
// DRAW REGIONS
// ==========================================================

function drawRegions() {
  for (let region of regions) {
    let covered = isRegionCovered(region);

    let regionColor = getRegionColor(region.type, covered);

    if (dist(region.x, region.y, region.anchorX, region.anchorY) > 3) {
      stroke(80, 85, 80, 125);
      strokeWeight(1.5);
      line(region.anchorX, region.anchorY, region.x, region.y);
      noStroke();
      fill(70, 75, 70, 180);
      circle(region.anchorX, region.anchorY, 7);
    }

    stroke(70, 75, 70, 150);
    strokeWeight(1.5);
    fill(regionColor);

    rectMode(CENTER);
    rect(region.x, region.y, region.w, region.h, 18);
    rectMode(CORNER);

    drawRegionIcon(region);

    if (showRegionNames) {
      fill(25);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(12);
      textStyle(BOLD);
      text(
        region.shortName,
        region.x,
        region.y
      );
      textStyle(NORMAL);
    }

    if (covered) {
      noFill();
      stroke(25, 120, 85);
      strokeWeight(3);

      rectMode(CENTER);
      rect(
        region.x,
        region.y,
        region.w + 5,
        region.h + 5,
        20
      );
      rectMode(CORNER);
    }
  }
}


// ==========================================================
// REGION COLORS
// ==========================================================

function getRegionColor(type, covered) {
  let alphaValue = covered ? 245 : 205;

  if (type === "commercial") {
    return color(241, 184, 85, alphaValue);
  }

  if (type === "mixedUse") {
    return color(199, 145, 207, alphaValue);
  }

  if (type === "newTown") {
    return color(112, 174, 215, alphaValue);
  }

  if (type === "airport") {
    return color(235, 120, 105, alphaValue);
  }

  if (type === "industrial") {
    return color(145, 151, 157, alphaValue);
  }

  if (type === "redevelopment") {
    return color(232, 150, 84, alphaValue);
  }

  if (type === "transportHub") {
    return color(238, 205, 80, alphaValue);
  }

  if (type === "conservation") {
    return color(116, 179, 111, alphaValue);
  }

  if (type === "border") {
    return color(111, 187, 178, alphaValue);
  }

  return color(200, 200, 200, alphaValue);
}


// ==========================================================
// REGION ICONS
// ==========================================================

function drawRegionIcon(region) {
  noStroke();
  fill(35);
  textAlign(CENTER, CENTER);
  textSize(18);

  let symbol = "";

  if (region.type === "airport") {
    symbol = "✈";
  } else if (region.type === "commercial") {
    symbol = "$";
  } else if (region.type === "mixedUse") {
    symbol = "■";
  } else if (region.type === "newTown") {
    symbol = "⌂";
  } else if (region.type === "industrial") {
    symbol = "⚙";
  } else if (region.type === "conservation") {
    symbol = "♣";
  } else if (region.type === "redevelopment") {
    symbol = "◆";
  } else if (region.type === "transportHub") {
    symbol = "T";
  } else if (region.type === "border") {
    symbol = "↕";
  }

  text(symbol, region.x, region.y - 20);

  fill(25);
  textSize(10);

  let demand = calculateRegionDemand(region);
  text(
    formatDemand(demand),
    region.x,
    region.y + 20
  );
}


// ==========================================================
// DRAW MAP LABELS
// ==========================================================

function drawMapLabels() {
  noStroke();
  fill(45, 80);
  textAlign(CENTER);
  textSize(14);

  text(
    "NEW TERRITORIES",
    longitudeToX(114.13),
    latitudeToY(22.555)
  );
  text(
    "KOWLOON",
    longitudeToX(114.20),
    latitudeToY(22.345)
  );
  text(
    "HONG KONG ISLAND",
    longitudeToX(114.21),
    latitudeToY(22.205)
  );
  text(
    "LANTAU ISLAND",
    longitudeToX(113.99),
    latitudeToY(22.205)
  );

  fill(40, 95);
  textAlign(LEFT);
  textSize(10);
  text("NORTH ↑", 18, 25);

  fill(190, 35, 35);
  textSize(9);
  text("*data from 2025", 18, 43);
}


// ==========================================================
// STATION COVERAGE
// ==========================================================

function drawCoverageAreas() {
  noStroke();

  for (let station of stations) {
    fill(45, 115, 205, 35);

    circle(
      station.x,
      station.y,
      stationCoverageRadius * 2
    );
  }
}


// ==========================================================
// METRO TRACKS
// ==========================================================

function drawMetroTracks() {
  noFill();

  for (let lineIndex = 0; lineIndex < metroLines.length; lineIndex++) {
    let metroLine = metroLines[lineIndex];

    if (metroLine.length < 2) {
      continue;
    }

    let lineColor = lineColors[lineIndex];

    stroke(lineColor[0], lineColor[1], lineColor[2]);
    strokeWeight(7);

    for (let i = 0; i < metroLine.length - 1; i++) {
      line(
        metroLine[i].x,
        metroLine[i].y,
        metroLine[i + 1].x,
        metroLine[i + 1].y
      );
    }

    stroke(255, 190);
    strokeWeight(2);

    for (let i = 0; i < metroLine.length - 1; i++) {
      line(
        metroLine[i].x,
        metroLine[i].y,
        metroLine[i + 1].x,
        metroLine[i + 1].y
      );
    }
  }
}


// ==========================================================
// DRAW STATIONS
// ==========================================================

function drawStations() {
  for (let i = 0; i < stations.length; i++) {
    let station = stations[i];
    let lineColor = lineColors[station.lineIndex];

    stroke(255);
    strokeWeight(3);
    fill(lineColor[0], lineColor[1], lineColor[2]);
    circle(station.x, station.y, 25);

    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(10);
    text(station.lineStationNumber, station.x, station.y);
  }
}


// ==========================================================
// ADD STATIONS
// ==========================================================

function mousePressed() {
  if (
    mouseX >= 0 &&
    mouseX <= mapWidth &&
    mouseY >= 0 &&
    mouseY <= canvasHeight
  ) {
    addStation(mouseX, mouseY);
  }
}


function addStation(x, y) {
  if (!isOnHongKongLand(x, y)) {
    message =
      "Stations must be placed on a Hong Kong land area.";
    return;
  }

  for (let station of stations) {
    let distance = dist(x, y, station.x, station.y);

    if (
      station.lineIndex === activeLineIndex &&
      distance < minimumStationDistance
    ) {
      message =
        "That location is too close to another station on this line.";
      return;
    }
  }

  let newStation = {
    x: x,
    y: y,
    lineIndex: activeLineIndex,
    lineStationNumber: metroLines[activeLineIndex].length + 1
  };

  stations.push(newStation);
  metroLines[activeLineIndex].push(newStation);

  let nearestRegion = findNearestRegion(x, y);

  if (nearestRegion !== null) {
    message =
      "Line " +
      (activeLineIndex + 1) +
      ", station " +
      newStation.lineStationNumber +
      " added near " +
      nearestRegion.shortName +
      ".";
  } else {
    message =
      "Line " +
      (activeLineIndex + 1) +
      ", station " +
      newStation.lineStationNumber +
      " added.";
  }
}


// ==========================================================
// GEOGRAPHIC LAND TEST
// ==========================================================

function isOnHongKongLand(x, y) {
  let location = screenToGeo(x, y);

  for (let polygon of hongKongLandPolygons) {
    if (
      pointInGeographicPolygon(
        location.longitude,
        location.latitude,
        polygon
      )
    ) {
      return true;
    }
  }

  return false;
}


function pointInGeographicPolygon(longitude, latitude, polygon) {
  let inside = false;

  for (
    let i = 0, j = polygon.length - 1;
    i < polygon.length;
    j = i++
  ) {
    let xi = polygon[i][0];
    let yi = polygon[i][1];
    let xj = polygon[j][0];
    let yj = polygon[j][1];

    let intersects =
      yi > latitude !== yj > latitude &&
      longitude <
        (xj - xi) * (latitude - yi) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}


// ==========================================================
// UNDO AND RESET
// ==========================================================

function undoStation() {
  if (stations.length > 0) {
    let removedStation = stations.pop();
    metroLines[removedStation.lineIndex].pop();
    message = "The most recent station was removed.";
  } else {
    message = "There are no stations to remove.";
  }
}


function resetNetwork() {
  stations = [];
  metroLines = [[], [], [], []];
  message = "The metro network has been reset.";
}


// ==========================================================
// FIND NEAREST REGION
// ==========================================================

function findNearestRegion(x, y) {
  let closestRegion = null;
  let shortestDistance = Infinity;

  for (let region of regions) {
    let distance = dist(x, y, region.anchorX, region.anchorY);

    if (distance < shortestDistance) {
      shortestDistance = distance;
      closestRegion = region;
    }
  }

  return closestRegion;
}


// ==========================================================
// COVERAGE CALCULATIONS
// ==========================================================

function isRegionCovered(region) {
  for (let station of stations) {
    let distance = dist(
      region.anchorX,
      region.anchorY,
      station.x,
      station.y
    );

    // Larger regions receive a small size allowance
    let sizeAllowance =
      min(region.w, region.h) * 0.2;

    if (
      distance <=
      stationCoverageRadius + sizeAllowance
    ) {
      return true;
    }
  }

  return false;
}


// ==========================================================
// REGION TRAVEL DEMAND
// ==========================================================

function calculateRegionDemand(region) {
  return (
    region.residents * 0.35 +
    region.jobs * 0.30 +
    region.students * 0.12 +
    region.visitors * 0.18 +
    region.transportImportance * 12000 +
    region.hospitals * 18000
  );
}


function calculateTotalDemand() {
  let total = 0;

  for (let region of regions) {
    total += calculateRegionDemand(region);
  }

  return total;
}


function calculateCoveredDemand() {
  let total = 0;

  for (let region of regions) {
    if (isRegionCovered(region)) {
      total += calculateRegionDemand(region);
    }
  }

  return total;
}


function calculateDemandCoverage() {
  let totalDemand = calculateTotalDemand();

  if (totalDemand === 0) {
    return 0;
  }

  return (
    calculateCoveredDemand() /
    totalDemand *
    100
  );
}


// ==========================================================
// POPULATION COVERAGE
// ==========================================================

function calculatePopulationCoverage() {
  let totalPopulation = 0;
  let coveredPopulation = 0;

  for (let region of regions) {
    totalPopulation += region.residents;

    if (isRegionCovered(region)) {
      coveredPopulation += region.residents;
    }
  }

  if (totalPopulation === 0) {
    return 0;
  }

  return (
    coveredPopulation /
    totalPopulation *
    100
  );
}


// ==========================================================
// JOB COVERAGE
// ==========================================================

function calculateJobCoverage() {
  let totalJobs = 0;
  let coveredJobs = 0;

  for (let region of regions) {
    totalJobs += region.jobs;

    if (isRegionCovered(region)) {
      coveredJobs += region.jobs;
    }
  }

  if (totalJobs === 0) {
    return 0;
  }

  return (
    coveredJobs /
    totalJobs *
    100
  );
}


// ==========================================================
// HOSPITAL COVERAGE
// ==========================================================

function calculateHospitalCoverage() {
  let totalHospitals = 0;
  let coveredHospitals = 0;

  for (let region of regions) {
    totalHospitals += region.hospitals;

    if (isRegionCovered(region)) {
      coveredHospitals += region.hospitals;
    }
  }

  if (totalHospitals === 0) {
    return 0;
  }

  return (
    coveredHospitals /
    totalHospitals *
    100
  );
}


// ==========================================================
// ENVIRONMENTAL IMPACT
// ==========================================================

function calculateEnvironmentalPenalty() {
  let penalty = 0;

  for (let station of stations) {
    let nearestRegion =
      findNearestRegion(station.x, station.y);

    if (nearestRegion !== null) {
      penalty +=
        nearestRegion.environmentalValue * 0.08;
    }
  }

  return penalty;
}


// ==========================================================
// TRACK LENGTH AND COST
// ==========================================================

function calculateTrackLength() {
  let totalLength = 0;

  for (let metroLine of metroLines) {
    for (let i = 0; i < metroLine.length - 1; i++) {
      totalLength += geographicDistanceKm(
        screenToGeo(metroLine[i].x, metroLine[i].y),
        screenToGeo(metroLine[i + 1].x, metroLine[i + 1].y)
      );
    }
  }

  return totalLength;
}


function geographicDistanceKm(first, second) {
  const earthRadiusKm = 6371.0088;
  const toRadians = Math.PI / 180;
  const latitude1 = first.latitude * toRadians;
  const latitude2 = second.latitude * toRadians;
  const latitudeDifference =
    (second.latitude - first.latitude) * toRadians;
  const longitudeDifference =
    (second.longitude - first.longitude) * toRadians;

  const haversine =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(latitude1) *
      Math.cos(latitude2) *
      Math.sin(longitudeDifference / 2) ** 2;

  return 2 * earthRadiusKm * Math.asin(Math.sqrt(haversine));
}


function calculateConstructionDifficulty() {
  let totalDifficulty = 0;

  for (let station of stations) {
    let nearestRegion =
      findNearestRegion(station.x, station.y);

    if (nearestRegion !== null) {
      totalDifficulty +=
        nearestRegion.constructionDifficulty;
    }
  }

  return totalDifficulty;
}


function calculateTotalCost() {
  let stationConstruction =
    stations.length * stationCost;

  let trackConstruction =
    calculateTrackLength() *
    trackCostPerKilometer;

  let difficultyCost =
    calculateConstructionDifficulty() * 0.45;

  return (
    stationConstruction +
    trackConstruction +
    difficultyCost
  );
}


// ==========================================================
// PLANNING SCORE
// ==========================================================

function calculateScore() {
  let populationCoverage =
    calculatePopulationCoverage();

  let jobCoverage =
    calculateJobCoverage();

  let demandCoverage =
    calculateDemandCoverage();

  let hospitalCoverage =
    calculateHospitalCoverage();

  let costPenalty =
    calculateTotalCost() / 42;

  let environmentalPenalty =
    calculateEnvironmentalPenalty();

  let score =
    populationCoverage * 0.28 +
    jobCoverage * 0.25 +
    demandCoverage * 0.27 +
    hospitalCoverage * 0.20 -
    costPenalty -
    environmentalPenalty;

  return constrain(score, 0, 100);
}


function getPlanningRating(score) {
  if (stations.length === 0) {
    return "No network created";
  }

  if (score >= 75) {
    return "Excellent integrated network";
  } else if (score >= 60) {
    return "Strong regional network";
  } else if (score >= 45) {
    return "Developing network";
  } else if (score >= 25) {
    return "Limited accessibility";
  } else {
    return "Network needs improvement";
  }
}


// ==========================================================
// INFORMATION PANEL
// ==========================================================

function drawInformationPanel() {
  noStroke();
  fill(248);
  rect(mapWidth, 0, canvasWidth - mapWidth, canvasHeight);

  fill(25);
  textAlign(LEFT);
  textSize(22);
  textStyle(BOLD);
  text("Hong Kong Metro Planner", panelX, 27);
  textStyle(NORMAL);

  fill(85);
  textSize(11);
  text(
    "Build a metro network that connects homes,\n" +
    "jobs, education, healthcare and transport hubs.",
    panelX,
    57
  );

  let activeColor = lineColors[activeLineIndex];
  fill(activeColor[0], activeColor[1], activeColor[2]);
  textSize(11);
  text(
    "Building Line " + (activeLineIndex + 1),
    panelX,
    85
  );

  let populationCoverage =
    calculatePopulationCoverage();

  let jobCoverage =
    calculateJobCoverage();

  let demandCoverage =
    calculateDemandCoverage();

  let hospitalCoverage =
    calculateHospitalCoverage();

  let trackLength =
    calculateTrackLength();

  let cost =
    calculateTotalCost();

  drawMetric(
    "Stations",
    stations.length,
    105
  );

  drawMetric(
    "Population coverage",
    populationCoverage.toFixed(1) + "%",
    155
  );

  drawMetric(
    "Employment coverage",
    jobCoverage.toFixed(1) + "%",
    205
  );

  drawMetric(
    "Total travel-demand coverage",
    demandCoverage.toFixed(1) + "%",
    255
  );

  drawMetric(
    "Hospital coverage",
    hospitalCoverage.toFixed(1) + "%",
    305
  );

  drawMetric(
    "Track length",
    trackLength.toFixed(1) + " kilometers",
    355
  );

  drawMetric(
    "Estimated cost",
    "$" + cost.toFixed(0) + " million",
    405
  );

  fill(125, 76, 45);
  textSize(12);
  text(
    "Click regions to place stations.",
    panelX,
    465
  );

  fill(125, 76, 45);
  textSize(12);
  text(
    message,
    panelX,
    488,
    260
  );
}


function drawMetric(label, value, y) {
  fill(95);
  textSize(11);
  textAlign(LEFT);
  text(label, panelX, y);

  fill(25);
  textSize(17);
  text(value, panelX, y + 22);
}


// ==========================================================
// HOVER INFORMATION
// ==========================================================

function showHoverInformation() {
  if (mouseX > mapWidth) {
    return;
  }

  for (let region of regions) {
    let insideX =
      mouseX >= region.x - region.w / 2 &&
      mouseX <= region.x + region.w / 2;

    let insideY =
      mouseY >= region.y - region.h / 2 &&
      mouseY <= region.y + region.h / 2;

    if (insideX && insideY) {
      drawRegionTooltip(region);
      return;
    }
  }
}


// ==========================================================
// TOOLTIP
// ==========================================================

function drawRegionTooltip(region) {
  let tooltipWidth = 235;
  let tooltipHeight = 170;

  let tooltipX = mouseX + 18;
  let tooltipY = mouseY - 35;

  if (tooltipX + tooltipWidth > mapWidth) {
    tooltipX =
      mouseX - tooltipWidth - 18;
  }

  if (tooltipY + tooltipHeight > canvasHeight) {
    tooltipY =
      canvasHeight - tooltipHeight - 10;
  }

  if (tooltipY < 10) {
    tooltipY = 10;
  }

  fill(255, 248);
  stroke(70);
  strokeWeight(1);
  rect(
    tooltipX,
    tooltipY,
    tooltipWidth,
    tooltipHeight,
    8
  );

  noStroke();
  fill(25);
  textAlign(LEFT);
  textSize(12);
  text(
    region.name,
    tooltipX + 12,
    tooltipY + 20
  );

  fill(75);
  textSize(10);

  text(
    "Residents: " +
    region.residents.toLocaleString(),
    tooltipX + 12,
    tooltipY + 42
  );

  text(
    "Jobs: " +
    region.jobs.toLocaleString(),
    tooltipX + 12,
    tooltipY + 58
  );

  text(
    "Students: " +
    region.students.toLocaleString(),
    tooltipX + 12,
    tooltipY + 74
  );

  text(
    "Visitors: " +
    region.visitors.toLocaleString(),
    tooltipX + 12,
    tooltipY + 90
  );

  text(
    "Main functions:",
    tooltipX + 12,
    tooltipY + 112
  );

  let functionText =
    region.functions.slice(0, 3).join(", ");

  text(
    functionText,
    tooltipX + 12,
    tooltipY + 128,
    tooltipWidth - 24,
    40
  );
}


// ==========================================================
// FORMAT LARGE NUMBERS
// ==========================================================

function formatDemand(number) {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + "M demand";
  }

  if (number >= 1000) {
    return Math.round(number / 1000) + "K demand";
  }

  return round(number) + " demand";
}
