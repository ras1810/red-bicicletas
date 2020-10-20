const express = require('express');
const router = express.Router();

const authController = require('../../controllers/api/authControllerAPI');

router.post('/authenticate', authController.authenticate);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/facebook_token', authController.authFacebookToken);

module.exports = router;