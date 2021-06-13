require("dotenv").config();
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const uuid = require('uuid');
const { Users } = require('../models');

// const {
//   sendAccessToken,
//   sendRefreshToken,
// } = require('./tokenControllers');

require('dotenv').config();
const accessDecrypt = process.env.ACCESS_SECRET;
const refreshDecrypt = process.env.REFRESH_SECRET;
const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const axios = require('axios');

const generateAccessToken = (data) => {
  return jwt.sign(data, accessDecrypt, {expiresIn: '1h'});
}
const generateRefreshToken = (data) => {
  return jwt.sign(data, refreshDecrypt, {expiresIn: '14d'});
}

//TODO: API문서 응답 메세지 수정 필요

module.exports = {

//*회원가입컨트롤러
  signUpController: async(req, res) => {
    //! TODO: client에서 req.body에 socialId 넣었는 지 확인(API 문서 수정)
    const { isSocialAccount, password, email, username } = req.body;
    const { socialId } = req.body.socialId;
    console.log(req.body.socialId.socialId);
    if(isSocialAccount === 1) {
      await Users.findOrCreate({
        where: { username },
        defaults: {uuid: uuid.v1(), username: username, email: null, password: null, isSocialAccount: isSocialAccount, socialId: socialId }
      })
      .then(([result, created]) => {
        if(!created) {
          res.status(409).send('Already Exist');
        }
        res.status(201).send({
          data: {
            userInfo: result.dataValues
          },
          message: 'Sign Up Successfully'
        })
      })
      .catch((err) => {
        console.error(err);
        res.status(422).send('Insufficient Information');
      })
    } else {
      await Users.findOrCreate({
      where: { email},
      defaults: { uuid: uuid.v1(), username: username, uuid: uuid.v1() , email: email , password: password, isSocialAccount: isSocialAccount, socialId: null}
    })
    .then(([result, created]) => {
      if(!created) {
        res.status(409).send('Already Exist');
      }
      res.status(201).send({
        data: {
          userInfo : result.dataValues
        },
        message: 'Sign Up Successfully'
      })
    })
    .catch((err) => {
      console.log(err);
      res.status(422).send('Insufficient Information');
    })
    }
  },

//*로그인컨트롤러
  logInController: async(req, res) => {
    console.log(req);
    const { email, password, uuid } = req.body;
    const { sessionID } = req;
    // 회원가입하고 로그인 할 때는 uuid로 전송 
    // sessionID 
    if(!sessionID) {
      //*로그인이 되지 않은 경우
      if( uuid === undefined ) {
        //*비소셜 로그인
          const result =  await Users.findOne({
            where: { email, password }
          });
          if(!result) {
            res.status(401).send('Login Failed');
          } else {
            delete result.dataValues.password;
            const accessToken = generateAccessToken(result.dataValues)
            const refreshToken = generateRefreshToken(result.dataValues);
            req.session.save( () => {
              //! session.userId에 uuid 활용
              req.session.userId = result.dataValues.uuid;
              res.cookie('refreshToken', refreshToken);
              res.status(200).send({
                data: {
                  accessToken,
                  username: result.dataValues.username
                },
                message: 'Login Successfully'
              });
            });
          }
      } else {
        Users.findOne({
          where: { uuid }
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
              res.cookie('refreshToken', refreshToken);
              res.status(200).send({
                data: {
                  accessToken,
                  username: result.dataValues.username
                },
                message: 'Login Successfully'
              });
            });
          }
      })
      .catch((err) => {
        console.error(err);
        res.cookie('refreshToken', refreshToken);
        res.status(422).send('Insufficient Information');
      });
    }      
  } else {
    //*로그인이 된 경우
    res.status(409).send('Already login');
  }
},
 //* 소셜로그인 할 때 프론트에서 authorizationCode를 전송해주면 accessToken을 깃허브로부터 받아서 전송해준다
  getTokenController: (req, res) => { 
    console.log("      🔍REQUEST CHECK🔍    ",req.body.authorizationCode);
    axios({
      method: 'post',
      url: 'https://github.com/login/oauth/access_token',
      headers: {
        accept: 'application/json',
      },
      data: {
        client_id: `75d98169bb09be4ab543`,
        client_secret: `4f2722a9eccf0a07b2b8670c5727e88b865ad9fe`,
        code: req.body.authorizationCode
      }
    }).then((result) => {
      const accessToken = result.data.access_token;
      console.log("        💡GITHUB DATA💡       ", result.data);
      console.log("ACCESS TOKEN: ", accessToken);
      // res.cookie('accessToken', accessToken);
      // res.status(200).send();
      res.status(200).send({
        data: {
          accessToken
        }
      });
    }).catch((err) => {
      res.status(404).send(err);
    })
  },

 //* 소셜로그인 한 유저가 회원인지 판별 컨트롤러(/logcheck)
  logCheckController: async(req, res) => {
    console.log('확인용:',req.body);
    const { socialId } = req.body;
    await Users.findOne({
      where: { socialId }
    })
    .then((result) => {
      if(!result) {
        res.status(404).send('Not our client');
      } else {
        res.status(202).send({
          data: {
            uuid: result.dataValues.uuid
          },
          message: 'recollect user'
        })
      } 
    })
    .catch((err) => {
      res.status(500).send(err);
    })
    },

  //* 로그아웃 컨트롤러
  logoutController: (req, res) => {
    if(!req.headers.authorization) {
      res.status(403).send('Log Out Failed');
    } else {
      req.session.destroy();
      //! TODO: 응답메세지 변경했음(API문서 수정 필요)
      res.status(205).send('Log out Succeeded');
    }
  },
}
  

