const express = require('express');
const router = express.Router();
const { addBoothLike, deleteBoothLike } = require('../controllers/boothLikeController');
const {getBoothModal, getBoothLocation} = require('../controllers/boothPhotoController');

// 즐겨찾기 등록 라우트
router.post('/', addBoothLike);

// 즐겨찾기 삭제 라우트
router.delete('/', deleteBoothLike);

// 부스 모달창 가져오기 라우트
router.get('/:photobooth_id', getBoothModal);

// 부스 위치 가져오기 라우트
router.get('/location/:photobooth_id', getBoothLocation);
module.exports = router;