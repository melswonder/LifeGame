const MAP_SCALE = 3;

const scalePoint = (point) => ({
  x: Math.round(point.x * MAP_SCALE),
  y: Math.round(point.y * MAP_SCALE),
});

const scalePoints = (points) => points.map(scalePoint);

const scaleEllipse = (ellipse) => ({
  ...ellipse,
  x: Math.round(ellipse.x * MAP_SCALE),
  y: Math.round(ellipse.y * MAP_SCALE),
  rx: Math.round(ellipse.rx * MAP_SCALE),
  ry: Math.round(ellipse.ry * MAP_SCALE),
});

const scaleHouse = (house) => ({
  ...house,
  x: Math.round(house.x * MAP_SCALE),
  y: Math.round(house.y * MAP_SCALE),
  width: Math.round(house.width * MAP_SCALE),
  height: Math.round(house.height * MAP_SCALE),
});

const scaleForest = (forest) => ({
  ...forest,
  x: Math.round(forest.x * MAP_SCALE),
  y: Math.round(forest.y * MAP_SCALE),
  r: Math.round(forest.r * MAP_SCALE),
});

const scaleLandmark = (landmark) => ({
  ...landmark,
  x: Math.round(landmark.x * MAP_SCALE),
  y: Math.round(landmark.y * MAP_SCALE),
});

const scaleMountain = (mountain) => ({
  ...mountain,
  points: scalePoints(mountain.points),
});

export const BOARD_CANVAS = {
  width: Math.round(1800 * MAP_SCALE),
  height: Math.round(1200 * MAP_SCALE),
};

export const BOARD_NODE_SIZE = 72;

const MAIN_ROUTE_WAYPOINTS = scalePoints([
  { x: 140, y: 1020 },
  { x: 280, y: 1060 },
  { x: 430, y: 1020 },
  { x: 540, y: 930 },
  { x: 610, y: 820 },
  { x: 560, y: 700 },
  { x: 450, y: 620 },
  { x: 350, y: 520 },
  { x: 420, y: 400 },
  { x: 560, y: 320 },
  { x: 740, y: 280 },
  { x: 940, y: 300 },
  { x: 1110, y: 360 },
  { x: 1250, y: 470 },
  { x: 1360, y: 600 },
  { x: 1480, y: 720 },
  { x: 1640, y: 800 },
  { x: 1740, y: 730 },
  { x: 1710, y: 610 },
  { x: 1600, y: 540 },
  { x: 1450, y: 560 },
  { x: 1370, y: 680 },
  { x: 1340, y: 830 },
  { x: 1400, y: 960 },
  { x: 1540, y: 1040 },
  { x: 1700, y: 1080 },
]);

export const SCENIC_TRAILS = [
  [
    { x: 740, y: 280 },
    { x: 810, y: 190 },
    { x: 970, y: 160 },
    { x: 1140, y: 220 },
    { x: 1250, y: 470 },
  ],
  [
    { x: 1480, y: 720 },
    { x: 1590, y: 660 },
    { x: 1710, y: 660 },
    { x: 1780, y: 720 },
  ],
  [
    { x: 1340, y: 830 },
    { x: 1220, y: 930 },
    { x: 1190, y: 1070 },
    { x: 1330, y: 1110 },
    { x: 1540, y: 1040 },
  ],
].map(scalePoints);

export const BOARD_LANDMARKS = [
  {
    x: 160,
    y: 1120,
    label: "はじまりの街",
    tone: "bg-sky-100 text-sky-900 border-sky-300",
  },
  {
    x: 365,
    y: 690,
    label: "森の抜け道",
    tone: "bg-emerald-100 text-emerald-900 border-emerald-300",
  },
  {
    x: 890,
    y: 170,
    label: "険しい山道",
    tone: "bg-slate-100 text-slate-900 border-slate-300",
  },
  {
    x: 1570,
    y: 620,
    label: "湖畔の分岐",
    tone: "bg-cyan-100 text-cyan-900 border-cyan-300",
  },
  {
    x: 1640,
    y: 1148,
    label: "ゴールシティ",
    tone: "bg-amber-100 text-amber-900 border-amber-300",
  },
].map(scaleLandmark);

export const BOARD_HOUSES = [
  { x: 90, y: 1085, width: 36, height: 28, color: "#fb7185" },
  { x: 132, y: 1060, width: 42, height: 34, color: "#f59e0b" },
  { x: 178, y: 1082, width: 38, height: 30, color: "#60a5fa" },
  { x: 1640, y: 1120, width: 44, height: 34, color: "#f97316" },
  { x: 1692, y: 1090, width: 38, height: 30, color: "#fb7185" },
  { x: 1738, y: 1112, width: 42, height: 32, color: "#22c55e" },
].map(scaleHouse);

export const BOARD_MOUNTAINS = [
  {
    points: [
      { x: 430, y: 520 },
      { x: 620, y: 180 },
      { x: 820, y: 520 },
    ],
    fill: "#94a3b8",
  },
  {
    points: [
      { x: 630, y: 560 },
      { x: 860, y: 120 },
      { x: 1080, y: 560 },
    ],
    fill: "#64748b",
  },
  {
    points: [
      { x: 910, y: 560 },
      { x: 1120, y: 190 },
      { x: 1320, y: 560 },
    ],
    fill: "#94a3b8",
  },
].map(scaleMountain);

export const BOARD_FORESTS = [
  { x: 280, y: 770, r: 66, color: "#166534" },
  { x: 380, y: 770, r: 58, color: "#15803d" },
  { x: 220, y: 680, r: 54, color: "#14532d" },
  { x: 470, y: 670, r: 52, color: "#166534" },
  { x: 310, y: 590, r: 48, color: "#22c55e" },
].map(scaleForest);

export const BOARD_LAKES = [
  {
    x: 1580,
    y: 670,
    rx: 210,
    ry: 120,
    fill: "#67e8f9",
    stroke: "#0891b2",
  },
].map(scaleEllipse);

export const BOARD_RIVER_PATH = scalePoints([
  { x: 1180, y: 160 },
  { x: 1320, y: 260 },
  { x: 1460, y: 420 },
  { x: 1550, y: 560 },
  { x: 1580, y: 670 },
  { x: 1510, y: 820 },
  { x: 1440, y: 1020 },
  { x: 1460, y: 1180 },
]);

const layoutCache = new Map();

const distanceBetween = (pointA, pointB) =>
  Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);

export const buildPolylinePath = (points) =>
  points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

const interpolatePointsAlongRoute = (points, count) => {
  if (count <= 1) {
    return [points[0]];
  }

  const segments = [];
  let totalLength = 0;

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    const length = distanceBetween(start, end);
    totalLength += length;
    segments.push({ start, end, length, totalLength });
  }

  return Array.from({ length: count }).map((_, index) => {
    const targetLength = (totalLength * index) / (count - 1);
    const segment =
      segments.find((candidate) => candidate.totalLength >= targetLength) ??
      segments[segments.length - 1];

    const previousLength = segment.totalLength - segment.length;
    const progress =
      segment.length === 0
        ? 0
        : (targetLength - previousLength) / segment.length;

    return {
      x: segment.start.x + (segment.end.x - segment.start.x) * progress,
      y: segment.start.y + (segment.end.y - segment.start.y) * progress,
    };
  });
};

export const getBoardLayout = (count) => {
  if (!layoutCache.has(count)) {
    layoutCache.set(
      count,
      interpolatePointsAlongRoute(MAIN_ROUTE_WAYPOINTS, count),
    );
  }

  return layoutCache.get(count);
};
