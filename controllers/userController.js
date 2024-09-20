const User = require('../models/user');

// id로 유저 조회 (Json으로 결과 반환)
const getUserById = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '유저 조회 실패', error });
    }
};

// 회원정보 수정
const updateUser = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const { name, email, profileImage } = req.body;
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }
        user.name = name;
        user.email = email;
        user.profileImage = profileImage;
        await user.save();
        return res.status(200).json(user);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '유저 업데이트 실패', error });
    }
};

// 회원 탈퇴
const deleteUser = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const user = await User.findByPk(user_id);
        
        // 해당 id 에 맞는 유저가 존재하지 않음
        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }
        
        // 탈퇴: 성공하면 204 코드
        await user.destroy();
        return res.status(204).json({message: '탈퇴 성공했습니다.'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '유저 삭제 실패', error });
    }
};

module.exports = { getUserById, updateUser, deleteUser };