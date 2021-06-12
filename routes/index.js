
const express = require('express');
const router = express.Router();
const {
  signUpController,
  logInController,
  logoutController,
  getTokenController,
  logCheckController,
}  = require('../controller/signController');

const emojiController = require('../controller/emoji');
const homeController = require('../controller/home');

router.post('/login', logInController);
router.post('/signup', signUpController);
router.get('/logout', logoutController);
router.post('/logcheck', logCheckController);
router.post('/getToken', getTokenController);

//! Test 확인용
router.get('/emoji', emojiController);
router.get('/home', homeController);

module.exports = router;