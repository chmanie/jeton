// Load modules

var Lab = require('lab'),
    Hapi = require('hapi'),
    Code = require('code'),
    Boom = require('boom'),
    sinon = require('sinon');

// Declare internals

var internals = {};

// Test shortcuts

var lab = exports.lab = Lab.script();
var beforeEach = lab.beforeEach;
var describe = lab.experiment;
var it = lab.test;
var expect = Code.expect;

describe('folk main plugin', function() {

    var server;

    beforeEach(function (done) {
        server = new Hapi.Server();
        done();
    });

    describe('plugin registration', function () {

        it('should register with options and appends tokenStorage', function(done) {

            var mockPlugin = {
                register: sinon.spy(function (plugin, options, next) {
                    next();
                })
            };

            mockPlugin.register.attributes = { name: 'mock!'};

                server.pack.register({
                    plugin: require('../'),
                    options: {
                        modules: [
                            {
                                plugin: mockPlugin,
                                options: {}
                            }
                        ]
                    }
                }, function() {
                    expect(mockPlugin.register.called).to.be.true();
                    var opts = mockPlugin.register.getCall(0).args[1];
                    expect(opts.tokenStorage).to.be.an.object();
                    done();
                });

        });

        it('should register with no options', function(done) {

            var mockPlugin = {
                register: sinon.spy(function (plugin, options, next) {
                    next();
                })
            };

            mockPlugin.register.attributes = { name: 'mock!'};

                server.pack.register({
                    plugin: require('../'),
                    options: {
                        modules: [
                            {
                                plugin: mockPlugin
                            }
                        ]
                    }
                }, function() {
                    expect(mockPlugin.register.called).to.be.true();
                    var opts = mockPlugin.register.getCall(0).args[1];
                    expect(opts.tokenStorage).to.be.an.object();
                    done();
                });

        });


    });

});