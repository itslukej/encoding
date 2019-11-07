import DataOutput from '../src/DataOutput';

test('creates empty', () => {
	const o = new DataOutput();
	expect(o.valueOf()).toBeInstanceOf(Uint8Array);
	expect(o.valueOf()).toHaveLength(0);
});

test('sets bytes', () => {
	const o = new DataOutput();
	o.set([1, 2, 3, 4]);
	expect(o.valueOf()).toEqual(new Uint8Array([1, 2, 3, 4]));

	o.set([1, 2, 3, 4], 1);
	expect(o.valueOf()).toEqual(new Uint8Array([1, 1, 2, 3, 4]));
});

test('stores booleans', () => {
	const o = new DataOutput();
	o.writeBoolean(true);
	expect(o.valueOf()).toHaveLength(1);
	expect(o.valueOf()).toContain(1);
});

test('stores bytes', () => {
	const o = new DataOutput();
	o.writeByte(255);
	o.writeByte(255);

	expect(o.valueOf()).toHaveLength(2);
	expect(o.valueOf()).toContain(0xFF);
});

test('stores min int', () => {
	const o = new DataOutput();
	o.writeInt(-0x7FFFFFFF);
	expect(o.valueOf()).toHaveLength(4);
	expect(o.valueOf()).toEqual(new Uint8Array([128, 0, 0, 1]));
});

test('stores 0', () => {
	const o = new DataOutput();
	o.writeInt(0);
	expect(o.valueOf()).toHaveLength(4);
	expect(o.valueOf()).toContain(0);
});

test('stores max int', () => {
	const o = new DataOutput();
	o.writeInt(0x7FFFFFFF);
	expect(o.valueOf()).toHaveLength(4);
	expect(o.valueOf()).toEqual(new Uint8Array([127, 255, 255, 255]));
});

test('stores longs', () => {
	const o = new DataOutput();
	o.writeLong(0x7FFFFFFFFFFFFFFFn);
	expect(o.valueOf()).toHaveLength(8);
	expect(o.valueOf()).toEqual(new Uint8Array([127, 255, 255, 255, 255, 255, 255, 255]));
});

test('stores UTF', () => {
	const o = new DataOutput();
	o.writeUTF('foo');
	expect(o.valueOf()).toHaveLength(5);
	expect(o.valueOf()).toEqual(new Uint8Array([0, 3, 102, 111, 111]));
});

test('stores unsigned shorts', () => {
	const o = new DataOutput();
	o.writeUnsignedShort(0xFFFF);
	expect(o.valueOf()).toHaveLength(2);
	expect(o.valueOf()).toEqual(new Uint8Array([255, 255]));
});

test('resizes as needed', () => {
	const o = new DataOutput(1);
	o.writeBoolean(true);
	expect(o.valueOf()).toEqual(new Uint8Array([1]));

	o.writeByte(255);
	expect(o.valueOf()).toEqual(new Uint8Array([1, 255]));

	o.writeLong(0x7FFFFFFFFFFFFFFFn);
	expect(o.valueOf()).toEqual(new Uint8Array([1, 255, 127, 255, 255, 255, 255, 255, 255, 255]));
});

test('stringifies to base 64', () => {
	const o = new DataOutput();
	o.writeUTF('foo');
	expect(o.toString()).toBe('AANmb28=');
});
