import { Encoder } from './Text';
import * as Base64 from 'base64-js';

export default class DataOutput {
    private pos: number = 0;
    private buf: Uint8Array;
    private view: DataView;

    constructor(initialSize: number = 256) {
        this.buf = new Uint8Array(initialSize);
        this.view = new DataView(this.buf.buffer);
    }

    private _advance(bytes: number) {
        const p = this.pos;
        this.pos += bytes;

        if (this.pos >= this.buf.length) {
            const newBuf = new Uint8Array(this.buf.length * 2 + 1);
            newBuf.set(this.buf);
            this.buf = newBuf;
            this.view = new DataView(this.buf.buffer);
        }

        return p;
    }

    public get length(): number {
        return this.pos;
    }

    public set(bytes: ArrayLike<number>, offset?: number) {
        const addedBytes = bytes.length + (offset || 0) - this.pos;
        if (addedBytes > 0) this._advance(addedBytes);
        this.buf.set(bytes, offset);
    }

    public writeBoolean(value: boolean) {
        this.writeByte(value ? 1 : 0);
    }

    public writeByte(value: number) {
        const p = this._advance(1);
        this.buf[p] = value;
    }

    public writeUnsignedShort(value: number): void {
        const p = this._advance(2)
        this.view.setUint16(p, value, false);
    }

    public writeInt(value: number): void {
        const p = this._advance(4);
        this.view.setInt32(p, value, false);
    }

    public writeLong(value: bigint) {
        const msb = value / BigInt(2**32);
        const lsb = value % BigInt(2**32);
        let p = this._advance(4);
        this.view.setInt32(p, Number(msb), false);
        p = this._advance(4);
        this.view.setInt32(p, Number(lsb), false);
    }

    public writeUTF(string: string) {
        const encoded = new Encoder().encode(string);
        if (encoded.byteLength > 65535) {
            throw new Error("String too big! Maximum utf8 length of 65535 bytes");
        }
        this.writeUnsignedShort(encoded.length);
        const p = this._advance(encoded.length);
        this.buf.set(encoded, p);
    }

    public valueOf() {
        return this.buf.slice(0, this.pos);
    }

    public toString(): string {
        return Base64.fromByteArray(this.valueOf());
    }
};
