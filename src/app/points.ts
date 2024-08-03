import { Points } from 'trianglify';

export function getPoints(
  width: number,
  height: number,
  cellSize: number
): Points {
  if (width <= 0 || height <= 0 || cellSize <= 0) {
    throw new Error('Width, height, and cell size must be greater than zero.');
  }

  const cellWidth = (Math.sqrt(3) / 2) * cellSize;
  const halfCellSize = cellSize / 2;

  // Pad by 2 cells outside the visible area on each side to ensure we fully cover the 'artboard'
  const colCount = Math.floor(width / cellWidth) + 4;
  const rowCount = Math.floor(height / cellSize) + 4;

  // Determine bleed values to ensure that the grid is centered within the artboard
  const bleedX = (colCount * cellWidth - width) / 2;
  const bleedY = (rowCount * cellSize - height) / 2;

  const points: Points = [];

  for (let y = 0; y < rowCount; y++) {
    for (let x = 0; x < colCount; x++) {
      const offsetY = x % 2 === 1 ? halfCellSize : 0;
      const xPos = -bleedX + x * cellWidth;
      const yPos = -bleedY + y * cellSize + offsetY;

      points.push([xPos, yPos]);
    }
  }

  return points;
}
