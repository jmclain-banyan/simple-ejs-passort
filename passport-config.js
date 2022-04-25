const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require('bcrypt');

const initialize = (passport, getUserbyEmail, getUserById) => {
  const authenticateUser = async (email, password, done) => {
    const user = getUserbyEmail(email);
    if (user == null) {
      return done(null, false, { message: "no user with that email" });
    }

    try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            return done(null, user)
        } else {
            return done(null, false, { message: 'password incorrect' });
        }

    } catch (err) {
        return done(err)
    }
  };
  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
      return done(null, getUserById(id))
  });
}

module.exports = initialize;
