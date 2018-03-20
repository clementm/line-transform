const Readable = require('stream').Readable;
const Writable = require('stream').Writable;

const LineTransform = require('.').LineTransform;

test('it should export constructor', () => {
  expect(new LineTransform()).toBeInstanceOf(LineTransform);
});

test('it should construct readable stream', () => {
  expect(new LineTransform()).toBeInstanceOf(Readable);
});

test('it should call transform with splitted lines', () => {
  const spy = jest.fn();
  const transform = new LineTransform({
    transform(chunk) {
      spy(chunk.toString());
    }
  });

  transform.write('abc\ndef\n');

  expect(spy).toHaveBeenCalledTimes(2);
  expect(spy).toHaveBeenCalledWith('abc');
  expect(spy).toHaveBeenCalledWith('def');
});

test('it should forward updated lines', () => {
  const spy = jest.fn();
  const transform = new LineTransform({
    transform(chunk) {
      this.push('updated:' + chunk.toString());
    }
  });

  transform.pipe(new Writable({
    write(chunk, enc, cb) {
      spy(chunk.toString());
    }
  }));
  transform.write('abc\n');

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith('updated:abc');
});

test('it should flush non-terminated lines on end', () => {
  const spy = jest.fn();
  const transform = new LineTransform({
    transform(chunk) {
      this.push('updated:' + chunk.toString());
    }
  });

  transform.pipe(new Writable({
    write(chunk, enc, cb) {
      spy(chunk.toString());
      cb();
    }
  }));
  transform.write('abc\ndef');
  transform.end();

  expect(spy).toHaveBeenCalledTimes(2);
  expect(spy).toHaveBeenCalledWith('updated:abc');
  expect(spy).toHaveBeenCalledWith('updated:def');
});

test('it should allow adding flush lifecycle', () => {
  const spy = jest.fn();
  const transform = new LineTransform({
    transform(chunk) {
      this.push('updated:' + chunk.toString());
    },

    flush(cb) {
      this.push('endflush');
    }
  });

  transform.pipe(new Writable({
    write(chunk, enc, cb) {
      spy(chunk.toString());
      cb();
    }
  }));
  transform.write('abc\ndef');
  transform.end();

  expect(spy).toHaveBeenCalledTimes(3);
  expect(spy).toHaveBeenCalledWith('updated:abc');
  expect(spy).toHaveBeenCalledWith('updated:def');
  expect(spy).toHaveBeenCalledWith('endflush');
});
