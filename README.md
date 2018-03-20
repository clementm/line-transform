# LineTransform

This package includes a set of utilities to slit incoming data into lines, based on new line feeds (carriage returns are ignored).

## LineSplitter

To create a new instance of `LineSplitter`, you need to pass a function which will be called each time a new line is parsed. The buffer corresponding to the line will be passed as the first argument.
The instance itself is a function you can call with an input buffer, with or without new line feeds inside.

Remaining characters are buffered, and will be preprened to the next incoming buffer. You can anytime read the buffered characters using `getBufferedData()` on your `LineSplitter`instance


```javascript
const LineSplitter = require('line-transform').LineSplitter;

const split = new LineSplitter(function (data) {
  // Outputs :
  // line : abc
  // line : def
  // line : ghijkl
  console.log('line : ' + data.toString());
});

split(Buffer.from('abc\ndef\nghi'));
split(Buffer.from('jkl\nmno'));

// Outputs :
// buffered : mno
console.log('buffered : ' + split.getBufferedData());
```

## LineTransform

LineTransform implements [Node.js Transform Streams](https://nodejs.org/api/stream.html#stream_implementing_a_transform_stream) interface and can be used to split lines inside streams.

It is similar to the standard `Transform` constructor, but incoming data is split into lines before calling transform method with each line.

All remaining buffered characters will form an extra line which will be passed to the transform method before flushing the stream.

You can also implement the flush method to add additional content at the end of the readable input.

```javascript
const LineTransform = require('line-transform').LineTransform;

// example.txt - content :
// abc
// def
// ghi

fs.createReadStream('./example.txt')
  .pipe(new LineTransform({
    transform(chunk) {
      this.push('updated:' + chunk.toString());
    }

    // optional
    flush(cb) {
      this.push('end');
      cb();
    }
  }))
  .pipe(fs.createWriteStream('./output.txt'));

// ouput.txt - content :
// updated:abc
// updated:def
// updated:ghi
// end
```

## Test

```
> npm test
```
