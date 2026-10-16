import {
  createGlassSurfaceController,
  type GlassSurfaceController,
} from "./controller";
import { describeFilter, FILTER_REGION, type SvgAttributes } from "./filter";
import {
  getSurfaceClasses,
  getSurfaceOverrides,
  getSurfaceProperties,
  toFilterId,
} from "./styles";
import type { GlassSurfaceInput } from "./types";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const DECORATION_LAYERS = ["frame", "sheen", "rim", "glow", "line"] as const;

let instanceCount = 0;

export interface GlassSurfaceInstance {
  readonly controller: GlassSurfaceController;

  /** Restores the element to its original state. */
  destroy: () => void;

  /** Merges the given options into the current ones. */
  update: (input: GlassSurfaceInput) => void;
}

function createSvgElement(tag: string, attributes: SvgAttributes): SVGElement {
  const node = document.createElementNS(SVG_NAMESPACE, tag);

  for (const [name, value] of Object.entries(attributes)) {
    node.setAttribute(name, String(value));
  }

  return node;
}

function createPart(tag: "canvas" | "div" | "span", name: string): HTMLElement {
  const part = document.createElement(tag);

  part.className = `glass-surface__${name}`;

  return part;
}

function createDecoration(name: string): HTMLElement {
  const decoration = createPart("span", name);

  decoration.ariaHidden = "true";

  return decoration;
}

/** Turns an existing element into a glass surface; its children are moved into the content layer. */
export function createGlassSurface(
  element: HTMLElement,
  input: GlassSurfaceInput = {}
): GlassSurfaceInstance {
  instanceCount += 1;

  const filterId = toFilterId(String(instanceCount));
  const controller = createGlassSurfaceController(input);

  const filterRoot = createSvgElement("svg", {
    "aria-hidden": "true",
    class: "glass-surface__filter",
  });

  const canvas = createPart("canvas", "canvas");
  const decorations = DECORATION_LAYERS.map(createDecoration);
  const content = createPart("div", "content");

  content.append(...element.childNodes);
  element.append(filterRoot, canvas, ...decorations, content);

  let currentInput = input;
  let appliedClasses: string[] = [];
  let appliedProperties: string[] = [];

  function render(): void {
    const state = controller.getState();
    const options = controller.getOptions();
    const properties: Record<string, string> = {
      ...getSurfaceProperties(filterId, options, state),
      ...getSurfaceOverrides(options, state),
    };

    element.classList.remove(...appliedClasses);
    appliedClasses = getSurfaceClasses(state);
    element.classList.add(...appliedClasses);

    for (const name of appliedProperties) {
      element.style.removeProperty(name);
    }

    for (const [name, value] of Object.entries(properties)) {
      element.style.setProperty(name, value);
    }

    appliedProperties = Object.keys(properties);

    const filter = createSvgElement("filter", {
      id: filterId,
      ...FILTER_REGION,
    });
    const primitives = describeFilter(options, state.displacementMap);

    for (const { tag, result, attributes } of primitives) {
      filter.append(createSvgElement(tag, { result, ...attributes }));
    }

    filterRoot.replaceChildren(filter);
  }

  const unsubscribe = controller.subscribe(render);
  const unmount = controller.mount(element);

  return {
    controller,

    destroy() {
      unmount();
      unsubscribe();

      element.classList.remove(...appliedClasses);

      for (const name of appliedProperties) {
        element.style.removeProperty(name);
      }

      element.replaceChildren(...content.childNodes);
    },

    update(nextInput) {
      currentInput = { ...currentInput, ...nextInput };
      controller.setOptions(currentInput);
    },
  };
}
