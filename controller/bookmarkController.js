const { Bookmarks } = require('../models');
const { isAuthorized } = require('./tokenControllers');

module.exports = {
  addVisitCountsController: async(req, res) => {
    console.log('북마크아이디확인', req.body);
    const id = req.body.bookmarkId;
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      res.status(401).send({
        message: 'Not Allowed'
      })
    } else {
      const foundResult = await Bookmarks.findOne({
        where: { id }
      });
      if(!foundResult){
        return res.status(501).send({
          message: 'Failed To Count Up'
        });
      } else {
        await foundResult.update({
          visitCounts: foundResult.visitCounts + 1
        })
        .then((result) => {
          res.status(200).send({
            message: 'Count Up Successfully'
          })
        })
      }
    }
  }
}