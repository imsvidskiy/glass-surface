import type { ReactNode } from "react";
import type { PresetName } from "./settings";

const ICON_PATHS = {
  heart:
    "M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 10c0 5.65-7 10-7 10Z",
  home: "M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1Z",
  search: "M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14Zm5-2 4 4",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
} as const;

type IconName = keyof typeof ICON_PATHS;

const TAB_BAR_ICONS: { label: string; name: IconName }[] = [
  { label: "Home", name: "home" },
  { label: "Search", name: "search" },
  { label: "Favorites", name: "heart" },
  { label: "Profile", name: "user" },
];

function Icon(props: { name: IconName }): ReactNode {
  return (
    <svg aria-hidden="true" className="icon" fill="none" viewBox="0 0 24 24">
      <path d={ICON_PATHS[props.name]} />
    </svg>
  );
}

function TabBar(): ReactNode {
  return (
    <nav className="tab-bar">
      {TAB_BAR_ICONS.map(function renderTab(tab) {
        return (
          <button
            aria-label={tab.label}
            className="tab-bar__item"
            key={tab.name}
            type="button"
          >
            <Icon name={tab.name} />
          </button>
        );
      })}
    </nav>
  );
}

function Card(): ReactNode {
  return (
    <article className="card">
      <h2 className="card__title">Liquid glass</h2>

      <p className="card__text">
        Drag the surface over the backdrop and tune every parameter below.
      </p>
    </article>
  );
}

export const PRESET_CONTENT: Record<PresetName, ReactNode> = {
  button: <span className="label">Get started</span>,
  card: <Card />,
  tabBar: <TabBar />,
};
