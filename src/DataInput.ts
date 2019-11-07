import { Decoder } from './Text';
import * as Base64 from 'base64-js';

export default class DataInput {
    private pos: number = 0;
    private buf: Uint8Array;
    private view: DataView;

    constructor(bytes: Uint8Array | string) {
        if (typeof bytes === 'string') bytes = Base64.toByteArray(bytes);
        this.buf = bytes;
        this.view = new DataView(bytes.buffer);
    }

    private _advance(bytes: number): number {
        if (this.pos + bytes > this.buf.length) {
            throw new Error("EOF: Tried to read " + bytes + " bytes at offset " +
                this.pos + ", but buffer size is only " + this.buf.length)
        }
        const p = this.pos;
        this.pos += bytes;
        return p;
    }

    public readBoolean(): boolean {
        return this.readByte() !== 0;
    }

    public readByte(): number {
        return this.buf[this._advance(1)];
    }

    public readUnsignedShort(): number {
        return this.view.getUint16(this._advance(2), false);
    }

    public readInt(): number {
        return this.view.getInt32(this._advance(4), false);
    }

    public readLong(): bigint {
        const msb = this.view.getInt32(this._advance(4), false);
        const lsb = this.view.getUint32(this._advance(4), false);
        return BigInt(msb) << 32n | BigInt(lsb);
    }

    public readUTF(): string {
        const len = this.readUnsignedShort();
        const start = this._advance(len);
        return new Decoder().decode(this.buf.slice(start, start + len));
    }
};
