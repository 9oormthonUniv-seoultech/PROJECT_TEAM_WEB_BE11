const express = require('express');
const router = express.Router();
const { uploadFiveImages} = require('../middlewares/s3');
const { createReview, deleteReview, getReviewDetail, getMypageReview} = require('../controllers/reviewController');
const {getBoothReviews} = require('../controllers/boothReviewController');
const {getBoothPhotos} = require('../controllers/boothPhotoController');

// 리뷰 작성 라우트
router.post('/user/:user_id',  uploadFiveImages, createReview);

//리뷰 삭제 라우트
router.delete('/:review_id', deleteReview);

//리뷰 상세정보 라우트
router.get('/:review_id', getReviewDetail);

//마이페이지 리뷰 get 라우트
router.get('/mypage/:user_id', getMypageReview);

//부스id를 통한 리뷰, 키워드 집계 get 라우트
router.get('/booth/:photobooth_id', getBoothReviews)

//부스id를 통한 리뷰사진, 부스평점 get 라우트
router.get('/boothphoto/:photobooth_id', getBoothPhotos)

module.exports = router;
