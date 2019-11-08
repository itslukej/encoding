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

test('can encode an empty track', () => {
	const encoded = encode({});
	expect(encoded).toBe('QAAAbgIAEzxubyB0aXRsZSBwcm92aWRlZD4AFDxubyBhdXRob3IgcHJvdmlkZWQ+AAAAAAAAAAAAGDxubyBpZGVudGlmaWVyIHByb3ZpZGVkPgAAABQ8bm8gc291cmNlIHByb3ZpZGVkPgAAAAAAAAAA');
});

test('can\'t encode a track into version 1', () => {
	expect(() => encode(trackInfo, 1)).toThrowError();
});

test('can decode a version 1 track', () => {
	test.todo('get a version 1 track to decode');
});

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
		parameters: null,
		raw: 'heck',
	},
};

const httpTrack = 'QAAAnAIAEzxubyB0aXRsZSBwcm92aWRlZD4AFDxubyBhdXRob3IgcHJvdmlkZWQ+AAAAAAAAAAoAGDxubyBpZGVudGlmaWVyIHByb3ZpZGVkPgABACJodHRwOi8vc29tZXdlYnNpdGUuZ3JlZW4vdHJhY2subXAzAARodHRwABg8bm8gcHJvYmUgaW5mbyBwcm92aWRlZD4AAAAAAAAAAA==';

test('can encode HTTP track', () => {
	const encoded = encode(httpTrackInfo);
	expect(encoded).toBe(httpTrack);
});

test('can decode HTTP track', () => {
	const decoded = decode(httpTrack);
	expect(decoded).toStrictEqual(httpTrackInfo);
});
