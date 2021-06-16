require("dotenv").config();
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const uuid = require("uuid");
const { Users } = require("../models");

const {
  generateAccessToken,
  generateRefreshToken,
  isAuthorized
} = require('./tokenControllers');

require("dotenv").config();
const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const axios = require("axios");

const processOfLogin = (req, res, result) => {
  if(!result) {
    return res.status(401).send('Login Failed');
  } else {
    delete result.dataValues.password;
    const accessToken = generateAccessToken(result.dataValues)
    const refreshToken = generateRefreshToken(result.dataValues);
    return req.session.save( () => {
      req.session.userId = result.dataValues.uuid;
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      res.cookie('refreshToken', refreshToken);
      res.status(200).send({
        data: {
          username: result.dataValues.username
        },
        message: 'Login Successfully'
      });
    });
  }
}

const processOfSignUp = (res, result, created) => {
  if(!created) {
    return res.status(409).send({
      message: 'Already Exists'
    });
  } else {
    return res.status(201).send({
      data: {
        userInfo: result.dataValues
      },
      message: 'Sign Up Successfully'
    })
  }
};

module.exports = {
  //*회원가입컨트롤러
  signUpController: async (req, res) => {
    const { isSocialAccount, password, email, username } = req.body;
    const { socialId } = req.body.socialId;
    if(isSocialAccount === 1) {
      const [result, created] = await Users.findOrCreate({
        where: { socialId },
        defaults: {
          uuid: uuid.v1(),
          username: username,
          isSocialAccount: isSocialAccount,
          socialId: socialId
        }
      });
      return processOfSignUp(res, result, created);
    } else {
      const [result, created] = await Users.findOrCreate({
        where: { email },
        defaults: {
          uuid: uuid.v1(),
          username: username,
          email: email,
          password: password,
          isSocialAccount: isSocialAccount
        },
      }); 
      return processOfSignUp(res, result, created);
    }
  },
//*로그인컨트롤러
  logInController: async(req, res) => {
    const { email, password, uuid } = req.body;
    const { userId } = req.session;
    // 회원가입하고 로그인 할 때는 uuid로 전송 
    if(!userId) {
      //*로그인이 되지 않은 경우
      if( uuid === undefined ) {
        //*비소셜 로그인
        const result = await Users.findOne({
          where: { email, password}
        });
        processOfLogin(req, res, result);
          
      } else {
        const result = await Users.findOne({
          where: { uuid }
        });
        processOfLogin(req, res, result);
    }      
  } else {
    //! API문서에서 추가된 사실 알려줄 것 
    //*로그인이 된 경우
    console.log("로그인한게 맞는 지 확인: ", req.session.userId);
    res.status(409).send('Already logged In');
  }
},
 //* 소셜로그인 할 때 프론트에서 authorizationCode를 전송해주면 accessToken을 깃허브로부터 받아서 전송해준다
 //! API문서에 추가가 안되어 있음 
  getTokenController: (req, res) => { 
    axios({
      method: 'post',
      url: 'https://github.com/login/oauth/access_token',
      headers: {
        accept: 'application/json',
      },
      data: {
        client_id: `${clientID}`,
        client_secret: `${clientSecret}`,
        code: req.body.authorizationCode
      }
    })
    .then((result) => {
      const accessToken = result.data.access_token;
      //! github accessToken도 data에 그대로 보내는 지 확인!
      res.setHeader('Authorization', `Bearer ${accessToken}`);
      res.status(200).send({
        message: 'ok'
      });
    })
    .catch((err) => {
      res.status(501).send({
        message: 'failed'
      });
    })
  },

 //* 소셜로그인 한 유저가 회원인지 판별 컨트롤러(/logcheck)
  logCheckController: async(req, res) => {
    console.log('확인용:',req.body);
    const { socialId } = req.body;
    await Users.findOne({
      where: { socialId },
    })
    .then((result) => {
      if(!result) {
        res.status(404).send('not our user');
      } else {
        res.status(202).send({
          data: {
            uuid: result.dataValues.uuid
          },
          message: 'ok'
        })
      } 
    })
    //! API문서 추가해준거 알려줄 것 
    .catch((err) => {
      res.status(500).send({
        message: 'failed'
      });
    })
    },
  //* 로그아웃 컨트롤러
  logoutController: (req, res) => {
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      res.status(403).send({
        message:'invalid access token'
      });
    } else {
      req.session.destroy();
      res.status(205).send({
        message: "Log Out Successfully"
      });
    }
  },
};
