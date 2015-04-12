var defaults = require('defaults'),
		catbox = require('catbox'),
		crypto = require('crypto');

function Token(settings) {
	this.engine = settings.engine;
	this.config = {
		engineOptions: settings.engineOptions,
		segmentName: settings.segmentName,
		tokenLength: settings.tokenLength,
		checkIdentity: settings.checkIdentity,
		policyOptions: defaults(settings.policyOptions, {
			expiresIn: settings.expires
		})
	};
}

Token.prototype.start = function (cb) {
	var storage = this;
	this._client = new catbox.Client(this.engine, this.config.engineOptions);
	this._client.start(function (err) {
		if (err) return cb(err);
		storage._policy = new catbox.Policy(storage.config.policyOptions, storage._client, storage.config.segmentName);
		cb();
	});
};

Token.prototype.generate = function () {
	return crypto.randomBytes(this.config.tokenLength).toString('hex');
};

Token.prototype.store = function (identity, data, cb) {

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
};

Token.prototype.retrieve = function (token, identity, cb) {
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
};

Token.prototype.invalidate = function (token, cb) {
	this._policy.drop(token, cb);
};

module.exports = Token;
