
const { isAuthorized } = require('./tokenControllers');
const { Users } = require('../models');
const { Bookmark } = require('../models');

// TODO: Access token에 있는 resource server를 확인하는 endpoint
// TODO : Mypage로부터 access token을 제대로 받아온 것이 맞다면, resource를 클라이언트로 보내야함


module.exports =  {
  //* 회원이 갖고 있는 Bookmark정보를 전달
  renderingController: (req, res) => {
    if(!req.headers.authorization) {
      res.status(403).send({
        message: 'no permission to access resources'
      })
      return;
    } else {
//TODO: 해당 유저가 갖고있는 북마크크를 모두 전송
      await Users.
      res.status(200).send({
        user,
        bookmark
      })
    }
  },
  //* accessToken
//! TODO: Mypage에서 accessToken 요청 
  accessTokenController: (req, res) => {
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      return res.send('invalid access token');
    }
    const { } = accessTokenData;
    User.findOne({ where: {}})
  },
    //* refreshToken
//! TODO: Mypage에서 refreshToken 요청




}








