const Photo = require('../models/photo');
const Photobooth = require('../models/photobooth');
const { Sequelize, Op, fn, col } = require('sequelize');
const axios = require('axios');

const getAlbum = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const date = req.query.date ? new Date(req.query.date) : null; 
    const brand = req.query.brand ? req.query.brand : null;
    const hashtag = req.query.hashtag ? req.query.hashtag : null; // 해시태그 검색 값 추가

    let photos;

    if (date) { // 날짜 필터링
      console.log("date로 들어옴");
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      photos = await Photo.findAll({
        where: {
          user_id: user_id,
          [Op.and]: [
            Sequelize.where(fn('YEAR', col('date')), year), 
            Sequelize.where(fn('MONTH', col('date')), month)
          ],
        },
        order: [['date', 'DESC']],
        attributes: ['image_url', 'photo_like', 'id'],
      });
    } else if (brand) { // 브랜드 이름 필터링
      console.log("brand로 들어옴");
      photos = await Photo.findAll({
        where: { user_id: user_id },
        include: [
          {
            model: Photobooth,
            where: { brand: brand }, 
            attributes: [],
          },
        ],
        order: [['date', 'DESC']],
        attributes: ['image_url', 'photo_like', 'id'],
      });
    } else if (hashtag) { // 해시태그 필터링
      console.log("hashtag로 들어옴");
      photos = await Photo.findAll({
        where: {
          user_id: user_id,
          [Op.or]: [
            { hashtag_1: { [Op.like]: `%${hashtag}%` } },
            { hashtag_2: { [Op.like]: `%${hashtag}%` } },
            { hashtag_3: { [Op.like]: `%${hashtag}%` } }
          ],
        },
        order: [['date', 'DESC']],
        attributes: ['image_url', 'photo_like', 'id'],
      });
    } else {
      console.log("마지막 else로");
      // 필터링 없이 전체 조회 (날짜페이지에서 아무 선택 안했을 때)
      photos = await Photo.findAll({
        where: { user_id: user_id },
        order: [['date', 'DESC']],
        attributes: ['image_url', 'photo_like', 'id'],
      });
    }

    // 데이터가 없는 경우
    if (photos.length === 0) {
      return res.status(200).json({
        photonum: 0,
      });
    }

    const response = photos.map((photo) => ({
      images: photo.image_url,
      photo_like: photo.photo_like,
      photo_id :photo.id ,
    }));

    return res.status(200).json(response);
  } catch (error) {
    console.error("getPhoto error", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getNearAlbum = async (req, res) => {
  const user_id = req.params.user_id;
  let latitude, longitude;
  if (searchTerm = req.query.searchTerm){
    try {
      const kakaoUrl = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${searchTerm}`;
      const kakaoSecretKey = process.env.KAKAO_ID;

      const response = await axios.get(kakaoUrl, {
          headers: {
              Authorization: `KakaoAK ${kakaoSecretKey}`
          }
      });
      console.log(response.data.documents[0].place_name);
      longitude = response.data.documents[0].x;
      latitude = response.data.documents[0].y;
    } catch (err) {
      console.error(err);
      res.status(404).json({ message: '검색어의 위치를 찾을 수 없습니다.'});
    }
  } else {
    latitude = req.query.latitude ? req.query.latitude : '37.6329741';
    longitude = req.query.longitude ? req.query.longitude : '127.0798802';
  }

  console.log("latitude: ", latitude, "longitude: ", longitude)
  const radius = 1000;

  try {
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

    const boothIds = photobooths.map(booth => booth.id);

    const photos = await Photo.findAll({
      where: {
        user_id: user_id,
        photobooth_id: {
          [Op.in]: boothIds
        }
      }
    });

    if (photos.length === 0) {
      return res.status(200).json({ photonum: 0 });
    };

    const response = photos.map((photo) => ({
      images: photo.image_url,
      photo_like: photo.photo_like,
      photo_id :photo.id ,
    }));

    return res.status(200).json(response);
  } catch(err) {
    console.error("getPhoto error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getAlbum, getNearAlbum };
