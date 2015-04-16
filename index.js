var Hapi = require('hapi'); //goes to node modules and finds hapi. html usually double quotation. javascript usually single.

var server = new Hapi.Server();




server.connection({
	host: '0.0.0.0', //same as localhost. 
	port: process.env.PORT || 3000, //if you want to deploy to hiroku, then need to add the stuff at the front. It's an environment variable prepared by Heroku deployment. If can find, use that, otherwise, use 3000. Heroku is a remote server on the internet.
	routes: {
		cors : true //anyone on any computer can be made outside of the main name. eg. harrychen.com, if no cors true thenonly harrychen.com can make request.
	}
});


var plugins = [ //make any new file, just load it here.
	{ register: require('./routes/users.js') },
	{ register: require('./routes/sessions.js') },
	{ 
		register: require('hapi-mongodb'),
		options: {
			"url": "mongodb://127.0.0.1:27017/hapi-twitter",
			"settings": {
				"db": {
					"native_parser": false
				}
			}
		}
	}, 
	{
		register: require('yar'),
		options: {
			cookieOptions: {
			password: "password", //every cookie on the browser is a lock. password is password for simplicity.
			isSecure: false //false means you can use it without HTTPS
			}
		}
	}
];

//database also has its owner server. option tells it which database. 
  //   { 
  //     register: require('hapi-mongodb'),
  //     options: {
  //       url : "mongodb://127.0.0.1/harry", // 127.0.0.1 is ip of this machine. harry is name of database. as in "USE HARRY". 
  //       settings : {db: {"native_parser": false}},
  //     }
  //   } 
  // ];


server.register(plugins, function(err) { //pls recognize the plugins. need to tell them what to do.
	if (err) {throw err; }

	server.start(function() {
		console.log('info.', 'Server running at: ' + server.info.uri + ". This is awesome!");
	})
})


//when you go to localhost:3000 on brower, even if it says error not found, server is running, otherwise nothing would load.

