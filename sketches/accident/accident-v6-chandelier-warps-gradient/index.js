let target = null;

function setup() {
    // utils.canvas.create(utils.presets.FILL);
    // utils.canvas.create(utils.presets.SQUARE.RETINA);
    // utils.canvas.create(utils.presets.SQUARE.HD);
    utils.canvas.create({ width: 768, height: 1368 });
    // utils.canvas.create({ width: 768/2, height: 1368/2 });
    
    utils.events.fullScreenOnDoubleClick();
    utils.events.extendCanvasOnResize();
    utils.events.pauseOnSpaceKeyPressed();
    utils.events.toggleCanvasRecordingOnKey();
    utils.events.toggleFPSCounter();
    
    noStroke();

  const xCount = 1;
  const yCount = 3;
  const size = (width + height) / 2 / (xCount + yCount) / 3.5;

  // for (let x = 1; x <= xCount; x++) {
  //   for (let y = 1; y <= yCount; y++) {
  //     shapes.push(
  //       new Spiral({
  //         size,
  //         start: createVector(0, -height / 3),
  //         end: createVector(0, height / 3),
  //         relativePosition: {
  //           x: x / (xCount + 1),
  //           y: y / (yCount + 1),
  //         },
  //       })
  //     );
  //   }
  // }

   for (let x = 1; x <= xCount; x++) {
     for (let y = 1; y <= yCount; y++) {
       shapes.push(
         new Spiral({
           size,
           start: createVector(-width / 3, 0),
           end: createVector(width / 3, 0),
           relativePosition: {
             x: x / (xCount + 1),
             y: y / (yCount + 1),
           },
         })
       );
     }
   }
}

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
    const waveAmplitude = size / 1.5//map(sin(time), -1, 1, 1, 2);

    target.push();
    target.translate(position.x, position.y);

    const lerpStep = 1 / 350; //map(mouseY, height, 0, 1, 200, true);


    for (let lerpIndex = 0; lerpIndex < 1; lerpIndex += lerpStep) {
      //       const f = 15//map(lerpIndex, 0, 1, 1, 30)
      //       const opacityFactor = map(
      //         lerpIndex,
      //         0,
      //         1,
      //         map(
      //           sin(lerpIndex*f + time * 3),
      //           -1,
      //           1,
      //           1,
      //           2
      //         ),
      //         1
      //       );

      let angle = map(
        lerpIndex,
        0,
        1.5,
        map(sin(time / 2), -1, 1, -TAU, TAU),
        -map(cos(time / 2), -1, 1, -TAU, TAU)
      );
      // angle = lerpIndex * 10;
      // angle = map(
      //   lerpIndex,
      //   0,
      //   1.5,
      //   sin(lerpIndex) * TAU,
      //   cos(lerpIndex) * TAU
      // );
      //  angle = map(lerpIndex, 0, 1/5, cos(TAU*lerpIndex), sin(TAU*lerpIndex));
      //  angle = map(
      //    lerpIndex,
      //    0,
      //    1.5,
      //    sin(lerpIndex) * TAU,
      //    cos(lerpIndex) * TAU
      //  );
      //  angle = map(
      //    lerpIndex,
      //    0,
      //    1 / map(sin(time + index), -1, 1, -8, 8),
      //    cos(lerpIndex * PI),
      //    sin(lerpIndex * PI)
      //  );
       angle += map(
         lerpIndex,
         0,
         1 / map(sin(time+index), -1, 1, -4, 4),
         cos(lerpIndex * map(cos(time), -1, 1, -PI, PI)),
         sin(lerpIndex * map(sin(time), -1, 1, -PI, PI))
       );
      // angle = lerpIndex * 12;
      const lerpPosition = p5.Vector.lerp(start, end, lerpIndex);
      let waveIndex = angle * sin(-time + lerpIndex + index);
      waveIndex = angle + time;
      const xOffset = map(sin(waveIndex), -1, 1, -waveAmplitude, waveAmplitude);
      const yOffset = map(cos(waveIndex), 1, -1, -waveAmplitude, waveAmplitude);

       const f = map(lerpIndex, 0, 1, 1, 10);
       const opacityFactor = map(
         lerpIndex,
         0,
         1,
         map(sin(lerpIndex * 10 + time), -1, 1, 1, 10),
         1
       );

      target.fill(
        map(sin(angle + hueCadence), -1, 1, 0, 360) / opacityFactor,
        map(cos(angle - hueCadence), -1, 1, 0, 255) / opacityFactor,
        map(sin(angle + hueCadence), -1, 1, 255, 0) / opacityFactor
      );

      let s = 30;
       s = map(sin(time + waveIndex * 2), -1, 1, 10, 50) * map(cos(time + index * 2), -1, 1, 1, 2);

      // target.translate(
      //   0,
      //   map(sin(waveIndex + lerpIndex + index), -1, 1, -1, 1)
      // );

      const c = map(sin(time+waveIndex), -1, 1, 2, 5);

      for (let i = 0; i < c; i++) {
        const x = lerp(
          lerpPosition.x + xOffset,
          lerpPosition.x - xOffset,
          i / c
        );
        const y = lerp(
          lerpPosition.y + yOffset,
          lerpPosition.y - yOffset,
          i / c
        );

        target.circle(x, y, s);
      }

      // target.circle(lerpPosition.x + xOffset, lerpPosition.y + yOffset, s);
      // target.circle(lerpPosition.x - xOffset, lerpPosition.y - yOffset, s);
    }

    target.pop();
  }
}

utils.sketch.draw( time => {
  background(0);

  shapes.forEach((shape, index) => shape.draw(time, index, window));
});
// 