import { encode, decode, TrackInfo } from '../src/index';

const trackInfo: TrackInfo = {
	author: 'RickAstleyVEVO',
	source: 'youtube',
	identifier: 'dQw4w9WgXcQ',
	length: 212000n,
	isStream: false,
	title: 'Rick Astley - Never Gonna Give You Up',
	uri: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
	position: 0n,
	flags: 1,
	version: 2,
};

const track: string = 'QAAAjQIAJVJpY2sgQXN0bGV5IC0gTmV2ZXIgR29ubmEgR2l2ZSBZb3UgVXAADlJpY2tBc3RsZXlWRVZPAAAAAAADPCAAC2RRdzR3OVdnWGNRAAEAK2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9ZFF3NHc5V2dYY1EAB3lvdXR1YmUAAAAAAAAAAA==';

test('can encode a full track', () => {
	const encoded = encode(trackInfo);
	expect(encoded).toBe(track);
});

test('can decode a full track', () => {
	const decoded = decode(track);
	expect(decoded).toStrictEqual(trackInfo);
});

const emptyTrack = 'QAAAbgIAEzxubyB0aXRsZSBwcm92aWRlZD4AFDxubyBhdXRob3IgcHJvdmlkZWQ+AAAAAAAAAAAAGDxubyBpZGVudGlmaWVyIHByb3ZpZGVkPgAAABQ8bm8gc291cmNlIHByb3ZpZGVkPgAAAAAAAAAA';
test('can encode an empty track', () => {
	const encoded = encode({});
	expect(encoded).toBe(emptyTrack);
});

test('can decode an empty track', () => {
	const decoded = decode(emptyTrack);
	expect(decoded).toStrictEqual({
		author: '<no author provided>',
		title: '<no title provided>',
		length: 0n,
		position: 0n,
		flags: 1,
		version: 2,
		identifier: '<no identifier provided>',
		isStream: false,
		uri: null,
		source: '<no source provided>',
	});
});

test('can\'t encode a track into version 1', () => {
	expect(() => encode(trackInfo, 1)).toThrowError();
});

test.todo('can decode a version 1 track');

const httpTrackInfo: Partial<TrackInfo> = {
	source: 'http',
	length: 10n,
	title: 'track.mp3',
	isStream: false,
	uri: 'http://somewebsite.green/track.mp3',
	position: 0n,
	flags: 1,
	version: 2,
	probeInfo: {
		name: 'heck',
		parameters: 'man',
		raw: 'heck|man',
	},
};

const httpTrack = 'QAAAggIACXRyYWNrLm1wMwAUPG5vIGF1dGhvciBwcm92aWRlZD4AAAAAAAAACgAYPG5vIGlkZW50aWZpZXIgcHJvdmlkZWQ+AAEAImh0dHA6Ly9zb21ld2Vic2l0ZS5ncmVlbi90cmFjay5tcDMABGh0dHAACGhlY2t8bWFuAAAAAAAAAAA=';

test('can encode HTTP track', () => {
	const encoded = encode(httpTrackInfo);
	expect(encoded).toBe(httpTrack);
});

test('can decode HTTP track', () => {
	const decoded = decode(httpTrack);
	expect(decoded).toStrictEqual({
		...httpTrackInfo,
		author: '<no author provided>',
		identifier: '<no identifier provided>',
	});
});
