const stream = require('stream');
const util = require('util');

const LineSplitter = require('./line-splitter');

const Transform = stream.Transform;

module.exports = LineTransform = function LineTransform(options) {
  if (!this instanceof LineTransform)
    return new LineTransform(options);

  options = options || {};

  if (options.transform)
    this._transformLine = options.transform.bind(this);
  
  if (options.flush)
    this._flushCb = options.flush.bind(this);

  const context = this;
  
  this.split = new LineSplitter(function(chunkline) {
    context._transformLine(chunkline);
  });

  Transform.call(this);
};

util.inherits(LineTransform, Transform);

LineTransform.prototype._transform = function(chunk, enc, cb) {
  this.split(chunk, cb);
};

LineTransform.prototype._flush = function(cb) {
  const bufferedData = this.split.getBufferedData();
  if (bufferedData)
    this._transformLine(bufferedData);
  
  if (this._flushCb)
    this._flushCb(cb);
  else cb();
};

// class LineTransform extends Transform {
//   constructor({ transform, flush } = {}) {
//     super();
//     if (transform) {
//       this._transformLine = transform.bind(this);
//     }

//     this.buffer = lbuff(this._transformLine);

//     if (flush) {
//       this._flushCb = flush.bind(this);
//     }
//   }

//   _transform(chunk, enc, cb) {
//     this.buffer(chunk, enc, cb);
//   }

//   _flush(cb) {
//     if (this.buffer.remainer().length > 0) {
//       this._transformLine(this.buffer.remainer());
//     }

//     if (this._flushCb) {
//       this._flushCb(cb)
//     } else {
//       cb();
//     }
//   }
// }
