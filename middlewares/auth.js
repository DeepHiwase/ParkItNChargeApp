const { OAuth2Client } = require('google-auth-library')
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const jwt = require('jsonwebtoken')

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]
    const googleToken = token.length > 1000
    if (googleToken) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      const payload = ticket.getPayload()
      req.user = {
        id: payload.sub,
        name: payload.name,
        photoURL: payload.picture,
      }
    } else {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
      const { id, name, photoURL } = decodedToken
      req.user = { id, name, photoURL }
      console.log('Decoded token:', decodedToken);
    }
    next()
  } catch (error) {
    console.log(error)
    res.status(401).json({
      success: false,
      message: 'Something is wrong with your authorization!',
    })
  }
}

module.exports = auth
