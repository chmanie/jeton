var Joi = require('joi'),
		Hoek = require('hoek');

var internals = {
	defaults: {
		modules: []
	},
	schema: Joi.object({
		tokenStorage: Joi.object().optional(),
		modules: Joi.array().includes({
			plugin: Joi.object().required(),
			options: Joi.object().optional()
		})
	})
};

exports.register = function (plugin, options, next) {

	var settings = Hoek.applyToDefaults(internals.defaults, options);

	Joi.assert(settings, internals.schema);

	internals.tokenStorage = require('./token_storage')(settings.tokenStorage);

	settings.modules.forEach(function (module) {
		module.options = module.options || {};
		module.options.tokenStorage = internals.tokenStorage;
	});

	internals.tokenStorage.start(function () {

		plugin.register(settings.modules, next);

	});

};

exports.register.attributes = {
	pkg: require('../package.json')
};