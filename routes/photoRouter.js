const express = require('express');
const router = express.Router();
const { uploadOneImageUrl, uploadOneImage } = require('../middlewares/s3');
const { uploadImageByQR } = require('../middlewares/uploadPhoto');
const { createTemp, updateInfo, updateRecord, savePhoto, deletePhoto, getPhoto, sharePhoto, getBooth, photoLike, photoToggleLike } = require('../controllers/photoController');

// 사진 등록용 라우트 1: 사용자id와 사진url 저장 (photoTemp 테이블)
router.post('/temp/upload/qr',  uploadImageByQR, uploadOneImageUrl, createTemp); // 1) QR 업로드
router.post('/temp/upload/img', uploadOneImage, createTemp) // 2) 갤러리 업로드

// 사진 등록용 라우트 2: date와 photobooth id 추가 저장 (photoTemp 테이블)
router.put('/temp/:photoTemp_id/update-info', updateInfo);

// 사진 등록 지점 검색용 라우트
router.get('/temp/update-info', getBooth);

// 사진 등록용 라우트 3: hashtag와 record 추가 저장 (photoTemp 테이블)
router.put('/temp/:photoTemp_id/update-record', updateRecord);

// 사진 등록용 라우트 4: 최종 데이터를 photo 테이블에 반영
router.post('/save/:photoTemp_id', savePhoto);

// 사진 삭제용 라우트
router.delete('/delete/:photo_id', deletePhoto);

// 사진 공유
router.get('/share/:photo_id', sharePhoto);

// 사진 조회용 라우트
router.get('/:photo_id', getPhoto);

// 사진 즐겨찾기 true만 라우트
router.post('/like/:photo_id', photoLike);

// 사진 즐겨찾기 등록, 해제 라우트
router.post('/toggleLike/:photo_id', photoToggleLike);

module.exports = router;
