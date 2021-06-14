
const { Bookmarks } = require('../models');
const { isAuthorized } = require('./tokenControllers');

module.exports = {
  addVisitCountsController: async(req, res) => {
    const { bookmarkId } = req.body;
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      res.status(401).send({
        message: 'Not Allowed'
      })
    } else {
      await Bookmarks.findOne({
        where: { id: bookmarkId }
      })
      .then((result) => {
        if(result) {
          return result.update({
            visitCount: result.visitCount + 1
          })
        } else {
          res.status(501).send({
            message: 'Failed To Count Up'
          })
        }
      })
      .then((result) => {
        res.status(200).send({
          message: 'Count Up Successfully'
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(501).send({
          message: 'Failed To Count Up'
        })
      })
    }
  }
}