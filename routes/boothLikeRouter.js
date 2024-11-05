const express = require('express');
const router = express.Router();
const { addBoothLike, deleteBoothLike, readBoothLike } = require('../controllers/boothLikeController');

// 즐겨찾기 등록 라우트
router.post('/', addBoothLike);

// 즐겨찾기 삭제 라우트
router.delete('/', deleteBoothLike);

module.exports = router;