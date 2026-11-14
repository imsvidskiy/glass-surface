import { isEmptySize, type Rectangle, type Size } from "../lib/geometry";

export type ObjectFitStyle = {
  objectFit: string;
  objectPosition: string;
};

const DEFAULT_POSITION = "50%";

function getFitScale(bounds: Size, natural: Size, fit: string): number {
  const horizontal = bounds.width / natural.width;
  const vertical = bounds.height / natural.height;

  switch (fit) {
    case "cover": {
      return Math.max(horizontal, vertical);
    }

    case "contain": {
      return Math.min(horizontal, vertical);
    }

    case "none": {
      return 1;
    }

    default: {
      return Math.min(1, horizontal, vertical);
    }
  }
}

function placeAlongAxis(freeSpace: number, position: string): number {
  const value = Number.parseFloat(position);

  if (position.endsWith("%")) {
    return (value / 100) * freeSpace;
  }

  if (Number.isFinite(value)) {
    return value;
  }

  return freeSpace / 2;
}

export function fitObject(bounds: Rectangle, natural: Size, { objectFit, objectPosition }: ObjectFitStyle): Rectangle {
  if (objectFit === "fill") {
    return bounds;
  }

  if (isEmptySize(natural)) {
    return bounds;
  }

  const scale = getFitScale(bounds, natural, objectFit);
  const width = natural.width * scale;
  const height = natural.height * scale;
  const [horizontal = DEFAULT_POSITION, vertical = horizontal] = objectPosition.split(" ");

  return {
    height,
    width,
    x: bounds.x + placeAlongAxis(bounds.width - width, horizontal),
    y: bounds.y + placeAlongAxis(bounds.height - height, vertical),
  };
}
