const express = require('express');
const router = express.Router();
const { getUserById, updateUser, deleteUser } = require('../controllers/userController');

// (마이페이지) 회원 조회 라우터
router.get('/:user_id', getUserById);

// 회원정보 수정 라우터
router.post('/update/:user_id', updateUser);

// 회원 탈퇴 라우터
router.get('/delete/:user_id', deleteUser);

module.exports = router;