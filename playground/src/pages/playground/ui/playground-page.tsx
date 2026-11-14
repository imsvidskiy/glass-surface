import "./playground-page.css";

import { type ReactNode, useCallback, useState } from "react";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import {
  BACKDROP_NAMES,
  DEFAULT_BACKDROP_NAME,
  DEFAULT_SETTINGS,
  type SettingChangeHandler,
  type Settings,
} from "../model/settings";
import { Panel } from "./panel";
import { Stage } from "./stage";

export function PlaygroundPage(): ReactNode {
  const [backdropName, setBackdropName] = useState(DEFAULT_BACKDROP_NAME);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const handleSettingChange = useCallback<SettingChangeHandler>((value, name) => {
    setSettings((current): Settings => {
      return {
        ...current,
        [name]: value,
      };
    });
  }, []);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  return (
    <main className="playground-page">
      <div className="playground-page__toolbar">
        <SegmentedControl
          label="Backdrop"
          name="backdrop"
          onChange={setBackdropName}
          options={BACKDROP_NAMES}
          value={backdropName}
        />
      </div>

      <Stage backdropName={backdropName} settings={settings} />

      <Panel onChange={handleSettingChange} onReset={handleReset} settings={settings} />
    </main>
  );
}
