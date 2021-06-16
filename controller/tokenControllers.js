require("dotenv").config();

const jwt = require('jsonwebtoken');
const accessDecrypt = process.env.ACCESS_SECRET;
const refreshDecrypt = process.env.REFRESH_SECRET;

//* 토큰 타임스탬프 확인(jwt)
module.exports = {
  generateAccessToken: (data) => {
    return jwt.sign(data, accessDecrypt, { expiresIn: '1h' });
  },
  generateRefreshToken: (data) => {
    return jwt.sign(data, refreshDecrypt, { expiresIn: '14d' });
  },
  //* mypage에서 오게되는 요청 컨트롤러 
  resendAccessToken: (res, accessToken) => {
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.status(200).send({
      message: 'ok'
    });
  },
  isAuthorized: (req) => {
    const authorization = req.headers.authorization;
    console.log("확인작업:", authorization);
    if (!authorization) {
      return null;
    }
    const token = authorization.split(' ')[1];
    try {
      return jwt.verify(token, accessDecrypt);
    } catch {
      return null;
    }
  },
  checkRefreshToken: (refreshToken) => {
    try {
      return jwt.verify(refreshToken, refreshDecrypt);
    } catch {
      return null;
    }
  }
};

