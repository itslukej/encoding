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
        //msb << 32 | lsb
        //since no bits overlap, addition is the same as a bitwise or
        return BigInt(msb) * BigInt(2**32) + BigInt(lsb);
    }

    readUTF() {
        const len = this.readUnsignedShort();
        const start = this._advance(len);
        return this.buf.toString("utf8", start, start + len);
    }
}

const TRACK_INFO_VERSIONED = 1;
const TRACK_INFO_VERSION = 2;
const PARAMETERS_SEPARATOR = "|";

function parseProbeInfo(track, input) {
    const probeInfo = input.readUTF();
    const separatorPosition = probeInfo.indexOf(PARAMETERS_SEPARATOR);
    const name = separatorPosition < 0 ? probeInfo : probeInfo.substring(0, separatorPosition);
    const parameters = separatorPosition < 0 ? null : probeInfo.substring(separatorPosition + 1);
    track.probeInfo = {raw: probeInfo, name, parameters}
}

// source manager name -> reader
// should either read the data into the track or
// discard it, so the position can be safely read.
const sourceManagers = {
    http: parseProbeInfo,
    local: parseProbeInfo
};

// version -> decoder
const decoders = {
    1: (input, flags) => {
        const title = input.readUTF();
        const author = input.readUTF();
        const length = input.readLong();
        const identifier = input.readUTF();
        const isStream = input.readBoolean();
        const uri = null;
        const source = input.readUTF();
        const track = {flags, version: 1, title, author, length, identifier, isStream, uri, source};
        if(sourceManagers[source]) {
            sourceManagers[source](track, input);
        }
        track.position = input.readLong();

        return track;
    },
    2: (input, flags) => {
        const title = input.readUTF();
        const author = input.readUTF();
        const length = input.readLong();
        const identifier = input.readUTF();
        const isStream = input.readBoolean();
        const uri = input.readBoolean() ? input.readUTF() : null;
        const source = input.readUTF();
        const track = {flags, version: 1, title, author, length, identifier, isStream, uri, source};
        if(sourceManagers[source]) {
            sourceManagers[source](track, input);
        }
        track.position = input.readLong();

        return track;
    }
};

function decodeTrack(data) {
    const input = new DataInput(
        data instanceof Buffer ? data : Buffer.from(data, "base64")
    );
    let flags = (input.readInt() & 0xC0000000) >> 30;
    const version = (flags & TRACK_INFO_VERSIONED) !== 0 ? input.readByte() : 1;
    if(!decoders[version]) {
        throw new Error("This track's version is not supported. Track version: " + version
            + ", supported versions: " + Object.getOwnPropertyNames(decoders).join(", "));
    }
    return decoders[version](input, flags);
}

module.exports = {decodeTrack, TRACK_INFO_VERSION, _decoders: decoders, _sourceManagers: sourceManagers};