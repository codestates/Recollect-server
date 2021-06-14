require("dotenv").config();

const jwt = require('jsonwebtoken');
const accessDecrypt = process.env.ACCESS_SECRET;
const refreshDecrypt = process.env.REFRESH_SECRET;

//* 토큰 타임스탬프 확인(jwt)
module.exports = {
  generateAccessToken: (data) => {
    console.log(data);
    return jwt.sign(data, accessDecrypt, { expiresIn: '1h' });
  },
  generateRefreshToken: (data) => {
    console.log(data);
    return jwt.sign(data, refreshDecrypt, { expiresIn: '14d' });
  },
  sendAccessToken: (res, accessToken, data) => {
    res.status(200).send({
      data: {
        accessToken,
        username: data.username
      },
      message: 'Login Successfully'
    });
  },
  sendRefreshToken: (res, refreshToken) => {
    //TODO: refreshToken cookie 보안옵션 설정
    res.cookie('refreshToken', refreshToken);
  },

  //* mypage에서 오게되는 요청 컨트롤러 
  resendAccessToken: (res, accessToken, data) => {
    req.headers.Authorization = accessToken;
    res.status(200).send({
      message: 'ok'
    });
  },
  isAuthorized: (req) => {
    //TODO: headers.authorization
    const authorization = req.headers.Authorization;
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
  },
};

