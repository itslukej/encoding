import { encode, decode, TrackInfo } from './index';

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
	version: 1,
};

const track: string = 'QAAAjQIAJVJpY2sgQXN0bGV5IC0gTmV2ZXIgR29ubmEgR2l2ZSBZb3UgVXAADlJpY2tBc3RsZXlWRVZPAAAAAAADPCAAC2RRdzR3OVdnWGNRAAEAK2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9ZFF3NHc5V2dYY1EAB3lvdXR1YmUAAAAAAAAAAA==';

test('can encode tracks', () => {
	const encoded = encode(trackInfo);
	expect(encoded).toBe(track);
});

test('can decode tracks', () => {
	const decoded = decode(track);
	expect(decoded).toStrictEqual(trackInfo);
});
