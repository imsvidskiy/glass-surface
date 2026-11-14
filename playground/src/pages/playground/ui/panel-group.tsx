import "./panel-group.css";

import type { PropsWithChildren, ReactNode } from "react";

type PanelGroupProps = PropsWithChildren<{
  title: string;
}>;

export function PanelGroup({ children, title }: PanelGroupProps): ReactNode {
  return (
    <div className="panel-group">
      <h3 className="panel-group__heading">{title}</h3>

      <div className="panel-group__grid">{children}</div>
    </div>
  );
}
