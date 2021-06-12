var express = require('express');
var { Emojis } = require('../models');
var router = express.Router();

router.get('/home', function(req, res, next) {
  Emojis.findAll()
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;