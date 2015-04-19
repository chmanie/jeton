'use strict';

var catbox = require('catbox'),
		assign = require('object-assign'),
		crypto = require('crypto');

var storage = {

	start: function start (cb) {
		var storage = this;
		this._client.start(function (err) {
			if (err) return cb(err);
			storage._policy = new catbox.Policy(storage.config.policyOptions, storage._client, storage.config.segmentName);
			cb();
		});
	},

	stop: function stop () {
		this._client.stop();
	},

	generate: function generate () {
		return crypto.randomBytes(this.config.tokenLength).toString('hex');
	},

	store: function store (identity, data, cb) {

		if ('function' === typeof data) {
			cb = data;
			data = null;
		}

		var token = this.generate();
		this._policy.set(token, {
			identity: identity,
			data: data
		}, 0, function (err) {
			if (err) return cb(err);
			cb(null, token);
		});
	},

	retrieve: function retrieve (token, identity, cb) {
		var storage = this;

		if (typeof identity === 'function') {
			cb = identity;
			identity = null;
			if (storage.config.checkIdentity) {
				return cb(new Error('Identity has to be provided when checkIdentity is enabled'));
			}
		}

		this._policy.get(token, function (err, value) {
			if (!value) return cb(err, value);
			if (storage.config.checkIdentity) {
				if (identity !== value.identity) return cb(new Error('Invalid identity'));
			}
			cb(err, value);
		});
	},

	invalidate: function invalidate (token, cb) {
		this._policy.drop(token, cb);
	}

};

module.exports = {
	storage: function (config) {

		config = assign({
			expires: 24*60*60*1000,
			tokenLength: 32,
			checkIdentity: true,
			engine: require('catbox-memory'),
			engineOptions: {},
			segmentName: 'token',
			policyOptions: {}
		}, config);

		return assign(Object.create(storage), {
			config: config,
			_client: new catbox.Client(config.engine, config.engineOptions)
		});

	}
};
