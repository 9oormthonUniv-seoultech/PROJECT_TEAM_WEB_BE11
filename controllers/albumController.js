const Photo = require('../models/photo');
const Photobooth = require('../models/photobooth');
const { Sequelize, Op, fn, col } = require('sequelize');

const getPhoto = async (req, res) => {
    try {
      const user_id = req.params.user_id;
      const date = req.query.date ? new Date(req.query.date) : null; 
      const brand = req.query.brand ? req.query.brand : null;
      const location = req.query.location ? req.query.location : null;
  
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
          attributes: ['image_url', 'photo_like'],
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
          attributes: ['image_url', 'photo_like'],
        });
      } else if (location && req.nearbyBoothIds && req.nearbyBoothIds.length > 0) {
        // location 필터링 - 미들웨어 반환값 이용, 현재위치 시에는 location=true로 받아야함
        console.log("location으로 들어옴");
        photos = await Photo.findAll({
          where: {
            user_id: user_id,
            photobooth_id: { [Op.in]: req.nearbyBoothIds },
          },
          order: [['date', 'DESC']],
          attributes: ['image_url', 'photo_like'],
        });
      } else {
        console.log("마지막 else로");
        // 필터링 없이 전체 조회 (날짜페이지에서 아무 선택 안했을 때)
        photos = await Photo.findAll({
          where: { user_id: user_id },
          order: [['date', 'DESC']],
          attributes: ['image_url', 'photo_like'],
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
      }));
  
      return res.status(200).json(response);
    } catch (error) {
      console.error("getPhoto error", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  };

  module.exports = {getPhoto}