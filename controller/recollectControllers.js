const { 
  Users,
  sequelize
} = require('../models');

const { isAuthorized } = require('../controller/tokenControllers');

module.exports = {
  getRecollectController: async(req, res) => {
    const  uuid  = req.session.userId;
    console.log("uuid를 확인해봅니다", req.session);
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
      await sequelize.query(query)
      .then((result) => {
        res.status(200).send({
          data: {
            user,
            bookmark: result
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


