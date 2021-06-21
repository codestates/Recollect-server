const { 
  Users,
  sequelize
} = require('../models');

const { isAuthorized } = require('../controller/tokenControllers');

module.exports = {
  getRecollectController: async(req, res) => {
    const  uuid  = req.session.userId;
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      res.status(401).send({
        message: 'not allowed'
      });
    } else {
      const user = await Users.findOne({
        where: { uuid }
      });
      const query = `SELECT Bookmarks.id, Bookmarks.url, Bookmarks.visitCounts, Bookmarks.descrip, Bookmarks.createdAt, Bookmarks.updatedAt, Bookmarks.userId, Emojis.icon FROM Bookmarks 
      JOIN Bookmark_Emojis 
      ON Bookmark_Emojis.bookmarkId = Bookmarks.id
      JOIN Emojis 
      ON Bookmark_Emojis.emojiId = Emojis.id
      WHERE Bookmarks.userId = ${user.dataValues.id} AND Bookmarks.visitCounts = 0
      ORDER BY id ASC;`;
      const [results, metadata] = await sequelize.query(query);
      if(!metadata) {
        res.status.send({
          message: 'Cannot Find'
        });
      } else {
        res.status(200).send({
          data: {
            user,
            bookmark: metadata
          }
        });
      }
    }
  }
};


