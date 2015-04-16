
exports.register = function(server, options, next) { //everything after register is loaded in "register" in index.js.
 
var Bcrypt = require('bcrypt'); // require would make it look into the node modules.
var Joi 	 = require('joi'); //because it's a library. Help us to distinguish betw variable, and variable leading to library.

 //include routes
 server.route([

 	{ 
 		method: 'POST',
 		path: '/login', // **PROBABLY NEED TO CHANGE THIS**
 		handler: function(request, reply) { //ALWAYS request reply here.

			//load the mongoDB
			var db = request.server.plugins['hapi-mongodb'].db;

			//read the payload
			var user = request.payload.userInfo; //userInfo is just for the stuff that goes in postman, eg. userInfo[username] : wilzon	

			//find if the user exists
			db.collection("users").findOne({"username": user.username}, function(err, userMongo) {
				if(err) {return reply ("Internal MongoDB error", err);}

				if (userMongo === null) {
					return reply({"message": "User doesn't exist"});
				// } else {return reply ("great success! username exists!");
				}

				Bcrypt.compare(user.password, userMongo.password, function(err, matched){
					if(matched) {
				 	//return reply ("great success! username exists! AUTHORIZE!*");
					
					// if password matches, authenticate user and add to cookie
					function randomKeyGenerator() {
						return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
					}

					// Generate a random key. Below is a common way of generating random key.
					var randomKey = (randomKeyGenerator() + randomKeyGenerator() + "-" + randomKeyGenerator() + "-4" + randomKeyGenerator().substr(0,3) + "-" + randomKeyGenerator() + "-" + randomKeyGenerator() + randomKeyGenerator() + randomKeyGenerator()).toLowerCase();

					var newSession = {
						"session_id" :randomKey,
						"user_id": userMongo._id,
					}

					db.collection("sessions").insert(newSession, function(err, writeResult) {
						if(err) {return reply("Internal MongoDB error", err);}

						// store the Session info in the browser Cookie with request sessions et.
						// we can do this because we have Yar

						request.session.set("hapi_twitter_session", { //name of hapi twitter session doesn't really matter.
							"session_key": randomKey,
							"user_id": userMongo._id
						});

						return reply(writeResult);

					});


					} else {
						reply({ "message":"Not authorized"});
					}
				});

			})

			// Bcrypt.genSalt(10, function(err, salt){
			// 	Bcrypt.hash(loginInfo.password, salt, function(err, hash){ //loginInfo.password accesses the password
			// 		loginInfo.password = hash;
		 // 			var uniqueUserQuery = {
		 // 				$or: [ //or, count the number of matching username or matching email.
		 // 					{username: loginInfo.username},
		 // 					{email: loginInfo.email}
			// 			]
			// 		};		 			
		 // 			db.collection("sessions").count(uniqueUserQuery, function(err, userExist){ //if user exists, don't do it, if it doesn't exist, create user.
		 // 				if(userExist) {
		 // 					return reply("username or email already exists", err);
		 // 				}
			//      	db.collection("sessions").insert(loginInfo, function(err, writeResult){
			//      		if(err) {
			//      			return reply("you suck ass, usercreate FAIL");
			//      		}
			//      			reply(writeResult);
			//      			console.log("awesome man!")
		 //   			});
		 //   		});
			// 	})
			// });
 		}

 		// validate: {
 		// 		payload: {
 		// 			userInfo: {
 		// 				username: Joi.string().min(5).max(20).required(), 
 		// 				email: Joi.string().email().max(50).required(),  
 		// 				password: Joi.string().min(5).max(20).required(),
 		// 			}
 		// 		}
 		// }

 	},

 	{
 		method: "GET",
 		path: "/authenticated",
 		handler: function(request, reply) {
 			//retrieve the session information from the browser
 			var session = request.session.get("hapi_twitter_session");
 			var db = request.server.plugins["hapi-mongodb"].db
 			db.collection("sessions").findOne({"session_id": session.session_key}, function(err, result){
 				if (result === null) {
 					return reply( { "message" : "Unauthorized! NOT SIGNED IN YET!" } );
				} else {
					return reply ( { "message" : "Authorized. Congrats!" } );
				}
 			});
 		}

 	}

 ])

 next();
};

// give this file some attributes
exports.register.attributes = { 
 name: 'sessions-route',
 version: '0.0.1'
}

