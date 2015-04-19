// Load modules

var Lab = require('lab');
var Code = require('code');

// Test shortcuts

var lab = exports.lab = Lab.script();
var before = lab.before;
var after = lab.after;
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;
var sinon = require('sinon');

describe('Token storage', function() {

	var Catbox = require('catbox');

    describe('general functions and initialization', function () {

        it('initializes without options', function (done) {
            expect(function () {
                require('../lib').storage();
            }).not.to.throw();

            done();

        });

        it('initializes with options', function (done) {
            expect(function () {
                require('../lib').storage({
                    expires: 48*60*60*1000
                });
            }).not.to.throw();

            done();

        });

        it('generates a token', function (done) {
            var token = require('../lib').storage().generate();
            expect(token).to.be.a.string();
            expect(token).to.have.length(64);
            done();
        });

        it('starts and stops the token storage', function (done) {
            var token = require('../lib').storage();
            token.start(function (err) {
                if (err) throw err;
                token.stop(done);
                done();
            });
        });

        it('errors on catbox engine start error', function (done) {
            var token = require('../lib').storage();

            sinon.stub(Catbox.Client.prototype, 'start', function (cb) {
                cb(new Error('Fake err'));
            });

            token.start(function (err) {
                expect(err).to.be.instanceof(Error);
                Catbox.Client.prototype.start.restore();
                done();
            });
        });
    });

    describe('token CRI', function () {

    	var tokenStorage = require('../lib').storage();

    	before(function (done) {
    		tokenStorage.start(done);
    	});

        after(function (done) {
            tokenStorage.stop();
            done();
        });

		it('creates tokens', function (done) {

			tokenStorage.store('me@me.com', function (err, token) {
				expect(token).to.be.a.string();
	    		expect(token).to.have.length(64);
				done();
			});

		});

    	it('creates tokens with additional data', function (done) {

    		tokenStorage.store('me@me.com', { type: 'forgot' }, function (err, token) {
    			expect(token).to.be.a.string();
        		expect(token).to.have.length(64);
    			done();
    		});

    	});

    	it('errors on policy error', function (done) {

    		sinon.stub(Catbox.Policy.prototype, 'set', function (key, value, ttl, cb) {
    			cb(new Error('Fake err'));
    		});

    		tokenStorage.store('me@me.com', function (err) {
    			expect(err).to.be.instanceof(Error);
    			Catbox.Policy.prototype.set.restore();
    			done();
    		});

    	});

    	it('retrieves token data', function (done) {

    		tokenStorage._policy.set('mytoken', {
    			identity: 'me@me.com',
    			foo: 'bar'
    		}, 5000, function (err) {
    			if (err) return done(err);

    			tokenStorage.retrieve('mytoken', 'me@me.com', function (err, data) {
                    if (err) {
                        return done(err);
                    }
    				expect(data.foo).to.equal('bar');
    				done();
    			});

    		});

    	});

        it('does not retrieve token data if it does not exist', function (done) {

            tokenStorage.retrieve('myothertoken', 'me@me.com', function (err, data) {
                expect(data).to.be.null();
                done();
            });

        });

    	it('does not retrieve token data if identity is wrong', function (done) {

    		tokenStorage._policy.set('mytoken', {
    			identity: 'me@me.com'
    		}, 5000, function (err) {
    			if (err) return done(err);

    			tokenStorage.retrieve('mytoken', 'me@moo.com', function (err, data) {
    				expect(err).to.be.instanceof(Error);
                    expect(err.message).to.contain('Invalid identity');
    				done();
    			});

    		});

    	});

        it('retrieves token data without identity if checkIdentity is false', function (done) {

            tokenStorage.config.checkIdentity = false;

            tokenStorage._policy.set('mytoken', {
                identity: 'me@me.com'
            }, 5000, function (err) {
                if (err) return done(err);

                tokenStorage.retrieve('mytoken', function (err, data) {
                    expect(data).to.be.an.object();
                    expect(data.identity).to.equal('me@me.com');
                    tokenStorage.config.checkIdentity = true;
                    done();
                });

            });

        });

        it('errors when trying to get token without identity when checkIdentity is true', function (done) {

            tokenStorage._policy.set('mytoken', {
                identity: 'beep@boop.com'
            }, 5000, function (err) {
                if (err) return done(err);

                tokenStorage.retrieve('mytoken', function (err, data) {
                    expect(err).to.be.instanceof(Error);
                    expect(err.message).to.contain('Identity has to be provided');
                    done();
                });

            });

        });


    	it('invalidates tokens', function (done) {

    		var dropSpy = sinon.spy(Catbox.Policy.prototype, 'drop');

			tokenStorage.invalidate('mytoken', function () {
				expect(dropSpy.calledWith('mytoken')).to.be.true();
				done();
			});

    	});


    });

});
