import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";


passport.use(
  new GoogleStrategy(
   {
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: process.env.BASE_UR!,
},
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        // TODO: find or create user in your DB
        const user = {
          id: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0].value,
          avatar: profile.photos?.[0].value,
        };
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user: Express.User, done) => done(null, user));

export default passport;