import {
  type PointerEvent,
  type ReactNode,
  useCallback,
  useLayoutEffect,
  useRef,
} from "react";
import { Avatar, PALETTE } from "./art";
import { Glass } from "./glass";
import { Icon, type IconName } from "./icons";

const MAP_WIDTH = 2400;
const MAP_HEIGHT = 1500;

const STREET_STEP_X = 130;
const STREET_STEP_Y = 112;

const SELECTED = { x: 1180, y: 760 };

const STREETS_X = Array.from(
  { length: Math.ceil(MAP_WIDTH / STREET_STEP_X) },
  (_, index) => (index + 0.5) * STREET_STEP_X
);
const STREETS_Y = Array.from(
  { length: Math.ceil(MAP_HEIGHT / STREET_STEP_Y) },
  (_, index) => (index + 0.5) * STREET_STEP_Y
);

const BUILDINGS = STREETS_X.flatMap(function blocksInColumn(x, column) {
  return STREETS_Y.map(function block(y, row) {
    return {
      id: `${column}-${row}`,
      shade: (column * 7 + row * 3) % 4,
      x: x + 12,
      y: y + 11,
    };
  });
});

const BUILDING_SHADES = ["#e6ddc9", "#e9e1cf", "#e1d7c1", "#ebe4d4"];

const PARKS = [
  { height: 290, id: "north", width: 420, x: 310, y: 190 },
  { height: 250, id: "south", width: 560, x: 1440, y: 1180 },
  { height: 220, id: "east", width: 300, x: 1920, y: 640 },
];

const PINS = [
  { id: "bakery", x: 820, y: 560 },
  { id: "museum", x: 1560, y: 420 },
  { id: "books", x: 940, y: 1000 },
  { id: "station", x: 1460, y: 900 },
];

const LABELS = [
  { id: "old-town", text: "OLD TOWN", x: 760, y: 770 },
  { id: "riverside", text: "RIVERSIDE", x: 1060, y: 900 },
  { id: "harbour", text: "HARBOUR", x: 2050, y: 1250 },
];

const STACK: IconName[] = ["layers", "location", "compass"];

function MapArt(): ReactNode {
  return (
    <svg
      aria-hidden="true"
      className="map__art"
      height={MAP_HEIGHT}
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      width={MAP_WIDTH}
    >
      <rect fill="#efe7d6" height={MAP_HEIGHT} width={MAP_WIDTH} />

      {BUILDINGS.map(function renderBuilding(building) {
        return (
          <rect
            fill={BUILDING_SHADES[building.shade]}
            height={STREET_STEP_Y - 22}
            key={building.id}
            rx="5"
            width={STREET_STEP_X - 24}
            x={building.x}
            y={building.y}
          />
        );
      })}

      {PARKS.map(function renderPark(park) {
        return (
          <rect
            fill="#bcd7a3"
            height={park.height}
            key={park.id}
            rx="28"
            width={park.width}
            x={park.x}
            y={park.y}
          />
        );
      })}

      <circle cx="1120" cy="420" fill="#bcd7a3" r="110" />

      <path
        d="M-60 1060 C 380 940 700 1260 1120 1110 S 1820 820 2460 980"
        fill="none"
        stroke="#93c4de"
        strokeWidth="96"
      />
      <ellipse cx="1900" cy="300" fill="#93c4de" rx="230" ry="130" />
      <path
        d={`M1700 ${MAP_HEIGHT} C 1900 1340 2200 1360 ${MAP_WIDTH} 1180 V ${MAP_HEIGHT} Z`}
        fill="#93c4de"
      />

      <path
        d={`M0 640 H${MAP_WIDTH}`}
        stroke={PALETTE.yellow}
        strokeWidth="24"
      />
      <path d="M260 1500 L1640 0" stroke={PALETTE.yellow} strokeWidth="22" />
      <path d={`M1380 0 V${MAP_HEIGHT}`} stroke="#ffffff" strokeWidth="26" />

      <text className="map__street" x="560" y="626">
        MARKET STREET
      </text>

      {LABELS.map(function renderLabel(label) {
        return (
          <text
            className="map__district"
            key={label.id}
            x={label.x}
            y={label.y}
          >
            {label.text}
          </text>
        );
      })}

      <text className="map__park" x="400" y="345">
        North Park
      </text>
      <text className="map__park" x="1600" y="1310">
        Harbour Gardens
      </text>
      <text className="map__water" x="1830" y="306">
        Glass Lake
      </text>

      {PINS.map(function renderPin(pin) {
        return (
          <g key={pin.id}>
            <circle cx={pin.x} cy={pin.y} fill={PALETTE.orange} r="18" />
            <circle cx={pin.x} cy={pin.y} fill="#ffffff" r="6" />
          </g>
        );
      })}

      <circle cx={SELECTED.x} cy={SELECTED.y} fill={PALETTE.navy} r="30" />
      <circle cx={SELECTED.x} cy={SELECTED.y} fill={PALETTE.cream} r="11" />
    </svg>
  );
}

