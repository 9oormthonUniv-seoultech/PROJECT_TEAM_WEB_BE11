const express = require('express');
const router = express.Router();
const { uploadImage} = require('../services/s3Service'); // S3 모듈
const { createReview } = require('../controllers/reviewController');

// 리뷰 작성 라우트
router.post('/:user_id', uploadImage, createReview);

module.exports = router;
