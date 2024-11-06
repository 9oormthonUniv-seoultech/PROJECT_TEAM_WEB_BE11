const { Sequelize, Op } = require('sequelize');
const axios = require('axios');
const Photobooth = require('../models/photobooth');

// 미들웨어로 근처 포토부스 위치를 반환
const getNearbyBooths = async (req, res, next) => {
    const { latitude = '37.6329741', longitude = '127.0798802', query } = req.query; // 기본 위치는 학교 위치로 설정
    const radius = 1000; // 반경 1km

    try {
        let searchLatitude = parseFloat(latitude);
        let searchLongitude = parseFloat(longitude);

        if (query) {
            console.log('Search Query:', query);
            // 키워드 검색 요청이 들어온 경우 카카오 지도 API를 사용하여 위치 검색
            const kakaoUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${query}`;
            const kakaoSecretKey = process.env.KAKAO_ID;

            const response = await axios.get(kakaoUrl, {
                headers: {
                    Authorization: `KakaoAK ${kakaoSecretKey}`
                }
            });

            // 키워드와 가장 근접한 장소의 위경도를 중심으로 설정
            if (response.data.documents && response.data.documents.length > 0) {
                const { x, y } = response.data.documents[0];
                searchLongitude = parseFloat(x);
                searchLatitude = parseFloat(y);
                console.log('Updated Coordinates from Keyword:', searchLongitude, searchLatitude);
            } else {
                console.log('No results found for the query, using default coordinates.');
            }
        }

        // 반경 내 포토부스 조회
        const nearbyBooths = await Photobooth.findAll({
            where: Sequelize.where(
                Sequelize.fn(
                    'ST_Distance_Sphere',
                    Sequelize.literal(`POINT(${searchLongitude}, ${searchLatitude})`),
                    Sequelize.literal(`POINT(longitude, latitude)`)
                ),
                { [Op.lte]: radius }
            )
        });

        req.nearbyBoothIds = nearbyBooths.map((booth) => booth.id); // 포토부스 ID 목록만 저장
        console.log('Nearby Booth IDs:', req.nearbyBoothIds);
        next();
    } catch (error) {
        console.error('Error fetching nearby booths:', error);
        res.status(500).json({ message: '서버 오류가 발생했습니다.' });
    }
};

module.exports = { getNearbyBooths };
