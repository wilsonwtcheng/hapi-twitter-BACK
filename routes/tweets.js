// routes/tweets.js

var Joi = require('joi');
var Auth = require('./auth'); // Why do we need this?

exports.register = function(server, options, next) {
  server.route([

    {
      // Retrieve all tweets
      method: 'GET',
      path: '/tweets',
      handler: function(request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;

        db.collection('tweets').find().toArray(function(err, tweets) {
          if (err) { return reply('Internal MongoDB error', err); }

          reply(tweets);
        });
      }
    },

    {
      // Retrieve one tweet
      method: 'GET',
      path: '/tweets/{id}',
      handler: function(request, reply) {
        var tweet_id = encodeURIComponent(request.params.id);
        var db = request.server.plugins['hapi-mongodb'].db;
        var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
        db.collection('tweets').findOne({ "_id": ObjectId(tweet_id)}, function(err, tweet) {
          if (err) { return reply('Internal MongoDB error', err); }
          reply(tweet);
        })
      }
    },

    {
      // Create a new tweet
      method: 'POST',
      path: '/tweets',
      config: {
        handler: function(request, reply) {
          Auth.authenticated(request, function(result) {
            if (result.authenticated) {
              var db = request.server.plugins['hapi-mongodb'].db;
              var session = request.session.get('hapi_twitter_session');
              var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
              var tweet = { 
                "message": request.payload.tweet.message,
                "user_id": ObjectId(session.user_id)
              };
              db.collection('tweets').insert(tweet, function(err, writeResult) {
                if (err) { return reply('Internal MongoDB error', err); }
                reply(writeResult);
              });
            } else {
              reply(result.message);
            }
          });
        },
        validate: {
          payload: {
            tweet: {
              // Required, Limited to 140 chars
              message: Joi.string().max(140).required()
            }
          }
        }
      }
    },

    {
      // Delete one tweet
      method: 'DELETE',
      path: '/tweets/{id}',
      handler: function(request, reply) {
        Auth.authenticated(request, function(result) {
          if (result.authenticated) {
            var tweet_id = encodeURIComponent(request.params.id);

            var db = request.server.plugins['hapi-mongodb'].db;
            var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;

            db.collection('tweets').remove({ "_id": ObjectId(tweet_id) }, function(err, writeResult) {
              if (err) { return reply('Internal MongoDB error', err); }

              reply(writeResult);
            });
          } else {
            reply(result.message);
          }
        });
      }
    },

    {
  // Retrieve all tweets by a specific user
      method: 'GET',
      path: '/users/{username}/tweets',
      handler: function(request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;
        var username = encodeURIComponent(request.params.username);

        db.collection('users').findOne({ "username": username }, function(err, user) {
          if (err) { return reply('Internal MongoDB error', err); }

          db.collection('tweets').find({ "user_id": user._id }).toArray(function(err, tweets) {
            if (err) { return reply('Internal MongoDB error', err); }

            reply(tweets);
          });
        })
      }
    },


  ]);

  next();
};

exports.register.attributes = {
  name: 'tweets-route',
  version: '0.0.1'
};




//    { //Retrieve all tweets WC
//      method: 'GET',
//      path: '/tweets',
//      handler: function(request, reply) {
//       var db = request.server.plugins['hapi-mongodb'].db;
//       db.collection("tweets").find().toArray(function(err, users) {
//         if(err) { 
//           return reply('Internal MongoDB error', err); 
//         }
//           reply(users);
//           console.log("great success! All the tweets.");
//       })
//      }
//    },

//     { //get tweets WC
//       method: "GET",
//       path: "/tweets/{wooWooWoo}", 
//       handler: function(request, reply) {
//         var id       = encodeURIComponent(request.params.wooWooWoo); //make sure it doesn't have weird stuff inside. you need the encode thing if you want to use MONGO.        
//         var db       = request.server.plugins['hapi-mongodb'].db;    
//         var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;    

//         db.collection("tweets").findOne( {"_id" :ObjectID(id) }, function(err, obtainedTweet) { //inside the function, err is the err, the second thing is the result.
//         if (err) throw err;
//         reply(obtainedTweet);
//           console.log("Obtained Tweet! success!")
//       });    
//       }
//     }, 

// //**
//   { //WC WIP OF TWEET
//     method: 'POST',
//     path: '/tweet',
//     config: {
//     handler: function(request, reply) { //ALWAYS request reply here.
//       var newUser = request.payload.userInfo;
//       var db = request.server.plugins['hapi-mongodb'].db;

//       Bcrypt.genSalt(10, function(err, salt){
//         Bcrypt.hash(newUser.password, salt, function(err, hash){ //newUser.password accesses the password
//           newUser.password = hash;
//           var uniqueUserQuery = {
//             $or: [ //or, count the number of matching username or matching email.
//               {username: newUser.username},
//               {email: newUser.email}
//             ]
//           };          
//           db.collection("users").count(uniqueUserQuery, function(err, userExist){ //if user exists, don't do it, if it doesn't exist, create user.
//             if(userExist) {
//               return reply("username or email already exists", err);
//             }
//             db.collection("users").insert(newUser, function(err, writeResult){
//               if(err) {
//                 return reply("you suck ass, usercreate FAIL");
//               }
//                 reply(writeResult);
//                 console.log("awesome man!")
//             });
//           });
//         })
//       });
//     },
//     validate: {
//         payload: {
//           userInfo: {
//             username: Joi.string().min(3).max(20).required(), 
//             email: Joi.string().email().max(50).required(),  
//             password: Joi.string().min(3).max(20).required(),
//           }
//         }
//     }
//     }
//   },