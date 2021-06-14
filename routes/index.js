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

const {
  getProfileController,
  editProfileController,
  deleteAccountController
} = require('../controller/profileController');

const { getRecollectController } = require('../controller/recollectControllers');

const { addVisitCountController } = require('../controller/bookmarkController');

const emojiController = require('../controller/emoji');
const homeController = require('../controller/home');

//만약 로컬스토리지에 저장하는 작업이 진행된다면
//router.get('/', )

router.post('/login', logInController);
router.post('/signup', signUpController);
router.get('/logout', logoutController);
router.post('/logcheck', logCheckController);
router.post('/getToken', getTokenController);

router.get('/mypage', renderingController);
router.post('/mypage', collectController);
router.patch('/mypage', deleteBookmarkController);
router.put('/mypage', updateBookmarkController);

router.put('/bookmark', addVisitCountController);

router.get('/recollect', getRecollectController);

router.get('/profile', getProfileController);
router.patch('/profile', editProfileController);
router.delete('/profile', deleteAccountController);

//! Test 확인용
router.get('/emoji', emojiController);
router.get('/home', homeController);

module.exports = router;