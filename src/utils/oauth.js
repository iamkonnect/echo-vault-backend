/**
 * OAuth Configuration for EchoVault
 * Passport strategies for Google and Apple authentication
 */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const AppleStrategy = require('passport-apple').Strategy;
const prisma = require('./prisma');
const { generateToken } = require('./jwt');
const crypto = require('crypto');

const BASE_URL = process.env.BASE_URL || 'https://admin.echovaultz.com';
const CLIENT_URL = process.env.CLIENT_URL || 'https://echovaultz.com';

// ============ SERIALIZATION ============
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// ============ GOOGLE STRATEGY ============
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/api/auth/google/callback`,
    passReqToCallback: true,
  }, async (req, accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      const name = profile.displayName;
      const googleId = profile.id;

      if (!email) {
        return done(new Error('No email returned from Google'), null);
      }

      // Find or create user
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { authProviderId: googleId, authProvider: 'google' },
            { email }
          ]
        }
      });

      if (user) {
        // Update existing user with Google info
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            authProvider: 'google',
            authProviderId: googleId,
            avatarUrl: profile.photos?.[0]?.value || user.avatarUrl,
            lastLogin: new Date(),
            isOnline: true
          }
        });
      } else {
        // Create new user with Google
        const randomPassword = crypto.randomBytes(16).toString('hex');
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            username: email.split('@')[0] + '_' + Date.now().toString().slice(-4),
            password: randomPassword,
            role: 'USER',
            authProvider: 'google',
            authProviderId: googleId,
            avatarUrl: profile.photos?.[0]?.value || null,
            isVerified: true,
            emailVerified: true,
            isOnline: true
          }
        });
      }

      // Attach JWT token to user object for the callback route to use
      user.oauthToken = generateToken(user.id, user.role);
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
} else {
  console.warn('⚠️ Google OAuth not configured (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing)');
}

// ============ APPLE STRATEGY ============
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
  passport.use(new AppleStrategy({
    clientID: process.env.APPLE_CLIENT_ID,
    teamID: process.env.APPLE_TEAM_ID,
    keyID: process.env.APPLE_KEY_ID,
    privateKeyString: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    callbackURL: `${BASE_URL}/api/auth/apple/callback`,
    passReqToCallback: true,
  }, async (req, accessToken, refreshToken, idToken, profile, done) => {
    try {
      const email = profile?.email || (idToken?.email);
      const name = profile?.name?.firstName 
        ? `${profile.name.firstName} ${profile.name.lastName || ''}`.trim()
        : email?.split('@')[0] || 'Apple User';
      const appleId = profile?.id || idToken?.sub;

      if (!email && !appleId) {
        return done(new Error('No user identifier returned from Apple'), null);
      }

      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { authProviderId: appleId, authProvider: 'apple' },
            ...(email ? [{ email }] : [])
          ]
        }
      });

      if (user) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            authProvider: 'apple',
            authProviderId: appleId,
            lastLogin: new Date(),
            isOnline: true,
            ...(email && !user.email ? { email } : {})
          }
        });
      } else {
        const randomPassword = crypto.randomBytes(16).toString('hex');
        const userEmail = email || `apple_${appleId}@privaterelay.appleid.com`;
        user = await prisma.user.create({
          data: {
            email: userEmail,
            name,
            username: `apple_${Date.now().toString().slice(-6)}`,
            password: randomPassword,
            role: 'USER',
            authProvider: 'apple',
            authProviderId: appleId,
            isVerified: true,
            emailVerified: true,
            isOnline: true
          }
        });
      }

      user.oauthToken = generateToken(user.id, user.role);
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
} else {
  console.warn('⚠️ Apple OAuth not configured (APPLE_CLIENT_ID / APPLE_TEAM_ID / APPLE_KEY_ID / APPLE_PRIVATE_KEY missing)');
}

module.exports = passport;
