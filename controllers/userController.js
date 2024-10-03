const User = require('../models/user');
const Review = require('../models/review');
const { deleteImages } = require('../middlewares/s3'); 

const defaultProfileImage = 'https://pocket-bucket.s3.ap-northeast-2.amazonaws.com/defaultProfileImage.jpg'; // 기본 이미지 URL


// id로 유저 조회 (Json으로 결과 반환)
const getUserById = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const user = await User.findByPk(user_id);
        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }
        // 프로필 이미지가 null이면 기본 이미지 URL 반환
        const profileImage = user.profileImage || defaultProfileImage;
        return res.status(200).json({
            id: user.id,
            name: user.name,
            email: user.email,
            profileImage: profileImage
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '유저 조회 실패', error });
    }
};

// 회원정보 수정
const updateUser = async (req, res) => {
    try {
        const user_id = req.params.user_id;
        const { name, email } = req.body;
                const user = await User.findByPk(user_id);
        
        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }
        
        //프로필 이미지 처리
        let profileImage = user.profileImage;
        if (req.files.length>0) {
            if (user.profileImage) {//기존 프로필 이미지가 있으면 s3에서 삭제
                const fileKey = user.profileImage.split('/').pop();
                try {
                    await deleteImage(fileKey);
                } catch (deleteError) {
                    return res.status(502).json({ message: '기존 이미지 삭제 실패', error: deleteError.message });
                }
            }
            profileImage = req.files[0].location; //새 이미지로 업데이트
        }else{
            profileImage = null; // 사용자가 프로필 이미지를 삭제했을 때
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
        
        // 유저의 이미지 URL이 있는지 확인하고 삭제
        if (user.profileImage) { 
            await deleteImages([user.profileImage]); 
        }
        // 유저의 리뷰들은 유지, user_id와 email을 null로 변경 (참조 무결성 지키기 위함)
        await Review.update(
            { user_id: null, email : null}, 
            { where: { user_id: user_id } }
        );
        
        // 탈퇴: 성공하면 204 코드
        await user.destroy();
        return res.status(204).json({message: '탈퇴 성공했습니다.'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '유저 삭제 실패', error });
    }
};

module.exports = { getUserById, updateUser, deleteUser };