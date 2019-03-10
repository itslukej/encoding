class DataInput {
    constructor(buffer) {
        this.pos = 0;
        this.buf = buffer;
    }

    _advance(bytes) {
        if(this.pos + bytes > this.buf.length) {
            throw new Error("EOF: Tried to read " + bytes + " bytes at offset " +
                this.pos + ", but buffer size is only " + this.buf.length)
        }
        const p = this.pos;
        this.pos += bytes;
        return p;
    }

    readBoolean() {
        return this.readByte() !== 0;
    }

    readByte() {
        return this.buf[this._advance(1)];
    }

    readUnsignedShort() {
        return this.buf.readUInt16BE(this._advance(2));
    }

    readInt() {
        return this.buf.readInt32BE(this._advance(4));
    }

    readLong() {
        const msb = this.buf.readInt32BE(this._advance(4));
        const lsb = this.buf.readInt32BE(this._advance(4));
        return BigInt(msb) * BigInt(2**32) + BigInt(lsb);
    }

    readUTF() {
        const len = this.readUnsignedShort();
        const start = this._advance(len);
        return this.buf.toString("utf8", start, start + len);
    }
}

module.exports = function decodeTrack(data) {
    const input = new DataInput(
        data instanceof Buffer ? data : Buffer.from(data, "base64")
    );
    let flags, size;
    {
        const value = input.readInt();
        flags = (value & 0xC0000000) >> 30;
        size = value & 0x3FFFFFFF;
    }
    const version = (flags & 1) === 1 ? input.readByte() : 1;
    const title = input.readUTF();
    const author = input.readUTF();
    const length = input.readLong();
    const identifier = input.readUTF();
    const isStream = input.readBoolean();
    const uri = (version >= 2 && input.readBoolean() ? input.readUTF() : null);
    const source = input.readUTF();
    const position = input.readLong();

    return {flags, size, version, title, author, length, identifier, isStream, uri, source, position};
};