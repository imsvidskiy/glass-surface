import type { GlassSurfaceInput } from "../types";
import { createGlassSurfaceController } from "./controller";
import { describeFilter, type SvgAttributes } from "./filter";
import { getSurfaceClasses, getSurfaceProperties, toFilterId } from "./styles";

export type GlassSurfaceInstance = {
  destroy: () => void;
  update: (input: GlassSurfaceInput) => void;
};

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const DECORATIONS = [
  "frame",
  "glow",
  "line",
];

let instanceCount = 0;

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

export function createGlassSurface(element: HTMLElement, input: GlassSurfaceInput = {}): GlassSurfaceInstance {
  instanceCount += 1;

  const filterId = toFilterId(String(instanceCount));
  const controller = createGlassSurfaceController(input);
  const canvas = createPart("canvas", "canvas");
  const content = createPart("div", "content");

  const filterRoot = createSvgElement("svg", {
    "aria-hidden": "true",
    class: "glass-surface__filter",
  });

  let currentInput = input;
  let appliedClasses: string[] = [];
  let appliedProperties: string[] = [];

  function clear(): void {
    element.classList.remove(...appliedClasses);

    for (const name of appliedProperties) {
      element.style.removeProperty(name);
    }
  }

  function renderFilter(): void {
    const description = describeFilter(filterId, controller.getOptions(), controller.getState());

    if (description === null) {
      filterRoot.replaceChildren();

      return;
    }

    const filter = createSvgElement("filter", description.attributes);

    for (const { attributes, result, tag } of description.primitives) {
      filter.append(
        createSvgElement(tag, {
          result,
          ...attributes,
        })
      );
    }

    filterRoot.replaceChildren(filter);
  }

  function render(): void {
    const state = controller.getState();
    const properties = getSurfaceProperties(filterId, controller.getOptions(), state);

    clear();

    appliedClasses = getSurfaceClasses(state);
    appliedProperties = Object.keys(properties);

    element.classList.add(...appliedClasses);

    for (const [name, value] of Object.entries(properties)) {
      element.style.setProperty(name, value);
    }

    renderFilter();
  }

  content.append(...element.childNodes);
  element.append(filterRoot, canvas, ...DECORATIONS.map(createDecoration), content);

  const unmount = controller.mount(element);
  const unsubscribe = controller.subscribe(render);

  render();

  return {
    destroy() {
      unmount();
      unsubscribe();
      clear();

      element.replaceChildren(...content.childNodes);
    },

    update(nextInput) {
      currentInput = {
        ...currentInput,
        ...nextInput,
      };

      controller.setOptions(currentInput);
    },
  };
}
