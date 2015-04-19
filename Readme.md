# jeton

[![Build Status](https://travis-ci.org/chmanie/jeton.svg)](https://travis-ci.org/chmanie/jeton)

This little tool creates disposable tokens (i.e. with an expiration date) which are stored. It is tailored to use in an email-verification or password-reset process where these kind of tokens are needed. To store the tokens and associated data, the power of [catbox](https://github.com/hapijs/catbox) is leveraged. It provides a lot of [strategies](https://github.com/hapijs/catbox#installation) for all kinds of persistent data-storages.

When a stored token is retrieved from db, the identity (i.e. the email address) is verified as an extra security measure.

## Installation

Install it via npm:

```
npm install jeton --save
```

Include it in your application:

```javascript
var jeton = require('jeton');
var storage = jeton.storage({
  expires: 24*60*60*1000, // 24 hours
  tokenLength: 32,
  checkIdentity: true,
  engine: require('catbox-memory'),
  engineOptions: {},
  segmentName: 'token',
  policyOptions: {}
});
```

## Configuration

The above example shows the default values. Per default it uses the catbox-memory engine, which does not persist data. **It is highly recommended that you use a persistent data storage module, that fit your needs/technology stack**.

#### expires (=86400000)

Time in milliseconds after the stored token is deleted automatically (invalidated). Defaults to 24h.

#### tokenLength (=32)

Token length in bytes.

#### checkIdentity (=true)

Checks for the correct identity on token retrieval. Means you have to know the identity (e.g. email) associated with a token when trying to retrieve it. Enabled by default.

#### engine (=require('catbox-memory'))

You **should** require your desired catbox [strategy](https://github.com/hapijs/catbox#installation) here. Otherwise all tokens will be lost when the server restarts. E.g. ```require('catbox-mongodb')```. Do not forget to install it via npm first.

#### engineOptions (={})

If the catbox strategy of your choice requires additional configuration (about 100% of the time), you can pass it here. Example for [catbox-mongodb](https://github.com/hapijs/catbox-mongodb#options):

```javascript
engineOptions: {
  host: '127.0.0.1',
  port: 27017,
  username: 'user', // if you need to auth with your db
  password: 'password', // if you need to auth with your db
  poolSize: 5,
  partition: 'tokens'
}
```

#### segmentName (='token')

The catbox segment name. It is used to isolate cached items within the cache partition. For example it would be a prefix in redis or a collection in MongoDB.

#### policyOptions (={})

Can be used to pass additional policyOptions to the catbox [policy](https://github.com/hapijs/catbox#policy).

## API

#### storage.start(callback)

This has to be run before you can start to store or retrieve tokens. It starts the catbox client and establishes a connection to your persistent data store. The callback is called, when the store is successfully initalized. Its signature is `callback(err)` where `err` can be an error passed by the catbox client (e.g. connection problems).

#### storage.stop()

This stops the storage and closes the database connection.

#### storage.store(identity, [data,] callback)

Generates a token and stores it while associating the identity. In most cases the identity will be your unique user identifier (e.g. an email address or userId). You can store additional data with the token, but this is optional. This could be the type of the token (e.g. password-reset or email-verification). The callback has the signature `callback(err, token)`, where `token` is the generated token-string.

Example:

```javascript
storage.store('foo@bar.com', { type: 'check-email' }, function(err, token) {
  if (err) {
    // handle error here
  }
  console.log(token); // 'b8cc762ccfd786e9663c86ce28635e245cf3baaf3a9da6669ffd9975280e22e2'
});
```

#### storage.retrieve(token, [identity,] callback)

Retrieves the associated data from store. If `checkIdentity` is enabled (which is default) the identity has to be provided as second argument. The callback has the signature `callback(err, data)` where `data` is the data originally saved with this token. If no token was found, `data` equals to null.

Example:

```javascript
storage.retrieve('b8cc762cc...', 'foo@bar.com', function(err, data) {
  if (err) {
    // handle error here
  }
  console.log(data);
  /*
    {
      identity: 'foo@bar.com',
      type: 'check-email'
    }
   */
});
```

#### storage.invalidate(token, callback)

After your token-based action (e.g. email-validation) is completed, you would typically invalidate (i.e. delete) the token. This can be achieved with this function. The callback has the signature `callback(err)`.

Example:

```javascript
storage.invalidate('b8cc762cc...', function(err) {
  if (err) {
    // handle error here
  }
  console.log('Successfully invalidated token.');
});
```

## License

The MIT License (MIT)

Copyright (c) 2014 Christian Maniewski

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
