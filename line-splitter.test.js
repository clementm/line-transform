const LineSplitter = require('.').LineSplitter;

it('should not re-emit buffered data', () => {
  const handle = jest.fn();

  const split = new LineSplitter(function (data) {
    handle(data.toString());
  });

  split(Buffer.from('abc'));
  split(Buffer.from('def\n'));
  split(Buffer.from('ghi'));
  split(Buffer.from('\njkl\nmno'));

  expect(handle).toHaveBeenCalledTimes(3);
  expect(handle).toHaveBeenCalledWith('abcdef');
  expect(handle).toHaveBeenCalledWith('ghi');
  expect(handle).toHaveBeenLastCalledWith('jkl');
  expect(split.getBufferedData().toString()).toEqual('mno');
});

it('should not overwrite pending buffer', () => {
  const handle = jest.fn();

  const split = new LineSplitter(function (data) {
    handle(data.toString());
  });

  split(Buffer.from('abc'));
  split(Buffer.from('def'));
  split(Buffer.from('ghi\n'));

  expect(handle).toHaveBeenCalledTimes(1);
  expect(handle).toHaveBeenCalledWith('abcdefghi');
});
