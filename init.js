
// Database
var mongo = require('mongodb');
var monk = require('monk');
var db = monk( process.env.DB_PATH || '127.0.0.1:27017/scoreboard');
// Password encryption
var bCrypt = require('bcrypt-nodejs');

// Get CLI arguments
var argv = require('minimist')(process.argv.slice(2));

// Generates hash using bCrypt
var createHash = function(password){
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

// Function to exit after callbacks
var createUser = true;
function exit(){
	if(createUser) process.exit();
}

// Create user if arguments are specified
if('user' in argv && 'password' in argv){
	createUser = false;
	console.log('The following user will be created:');
	console.log('User: '+ argv.user);
	console.log('Password: '+ argv.password);

	// create the user
	var newUser = { "username": argv.user,
	                "password": createHash(argv.password)
	                };
	// Get user collection
	var users = db.get('users');

	// Insert new user to database
	users.insert(newUser, function(err, result){
	    if (err){
	        console.log('Error in Saving user: '+err);  
	        throw err;  
	    }
	    createUser = true;
	    console.log('User Registration succesful');
	    exit();
	});
}
exit();