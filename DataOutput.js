module.exports = class DataOutput {
    constructor(initialSize) {
        this.pos = 0;
        this.buf = Buffer.alloc(initialSize || 256);
    }

    _advance(bytes) {
        if(this.pos + bytes >= this.buf.length) {
            const newBuffer = Buffer.alloc(Math.max(this.buf.length * 2, this.pos + bytes));
            this.buf.copy(newBuffer);
            this.buf = newBuffer;
        }
        const p = this.pos;
        this.pos += bytes;
        return p;
    }

    writeBoolean(value) {
        this.writeByte(value ? 1 : 0)
    }

    writeByte(value) {
        this.buf[this._advance(1)] = value;
    }

    writeUnsignedShort(value) {
        return this.buf.writeUInt16BE(value, this._advance(2));
    }

    writeInt(value) {
        this.buf.writeInt32BE(value, this._advance(4));
    }

    writeLong(value) {
        const msb = value / BigInt(2**32);
        const lsb = value % BigInt(2**32);
        this.buf.writeInt32BE(Number(msb), this._advance(4));
        this.buf.writeInt32BE(Number(lsb), this._advance(4));
    }

    writeUTF(string) {
        const len = Buffer.byteLength(string, 'utf8');
        if(len > 65535) {
            throw new Error("String too big! Maximum utf8 length of 65535 bytes");
        }
        this.writeUnsignedShort(len);
        const start = this._advance(len);
        this.buf.write(string, start, len, "utf8");
    }

    result() {
        return this.buf.slice(0, this.pos);
    }
};
