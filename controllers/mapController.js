const { Sequelize } = require('../models');
const Photobooth = require('../models/photobooth');
const { Op } = require('sequelize');
const axios = require('axios');

// 현 위치 기반 인근 포토부스 조회
const getBooth = async (req, res) => {
    // 위경도 없으면 우리 학교 기준!
    const { latitude = '37.6329741', longitude = '127.0798802', brand } = req.query;

    // 반경 1km 설정
    const radius = 1000;

    try {
        // 포토부스 조회
        const photobooths = await Photobooth.findAll({
            where: Sequelize.where(
                Sequelize.fn(
                    'ST_Distance_Sphere',
                    Sequelize.literal(`POINT(${longitude}, ${latitude})`),
                    Sequelize.literal(`POINT(longitude, latitude)`)
                ),
                {
                    [Op.lte]: radius
                }
            )
        });

        if (brand) {
            // 필터링을 원하는 브랜드가 존재하는 경우: 해당 브랜드의 포토부스와 해당 브랜드가 아닌 포토부스 별도로 제공
            const brandPhotobooths = photobooths.filter(booth => booth.brand === brand );
            const otherPhotobooths = photobooths.filter(booth => booth.brand !== brand );
            res.json({brandPhotobooths, otherPhotobooths});
        } else {
            // 필터링 제한 없는 경우: 반경 내의 전체 포토부스 제공
            res.json({ photobooths });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

// 검색 기반 포토부스 조회
const searchBooth = async (req, res) => {
    const { searchTerm } = req.query;

    if (!searchTerm) {
        return res.status(400).json({ message: '검색어를 입력하세요.' });
    }

    // 반경 1km 설정
    const radius = 1000;

    try {
        // 카카오지도 api에 해당 키워드 검색
        const kakaoUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${searchTerm}`;
        const kakaoSecretKey = process.env.KAKAO_ID;

        const response = await axios.get(kakaoUrl, {
            headers: {
                Authorization: `KakaoAK ${kakaoSecretKey}`
            }
        });

        // 키워드와 가장 근접한 장소를 중심으로 선택
        console.log(response.data.documents[0].place_name);
        const {x: longitude, y: latitude, place_name } = response.data.documents[0];

        // 중심으로 채택된 장소의 위경도를 기준으로 반경 1km의 포토부스 검색
        const photobooths = await Photobooth.findAll({
            where: Sequelize.where(
                Sequelize.fn(
                    'ST_Distance_Sphere',
                    Sequelize.literal(`POINT(${longitude}, ${latitude})`),
                    Sequelize.literal(`POINT(longitude, latitude)`)
                ),
                {
                    [Op.lte]: radius
                }
            )
        });

        // 중심 장소의 이름과 검색된 포토부스 정보 반환
        res.json({ place_name, photobooths });
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
}

module.exports = { getBooth, searchBooth };