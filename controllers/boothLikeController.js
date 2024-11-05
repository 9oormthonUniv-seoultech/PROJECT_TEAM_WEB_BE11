const User = require('../models/user');
const Photobooth = require('../models/photobooth');

// 부스 즐겨찾기 추가
const addBoothLike = async(req, res) => {
    try {
        const { user_id, photobooth_id } = req.body;
        const user = User.findByPk(user_id);
        const booth = Photobooth.findByPk(photobooth_id);

        if (user && booth) {
            await user.addLikedBooths(booth);
            console.log('포토부스가 즐겨찾기 되었습니다.');
            res.status(200).json({message: '포토부스가 즐겨찾기 되었습니다.'});
        }
        else {
            res.status(400).json({message: '존재하지 않는 유저거나 존재하지 않는 부스입니다.'});
        }
    } catch(error) {
        console.error(error);
        res.status(500).json({message: '즐겨찾기에 실패했습니다.'});
    }
};

// 부스 즐겨찾기 삭제
const deleteBoothLike = async(user_id, photobooth_id) => {
    try {
        const { user_id, photobooth_id } = req.body;

        const user = User.findByPk(user_id);
        const booth = Photobooth.findByPk(photobooth_id);

        if (user && booth) {
            await user.removeLikedBooths(booth);
            console.log('포토부스가 즐겨찾기 해제 되었습니다.');
            res.status(200).json({message: '포토부스가 즐겨찾기 해제 되었습니다.'});
        } else {
            res.status(400).json({message: '존재하지 않는 유저거나 존재하지 않는 부스입니다.'});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: '즐겨찾기 해제에 실패했습니다.'});
    }
};

// 해당 회원이 즐겨찾기한 부스 불러오기
const readBoothLike = async(req, res) => {
    try {
        const user_id = req.params.user_id;
        const user = await User.findByPk(user_id, {
            include: {
                model: Photobooth,
                as: 'likedBooths'
            }
        });
        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }

        return res.status(200).json(user.likedBooths);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: '즐겨찾는 부스 조회 실패', error });
    }
};

module.exports = { addBoothLike, deleteBoothLike, readBoothLike };
