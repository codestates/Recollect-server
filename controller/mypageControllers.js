const { Users, sequelize, Bookmarks, Bookmark_Emojis } = require('../models');

const { 
  isAuthorized, 
  checkRefreshToken, 
  generateAccessToken,
  resendAccessToken,
} = require('./tokenControllers');

module.exports =  {
  //* 회원이 갖고 있는 Bookmark정보를 전달(GET "/mypage")
  renderingController: async(req, res) => {
    console.log(req.session);
    const uuid = req.session.userId;
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      return res.status(401).send({
        message: 'invalid access token'
      });
    } else {
      //TODO: 해당 유저가 갖고있는 북마크크를 모두 전송
      const foundResult = await Users.findOne({
        where: { uuid }
      });
      console.log(foundResult);
      const user = foundResult.dataValues;
      const userId = foundResult.dataValues.id;
      let query = `SELECT Bookmarks.id, Bookmarks.url, Bookmarks.visitCounts, Bookmarks.descrip, Bookmarks.createdAt, Bookmarks.updatedAt, Bookmarks.userId, Emojis.icon FROM Bookmarks
      JOIN Bookmark_Emojis 
      ON Bookmark_Emojis.emojiId  IN (SELECT id FROM Emojis)
      JOIN Emojis 
      ON Emojis.id = Bookmark_Emojis.emojiId 
      WHERE Bookmarks.userId = ${userId}
      ORDER BY id ASC`;
      await sequelize.query(query)
      .then(([result, metadata]) => {
        console.log('가져온 결과값을 확인', metadata);
        res.status(200).send({
          data: {
            user,
            bookmark: metadata
          }
        })
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send({
          message: 'failed'
        })
      })
    }
  },
  //* bookmark 추가하는 작업(POST "/mypage")
  collectController: async(req, res) => {
    const {username, desc, url, emoji } = req.body;
    const emojiArr = emoji.split(',');
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      return res.status(401).send({
        message: 'invalid access token'
      }); 
    } else {
      const foundResult = await Users.findOne({
        where: { username }
      });
      //*해당유저의 id필드 값을 알아내야 함 -> Bookmark table에 데이터 추가
      console.log('데이터 출력',foundResult);
      const userId = foundResult.dataValues.id;
      const newBookmark = await Bookmarks.create({
        url: url,
        descrip: desc,
        userId: userId
      });
      console.log(newBookmark.dataValues);
      if(newBookmark !== undefined) {
         //*bookmark의 id필드 값을 알아내야 함 -> Bookmark_Emojis table에 데이터 추가
          const bookmarkId = newBookmark.dataValues.id;
          const insertData = (async(id) => {
            await Bookmark_Emojis.create({
              bookmarkId: bookmarkId,
              emojiId: id
            })
          });
          await Promise.all(
            emojiArr.map( (id) => {
              return insertData(id);
            })
          )
          .then(() => {
            res.status(201).send({
              message: 'Created Successfully'
            })
          })
          .catch((err) => {
            console.log('조인테이블에 데이터가 제대로 입력되지 않았습니다');
            res.status(501).send({
              message: 'Failed To Created'
            })
          })
      } else {
        console.log('북마크 생성이 제대로 수행되지 않았습니다');
        res.status(501).send({
          message: 'Failed To Created'
        })
      }
    }
  },
  //* Bookmark 삭제 요청(PATCH "/mypage")
  deleteBookmarkController: async(req, res) => {
    const id = req.body.bookmarkId;
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      res.status(401).send({
        message: 'Not Allowed'
      });
    } else {
      const destroyBookmark = Bookmarks.destroy({
        where: { id }
      });
      const destroyEmojis = Bookmark_Emojis.destroy({
        where: { bookmarkId: id }
      });
      Promise
      .all([destroyBookmark, destroyEmojis])
      .then(() => {
        return res.status(200).send({
          message: 'Deleted Successfully'
        })
      })
      .catch((err) => {
        console.error(err);
        return res.status(501).send({
          message: 'Failed To Delete'
        })
      })
    }
  },
  //* Bookmark 수정 요청(PUT "/mypage")
  updateBookmarkController: async(req, res) => {
    const { bookmarkId, desc, url, emoji } = req.body;
    console.log("길이확인", emoji.length);
    const emojiArr = emoji.split(',');
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      return res.status(401).send({
        message: 'Not Allowed'
      })
    } else {
      const updateBookmark = Bookmarks.update({
        url: url,
        descrip: desc
      }, {
        where: {
          id: bookmarkId
        }
      });
      const insertData = (async(id) => {
        await Bookmark_Emojis.create({
          bookmarkId: bookmarkId,
          emojiId: id
        })
      });
      const deleteEmojiChains = Bookmark_Emojis.destroy({
        where: { bookmarkId: bookmarkId }
      });
      const updateEmojis = await Promise.all(
        emojiArr.map( (id) => {
          return insertData(id);
        })
      );
      if( emoji.length === 0 ){
        console.log('정확한 위치가 어디인지 확인하세요');
        await updateBookmark(url, desc, bookmarkId)
        .then((result) => {
          res.status(200).send({
            message: 'Edited Successfully'
          });
        })
        .catch((err) => {
          console.error(err);
          return res.status(501).send({
            message: 'Failed To Edit'
          });
        })
        return;
      } else {
        Promise
        .all([updateBookmark,,deleteEmojiChains,updateEmojis])
        .then(() => {
          res.status(200).send({
            message: 'Edited Successfully'
          })
        })
        .catch((err) => {
          console.error(err);
          res.status(501).send({
            message: 'Failed To Edit'
          })
        })
      }
    } 
  },
  //* refreshToken
  refreshTokenController: async(req, res) => {
    const { uuid } = req.session.userId;
    const refreshTokenData = checkRefreshToken(req.cookie.refreshToken);
    if(!refreshTokenData) {
      return res.status(401).send('invalid refresh token');
    } else {
      await Users.findOne({
        where: { uuid }
      })
      .then((result) => {
        const accessToken = generateAccessToken(result.dataValues);
        return resendAccessToken(res, accessToken);
      })
      .catch((err) => {
        return res.status(501).send({
          message: 'Failed To Create'
        })
      })
    }
  }
}


