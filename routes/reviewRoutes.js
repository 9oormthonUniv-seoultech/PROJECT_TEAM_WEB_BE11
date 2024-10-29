const express = require('express');
const router = express.Router();
const { uploadFiveImages} = require('../middlewares/s3');
const { createReview, deleteReview, getReviewDetail, getMypageReview} = require('../controllers/reviewController');

// 리뷰 작성 라우트
router.post('/user/:user_id',  uploadFiveImages, createReview);

//리뷰 삭제 라우트
router.delete('/:review_id', deleteReview);

//리뷰 상세정보 라우트
router.get('/:review_id', getReviewDetail);

//마이페이지 리뷰 get 라우트 (더보기 이전 2개)
router.get('/mypage/:user_id', getMypageReview);

//마이페이지에서 리뷰 get 라우트 (더보기)
//router.get('/mypageall/:user_id', getMoreReview)

module.exports = router;
