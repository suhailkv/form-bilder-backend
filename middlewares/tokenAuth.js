const jwt = require("jsonwebtoken");
const config = require("../config/config").app;
const { User, RefreshToken } = require("../models");

async function tokenAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const sessionCookie = req.cookies.session;
  const refreshCookie = req.cookies.refreshToken;

  // === Step 1: Check JWT token in headers or cookie ===
  let accessToken = null;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    accessToken = authHeader.slice(7);
  } else if (sessionCookie) {
    accessToken = sessionCookie;
  }

  if (accessToken) {
    try {
      const payload = jwt.verify(accessToken, config.jwtSecret);
      const user = await User.findByPk(payload.userId,
        {
            attributes : [
                ["userID","userId"],
                "email",
                "name"
            ],
            raw : true
        },
       
    );
      if (!user) return res.status(401).json({ message: "Unauthorized" });
        const userData = 
      req.user = user;
      return next();
    } catch (err) {
      if (err.name !== "TokenExpiredError") {
        return res.status(401).json({ message: "Invalid token" });
      }

      // === Step 1b: Access token expired → try refresh token ===
      if (!refreshCookie) {
        return res.status(401).json({ message: "Session Expired" });
      }

      try {
        const refreshPayload = jwt.verify(refreshCookie, config.refreshTokenSecret);

        const user = await User.findByPk(refreshPayload.userId);
        if (!user) return res.status(401).json({ message: "Unauthorized" });

        // Check refresh token in DB
        // const tokenRecord = await RefreshToken.findOne({
        //   where: { token: refreshCookie, userId: user.id }
        // });
        // if (!tokenRecord) return res.status(401).json({ message: "Invalid refresh token" });

        // Issue new access token
        const newAccessToken = jwt.sign(
          { userId: user.id },
          config.jwtSecret,
          { expiresIn: "1h" }
        );

        res.cookie("session", newAccessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "Strict",
          maxAge: 60 * 60 * 1000,
        });

        req.user = user;
        return next();
      } catch (refreshErr) {
        return res.status(401).json({ message: "Invalid refresh token" });
      }
    }
  }

  // === Step 2: Check query token ===
  const queryToken = req.query.token;
  if (queryToken) {
    try {
      const payload = jwt.verify(queryToken, config.linkTokenSecret);

      const user = await User.findByPk(payload.userId);
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      // Issue access token
      const accessToken = jwt.sign(
        { userId: user.userID },
        config.jwtSecret,
        { expiresIn: "1h" }
      );

      // Issue refresh token
      const refreshToken = jwt.sign(
        { userId: user.userID },
        config.refreshTokenSecret,
        { expiresIn: "7d" }
      );

      // Store refresh token in DB (or Redis)
    //   await RefreshToken.create({ userId: user.userID, token: refreshToken });

      // Send tokens in HttpOnly cookies
      res.cookie("session", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 60 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      req.user = { userId: user.userID };
      return next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid query token" });
    }
  }

  return res.status(401).json({ message: "No token provided" });
}

module.exports = tokenAuth;
