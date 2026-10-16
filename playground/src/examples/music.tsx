import type { ReactNode } from "react";
import { Artwork, Avatar } from "./art";
import { Glass } from "./glass";
import { Icon, type IconName } from "./icons";

interface Album {
  artist: string;
  title: string;
}

interface Tab {
  icon: IconName;
  label: string;
}

const TOP_PICKS: Album[] = [
  { artist: "Lumen Avenue", title: "Refraction" },
  { artist: "The Prisms", title: "Soft Edges" },
  { artist: "Nora Kim", title: "Bauhaus Tapes" },
];

const RECENT: Album[] = [
  { artist: "Arches", title: "Half Light" },
  { artist: "Memphis Club", title: "Squiggle" },
  { artist: "Sage", title: "Field Notes" },
  { artist: "Lumen Avenue", title: "Caustics" },
  { artist: "Dot Matrix", title: "Polka" },
  { artist: "The Prisms", title: "Spectrum" },
];

const MADE_FOR_YOU: Album[] = [
  { artist: "Updated today", title: "Morning Mix" },
  { artist: "Updated Friday", title: "Focus" },
  { artist: "Updated Monday", title: "New Music" },
  { artist: "Updated today", title: "Chill" },
  { artist: "Updated Sunday", title: "Favourites" },
  { artist: "Updated today", title: "Replay" },
];

const TABS: Tab[] = [
  { icon: "home", label: "Home" },
  { icon: "grid", label: "New" },
  { icon: "radio", label: "Radio" },
  { icon: "library", label: "Library" },
];

function Shelf(props: {
  albums: Album[];
  large?: boolean;
  offset: number;
  title: string;
}): ReactNode {
  const { albums, large = false, offset, title } = props;

  return (
    <section className="shelf">
      <h3 className="shelf__title">{title}</h3>

      <div className={large ? "shelf__row shelf__row--large" : "shelf__row"}>
        {albums.map(function renderAlbum(album, index) {
          return (
            <figure className="album" key={album.title}>
              <Artwork variant={offset + index} />

              <figcaption className="album__caption">
                <span className="album__title">{album.title}</span>
                <span className="album__artist">{album.artist}</span>
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}

export function Music(): ReactNode {
  return (
    <div className="screen music">
      <div className="music__scroll">
        <h2 className="music__heading">Listen Now</h2>

        <Shelf albums={TOP_PICKS} large offset={0} title="Top Picks" />

        <Shelf albums={RECENT} offset={3} title="Recently Played" />

        <Shelf albums={MADE_FOR_YOU} offset={9} title="Made for You" />
      </div>

      <div className="music__account">
        <Glass height={52} width={52}>
          <Avatar name="Sam Lee" size={36} tone={2} />
        </Glass>
      </div>

      <div className="music__dock">
        <Glass height={64} tint={0.5} width={540}>
          <span className="player">
            <span className="player__cover">
              <Artwork variant={0} />
            </span>

            <span className="glass-stack">
              <span className="glass-label">Refraction</span>
              <span className="glass-caption">Lumen Avenue</span>
            </span>

            <span className="glass-icons">
              <Icon name="play" />
              <Icon name="next" />
            </span>
          </span>
        </Glass>

        <div className="music__tabs">
          <Glass height={68} tint={0.5} width={420}>
            <span className="tabs">
              {TABS.map(function renderTab(tab, index) {
                return (
                  <span
                    className={index === 0 ? "tab tab--active" : "tab"}
                    key={tab.label}
                  >
                    <Icon name={tab.icon} />
                    {tab.label}
                  </span>
                );
              })}
            </span>
          </Glass>

          <Glass height={68} width={68}>
            <Icon name="search" />
          </Glass>
        </div>
      </div>
    </div>
  );
}
