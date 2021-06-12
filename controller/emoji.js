var express = require('express');
var router = express.Router();
var { Emojis } = require('../models');

router.get('/emoji', async(req, res, next) => {
  
  const emoji_name = req.query.name;
  let result = await Emojis.findOne({
    where: {
      name: emoji_name
    }
  });

  if(result) {
    const receivedData = {
      name: emoji_name,
      icon: result.dataValues.icon
    }
    res.send({
      status: 'success',
      data: {
        receivedData: receivedData
      }
    });
  } else {
    const receivedData = {
      name: emoji_name,
      icon: null
    }
    res.send({
      status: 'null',
      data: {
        receivedData
      }
    })
  }
});

module.exports = router;