/** Pans the map by dragging, like a scroll container that follows the pointer. */
function usePan() {
  const start = useRef<{
    left: number;
    top: number;
    x: number;
    y: number;
  } | null>(null);

  const handlePointerDown = useCallback(function startPan(
    event: PointerEvent<HTMLDivElement>
  ) {
    const element = event.currentTarget;

    element.setPointerCapture(event.pointerId);

    start.current = {
      left: element.scrollLeft,
      top: element.scrollTop,
      x: event.clientX,
      y: event.clientY,
    };
  }, []);

  const handlePointerMove = useCallback(function pan(
    event: PointerEvent<HTMLDivElement>
  ) {
    const origin = start.current;

    if (!origin) {
      return;
    }

    event.currentTarget.scrollLeft = origin.left - (event.clientX - origin.x);
    event.currentTarget.scrollTop = origin.top - (event.clientY - origin.y);
  }, []);

  const handlePointerUp = useCallback(function endPan() {
    start.current = null;
  }, []);

  return { handlePointerDown, handlePointerMove, handlePointerUp };
}

export function Maps(): ReactNode {
  const mapRef = useRef<HTMLDivElement>(null);
  const pan = usePan();

  useLayoutEffect(function centerOnPlace() {
    const map = mapRef.current;

    if (!map) {
      return;
    }

    map.scrollLeft = SELECTED.x - map.clientWidth * 0.62;
    map.scrollTop = SELECTED.y - map.clientHeight * 0.4;
  }, []);

  return (
    <div className="screen maps">
      <div
        className="map"
        onPointerCancel={pan.handlePointerUp}
        onPointerDown={pan.handlePointerDown}
        onPointerMove={pan.handlePointerMove}
        onPointerUp={pan.handlePointerUp}
        ref={mapRef}
      >
        <MapArt />
      </div>

      <div className="maps__search">
        <Glass height={56} tint={0.45} width={380}>
          <span className="glass-row">
            <Icon name="search" />
            <span className="glass-row--muted">Search Maps</span>
            <span className="glass-row__end">
              <Avatar name="Sam Lee" size={34} tone={2} />
            </span>
          </span>
        </Glass>
      </div>

      <div className="maps__stack">
        <Glass height={168} radius={28} width={56}>
          <span className="glass-column">
            {STACK.map(function renderButton(name) {
              return <Icon key={name} name={name} />;
            })}
          </span>
        </Glass>
      </div>

      <div className="maps__card">
        <Glass height={222} radius={30} tint={0.5} width={400}>
          <span className="place">
            <span className="place__title">Glass Café</span>

            <span className="place__meta">
              <Icon name="star" size={16} />
              4.8 · Café · Open until 22:00
            </span>

            <span className="place__meta">12 min walk · 900 m</span>

            <span className="place__actions">
              <span className="place__button place__button--primary">
                <Icon name="directions" size={18} />
                Directions
              </span>

              <span className="place__button">
                <Icon name="phone" size={18} />
              </span>

              <span className="place__button">
                <Icon name="globe" size={18} />
              </span>
            </span>
          </span>
        </Glass>
      </div>
    </div>
  );
}
