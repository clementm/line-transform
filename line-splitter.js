module.exports = LineSplitter = function LineSplitter(handle) {
  if (!this instanceof(LineSplitter))
    return new LineSplitter(handle);

  this.buffer = Buffer.alloc(0);
  this.handle = handle;

  const _ = (function (chunk, cb) {
    let readChunk = Buffer.alloc(chunk.length);
    let j = 0;

    for (const [i, value] of chunk.entries()) {
      switch (value) {
        case 0x0a: // new line feed
          this.handle(
            Buffer.concat([
              this.buffer,
              readChunk.slice(0, j)
            ])
          );
          this.buffer = Buffer.alloc(0);
          j = 0;
          break;

        case 0x0d: // carriage return
          break; // do nothing

        default:
          readChunk[j++] = value;
      }
    }

    this.buffer = Buffer.concat([
      this.buffer,
      readChunk.slice(0, j)
    ]);
    cb && cb();
  }).bind(this);

  _.getBufferedData = (function() {
    return this.buffer;
  }).bind(this);

  return _;
};
