const express = require('express');
const router = express.Router();
const { Users } = require('../models');
const {
  generateAccessToken,
  generateRefreshToken,
  sendAccessToken,
  sendRefreshToken,
} = require('./tokenControllers');

require('dotenv').config();
const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const axios = require('axios');


//TODO: API문서 응답 메세지 수정 필요

module.exports = {

//*회원가입컨트롤러
  signUpController: async(req, res) => {
    //! TODO: client에서 req.body에 socialId 넣었는 지 확인(API 문서 수정)
    const { isSocialAccount, password, email, username, socialId } = req.body;
    await Users.findOrCreate({
      where: { username },
      //! uuid필드 생성 
      defaults: { username: username, uuid: uuid(), email: email || null, password: password || null, isSocialAccount: isSocialAccount, socialId: socialId || null }
    })
    .then(([result, created]) => {
      if(!created) {
        res.status(409).send('Already Exist');
      }
      res.status(201).send({
        data: {
          //! res.data.userInfo
          userInfo : result.dataValues
        },
        message: 'Sign Up Successfully'
      })
    })
    .catch((err) => {
      res.status(422).send('Insufficient Information');
    })
  },

//*로그인컨트롤러
  logInController: async(req, res) => {
    const { email, password, uuid } = req.body;
    // 회원가입하고 로그인 할 때는 uuid로 전송 
    if( uuid === null ) {
      await Users.findOne({
        where: { email, password }
      })
      .then((result) => {
        if(!result) {
          res.status(401).send('Login Failed');
        } else {
          // TODO: accessToken과 refreshToken 생성
          // TODO: req.session.userId 에 uuid 입력
          // TODO: accessToken과 refreshToken 전송
          // ! 엑세스 토큰을 뭘로 암호화 할건지? uuid로 암호화 한다 
          delete result.dataValues.password;
          const accessToken = generateAccessToken(result.dataValues.uuid);
          const refreshToken = generateRefreshToken(result.dataValues.uuid);
    
          req.session.save( () => {
            //! session.userId에 uuid 활용
            req.session.userId = result.dataValues.uuid;
            sendAccessToken(res, accessToken, result.dataValues);
            sendRefreshToken(res, refreshToken, result.dataValues);
          });
        }
    })
    .catch((err) => {
      res.status(422).send('Insufficient Information');
    });
    } else {
      await Users.findOne({
        where: { uuid}
      })
      .then((result) => {
        if(!result) {
          res.status(401).send('Login Failed');
        } else {
          // TODO: accessToken과 refreshToken 생성
          // TODO: req.session.userId 에 uuid 입력
          // TODO: accessToken과 refreshToken 전송
          // ! 엑세스 토큰을 뭘로 암호화 할건지? uuid로 암호화 한다 
          delete result.dataValues.password;
          const accessToken = generateAccessToken(result.dataValues.uuid);
          const refreshToken = generateRefreshToken(result.dataValues.uuid);
    
          req.session.save( () => {
            //! session.userId에 uuid 활용
            req.session.userId = result.dataValues.uuid;
            sendAccessToken(res, accessToken, result.dataValues);
            sendRefreshToken(res, refreshToken, result.dataValues);
          });
        }
    })
    .catch((err) => {
      res.status(422).send('Insufficient Information');
    });
    }
  },

 //* 소셜로그인 할 때 프론트에서 authorizationCode를 전송해주면 accessToken을 깃허브로부터 받아서 전송해준다
 //! TODO: 시윤님한테 다시 확인 받기(경로 /getToken)
  getTokenController: (req, res) => { 
    axios({
      method: 'post',
      url: 'https://github.com/login/oauth/access_token',
      headers: {
        accept: 'application/json',
      },
      data: {
        client_id: clientID,
        client_secret: clientSecret,
       //! TODO: header에 들어오는 필드명 프론트랑 확인 필요
        code: req.body.authorization
      }
    }).then((result) => {
      const accessToken = result.access_token;
      const refreshToken = result.refresh_token;
      res.status(200).send({
        data: {
          accessToken,
          refreshToken
        }
      });
    }).catch((err) => {
      res.status(404).send(err);
    })
  },

 //* 소셜로그인 한 유저가 회원인지 판별 컨트롤러(/logcheck)
  logCheckController: async(req, res) => {
    const { socialId } = req.body;
    await Users.findOne({
      where: { socialId }
    })
    .then((result) => {
      if(!result) {
        res.status(404).send('Not our client');
      } res.status(202).send('recollect user');
    })
    .catch((err) => {
      res.status(500).send(err);
    })
    },

  //* 로그아웃 컨트롤러
  logoutController: (req, res) => {
    //TODO: authorization 인지 Authorization인지 체크
    if(!req.headers.authorization) {
      res.status(403).send('Log Out Failed');
    } else {
      req.session.destroy();
      //! TODO: 응답메세지 변경했음(API문서 수정 필요)
      res.status(205).send('Log out Succeeded');
    }
  },
}
  

