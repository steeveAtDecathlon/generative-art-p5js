import { midi, events, sketch, string, mappers, easing, animation, colors, cache } from './utils/index.js';

const units = ['', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const tens = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', '', 'quatre-vingt', ''];
const scales = [
  [ 'centillion', 67 ],
  [ 'vigintillion', 64 ],
  [ 'novemdecillion', 61 ],
  [ 'octodecillion', 58 ],
  [ 'septen-decillion', 55 ],
  [ 'sexdecillion', 52 ],
  [ 'quindecillion', 49 ],
  [ 'quatttuor-decillion', 46 ],
  [ 'tredecillion', 43 ],
  [ 'duodecillion', 40],
  [ 'undecillion', 37 ],
  [ 'decillion', 34 ],
  [ 'nonillion', 31 ],
  [ 'octillion', 28 ],
  [ 'septillion', 25 ],
  [ 'sextillion', 22 ],
  [ 'quintillion', 19 ],
  [ 'quadrillion', 16 ],
  [ 'trillion', 13 ],
  [ 'milliard', 10 ],
  [ 'million', 7 ],
  [ 'mille', 4 ],
  [ 'cent', 3 ]
];

const numberToFrench = ( initialNumber ) => {
  if ( undefined === initialNumber || '' === initialNumber ) {
    return '';
  }

  if ( parseInt( initialNumber, 10 ) === 0 ) {
    return 'zéro';
  }

  const resolve = ( input ) => {
    const number = parseInt( input , 10 );
    const string = number.toString();

    if ( number < 20 ) {
      return units[ number ];
    }

    if ( number < 100 ) {
      let tenIndex = parseInt( string[ 0 ], 10 );
      let unitIndex = parseInt( string[ 1 ], 10 );

      if ( 7 === tenIndex || 9 === tenIndex ) {
        tenIndex -= 1;
        unitIndex += 10;
      }

      const tenWord = tens[ tenIndex ];
      const unitWord = 0 === unitIndex ? '' : units[ unitIndex ];
      let separator = '-';

      if ( ( 1 === unitIndex || 11 === unitIndex ) && ( 8 > tenIndex ) ) {
        separator = '-et-';
      }
      if ( 0 === unitIndex ) {
        separator = '';
      }

      return `${tenWord}${separator}${unitWord}`;
    }

    const resolvable = string.slice( 0, 67 );
    const scale = scales.find( ( [ _, length ] ) => resolvable.length >= length );

    if ( !scale ) {
      // console.error( 'no scale' );
      return;
    }

    const [ scaleLabel, scaleLength ] = scale;

    // console.log( '>>>>>>>>>>>>>>>>', scale );

    const scalePart = resolvable.slice( 0, -( scaleLength - 1 ) );
    const remainingPart = resolvable.slice( -( scaleLength - 1 ) );

    const resolvedScalePart = resolve( scalePart );
    const resolvedRemainingPart = resolve( remainingPart );

    // console.log( 'scalePart', scalePart, scalePart.length );
    // console.log( 'resolvedScalePart', resolvedScalePart, resolvedScalePart.length );
    // console.log( 'remainingPart', remainingPart, remainingPart.length );
    // console.log( 'resolvedRemainingPart', resolvedRemainingPart, resolvedRemainingPart.length );

    const formattedScalePart = ( 'un' === resolvedScalePart && ( 'cent' === scaleLabel || 'mille' === scaleLabel ) ) ? '' : resolvedScalePart + '-';
    // const formattedRemainingPart = resolvedRemainingPart ? '-' + resolvedRemainingPart : '';
    const formattedScale = 'un' !== resolvedScalePart && '' === resolvedRemainingPart ? scaleLabel + 's' : scaleLabel;

    return `${formattedScalePart}${formattedScale} ${resolvedRemainingPart}`;
  }

  return resolve( initialNumber );
};

function drawGrid(xCount, yCount, color, weight = 2, offset = 0) {
  const xSize = width / xCount;
  const ySize = height / yCount;

  stroke(color)
  strokeWeight(weight)

  const xx = xSize;
  const yy = ySize;

  for (let x = 0; x < xCount-1; x++) {
    line((xx + x * xSize), 0, (xx + x * xSize), height);   
  }

  for (let y = 0; y < yCount-1; y++) {
    line(0, (yy + y * ySize), width, (y * ySize + yy));
  }
}

sketch.setup( undefined, { type: "webgl" } );

function traceVectors(count, vectorsGenerator, onStart, onTrace, onEnd) {
  const vectorsList = Array( count ).fill(undefined).map( ( _, index ) => (
    vectorsGenerator( index / (count-1) )
  ));

  // const longestVectorsLength = Math.max( ...vectorsList.map( vectors => vectors.length ) );

  const { smooth: longestVectorsLength } = mappers.valuer(`longest-vectors-length`, Math.max( ...vectorsList.map( vectors => vectors.length )))

  console.log(longestVectorsLength);

  for (let index = 0; index < longestVectorsLength; index++) {
    const vectorIndexProgression = index / (longestVectorsLength-1);

    onStart( vectorIndexProgression );
    
    for (let j = 0; j < vectorsList.length; j++) {
      const vectors = vectorsList[j];
      const vectorsListProgression = j/(vectorsList.length-1);

      onTrace( vectors[index % vectors.length], vectorsListProgression, vectorIndexProgression );
    }

    onEnd( vectorIndexProgression );
  }

  return vectorsList;
}

let alphabet = Array(26).fill(undefined).map((_, index) => String.fromCharCode(index + 'a'.charCodeAt(0)))
alphabet = "0123456789".split("")
// alphabet = "tracé".split("")
// alphabet = "abc".split("")
// alphabet = "12345".split("")
// alphabet = "test".split("")
// alphabet = "ok".split("")
// alphabet = "aurélie".split("")
// alphabet = "Vanessa".split("")
// alphabet = "salsa-or-bachata".split("")

function drawPoints( points ) {
  for (let index = 0; index < points.length; index++) {
    const { x, y } = points[index];

    point(x, y );
  }
}

function drawLine( points ) {
  beginShape();
  for (let index = 0; index < points.length; index++) {
    const { x, y } = points[index];

    vertex(x, y );
  }

  endShape()
}

function getSeparatedTextPoints(options) {
  // console.log(options.text.split("").map( ( char, innerIndex ) => innerIndex === 3 ? char : " " ).join(""));

  // options.text.split("").forEach( ( char, index ) => {
  //   const test = options.text.split("").map( ( char, innerIndex ) => innerIndex === index ? char : "-" ).join("")

  //   console.log({test});
  // });

  return options.text.split("").map( ( char, index ) => {
    const alteredText = options.text.split("").map( ( char, innerIndex ) => innerIndex === index ? char : "-" ).join("");

    return ({
      char: alteredText[ index ],
      points: string.getTextPoints({
        ...options,
        text: char
      })
    })
  });



  return options.text.split("").map( ( char, index ) => {
    const alteredText = options.text.split("").map( ( char, innerIndex ) => innerIndex === index ? char : "-" ).join("");

    return ({
      char: alteredText[ index ],
      points: string.getTextPoints({
        ...options,
        text: alteredText
      })
    })
  });
}

sketch.draw( ( time, center, favoriteColor ) => {
  background(0);
  noFill();

  const W = width/2;
  const H = height/2

  const letterSize = W/1.5//1.25;
  const margin = letterSize/2;

  const from = createVector(-W+margin, 0);
  const to = createVector(W-margin, 0);
  // const from = createVector(-W+margin, -H+margin);
  // const to = createVector(W-margin, H-margin);

  push()
  translate(-W, -H)
  // translate(-center.x, -center.y/2)
  
  const cols = 20;
  const rows = cols * (height/width);
  drawGrid(cols, rows, favoriteColor, 0.5, 0)
  pop()

  // const from = createVector(0, -H+margin, 0);
  // const to = createVector(0, H-margin, 0);

  // drawLine( points )
  // drawPoints( points )

  // const values = alphabet.map( text => (
  //   string.getTextPoints({
  //     // text: numberToFrench(text),
  //     text,
  //     size: letterSize*2,
  //     position: center,
  //     sampleFactor: .25,
  //     // sampleFactor: mappers.circularIndex(time*4, [.05, .025, 0.1, 0.04, .07]),
  //     // sampleFactor: animation.ease({
  //     //   values: [.05, .025, 0.1, .07],
  //     //   duration: 1,
  //     //   // easingFn: easing.easeInOutCubic,
  //     //   easingFn: easing.easeInOutExpo,
  //     //   currentTime: time
  //     // }) ,
  //     simplifyThreshold: 0,
  //     font: string.fonts.martian
  //   })
  // ));

  translate(0, 0, 50)

  const start = [];
  const end = [];

  const dValues = [alphabet.length]//[alphabet.length*2, alphabet.length/2]
  
  const vectorsList = traceVectors(
    alphabet.length*2,
    ( progression ) => {
      const d = animation.ease({
        values: dValues,
        duration: 1,
        easingFn: easing.easeInOutCubic,
        currentTime: time/2+progression
      })

      // const sampleFactor = animation.ease({
      //   values: [.05, .025, 0.1, 0.04, .07],
      //   duration: 1,
      //   easingFn: easing.easeInOutCubic,
      //   currentTime: time/2+progression
      // })
  
      return animation.ease({
        values: alphabet.map( text => (
          string.getTextPoints({
            text,
            // text: numberToFrench(text),
            size: letterSize,
            // size: mappers.circularIndex(progression*2+time, [letterSize, letterSize/2]),
            position: center,
            sampleFactor: .15,
            // sampleFactor: mappers.circularIndex(progression+time/2, [.05, .025, 0.1, 0.04, .07]),
            // sampleFactor: mappers.circularIndex(progression+time*2, [.2, .1, .05]),
            // sampleFactor: mappers.circular(progression, 0, 1, .2, .005),
            // sampleFactor,
            simplifyThreshold: 0,
            font: string.fonts.martian,
            // font: mappers.circularIndex(progression*2+time, [string.fonts.martian, string.fonts.sans]),
          })
        )),
        duration: 1,
        lerpFn: mappers.lerpPoints,
        easingFn: easing.easeInOutExpo,
        easingFn: easing.easeInOutQuad,
        easingFn: easing.easeInOutQuart,
        // easingFn: easing.easeInOutCubic,
        currentTime: map(progression, 0, 1, 0, (alphabet.length-1)/d)+time
      }) 
    },
    () => beginShape(TRIANGLE_FAN),
    ( vector, vectorsListProgression, vectorIndexProgression ) => {
      const position = p5.Vector.lerp( from, to, vectorsListProgression ) 
      const scale = animation.ease({
        values: [1/2, 1.5],
        duration: 1,
        easingFn: easing.easeInOutExpo,
        // easingFn: easing.easeInOutQuad,
        currentTime: time/2+vectorsListProgression//+vectorIndexProgression/12
        // currentTime: time+vectorIndexProgression
      })

      const z = animation.ease({
        values: [-H/4, H/4],
        duration: 1,
        easingFn: easing.easeInOutExpo,
        // easingFn: easing.easeInOutCubic,
        // easingFn: easing.easeInOutBounce,
        // easingFn: easing.easeInOutQuad,

        // currentTime: time+vectorsListProgression*2,//+vectorIndexProgression
        // currentTime: time+noise(vectorIndexProgression+time/2, vectorsListProgression),
        // currentTime: time+noise(vectorsListProgression+vector.x),
        // currentTime: time+noise(vector.x*2/(width/2)+time, vector.y),
        currentTime: noise(vectorsListProgression+time, vector.y/(H/2), vector.x/(W/2))+time+vectorsListProgression//*scale
        // currentTime: time+vectorIndexProgression
      })

      position.add( vector )
      // position.mult( scale )
      // position.mult( 1.5 )

      if (vectorsListProgression==1 ) {
        // stroke(favoriteColor); 
        // strokeWeight(4)
        // point( position.x, position.y+z, 1 )

        end.push( createVector( position.x+z/4, position.y+z ))
      }

      if (vectorsListProgression==0) {
        // stroke(favoriteColor); 
        // strokeWeight(4)
        // point( position.x, position.y+z, 1 )

        start.push( createVector( position.x+z/4, position.y+z ))
      }

  
      vertex( position.x+z/4, position.y+z )
    },
    vectorIndexProgression => {
      const colorFunction = colors.rainbow;
      // const colorFunction = mappers.circularIndex( time+index*4/longest, [ colors.rainbow, colors.purple ] );

      const opacityFactor = animation.ease({
        values: [10, 1.5],
        // values: [1],
        duration: 1,
        easingFn: easing.easeInOutCubic,
        // easingFn: easing.easeInOutExpo,
        currentTime: time+vectorIndexProgression
      })
      
      stroke(colorFunction({
        hueOffset: (
          +time
          // +index/longest
          +0
        ),
        hueIndex: mappers.circularPolar(vectorIndexProgression, 0, 1, -PI/2, PI/2)*4,
        // hueIndex: map(sin(time+vectorIndexProgression), -1, 1, -PI/2, PI/2)*4,
        hueIndex: mappers.fn(noise(vectorIndexProgression*8, vectorIndexProgression*cos(time+vectorIndexProgression)), 0, 1, -PI/2, PI/2)*6,
        opacityFactor: 1.5,
        // opacityFactor: map(scale, 0, 2, 10, 1),
        // opacityFactor: map(vectorIndexProgression, 0, 1, 10, 1),
        opacityFactor: map(sin(time+vectorIndexProgression*16), -1, 1, 3.5, 1.5),
        // opacityFactor
      }))

      strokeWeight(4)
      endShape()
    }
  )

  stroke(favoriteColor)
  //fill(favoriteColor)
  strokeWeight(4)
  drawLine( end )
  drawLine( start )


  // stroke(favoriteColor)
  // strokeWeight(6)

  // translate(0, 0, 1)

  // push()
  // translate(from)
  // drawPoints( vectorsList[ 0 ] )
  // drawLine( vectorsList[ 0 ] )
  // pop()

  // push()
  // translate(to)
  // drawPoints( vectorsList[ vectorsList.length - 1 ] )
  // drawLine( vectorsList[ vectorsList.length - 1 ] )
  // pop()


  // const values = [];
  // const count = alphabet.length*2//4;

  // for (let index = 0; index < count; index++) {
  //   const d = animation.ease({
  //     values: [2, 4, 3],
  //     duration: 1,
  //     easingFn: easing.easeInOutCubic,
  //     // easingFn: easing.easeInOutExpo,
  //     currentTime: time/2+index/(count-1)
  //   })

  //   const points = animation.ease({
  //     values: alphabet.map( text => (
  //       string.getTextPoints({
  //         // text: numberToFrench(text),
  //         text,
  //         size: letterSize,
  //         position: center,
  //         sampleFactor: .1,
  //         // sampleFactor: mappers.circularIndex(index/count+time/2, [.05, .025, 0.1, 0.04, .07]),
  //         simplifyThreshold: 0,
  //         font: string.fonts.martian
  //       })
  //     )),
  //     duration: 1,
  //     lerpFn: mappers.lerpPoints,
  //     easingFn: easing.easeInOutExpo,
  //     currentTime: map(index/(count-1), 0, 1, 0, (alphabet.length-1), true)//+time/2//+~~time*2
  //   }) 

  //   values.push( points );
  // }

  // const longest = Math.max( ...values.map( array => array.length ) );

  // for (let index = 0; index < longest; index++) {
  //   // rotateY(time/1000)

  //   beginShape()
    
  //   for (let j = 0; j < values.length; j++) {
  //     const letter = values[j];
  //     const dot = letter[index % letter.length];

  //     const ref = p5.Vector.lerp( from, to, j / (values.length -1)) 
  //     const scale = animation.ease({
  //       values: [1/8, 2],
  //       // values: [1],
  //       duration: 1,
  //       // easingFn: easing.easeInOutCubic,
  //       easingFn: easing.easeInOutExpo,
  //       // easingFn: easing.easeInOutQuint,
  //       currentTime: time+j/(values.length-1)//+index/longest*2
  //     })

  //     const { x, y } = ref.add( dot.x * scale, dot.y * scale )

  //     // stroke(favoriteColor);
  //     // strokeWeight(4)
  //     // point( x, y )


  //     vertex( x , y  )
  //   }

  //   // stroke(favoriteColor);
  //   const colorFunction = colors.rainbow;
  //   // const colorFunction = mappers.circularIndex( time+index*4/longest, [ colors.rainbow, colors.purple ] );

  //   // const opacityFactor = animation.ease({
  //   //   values: [10, 1.5],
  //   //   // values: [1],
  //   //   duration: 1,
  //   //   easingFn: easing.easeInOutCubic,
  //   //   // easingFn: easing.easeInOutExpo,
  //   //   currentTime: time+index/longest*2
  //   // })
    
  //   stroke(colorFunction({
  //     hueOffset: (
  //       +time
  //       // +index/longest
  //       +0
  //     ),
  //     hueIndex: mappers.circularPolar(index, 0, longest, -PI/2, PI/2)*4,
  //     // hueIndex: mappers.fn(noise(index*8/longest), 0, 1, -PI/2, PI/2)*4,
  //     opacityFactor: 1.5,
  //     // opacityFactor: map(scale, 0, 2, 10, 1),
  //     // opacityFactor: map(j, 0, values.length, 1, 1),
  //     // opacityFactor
  //   }))

  //   strokeWeight(2)
  //   endShape()
  // }

  // const separatedTextPoints = getSeparatedTextPoints({
  //   text: "ab",
  //   size: letterSize,
  //   position: center,
  //   sampleFactor: .1,
  //   sampleFactor: mappers.circularIndex(time*8, [.05, .025, 0.1, 0.04, .07]),
  //   simplifyThreshold: 0,
  //   font: string.fonts.martian
  // })

  // console.log(separatedTextPoints);

  // for (let index = 0; index < separatedTextPoints.length; index++) {
  //   const { char, points } = separatedTextPoints[index];

  //   if ( "-" !== char ) {
  //     drawLine( points )
  //     drawPoints( points )
  //   }
  // }

  orbitControl()
});


