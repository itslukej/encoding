import DataInput from '../src/DataInput';

test('creates empty', () => {
	const i = new DataInput(new Uint8Array());
	expect(() => i.readBoolean()).toThrowError();
	expect(() => i.readByte()).toThrowError();
	expect(() => i.readInt()).toThrowError();
	expect(() => i.readLong()).toThrowError();
	expect(() => i.readUTF()).toThrowError();
	expect(() => i.readUnsignedShort()).toThrowError();
});

test('stores booleans', () => {
	const a = new Uint8Array(2);
	a.fill(1);
	const i = new DataInput(a);
	expect(i.readBoolean()).toBe(true);
	expect(i.readBoolean()).toBe(true);
	expect(() => i.readBoolean()).toThrowError();
});

test('stores bytes', () => {
	const a = new Uint8Array(1);
	a.fill(255);
	const i = new DataInput(a);
	expect(i.readByte()).toBe(255);
	expect(() => i.readByte()).toThrowError();
});

test('stores 0 int', () => {
	const a = new Uint8Array(4);
	const i = new DataInput(a);
	expect(i.readInt()).toBe(0);
	expect(() => i.readInt()).toThrowError();
});

test('stores mid int', () => {
	const a = new Uint8Array(4);
	const i = new DataInput(a);
	a.fill(127);
	expect(i.readInt()).toBe(0x7F7F7F7F);
	expect(() => i.readInt()).toThrowError();
});

test('stores max int', () => {
	const a = new Uint8Array(4);
	const i = new DataInput(a);
	a.fill(255);
	a[0] = 127;
	expect(i.readInt()).toBe(0x7FFFFFFF);
	expect(() => i.readInt()).toThrowError();
});

test('stores longs', () => {
	const a = new Uint8Array(8);
	const i = new DataInput(a);
	a.fill(255);
	a[0] = 127;
	expect(i.readLong()).toBe(0x7FFFFFFFFFFFFFFFn);
});

test('stores UTF strings', () => {
	const a = new Uint8Array(5);
	const i = new DataInput(a);
	a[1] = 3; // length
	a[2] = 102; // f
	a[3] = 111; // o
	a[4] = 111; // o
	expect(i.readUTF()).toBe('foo');
});

test('stores unsigned shorts', () => {
	const a = new Uint8Array(2);
	const i = new DataInput(a);
	a.fill(255);
	expect(i.readUnsignedShort()).toBe(0xFFFF);
});
