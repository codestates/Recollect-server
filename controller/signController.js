const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const uuid = require("uuid");
const { Users } = require("../models");

// const {
//   sendAccessToken,
//   sendRefreshToken,
// } = require('./tokenControllers');

require("dotenv").config();
const accessDecrypt = process.env.ACCESS_SECRET;
const refreshDecrypt = process.env.REFRESH_SECRET;
const clientID = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;
const axios = require("axios");

const generateAccessToken = (data) => {
  return jwt.sign(data, accessDecrypt, { expiresIn: "1h" });
};
const generateRefreshToken = (data) => {
  return jwt.sign(data, refreshDecrypt, { expiresIn: "14d" });
};

//TODO: API문서 응답 메세지 수정 필요

module.exports = {
  //*회원가입컨트롤러
  signUpController: async (req, res) => {
    //! TODO: client에서 req.body에 socialId 넣었는 지 확인(API 문서 수정)
    const { isSocialAccount, password, email, username, socialId } = req.body;
    if (isSocialAccount === 1) {
      await Users.findOrCreate({
        where: { username },
        defaults: {
          uuid: uuid.v1(),
          username: username,
          email: null,
          password: null,
          isSocialAccount: isSocialAccount,
          socialId: socialId,
        },
      })
        .then(([result, created]) => {
          if (!created) {
            res.status(409).send("Already Exist");
          }
          res.status(201).send({
            data: {
              userInfo: result.dataValues,
            },
            message: "Sign Up Successfully",
          });
        })
        .catch((err) => {
          console.error(err);
          res.status(422).send("Insufficient Information");
        });
    } else {
      await Users.findOrCreate({
        where: { email },
        defaults: {
          uuid: uuid.v1(),
          username: username,
          uuid: uuid.v1(),
          email: email,
          password: password,
          isSocialAccount: isSocialAccount,
          socialId: null,
        },
      })
        .then(([result, created]) => {
          if (!created) {
            res.status(409).send("Already Exist");
          }
          res.status(201).send({
            data: {
              userInfo: result.dataValues,
            },
            message: "Sign Up Successfully",
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(422).send("Insufficient Information");
        });
    }
  },

  //*로그인컨트롤러
  logInController: async (req, res) => {
    console.log(req.body);
    const { email, password, uuid } = req.body;
    // 회원가입하고 로그인 할 때는 uuid로 전송
    if (uuid === undefined) {
      try {
        const result = await Users.findOne({
          where: { email, password },
        });
        //!
        console.log(result);
        if (!result) {
          res.status(401).send("Login Failed");
        } else {
          delete result.dataValues.password;
          const accessToken = generateAccessToken(result.dataValues);
          const refreshToken = generateRefreshToken(result.dataValues);
          //!
          console.log(accessToken);

          req.session.save(() => {
            //! session.userId에 uuid 활용
            req.session.userId = result.dataValues.uuid;
            res.cookie("refreshToken", refreshToken);
            res.status(200).send({
              data: {
                accessToken,
                username: result.dataValues.username,
              },
              message: "Login Successfully",
            });
          });
        }
      } catch (err) {
        console.error(err);
        res.status(422).send("Insufficient Information");
      }
    } else {
      Users.findOne({
        where: { uuid },
      })
        .then((result) => {
          if (!result) {
            res.status(401).send("Login Failed");
          } else {
            // TODO: accessToken과 refreshToken 생성
            // TODO: req.session.userId 에 uuid 입력
            // TODO: accessToken과 refreshToken 전송
            // ! 엑세스 토큰을 뭘로 암호화 할건지? uuid로 암호화 한다
            delete result.dataValues.password;
            const accessToken = generateAccessToken(result.dataValues.uuid);
            const refreshToken = generateRefreshToken(result.dataValues.uuid);

            req.session.save(() => {
              //! session.userId에 uuid 활용
              req.session.userId = result.dataValues.uuid;
              res.cookie("refreshToken", refreshToken);
              res.status(200).send({
                data: {
                  accessToken,
                  username: result.dataValues.username,
                },
                message: "Login Successfully",
              });
            });
          }
        })
        .catch((err) => {
          console.error(err);
          res.status(422).send("Insufficient Information");
        });
    }
  },

  //* 소셜로그인 할 때 프론트에서 authorizationCode를 전송해주면 accessToken을 깃허브로부터 받아서 전송해준다
  getTokenController: (req, res) => {
    console.log("      🔍REQUEST CHECK🔍    ", req.body.data.authorizationCode);
    axios({
      method: "post",
      url: "https://github.com/login/oauth/access_token",
      headers: {
        accept: "application/json",
      },
      data: {
        client_id: "749cea90f0ee8535f1fa",
        client_secret: "dd32ef6bef3293b42cde199d6a968bf3f5375200",
        code: req.body.data.authorizationCode,
      },
    })
      .then((result) => {
        const accessToken = result.data.access_token;
        const refreshToken = result.data.refresh_token;
        console.log("        💡GITHUB DATA💡       ", result.cookie);
        console.log("ACCESS TOKEN: ", accessToken);
        console.log("REFRESH TOKEN: ", refreshToken);
        res.status(200).send({
          data: {
            accessToken,
            refreshToken,
          },
        });
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  },

  //* 소셜로그인 한 유저가 회원인지 판별 컨트롤러(/logcheck)
  logCheckController: async (req, res) => {
    const { socialId } = req.body;
    await Users.findOne({
      where: { socialId },
    })
      .then((result) => {
        if (!result) {
          res.status(404).send("Not our client");
        }
        res.status(202).send("recollect user");
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  },

  //* 로그아웃 컨트롤러
  logoutController: (req, res) => {
    //TODO: authorization 인지 Authorization인지 체크
    if (!req.headers.authorization) {
      res.status(403).send("Log Out Failed");
    } else {
      req.session.destroy();
      //! TODO: 응답메세지 변경했음(API문서 수정 필요)
      res.status(205).send("Log out Succeeded");
    }
  },
};
