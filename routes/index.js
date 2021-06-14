const express = require('express');
const router = express.Router();
const {
  signUpController,
  logInController,
  logoutController,
  getTokenController,
  logCheckController,
}  = require('../controller/signController');

const {
  renderingController,
  collectController,
  deleteBookmarkController,
  updateBookmarkController,
  accessTokenController,
  refreshTokenController,
} = require('../controller/mypageControllers');

const emojiController = require('../controller/emoji');
const homeController = require('../controller/home');

router.post('/login', logInController);
router.post('/signup', signUpController);
router.get('/logout', logoutController);
router.post('/logcheck', logCheckController);
router.post('/getToken', getTokenController);

router.get('/mypage', renderingController);
router.post('/mypage', collectController);
router.delete('/mypage', deleteBookmarkController);
router.patch('/mypage', updateBookmarkController);

//! Test 확인용
router.get('/emoji', emojiController);
router.get('/home', homeController);

module.exports = router;