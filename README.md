# Lavaplayer Track Info

Decode lavaplayer tracks locally, from a Buffer or base64 string.

# Installation

```
npm i lavaplayer-track-info
```

# Usage

```js
const { decodeTrack } = require("lavaplayer-track-info");

const track = "QAAAkwIANFNrcmlsbGV4ICYgSGFic3RyYWt0IC0gQ2hpY2tlbiBTb3VwIFtPZmZpY2lhbCBBdWRpb10ABU9XU0xBAAAAAAADLIAACzIyTVdyV1BWX1FNAAEAK2h0dHBzOi8vd3d3LnlvdXR1YmUuY29tL3dhdGNoP3Y9MjJNV3JXUFZfUU0AB3lvdXR1YmUAAAAAAAAAAA==";

console.log(decodeTrack(track));
console.log(decodeTrack(Buffer.from(track, "base64")));
```

Both log
```js
{ flags: 1,
  version: 2,
  title: 'Skrillex & Habstrakt - Chicken Soup [Official Audio]',
  author: 'OWSLA',
  length: 208000n,
  identifier: '22MWrWPV_QM',
  isStream: false,
  uri: 'https://www.youtube.com/watch?v=22MWrWPV_QM',
  source: 'youtube',
  position: 0n }
```