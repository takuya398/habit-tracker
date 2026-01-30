const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

function sign(user){
  return jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' })
}

function verifyToken(token){
  try{
    return jwt.verify(token.replace(/^Bearer\s+/i, ''), SECRET)
  }catch(e){ return null }
}

module.exports = { sign, verifyToken }
