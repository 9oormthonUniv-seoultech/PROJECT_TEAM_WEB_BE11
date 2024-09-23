const express = require('express');
const router = express.Router();

const { getBooth, searchBooth } = require('../controllers/mapController');

// 메인 페이지 지도 위에 표시할 포토부스 조회
router.get('/', getBooth);

// 검색어 입력 후 표시할 포토부스 조회
router.get('/search', searchBooth);

module.exports = router;