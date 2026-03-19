require('dotenv').config();

const passport = require('passport');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

const strategy = new JWTStrategy(options, (payload, done) => {
    if(payload.apiKey !== process.env.API_KEY) {
        return done(null, false, { message: 'Invalid API Key' });
    }

    return done(null, payload);
});

passport.use(strategy);

module.exports = passport;