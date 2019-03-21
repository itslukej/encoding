const DataInput = require("./DataInput");
const DataOutput = require("./DataOutput");

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

function writeProbeInfo(track, output) {
    if(typeof track.probeInfo === "object") {
        output.writeUTF(track.probeInfo.raw || "<no probe info provided>");
    } else {
        output.writeUTF("<no probe info provided>");
    }
}

// source manager name -> reader
// should either read the data into the track or
// discard it, so the position can be safely read.
const sourceReaders = {
    http: parseProbeInfo,
    local: parseProbeInfo
};

const sourceWriters = {
    http: writeProbeInfo,
    local: writeProbeInfo
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
        if(sourceReaders[source]) {
            sourceReaders[source](track, input);
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
        if(sourceReaders[source]) {
            sourceReaders[source](track, input);
        }
        track.position = input.readLong();

        return track;
    }
};

const encoders = {
    2: (track, output) => {
        output.writeUTF(track.title || "<no title provided>");
        output.writeUTF(track.author || "<no author provided>");
        output.writeLong(track.length || 0n);
        output.writeUTF(track.identifier || "<no identifier provided>");
        output.writeBoolean(track.isStream);
        output.writeBoolean(track.uri);
        if(track.uri) {
            output.writeUTF(track.uri);
        }
        output.writeUTF(track.source || "<no source provided>");
        if(sourceWriters[track.source]) {
            sourceWriters[track.source](track, output);
        }
        output.writeLong(track.position || 0n);
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

function encodeTrack(track, version) {
    const out = new DataOutput();
    if(!encoders[version || TRACK_INFO_VERSION]) {
        throw new Error("This track's version is not supported. Track version: " + version
            + ", supported versions: " + Object.getOwnPropertyNames(decoders).join(", "));
    }
    out.writeByte(version || TRACK_INFO_VERSION);
    encoders[version || TRACK_INFO_VERSION](track, out);
    const b = out.result();
    const result = Buffer.alloc(b.length + 4);
    result.writeInt32BE(b.length | (TRACK_INFO_VERSIONED << 30));
    b.copy(result, 4);
    return result;
}

module.exports = {
    decodeTrack,
    encodeTrack,
    TRACK_INFO_VERSION,
    _decoders: decoders,
    _sourceManagers: sourceReaders,
    _sourceReaders: sourceReaders,
    _sourceWriters: sourceWriters
};