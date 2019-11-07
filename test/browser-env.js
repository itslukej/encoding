const Environment = require('jest-environment-jsdom');
const { TextEncoder, TextDecoder } = require('util');

// https://stackoverflow.com/a/57713960
module.exports = class CustomTestEnvironment extends Environment {
	async setup() {
		await super.setup();

		this.global.TextEncoder = TextEncoder;
		this.global.TextDecoder = TextDecoder;
	}
}
