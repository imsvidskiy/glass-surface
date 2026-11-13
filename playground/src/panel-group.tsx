import type { PropsWithChildren, ReactNode } from "react";

type PanelGroupProps = PropsWithChildren<{
  title: string;
}>;

export function PanelGroup({ children, title }: PanelGroupProps): ReactNode {
  return (
    <div className="panel__group">
      <h3 className="panel__heading">{title}</h3>

      <div className="panel__grid">{children}</div>
    </div>
  );
}
