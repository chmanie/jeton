
var Hoek = require('hoek'),
		Joi = require('joi'),
		Token = require('./token');

var internals = {
	defaults: {
		expires: 24*60*60*1000,
		tokenLength: 32,
		checkIdentity: true,
		engine: require('catbox-memory'),
		engineOptions: {},
		storageName: 'tokens',
		segmentName: 'token',
		policyOptions: {}
	},
	schema: Joi.object({
		expires: Joi.number().integer().min(0).required(),
		tokenLength: Joi.number().integer().min(16).required(),
		checkIdentity: Joi.boolean().required(),
		engine: Joi.func().required(),
		engineOptions: Joi.object().options({ allowUnknown: true }),
		storageName: Joi.string().required(),
		segmentName: Joi.string().required(),
		policyOptions: Joi.object().options({ allowUnknown: true })
	})
};

module.exports = function (options) {

	options = options || {};

	var settings = Hoek.applyToDefaults(internals.defaults, options);

	Joi.assert(settings, internals.schema);

	return new Token(settings);
};
