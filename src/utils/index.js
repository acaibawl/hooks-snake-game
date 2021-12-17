export const initFields = (fieldSize, snakePosition) => {
  const fields = [];
  for (let i = 0; i < fieldSize; i++) {
    const cols = new Array(fieldSize).fill('');
    fields.push(cols);
  }

  fields[snakePosition.x][snakePosition.y] = 'snake';

  return fields;
}
