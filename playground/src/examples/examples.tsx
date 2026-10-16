import type { ReactNode } from "react";
import { Maps } from "./maps";
import { Messages } from "./messages";
import { Music } from "./music";
import { Photos } from "./photos";

const SCREENS = [
  {
    caption: "A floating header, buttons and a composer over a scrolling chat.",
    id: "messages",
    title: "Messages",
    view: <Messages />,
  },
  {
    caption: "A mini player and a tab bar over album art.",
    id: "music",
    title: "Music",
    view: <Music />,
  },
  {
    caption: "Search, controls and a place card over a map you can drag.",
    id: "maps",
    title: "Maps",
    view: <Maps />,
  },
  {
    caption: "Buttons and a segmented control over a photo grid.",
    id: "photos",
    title: "Photos",
    view: <Photos />,
  },
];

export function Examples(): ReactNode {
  return (
    <main className="playground examples">
      <header className="examples__header">
        <div className="examples__intro">
          <h1 className="examples__title">Examples</h1>

          <p className="examples__lead">
            Glass Surface over live interfaces. Everything behind the glass is
            regular DOM: Chromium refracts it through the SVG filter, other
            browsers frost it. Scroll the screens to see it bend.
          </p>
        </div>

        <a className="panel__button examples__back" href="/">
          Playground
        </a>
      </header>

      {SCREENS.map(function renderScreen(screen) {
        return (
          <section className="example" id={screen.id} key={screen.id}>
            <div className="example__header">
              <h2 className="example__title">{screen.title}</h2>
              <p className="example__caption">{screen.caption}</p>
            </div>

            {screen.view}
          </section>
        );
      })}
    </main>
  );
}
