import type { ReactNode } from "react";
import { Artwork } from "./art";
import { Glass } from "./glass";
import { Icon } from "./icons";

type Tile =
  | {
      id: string;
      image: string;
      kind: "photo";
      position: string;
      zoom: number;
    }
  | { id: string; kind: "artwork"; variant: number };

const POSITIONS = [
  "10% 20%",
  "50% 50%",
  "85% 15%",
  "30% 80%",
  "70% 60%",
  "0% 100%",
  "60% 0%",
];
const ZOOMS = [1, 1.9, 2.6, 1.4];
const BACKDROPS = [
  "/backdrops/1.webp",
  "/backdrops/2.webp",
  "/backdrops/3.webp",
];
const TILE_COUNT = 40;
const ARTWORK_EVERY = 3;

function createTile(index: number): Tile {
  if (index % ARTWORK_EVERY === 1) {
    return { id: `artwork-${index}`, kind: "artwork", variant: index };
  }

  return {
    id: `photo-${index}`,
    image: BACKDROPS[index % BACKDROPS.length],
    kind: "photo",
    position: POSITIONS[index % POSITIONS.length],
    zoom: ZOOMS[index % ZOOMS.length],
  };
}

const TILES = Array.from({ length: TILE_COUNT }, (_, index) =>
  createTile(index)
);

const RANGES = ["Years", "Months", "All"];

function TileView(props: { tile: Tile }): ReactNode {
  const { tile } = props;

  if (tile.kind === "artwork") {
    return (
      <span className="tile">
        <Artwork variant={tile.variant} />
      </span>
    );
  }

  return (
    <span className="tile">
      <img
        alt=""
        className="tile__image"
        height={300}
        src={tile.image}
        style={{
          objectPosition: tile.position,
          transform: `scale(${tile.zoom})`,
          transformOrigin: tile.position,
        }}
        width={300}
      />
    </span>
  );
}

export function Photos(): ReactNode {
  return (
    <div className="screen photos">
      <div className="photos__scroll">
        <header className="photos__header">
          <h2 className="photos__title">Library</h2>
          <span className="photos__count">2,418 photos, 96 videos</span>
        </header>

        <div className="photos__grid">
          {TILES.map(function renderTile(tile) {
            return <TileView key={tile.id} tile={tile} />;
          })}
        </div>
      </div>

      <div className="photos__actions">
        <Glass height={48} tint={0.4} width={96}>
          <span className="glass-label">Select</span>
        </Glass>

        <Glass height={48} width={48}>
          <Icon name="search" />
        </Glass>
      </div>

      <div className="photos__dock">
        <Glass height={56} tint={0.5} width={330}>
          <span className="segments">
            {RANGES.map(function renderRange(range, index) {
              return (
                <span
                  className={
                    index === RANGES.length - 1
                      ? "segment segment--active"
                      : "segment"
                  }
                  key={range}
                >
                  {range}
                </span>
              );
            })}
          </span>
        </Glass>

        <Glass height={56} width={56}>
          <Icon name="filter" />
        </Glass>
      </div>
    </div>
  );
}
