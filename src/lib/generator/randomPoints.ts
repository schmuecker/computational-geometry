import { Point } from "../geometry";

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomPoints(
  amount = 10,
  lowerX = 0,
  upperX = 400,
  lowerY = 0,
  upperY = 400
) {
  const randomPoints = [];
  for (let i = 0; i < amount; i++) {
    const x = getRandomInt(lowerX, upperX);
    const y = getRandomInt(lowerY, upperY);
    randomPoints.push(new Point(x, y));
  }
  return randomPoints;
}

export default generateRandomPoints;
