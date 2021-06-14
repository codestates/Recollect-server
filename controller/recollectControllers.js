// req.session.id 에서 uuid 추출해서 Users를 가질 수 있다 
// count가 0인 모든 북마크를 전송
// delete Password 

const { 
  Users,
  sequelize
} = require('../models');

const { isAuthorized } = require('../controller');

module.exports = {
  getRecollectController: async(req, res) => {
    const { uuid } = req.session.userId;
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      res.status(401).send({
        message: 'not allowed'
      })
    } else {
      const user = await Users.findOne({
        where: { uuid }
      });
      const query = `SELECT Bookmarks.id, Bookmarks.url, Bookmarks.visitCounts, Bookmarks.descrip, Bookmarks.createdAt, Bookmarks.updatedAt, Bookmarks.userId, Emojis.icon FROM Bookmarks
      JOIN Bookmark_Emojis 
      ON Bookmark_Emojis.emojiId  IN (SELECT id FROM Emojis)
      JOIN Emojis 
      ON Emojis.id = Bookmark_Emojis.emojiId 
      WHERE Bookmarks.userId = ${user.dataValues.id} AND Bookmarks.visitCounts = 0
      ORDER BY id ASC;`;
      const bookmark = await sequelize.query(query)
      .then((result) => {
        res.status(200).send({
          data: {
            user,
            bookmark
          }
        })
      })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Cannot Find');
    })
    }
  }
}


