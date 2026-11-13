import { type ReactNode, useCallback, useState } from "react";
import { SegmentedControl } from "./controls/segmented-control";
import { Panel } from "./panel";
import {
  BACKDROP_NAMES,
  DEFAULT_BACKDROP_NAME,
  DEFAULT_SETTINGS,
  type SettingChangeHandler,
  type Settings,
} from "./settings";
import { Stage } from "./stage";

export function App(): ReactNode {
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
    <main className="playground">
      <div className="toolbar">
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
