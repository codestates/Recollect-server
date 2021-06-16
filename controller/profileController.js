const { Users } = require('../models');
const { isAuthorized } = require('./tokenControllers');


module.exports = {
  //* GET '/profile' 
  getProfileController: async(req, res) => {
    const uuid = req.session.userId;
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      res.status(401).send({
        message: 'not allowed'
      });
    } else {
      await Users.findOne({
        where: { uuid }
      })
      .then((result) => {
        delete result.dataValues.password;
        res.send({
          data: {
            user: result.dataValues
          },
          message: 'Load Profile'
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
  //* PATCH '/profile'
  editProfileController: async(req, res) => {
    const { username, password } = req.body;
    const  uuid  = req.session.userId;
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      res.status(401).send({
        message: 'not allowed'
      })
    } else {
      //* password 값의 존재 여부에 따라서 update 필드 작업이 다름 
      password !== undefined ? (
        await Users.update({
          username,
          password
        }, {
          where: { uuid }
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
      ) : (
        await Users.update({
          username
        }, {
          where: { uuid }
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
      )
      
    
    }
  },
  //* DELETE '/profile'
  deleteAccountController: async(req, res) => {
    console.log('uuid:   ', req);
    const uuid  = req.session.userId;
    const accessTokenData = isAuthorized(req);
    if(!accessTokenData) {
      res.status(401).send({
        message: 'not allowed'
      })
    } else {
      await Users.destroy({
        where: { uuid }
      })
      .then(() => {
        res.status(200).send({
          message: 'Deleted Successfully'
        })
      })
      .catch(() => {
        res.status(501).send({
          message: 'Failed To Delete'
        })
      })
    }
  }
}

