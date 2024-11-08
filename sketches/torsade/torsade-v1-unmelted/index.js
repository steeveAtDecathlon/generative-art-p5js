import { shapes, sketch, converters, events, colors, mappers } from './utils/index.js';

sketch.setup(() => {
  const xCount = 1;
  const yCount = 1;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  for (let x = 1; x <= xCount; x++) {
    for (let y = 1; y <= yCount; y++) {
      shapes.push(
        new Spiral({
          size,
          start: createVector(0, -height / 2),
          end: createVector(0, height / 2),
          relativePosition: {
            x: x / (xCount + 1),
            y: y / (yCount + 1),
          },
        })
      );
    }
  }
} )

class Spiral {
  constructor(options) {
    Object.assign(this, options);
    this.calculateRelativePosition();
  }

  calculateRelativePosition() {
    this.position = createVector(
      lerp(0, width, this.relativePosition.x),
      lerp(0, height, this.relativePosition.y)
    );
  }

  onWindowResized() {
    this.calculateRelativePosition();
  }

  draw(time, index, target) {
    let { position, size, start, end } = this;

    const hueCadence = index + time;
    const waveAmplitude = size / 2.5; //map(sin(time), -1, 1, size / 8, size / 7.5);

    target.push();
    target.translate(position.x, position.y);

    const lerpStep = 1 / 300; //map(mouseY, height, 0, 1, 200, true);

    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      const angle = map(lerpIndex, 0, 1, -PI, PI);
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      const cadence = map(sin(-time + lerpIndex + index), -1, 1, -4, 4);
      const waveIndex = angle * cadence;
      const xOffset = map(sin(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);
      const yOffset = map(cos(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);

      target.fill(
        map(sin(angle + hueCadence), -1, 1, 0, 360),
        map(cos(angle + hueCadence), -1, 1, 0, 255),
        map(sin(angle + hueCadence), -1, 1, 255, 0)
      );

      target.circle(lerpPosition.x + xOffset, lerpPosition.y + yOffset, 100);
      target.circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, 100);
    }

    target.pop();
  }
}

sketch.draw( time => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index, window));
});
