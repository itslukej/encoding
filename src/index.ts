import DataInput from "./DataInput";
import DataOutput from "./DataOutput";

export interface TrackInfo {
    flags?: number;
    source: Source;
    identifier: string;
    author: string;
    length: bigint;
    isStream: boolean;
    position: bigint;
    title: string;
    uri: string | null;
    version?: number;
    probeInfo?: { raw: string, name: string, parameters: string | null };
}

const TRACK_INFO_VERSIONED = 1;
const TRACK_INFO_VERSION = 2;
const PARAMETERS_SEPARATOR = "|";

function parseProbeInfo(track: TrackInfo, input: DataInput) {
    const probeInfo = input.readUTF();
    const separatorPosition = probeInfo.indexOf(PARAMETERS_SEPARATOR);
    const name = separatorPosition < 0 ? probeInfo : probeInfo.substring(0, separatorPosition);
    const parameters = separatorPosition < 0 ? null : probeInfo.substring(separatorPosition + 1);
    track.probeInfo = { raw: probeInfo, name, parameters };
}

function writeProbeInfo(track: TrackInfo, output: DataOutput) {
    if(typeof track.probeInfo === "object") {
        output.writeUTF(track.probeInfo.raw || "<no probe info provided>");
    } else {
        output.writeUTF("<no probe info provided>");
    }
}

// source manager name -> reader
// should either read the data into the track or
// discard it, so the position can be safely read.
const sourceReaders: { [key: string]: typeof parseProbeInfo | undefined } = {
    http: parseProbeInfo,
    local: parseProbeInfo
};

const sourceWriters: { [key: string]: typeof writeProbeInfo | undefined } = {
    http: writeProbeInfo,
    local: writeProbeInfo
};

type Source = string;

// version -> decoder
const decoders = [
    undefined,
    (input: DataInput, flags: number) => {
        const title = input.readUTF();
        const author = input.readUTF();
        const length = input.readLong();
        const identifier = input.readUTF();
        const isStream = input.readBoolean();
        const uri = null;
        const source: Source = input.readUTF() as Source;
        const track: TrackInfo = {
            flags,
            version: 1,
            title,
            author,
            length,
            identifier,
            isStream,
            uri,
            source,
            position: 0n,
        };
        const reader = sourceReaders[source];
        if (reader) reader(track, input);
        track.position = input.readLong();

        return track;
    },
    (input: DataInput, flags: number) => {
        const title = input.readUTF();
        const author = input.readUTF();
        const length = input.readLong();
        const identifier = input.readUTF();
        const isStream = input.readBoolean();
        const uri = input.readBoolean() ? input.readUTF() : null;
        const source: Source = input.readUTF() as Source;
        const track: TrackInfo = {
            flags,
            version: 2,
            title,
            author,
            length,
            identifier,
            isStream,
            uri,
            source,
            position: 0n,
        };
        const reader = sourceReaders[source];
        if (reader) reader(track, input);
        track.position = input.readLong();

        return track;
    },
];

const encoders = [
    undefined,
    undefined,
    (track: TrackInfo, output: DataOutput) => {
        output.writeUTF(track.title || "<no title provided>");
        output.writeUTF(track.author || "<no author provided>");
        output.writeLong(track.length || 0n);
        output.writeUTF(track.identifier || "<no identifier provided>");
        output.writeBoolean(track.isStream);
        output.writeBoolean(Boolean(track.uri));
        if (track.uri) output.writeUTF(track.uri);
        output.writeUTF(track.source || "<no source provided>");
        const writer = sourceWriters[track.source];
        if (writer) writer(track, output);
        output.writeLong(track.position || 0n);
    },
];

export function decode(data: Uint8Array | string): TrackInfo {
    const input = new DataInput(data);
    const flags = input.readInt() >> 30;
    const version = Boolean(flags & TRACK_INFO_VERSIONED) ? input.readByte() : 1;
    const decoder = decoders[version];
    if (!decoder) {
        throw new Error("This track's version is not supported. Track version: " + version
            + ", supported versions: " + decoders.filter(e => e).map((_, i) => i).join(", "));
    }
    return decoder(input, flags);
}

export function encode(track: TrackInfo, version: number = TRACK_INFO_VERSION): string {
    const encoder = encoders[version];
    if (!encoder) {
        throw new Error("This track's version is not supported. Track version: " + version
            + ", supported versions: " + Object.getOwnPropertyNames(decoders).join(", "));
    }

    const out = new DataOutput();
    out.writeInt(0); // overwritten by prefix
    out.writeByte(version);

    encoder(track, out);

    const prefix = new DataOutput(5);
    prefix.writeInt((out.length - 4) | (TRACK_INFO_VERSIONED << 30));
    out.set(prefix.valueOf());

    return out.toString();
}
