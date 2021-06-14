
const { isAuthorized } = require('./tokenControllers');
const { Users, sequelize } = require('../models');
const { Bookmarks } = require('../models');
const { Bookmark_Emojis } = require('../models');

// TODO: Access token에 있는 resource server를 확인하는 endpoint
// TODO : Mypage로부터 access token을 제대로 받아온 것이 맞다면, resource를 클라이언트로 보내야함
//! emoji를 보내줄때는 그냥 '1,2,3'과 같이 보내줘야 배열 형태로 변환 작업이 가능해짐

module.exports =  {
  //* 회원이 갖고 있는 Bookmark정보를 전달(GET "/mypage")
  renderingController: async(req, res) => {
    //TODO: myPage에서 req.body에 userId 넣어서 보내줘야 함-!!!
    const { username } = req.body;
    if(!req.headers.authorization) {
      res.status(403).send({
        message: 'no permission to access resources'
      })
      return;
    } else {
      //TODO: 해당 유저가 갖고있는 북마크크를 모두 전송
      const foundResult = await Users.findOne({
        where: { username }
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
          message: 'Failed To Load'
        })
      })
    }
  },
  //* bookmark 추가하는 작업(POST "/mypage")
  collectController: async(req, res) => {
    const {username, desc, url, emoji } = req.body;
    const emojiArr = emoji.split(',');
    console.log(`이모지 데이터 형태를 확인합니다 ${emojiArr}`);
    //TODO: emoji 전송 형태를 확인할 필요가 있음
    /* emoji = '1,2,3'; */
    const foundResult = await Users.findOne({
      where: { username }
    });
    //*해당유저의 id필드 값을 알아내야 함 -> Bookmark table에 데이터 추가
    console.log(foundResult.dataValues);
    const userId = foundResult.dataValues.id;
    const newBookmark = await Bookmarks.create({
      url: url,
      desc: desc,
      userId: userId
    });
    console.log(newBookmark.dataValues);
    if(newBookmark !== undefined) {
       //*bookmark의 id필드 값을 알아내야 함 -> Bookmark_Emojis table에 데이터 추가
        const bookmarkId = newBookmark.dataValues.id;
        
        await Bookmark_Emojis.create({
          bookmarkId: bookmarkId,
          emojiId: `${emoji[0]}`
        })
        .then((result) => {
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
  },
  //* Bookmark 삭제 요청(DELETE "/mypage")
  deleteBookmarkController: async(req, res) => {
    const { bookmarkId } = req.body;
    if(!req.headers.authorization) {
      res.status(401).send({
        message: 'Not Allowed'
      });
    } else {
      await Bookmarks.destroy({
        where: { id: bookmarkId }
      })
      .then((result) => {
        res.status(200).send({
          message: 'Deleted Successfully'
        })
      })
      .catch((err) => {
        console.error(err);
        res.status(501).send({
          message: 'Failed to delete'
        })
      })
    }
  },
  //* Bookmark 수정 요청(PATCH "/mypage")
  updateBookmarkController: async(req, res) => {
    const { bookmarkId, desc, url, emoji, username } = req.body;
    if(!req.headers.authorization) {
      res.status(401).send({
        message: 'Not Allowed'
      })
    } else {
      await Bookmarks.update({
        url: url,
        desc: desc
      }, {
        where: {
          id: bookmarkId
        }
      })
      .then((result) => {
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
  },
  //* accessToken
  accessTokenController: (req, res) => {
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      return res.send('invalid access token');
    }
    const { } = accessTokenData;
    Users.findOne({ where: {}})
  },
  //* refreshToken
  refreshTokenController: (req, res) => {
  }
}


