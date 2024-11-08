const express = require('express');
const router = express.Router();
const { getNearbyBooths } = require('../middlewares/location');
const { getAlbum, getNearAlbum } = require('../controllers/albumController');

// 앨범 조회용 라우트
router.get('/:user_id', getNearbyBooths , getAlbum);
router.get('/:user_id/location', getNearAlbum);

module.exports = router;