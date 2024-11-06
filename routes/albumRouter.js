const express = require('express');
const router = express.Router();
const { getNearbyBooths } = require('../middlewares/location');
const {getPhoto} = require('../controllers/albumController');

// 앨범 조회용 라우트
router.get('/:user_id', getNearbyBooths , getPhoto);

module.exports = router;