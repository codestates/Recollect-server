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
  refreshTokenController,
} = require('../controller/mypageControllers');

const {
  getProfileController,
  editProfileController,
  deleteAccountController
} = require('../controller/profileController');

const { getRecollectController } = require('../controller/recollectControllers');

router.post('/login', logInController);
router.post('/signup', signUpController);
router.get('/logout', logoutController);
router.post('/logcheck', logCheckController);
router.post('/getToken', getTokenController);

router.get('/mypage', renderingController);
router.post('/mypage', collectController);
router.patch('/mypage', deleteBookmarkController);

router.get('/getrefreshtoken', refreshTokenController);

router.get('/recollect', getRecollectController);

router.get('/profile', getProfileController);
router.patch('/profile', editProfileController);
router.delete('/profile', deleteAccountController);

module.exports = router;