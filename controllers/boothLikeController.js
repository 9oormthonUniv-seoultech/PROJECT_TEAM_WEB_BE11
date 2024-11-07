const User = require('../models/user');
const Photobooth = require('../models/photobooth');
const Photo = require('../models/photo');
const {Keyword, Keyword_list} = require('../models/keyword');

// 부스 즐겨찾기 추가
const addBoothLike = async (req, res) => {
    try {
        const { user_id, photobooth_id } = req.body;

        const user = await User.findByPk(user_id);
        const booth = await Photobooth.findByPk(photobooth_id);

        if (user && booth) {
            await user.addLikedBooths(booth);
            console.log('포토부스가 즐겨찾기 되었습니다.');
            return res.status(200).json({ message: '포토부스가 즐겨찾기 되었습니다.' });
        } else {
            res.status(400).json({ message: '존재하지 않는 유저거나 존재하지 않는 부스입니다.' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '즐겨찾기에 실패했습니다.' });
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

const readBoothLike = async (req, res) => {
    try {
        const user_id = req.params.user_id;

        // 유저가 즐겨찾기한 부스와 해당 부스에 대한 정보
        const user = await User.findByPk(user_id, {
            include: {
                model: Photobooth,
                as: 'likedBooths',
                attributes: ['id', 'name', 'rating'],
                through: { attributes: [] },
            }
        });

        if (!user) {
            return res.status(404).json({ message: '유저를 찾을 수 없습니다.' });
        }

        if (user.likedBooths.length === 0) {
            return res.status(404).json({ message: '즐겨찾기한 포토부스가 없습니다' });
        }

        // 각 부스의 가장 최근 리뷰 사진 가져오기
        const likedBoothIds = user.likedBooths.map(booth => booth.id);
        const recentPhotos = await Photo.findAll({
            where: {
                photobooth_id: likedBoothIds
            },
            attributes: ['date', 'image_url', 'photobooth_id'],
            order: [['date', 'DESC']],
            limit: likedBoothIds.length,
            group: ['photobooth_id']
        });

        // 부스 ID별로 가장 최근의 리뷰 사진 매핑
        const recentPhotoMap = recentPhotos.reduce((acc, photo) => {
            acc[photo.photobooth_id] = photo;
            return acc;
        }, {});

        // 각 부스에 대한 최다 키워드 가져오기
        const topKeywords = await Keyword.findAll({
            where: {
                photobooth_id: likedBoothIds
            },
            attributes: ['photobooth_id', 'keyword_id', 'count'],
            include: [
                {
                    model: Keyword_list,
                    as: 'keyword',
                    attributes: ['keyword']
                }
            ],
            order: [[ 'count', 'DESC' ]],
            group: ['photobooth_id']
        });

        // 부스 ID별로 가장 많이 사용된 키워드 매핑
        const topKeywordMap = topKeywords.reduce((acc, keyword) => {
            acc[keyword.photobooth_id] = keyword.keyword.keyword; // 키워드 이름만 저장
            return acc;
        }, {});

        const response = user.likedBooths.map(booth => {
            const recentPhoto = recentPhotoMap[booth.id];
            const topKeyword = topKeywordMap[booth.id] || null;

            return {
                photobooth_id: booth.id,
                photobooth_name: booth.name,
                rating: booth.rating,
                top_keyword: topKeyword,
                is_liked_by_user: true,
                recent_photo: recentPhoto ? {
                    date: recentPhoto.date,
                    image_url: recentPhoto.image_url
                } : null
            };
        });

        return res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '즐겨찾는 부스 조회 실패', error });
    }
};



module.exports = { addBoothLike, deleteBoothLike, readBoothLike };
