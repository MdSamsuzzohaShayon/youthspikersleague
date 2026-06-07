const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

module.exports = (passport) => {
    passport.use(new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async function (email, password, done) {

            const adminExist = await Admin.findOne({ email });
            if (!adminExist) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            const passwordMatched = await bcrypt.compare(password, admin.password);
            if (passwordMatched) {
                return done(null, admin);
            }
            return done(null, false);

        }
    ));
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        Admin.findById(id, function (err, user) {
            // const userInformation = {
            //     name: user.username,
            //     email: user
            // };

            // console.log("User detail - ", user);
            done(err, user);
        });
    });
}


