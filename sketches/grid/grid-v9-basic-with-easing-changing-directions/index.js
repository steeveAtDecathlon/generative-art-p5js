import { events, sketch, converters, audio, grid, colors, midi, animation, mappers, iterators, options, easing } from './utils/index.js';

options.add( [
  {
    id: "grid-rows",
    type: 'slider',
    label: 'Rows',
    min: 1,
    max: 200,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-cols",
    type: 'slider',
    label: 'Cols',
    min: 1,
    max: 200,
    defaultValue: 40,
    category: 'Grid'
  },
  {
    id: "grid-cell-centered",
    type: 'switch',
    label: 'Centered cell',
    defaultValue: true,
    category: 'Grid'
  },
  {
    id: "grid-multiply-over-time",
    type: 'switch',
    label: 'Multiply size over time',
    defaultValue: false,
    category: 'Grid'
  },
  {
    id: "grid-multiply-over-time-min",
    label: 'Multiplier min',
    type: 'slider',
    min: 1,
    max: 10,
    defaultValue: 2,
    category: 'Grid'
  },
  {
    id: "grid-multiply-over-time-max",
    label: 'Multiplier max',
    type: 'slider',
    min: 1,
    max: 10,
    defaultValue: 4,
    category: 'Grid'
  },
] );


let clickCount = 0;

sketch.setup(() => {
  events.register("mousePressed", () => {
    console.log(clickCount++);
  });
});

let min = Math.PI, max = 0;
let xOff = 0, yOff = 0;

sketch.draw((time) => {
  background(0);

  const n = options.get("grid-multiply-over-time") ? mappers.fn(
    sin(time/2),
    -1,
    1,
    options.get("grid-multiply-over-time-min"),
    options.get("grid-multiply-over-time-max"),
    easing.easeInBounce
    ) : 1;
  const rows = options.get("grid-rows")*n;
  const cols = options.get("grid-cols")*n;

  const gridOptions = {
    startLeft: createVector( 0, 0 ),
    startRight: createVector( width, 0 ),
    endLeft: createVector( 0, height ),
    endRight: createVector( width, height ),
    rows,
    cols,
    centered: options.get("grid-cell-centered")
  }

  // const hueMax = PI/2;

  noFill();

  const easingFunctions = Object.entries( easing );

  const i = map(mouseX, 0, width, 0, easingFunctions.length);
  const [ , easingFunction ] = mappers.circularIndex( time*2, easingFunctions);

  const cellSize = ((width+height) / (rows+cols))/2;
  let detail = animation.sequence("detail", clickCount, [0.2, 0.3, 0.4, 0.5])
  detail = animation.sequence("detail", time, [0.2, 0.3, 0.4, 0.5])
  const hueMax = PI//animation.sequence("hue-max", clickCount, [PI/2, PI])

  xOff += animation.sequence("x-speed", time/2, [-0.01, 0.01])
  yOff += animation.sequence("y-speed", time/4, [-0.01, 0.01])
  // yOff += 0.01 //* animation.sequence("y-speed", time/2, [1, -1, -1])

  // xOff += 0.01 * map(mouseX, 0, width, -1, 1)
  // yOff += 0.0005// * map(winMouseY, 0, windowHeight, -1, 1)/4

  // noiseSeed(6)

  noiseDetail(
    88,
    detail
  )

  grid.draw(gridOptions, (cellVector, { x, y}) => {
    const angle = noise(x/cols+xOff, y/rows+yOff) * (TAU*4);
    
    let weight = map(angle, min, TAU, 1, 10, true );
    weight = mappers.fn(angle, min, TAU, 1, cellSize, easingFunctions[24][1] );
    //weight = mappers.fn(angle, min, TAU, 1, 10, easingFunction );

    min = Math.min(min, angle);
    max = Math.max(max, angle);

    stroke(colors.rainbow({
      hueOffset: 0,
      hueIndex: map(angle, min, TAU, -hueMax, hueMax ),
      // hueIndex: mappers.fn(angle, 0, TAU, -PI/2, PI/2, easingFunction ),
      opacityFactor: 1.5,
      // opacityFactor: map(angle, min, max, 30, 1 ),
      // opacityFactor: mappers.fn(angle, 0, TAU, 50, 1, easingFunctions[24][1] ),
    }))

    push();
    translate( cellVector.x, cellVector.y );
    // circle(0, 0, scale)

    strokeWeight(weight);

    translate(cellSize * sin(angle), cellSize * cos(angle) )
    point( 0, 0);

    pop();
  })

  // console.log({
  //   max, min
  // });
});