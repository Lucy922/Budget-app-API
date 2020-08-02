const jwt = require('jsonwebtoken');
const jwt_decode = require('jwt-decode') 

function auth(req, res, next) {
  const token = req.headers['x-access-token']

  if (!token) {
    return res.status(400).json({
      status: "error",
      message: "No token provided"
    })
  }
 
  jwt.verify(token, process.env.TOKEN_SECRET, function (error) {
    if (error) {
      return res.status(400).send("verification failed")
    }

    const decoded = jwt_decode(token)
    req.userId = decoded._id
  })
  next()
}

module.exports = auth;