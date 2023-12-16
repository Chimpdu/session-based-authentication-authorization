const LocalStrategy = require('passport-local').Strategy;
const bcryptjs = require('bcryptjs');


function initializePassport(passport, getUserByName, getUserByID) {
    const authenticateUser = async (username, password, done) => {
        const user = await getUserByName(username);
        if (!user) {
            console.log("User not found");
            return done(null, false);
        }
        try {
            if(await bcryptjs.compare(password, user.password)) {
                console.log(`User: ${username} has logged in`);
                return done(null, user);
            } else {
                console.log("password wrong");
                return done(null, false);
            }
        } catch (error) {
            return done(error, null);
        }
    }
    passport.use(new LocalStrategy(authenticateUser));
    passport.serializeUser((user, done)=> {
        return done(null, user._id);
    });
    passport.deserializeUser(async (_id, done)=> {
        try {
            const user = await getUserByID(_id);
            return done(null, user);  
        } catch (error) {
            done(error, null)
        }
    })
}

module.exports = initializePassport;