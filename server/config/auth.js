const jwt = require('jsonwebtoken');
const { GENERAL, SUPER } = require("../utils/Role");

module.exports = {
    ensureAuth: async (req, res, next) => {
        try {
          if (!req.headers.authorization) return res.status(401).json({ msg: 'Unauthenticated' });
          const accessToken = req.headers.authorization.split(" ")[1];
          if (!accessToken) return res.status(401).send({ msg: 'Unauthenticated' });
          const decodedToken = await jwt.verify(accessToken, process.env.JWT_SECRET);
          if (!decodedToken) return res.status(401).send({ msg: 'Unauthenticated' });
          console.log({decodedToken, role: decodedToken.role});
          if (decodedToken?.role !== GENERAL && decodedToken?.role !== SUPER ) return res.status(401).send({ msg: 'Unauthenticated' });
          req.userId = decodedToken?.id;
          req.userEmail = decodedToken?.email;
          req.userRole = decodedToken.role;
          next();
        } catch (error) {
          console.error(error);
          if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ msg: 'Unauthenticated' });
          }
          return res.status(500).json({ msg: error?.message || "Internal Server Error" });
        }
      },
    ensureGuast: (req, res, next) => {
        next(); // PASS
    }
}