var login = require('./login');
var signup = require('./signup');

module.exports = function(passport,db){
    var collection = db.get('users');
	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user: ');console.log(user);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        collection.findOne({"_id": id}, function(err, user) {
            console.log('deserializing user:',user);
            done(err, user);
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport, db);
    signup(passport, db);

}