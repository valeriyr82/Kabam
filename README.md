Kabam
========

Higher level framework build on top of [Kabam's kernel](https://github.com/mykabam/kabam-kernel)

[![Build Status](https://travis-ci.org/mykabam/kabam.png)](https://travis-ci.org/mykabam/kabam)

Plugins included:

- [kabam-kernel](https://github.com/mykabam/kabam-kernel) - Kernel [![Build Status](https://travis-ci.org/mykabam/kabam-kernel.png)](https://travis-ci.org/mykabam/kabam-kernel)
- [kabam-plugin-hogan](https://github.com/mykabam/kabam-plugin-hogan) - hoganJS template engine - [![Build Status](https://travis-ci.org/mykabam/kabam-plugin-hogan.png)](https://travis-ci.org/mykabam/kabam-plugin-hogan)
- [kabam-plugin-welcome](https://github.com/mykabam/kabam-plugin-welcome) - static html authorization plugin
- [kabam-plugin-my-profile](https://github.com/mykabam/kabam-plugin-my-profile) - plugin to edit my profile
- [kabam-plugin-private-message](https://raw.github.com/mykabam/kabam-plugin-private-message) [![Build Status](https://travis-ci.org/mykabam/kabam-plugin-private-message.png)](https://travis-ci.org/mykabam/kabam-plugin-private-message)
- [kabam-plugin-notify-email](https://github.com/mykabam/kabam-plugin-notify-email) - notify users by email
- [kabam-plugin-rest](https://github.com/mykabam/kabam-plugin-rest) - REST interface for mongoose collections
- [kabam-plugin-spine](https://github.com/mykabam/kabam-plugin-spine) - Redis backended task queue [![Build Status](https://travis-ci.org/mykabam/kabam-plugin-spine.png?branch=master)](https://travis-ci.org/mykabam/kabam-plugin-spine)

Example
=========

We have an examples too, [check it out here](https://github.com/mykabam/kabam/blob/master/example/example.js).

Documentation
=========

For now Kabam object is kabamKernel object with preinstalled plugins.
All kabamKernel api is exposed on it.
[Please, have a good time to read more complete documentations](http://cd.monimus.com:8080/#/api).

Plugins are activated if they find proper field in config object:

```javascript

var kabam = Kabam({
  // required fields
  'hostUrl': 'http://vvv.msk0.ru/',
  'mongoUrl': 'mongodb://localhost/kabam_dev',
  'secret': 'Long_and_hard_secret',

  // optional fields
  'redis': 'redis://kabamKernel:@localhost:6379',
  'passport': {
    //activate autorization for facebook by /auth/facebook
    'FACEBOOK_APP_ID': '--insert-facebook-app-id-here--',
    'FACEBOOK_APP_SECRET': '--insert-facebook-app-secret-here--'
  },
  // activate kabam-plugin-notify-email
  'emailConfig': 'myemail@gmail.com:1234567',
  'spine': { //activate kabam-plugin-spine
    'domains': ['urgentTasks']
  }
});

```

Exposed API
================

 `Model`. Kabam fully exposes model object of kernel application, that includes all mongoose models,
 being used by this application

 `User model`. Kabam fully exposes kernel user model, so we can create, edit and do other user related tasks programmaticly.
 Actual documentation on User's model is published here [http://cd.monimus.com:8080/#/api/User](http://cd.monimus.com:8080/#/api/User).
 The user model itself is an Active Record class, build on top of [mongooseJS](http://mongoosejs.com/) schema.
 The user model instance - User, is described here - [http://cd.monimus.com:8080/#/api/User](http://cd.monimus.com:8080/#/api/User)

  Example:

```javascript

  kabam
    .model
    .User
    .findOne({
      'username': 'vodolaz095'
    }, function(err, userFound) {
      userFound.notify('email', 'Hello!');
      usesFound.setPassword('someNewPassword', function(err) {
        userFound.notify('email', 'Your new password is "someNewPassword"');
      });
    });

  kabam
    .model
    .User
    .signUp('vodolaz095', 'vodolaz096@example.org', 'SomeLooongAndHardPassw0rd',
      function(err, userCreated) {
        userFound.notify('email', 'Hello! Verify your email please, see our previous message!');
      });

```

  `redis`. Kabam can spawn ready to work redis clients by command [kabam.createRedisClient](http://ci.monimus.com/docs/#/api/kabamKernel.createRedisClient)

```javascript

  var client = kabam.createRedisClient();
  client.set('someValue', '1', function(err) {
    if (err) throw err;
    console.log('value is set!');
  });

```

  `Event emmiter` - kabam inherites the event emmiting capabilities from kernel, and kernel inherits it from [nodejs event emmiter](http://nodejs.org/api/events.html)
  For now kabam emits events on various of situation. They are mainly documented here [http://ci.monimus.com/docs/#/api/kabamKernel.on](http://ci.monimus.com/docs/#/api/kabamKernel.on)
  For example,

```javascript

  kabam.on('http', function(log) { //basic http logger
    if (log.username) {
      console.log('User "' + log.username +
        '" made ' + log.method + ' request to page ' + log.uri +
        ' from IP of '.log.ip);
    } else {
      console.log('User "Anonimus" made ' + log.method +
        ' request to page ' + log.uri + ' from IP of '.log.ip);
    }
  });

  //event handler for user being registered
  kabamKernel.on('users:signUp', function(user) {
    if (user.email === 'freddyKrugger@example.org') {
      user.ban(function(err) {
        if (err) throw err;
      })
    } else {
      console.log('Welcome, ' + user.username + '!');
    }
  });

```

HTTP - REST API
================

Routes, related to user authorization and authentication.
POST requests can be simple html form submits or can be application/json types.
If post request have type application/json, kabam responds with application/json page.
If request is from form submit, browser is redirected with 302 code.
There is a CSRF protection present - client have to include the value of cookie of
`CSRF-TOKEN` in each POST/PUT/DELETE requests as a field of `_csrf`. When submiting the form this
value is usually printed in form and in views like this:

```html

    <input type="hidden" name="_csrf" value="[[_csrf]"/>

```


For non authorized user there is this routes present :

- `GET /auth/google` - try to autorize user via Google Account  by oAuth. If user with this email is not present in database, we create his/her account with verified gmail address, but without username and password. When user starts work with site, he\she prompted to enter them.
- `GET /auth/twitter` - try to autorize user via Twitter Account by oAuth
- `GET /auth/github` - try to autorize user via Github Account  by oAuth
- `GET /auth/facebook` - try to autorize user via Facebook Account  by oAuth
- `GET /auth/confirm/veryLongHashKey` - usually this links are recieved by email after registration.
- `GET /login` - Page to singin\signup.
- `POST /auth/login` - authorize by login and password with two mandatory parameters - `username` and `password`.
- `POST /auth/signup` - create new user account with 3 mandatory parameters - `username`,`email` and `password`.
- `POST /auth/isBusy` - route to be executed by ajax to determine, if username or email is in use. Two mandatory parameters - `username` and `email`. Response is a JSON object with information about it, like this - `{ 'username':'OK', 'email': 'OK' }`
- `POST /auth/completeProfile` - complete user profile (set username and password) when user tryes to register via Google account. Two mandatory parameters - `username` and `password`.
- `GET /auth/restoreAccount` - page where one can request email with link to page to reset his password.
- `POST /auth/restoreAccount` - send email with link to restore access to account. Mandatory paramerer - `email`.
- `POST /auth/resetPassword` - reset password for current user. Mandatory parameters are `apiKey` and `password`.

We are working on the live documentation here - [http://docs.mykabam.apiary.io/](http://docs.mykabam.apiary.io/)

Documentation disclaimer
================
Product is at state of development. But documentation are always correct.
It means that if feature is documented, it WORKS as documented.
But there can be more features, that are not documented.



Responsibility guidelines
================

Every Kabam's plugins and package has a maintainer. The maintainers will help to:

1. Maintain the package - fix and find bugs from upgrading modules included or nodejs version change
2. Respond to reported issues or bugs
3. Accept/deny pull request

The `Push` and `npm publish` privilege is the right of the `Responsible developer`. If you are interested to help us make things better here, please fork it and send us a pull request.

Responsible developer for this package is  [Anatolij Ostroumov](https://github.com/vodolaz095).

Deployment on heroku
================

We need to add custom buildpack for cairo lib - used in captcha

```shell
  $ heroku config:set BUILDPACK_URL='git://github.com/mojodna/heroku-buildpack-nodejs.git#cairo'
```

We need to install one of Redis and one MongoDB providers available at [https://addons.heroku.com](https://addons.heroku.com)

We need to manually set the hostUrl
```shell
  $ heroku config:set hostUrl='http://mykabam.herokuapp.com/'
```

We need to set the email credentials for application

```shell
  $ heroku config:set emailConfig='mywebclass@webizly.com:someVeryLongAndHardPasswordToIrritateSpammersALittleMore111111'
```

You can try this application in action - [http://mykabam.herokuapp.com/](http://mykabam.herokuapp.com/).
For now

 - You can sign up by username, email and password
 - Sign in by username and login
 - Edit profile [http://mykabam.herokuapp.com/auth/myProfile](http://mykabam.herokuapp.com/auth/myProfile)
 - See how geotagging works here [http://mykabam.herokuapp.com/](http://mykabam.herokuapp.com/). For me it shows that i  am in town of Moscow, but i am in city of Klin now... 50km from Moscow
 - Set first name, last name, skype and attach github/twitter accounts (facebook do not works for now)



License
========

Licensed under the MIT License.