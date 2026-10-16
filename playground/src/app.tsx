import { GlassSurface } from "@svidskiy/glass-surface-react";
import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import {
  SegmentedControl,
  SelectControl,
  SliderControl,
  ToggleControl,
} from "./controls";
import {
  BACKDROP_OPTIONS,
  type BackdropName,
  BLEND_MODE_OPTIONS,
  CHANNEL_OPTIONS,
  findSlider,
  type NumericSetting,
  PRESET_OPTIONS,
  PRESET_SETTINGS,
  type PresetName,
  RENDERER_OPTIONS,
  type Settings,
  SLIDER_SECTIONS,
} from "./settings";
import { createSnippet } from "./snippet";
import { useDrag } from "./use-drag";

const BACKDROP_WIDTH = 1920;
const BACKDROP_HEIGHT = 1200;

const COPIED_NOTICE_DURATION = 1500;

function useSettingUpdater<Key extends keyof Settings>(
  key: Key,
  setSettings: Dispatch<SetStateAction<Settings>>
): (value: Settings[Key]) => void {
  return useCallback(
    function updateSetting(value: Settings[Key]) {
      setSettings(function applySetting(current) {
        return { ...current, [key]: value };
      });
    },
    [key, setSettings]
  );
}

export function App(): ReactNode {
  const stageRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLImageElement>(null);

  const [settings, setSettings] = useState<Settings>(PRESET_SETTINGS.tabBar);
  const [backdrop, setBackdrop] = useState<BackdropName>("1");
  const [copied, setCopied] = useState(false);

  const drag = useDrag(stageRef);

  const updateRenderer = useSettingUpdater("renderer", setSettings);
  const updateXChannel = useSettingUpdater("xChannel", setSettings);
  const updateYChannel = useSettingUpdater("yChannel", setSettings);
  const updateBlendMode = useSettingUpdater("mixBlendMode", setSettings);
  const updateRefraction = useSettingUpdater("refraction", setSettings);

  const { preset, ...surfaceSettings } = settings;

  const updateNumber = useCallback(function applyNumberSetting(
    key: NumericSetting,
    value: number
  ) {
    setSettings(function applyNumber(current) {
      return { ...current, [key]: value };
    });
  }, []);

  const choosePreset = useCallback(function selectPreset(name: PresetName) {
    setSettings(PRESET_SETTINGS[name]);
  }, []);

  const resetSettings = useCallback(function restorePreset() {
    setSettings(function applyPreset(current) {
      return PRESET_SETTINGS[current.preset];
    });
  }, []);

  const copySnippet = useCallback(
    async function writeSnippet() {
      await navigator.clipboard.writeText(createSnippet(settings));

      setCopied(true);

      setTimeout(function hideNotice() {
        setCopied(false);
      }, COPIED_NOTICE_DURATION);
    },
    [settings]
  );

  const handleStyle = {
    left: `${drag.position.x * 100}%`,
    top: `${drag.position.y * 100}%`,
  };

  return (
    <main className="playground">
      <div className="toolbar">
        <SegmentedControl
          label="Preset"
          onChange={choosePreset}
          options={PRESET_OPTIONS}
          value={preset}
        />

        <SegmentedControl
          label="Backdrop"
          onChange={setBackdrop}
          options={BACKDROP_OPTIONS}
          value={backdrop}
        />
      </div>

      <div className="stage" ref={stageRef}>
        <img
          alt=""
          className="stage__backdrop"
          height={BACKDROP_HEIGHT}
          ref={backdropRef}
          src={`/backdrops/${backdrop}.webp`}
          width={BACKDROP_WIDTH}
        />

        <div
          className="stage__handle"
          onPointerCancel={drag.handlePointerUp}
          onPointerDown={drag.handlePointerDown}
          onPointerMove={drag.handlePointerMove}
          onPointerUp={drag.handlePointerUp}
          style={handleStyle}
        >
          <GlassSurface {...surfaceSettings} backdrop={backdropRef} />
        </div>
      </div>

      <section className="panel">
        <header className="panel__header">
          <h2 className="panel__title">Customize</h2>

          <div className="panel__actions">
            <button
              className="panel__button"
              onClick={copySnippet}
              type="button"
            >
              {copied ? "Copied" : "Copy code"}
            </button>

            <button
              className="panel__button"
              onClick={resetSettings}
              type="button"
            >
              Reset
            </button>
          </div>
        </header>

        <div className="panel__group">
          <h3 className="panel__heading">Surface</h3>

          <div className="panel__grid">
            <SegmentedControl
              label="Renderer"
              onChange={updateRenderer}
              options={RENDERER_OPTIONS}
              value={settings.renderer}
            />

            <ToggleControl
              checked={settings.refraction}
              label="Refraction"
              onChange={updateRefraction}
            />
          </div>
        </div>

        {SLIDER_SECTIONS.map(function renderSection(section) {
          return (
            <div className="panel__group" key={section.title}>
              <h3 className="panel__heading">{section.title}</h3>

              <div className="panel__grid">
                {section.sliders.map(function renderSlider(key) {
                  return (
                    <SliderControl
                      key={key}
                      onChange={updateNumber}
                      slider={findSlider(key)}
                      value={settings[key]}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="panel__group">
          <h3 className="panel__heading">Displacement map</h3>

          <div className="panel__grid">
            <SegmentedControl
              label="X channel"
              onChange={updateXChannel}
              options={CHANNEL_OPTIONS}
              value={settings.xChannel}
            />

            <SegmentedControl
              label="Y channel"
              onChange={updateYChannel}
              options={CHANNEL_OPTIONS}
              value={settings.yChannel}
            />

            <SelectControl
              label="Blend mode"
              onChange={updateBlendMode}
              options={BLEND_MODE_OPTIONS}
              value={settings.mixBlendMode}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
