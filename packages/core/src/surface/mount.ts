import type { GlassSurfaceInput } from "../options";
import { createGlassSurfaceController } from "./controller";
import { describeFilter, type FilterDescription, type FilterPrimitive, type SvgAttributes } from "./filter";
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

function setAttributes(node: Element, attributes: SvgAttributes): void {
  for (const [name, value] of Object.entries(attributes)) {
    const text = String(value);

    if (node.getAttribute(name) !== text) {
      node.setAttribute(name, text);
    }
  }
}

function createSvgElement(tag: string, attributes: SvgAttributes): SVGElement {
  const node = document.createElementNS(SVG_NAMESPACE, tag);

  setAttributes(node, attributes);

  return node;
}

function toPrimitiveAttributes({ attributes, result }: FilterPrimitive): SvgAttributes {
  return {
    result,
    ...attributes,
  };
}

function createFilter({ attributes, primitives }: FilterDescription): SVGElement {
  const filter = createSvgElement("filter", attributes);

  for (const primitive of primitives) {
    filter.append(createSvgElement(primitive.tag, toPrimitiveAttributes(primitive)));
  }

  return filter;
}

function updateFilter(filter: Element, { attributes, primitives }: FilterDescription): void {
  setAttributes(filter, attributes);

  for (const [index, primitive] of primitives.entries()) {
    setAttributes(filter.children[index], toPrimitiveAttributes(primitive));
  }
}

function renderFilter(root: SVGElement, description: FilterDescription | null): void {
  const filter = root.firstElementChild;

  if (description === null) {
    root.replaceChildren();

    return;
  }

  if (filter === null) {
    root.append(createFilter(description));

    return;
  }

  updateFilter(filter, description);
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

  function render(): void {
    const options = controller.getOptions();
    const state = controller.getState();
    const properties = getSurfaceProperties(filterId, options, state);

    clear();

    appliedClasses = getSurfaceClasses(state);
    appliedProperties = Object.keys(properties);

    element.classList.add(...appliedClasses);

    for (const [name, value] of Object.entries(properties)) {
      element.style.setProperty(name, value);
    }

    renderFilter(filterRoot, describeFilter(filterId, options, state));
  }

  content.append(...element.childNodes);
  element.append(filterRoot, canvas, ...DECORATIONS.map(createDecoration), content);

  const unmount = controller.mount(element);
  const unsubscribe = controller.subscribe(render);

  render();

  function destroy(): void {
    unmount();
    unsubscribe();
    clear();

    element.replaceChildren(...content.childNodes);
  }

  function update(nextInput: GlassSurfaceInput): void {
    currentInput = {
      ...currentInput,
      ...nextInput,
    };

    controller.setOptions(currentInput);
  }

  return {
    destroy,
    update,
  };
}
