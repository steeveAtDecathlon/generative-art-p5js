import { events, sketch, converters, audio, grid, colors, midi, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 100,
    category: 'Grid'
  },
  {
    id: "grid-columns",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 500,
    defaultValue: 100,
    category: 'Grid'
  },
  {
    id: "grid-cell-centered",
    type: 'switch',
    label: 'Centered cell',
    defaultValue: true,
    category: 'Grid'
  }
] );

let direction = undefined;

sketch.setup((center) => {
  direction = center;
}, { type: 'webgl' });

function rotateVector(vector, center, angle) {
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);

  return ([
    (cosine * (vector.x - center.x)) + (sine * (vector.y - center.y)) + center.x,
    (cosine * (vector.y - center.y)) - (sine * (vector.x - center.x)) + center.y
  ]);
}

sketch.draw((time, center) => {
  const mouseAngle = time/8//map(mouseX, 0, width, -PI/2, PI/2)

  direction.add(0, 0.01)

  // translate( center )
  rotateX(radians(30))
  // rotateZ(map(sin(time), -1, 1, -PI, PI)/16)
  rotateX(map(cos(time), -1, 1, -PI, PI)/16)

  translate(0, 0, -500)

  background(0);

  const rows = options.get("grid-rows");
  const columns = options.get("grid-columns");

  const W = ( width / 2 ) * 1.5;
  const H = ( height / 2 ) * 1.5;

  const gridOptions = {
    topLeft: createVector( -W, -H ),
    topRight: createVector( W, -H ),
    bottomLeft: createVector( -W, H/2 ),
    bottomRight: createVector( W, H/2 ),
    rows,
    columns,
    centered: options.get("grid-cell-centered")
  }

  const scale = (width / columns);

  noiseDetail(16, 0.1)

  const zMax = scale * 10;

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const [ rotatedX, rotatedY ] = rotateVector(cellVector, center.div(2), mouseAngle);
    const xOff = rotatedX/columns;
    const yOff = rotatedY/rows;
    const angle = noise(xOff+direction.x, yOff+direction.y, time/5) * (TAU*4);

    push();
    translate( cellVector.x, cellVector.y );

    const z = zMax * cos(angle);

    // stroke(colors.rainbow({
    //   hueOffset: 0,
    //   hueIndex: map(z, -zMax, zMax, -PI, PI),
    //   hueIndex: map(sin(angle+time+(y/rows)*5), -1, 1, -PI, PI),
    //   opacityFactor: map(z, -zMax, zMax, 3, 1)
    // }))

    // stroke(colors.rainbow({
    //   hueOffset: 0,
    //   // hueIndex: map(z, -zMax, zMax, -PI, PI),
    //   hueIndex: map(angle, 0, TAU, -PI, PI)*2,
    //   opacityFactor: map(z, -zMax, zMax, 3, 1)
    // }))

    const colorFunction = mappers.circularIndex(noise(yOff, xOff, time/2)+time/2, [colors.rainbow,colors.purple])
    // const colorFunction = mappers.circularIndex(xOff+yOff+time, [colors.rainbow,colors.purple])

    stroke(colorFunction({
      hueOffset: 0,
      hueIndex: map(z, -zMax, zMax, -PI, PI),
      opacityFactor: map(z, -zMax, zMax, 3, 1),
      // opacityFactor: map(sin(time+angle*2), -1, 1, 3, 1)
    }))

    strokeWeight(3);

    let zz = 0// mappers.fn(cellVector.dist(center), 0, 200, 200, 0, easing.easeOutQuart)
    let yy = mappers.fn(y, 0, rows -1, 600, 0, easing.easeOutQuint) * sin(time)
    // const zz = mappers.fn(sin(2*time+cellVector.dist(center)), -1, 1, 0, 100, Object.entries(easing)[1][1])

    translate(scale * sin(angle), scale * cos(angle), z+ zz + yy )
    point( 0, 0);

    pop();
  })

  orbitControl();
});
