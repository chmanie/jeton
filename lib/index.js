
var defaults = require('defaults'),
		Token = require('./token');

module.exports = function (options) {

	var settings = defaults(options, {
		expires: 24*60*60*1000,
		tokenLength: 32,
		checkIdentity: true,
		engine: require('catbox-memory'),
		engineOptions: {},
		segmentName: 'token',
		policyOptions: {}
	});

	return new Token(settings);
};
