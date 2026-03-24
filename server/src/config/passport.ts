import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import User from "../models/User";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.BASE_URL}/api/v1/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        if (!email) return done(new Error("No email returned from Google"), undefined);

        let user = await User.findOne({ email });

        if (!user) {
          const username = email.split("@")[0] + "_" + profile.id.slice(0, 6);
          user = await User.create({
            email,
            name: profile.displayName,
            username,
            password: "google-oauth-" + profile.id,
            emailVerified: true,
          });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
passport.serializeUser((user, done) => done(null, (user as any)._id));
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;
