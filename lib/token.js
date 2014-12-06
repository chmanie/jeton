var Hoek = require('hoek'),
	Catbox = require('catbox'),
	Crypto = require('crypto');

function Token(settings) {
	this.engine = settings.engine;
	this.clientOptions = Hoek.applyToDefaults({
		partition: settings.storageName
	}, settings.engineOptions);
	this.policyOptions = Hoek.applyToDefaults({
		expiresIn: settings.expires
	}, settings.policyOptions);
	this.segmentName = settings.segmentName;
	this.tokenLength = settings.tokenLength;
}

Token.prototype.start = function (cb) {
	var storage = this;
	this._client = new Catbox.Client(this.engine, this.clientOptions);
	this._client.start(function (err) {
		if (err) return cb(err);
		storage._policy = new Catbox.Policy(storage.policyOptions, storage._client, storage.segmentName);
		cb();
	});
};

Token.prototype.generate = function () {
	return Crypto.randomBytes(this.tokenLength).toString('hex');
};

Token.prototype.create = function (identity, data, cb) {

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
	this._policy.get(token, function (err, value) {
		if (!value || identity !== value.identity) return cb();
		cb(err, value);
	});
};

Token.prototype.invalidate = function (token, cb) {
	this._policy.drop(token, cb);
};

module.exports = Token;