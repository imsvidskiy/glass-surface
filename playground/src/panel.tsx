import { type ReactNode, useCallback, useState } from "react";
import { SegmentedControl } from "./controls/segmented-control";
import { SelectControl } from "./controls/select-control";
import { SliderControl } from "./controls/slider-control";
import { ToggleControl } from "./controls/toggle-control";
import { PanelGroup } from "./panel-group";
import {
  BLEND_MODES,
  COLOR_CHANNELS,
  RENDERERS,
  type SettingChangeHandler,
  type Settings,
  SLIDER_SECTIONS,
} from "./settings";
import { createSnippet } from "./snippet";

type PanelProps = {
  onChange: SettingChangeHandler;
  onReset: () => void;
  settings: Settings;
};

const COPIED_NOTICE_DURATION = 1500;

export function Panel({ onChange, onReset, settings }: PanelProps): ReactNode {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(createSnippet(settings));

    setIsCopied(true);

    setTimeout(() => {
      setIsCopied(false);
    }, COPIED_NOTICE_DURATION);
  }, [
    settings,
  ]);

  return (
    <section className="panel">
      <header className="panel__header">
        <h2 className="panel__title">Customize</h2>

        <div className="panel__actions">
          <button className="panel__button" onClick={handleCopy} type="button">
            {isCopied ? "Copied" : "Copy code"}
          </button>

          <button className="panel__button" onClick={onReset} type="button">
            Reset
          </button>
        </div>
      </header>

      <PanelGroup title="Surface">
        <SegmentedControl
          label="Renderer"
          name="renderer"
          onChange={onChange}
          options={RENDERERS}
          value={settings.renderer}
        />

        <ToggleControl isChecked={settings.refraction} label="Refraction" name="refraction" onChange={onChange} />
      </PanelGroup>

      {SLIDER_SECTIONS.map((section) => {
        return (
          <PanelGroup key={section.title} title={section.title}>
            {section.sliders.map((slider) => {
              return (
                <SliderControl key={slider.name} onChange={onChange} slider={slider} value={settings[slider.name]} />
              );
            })}
          </PanelGroup>
        );
      })}

      <PanelGroup title="Displacement map">
        <SegmentedControl
          label="X channel"
          name="xChannel"
          onChange={onChange}
          options={COLOR_CHANNELS}
          value={settings.xChannel}
        />

        <SegmentedControl
          label="Y channel"
          name="yChannel"
          onChange={onChange}
          options={COLOR_CHANNELS}
          value={settings.yChannel}
        />

        <SelectControl
          label="Blend mode"
          name="mixBlendMode"
          onChange={onChange}
          options={BLEND_MODES}
          value={settings.mixBlendMode}
        />
      </PanelGroup>
    </section>
  );
}
