const BASE_COLUMN = 65;

export function convertGridToCordinate(row: number, col: number): string {
  const colChar = String.fromCharCode(col + BASE_COLUMN);
  const rowNum = row + 1;
  return `${colChar}${rowNum}`;
}
