const Photo = require('../models/photo');
const PhotoTemp = require('../models/photoTemp');
const User = require('../models/user');
const Photobooth = require('../models/photobooth');
const { deleteTemp } = require('../middlewares/uploadPhoto');
const { deleteImages } = require('../middlewares/s3');
const { Sequelize, Op, fn, col } = require('sequelize');

const createTemp = async (req, res) => {
    try{
        console.log(req.body);
        const { user_id, uploadedUrl } = req.body;
        console.log(uploadedUrl);

        const newTemp = await PhotoTemp.create({
            user_id: user_id,
            image_url: uploadedUrl
        });

        res.status(201).json( {status: 'success', newTemp});
    } catch (err) {
        console.error('이미지 업로드 중 오류: ', err);
        res.status(500).json({ status: 'fail' , message: '이미지 업로드에 실패했습니다.'});
    }
};

const updateInfo = async(req, res) => {
    try {
        const photoTemp_id = req.params.photoTemp_id;
        const { date, photobooth_id } = req.body;

        const temp = await PhotoTemp.findByPk(photoTemp_id);
        temp.date = date;
        temp.photobooth_id = photobooth_id;
        await temp.save();
        return res.status(200).json({status: 'success', message: '날짜 및 포토부스 장소 정보가 추가되었습니다.', temp});
    } catch (err) {
        console.error('업데이트 중 오류: ', err);
        res.status(500).json({ status: 'fail' , message: '이미지 업로드에 실패했습니다.'});
    }
};

const updateRecord = async (req, res) => {
    try {
        const photoTemp_id = req.params.photoTemp_id;
        const { hashtag_1, hashtag_2, hashtag_3, record } = req.body;

        const temp = await PhotoTemp.findByPk(photoTemp_id);
        temp.hashtag_1 = hashtag_1;
        temp.hashtag_2 = hashtag_2;
        temp.hashtag_3 = hashtag_3;
        temp.record = record;
        await temp.save();
        return res.status(200).json({status: 'success', message: '해시태그와 기록이 추가되었습니다.', temp});
    } catch (err) {
        console.error('업데이트 중 오류: ', err);
        res.status(500).json({ status: 'fail' , message: '이미지 업로드에 실패했습니다.'});
    }
};

const savePhoto = async (req, res) => {
    try {
        const photoTemp_id = req.params.photoTemp_id;
        const temp = await PhotoTemp.findByPk(photoTemp_id);

        const newPhoto = await Photo.create({
            user_id: temp.user_id,
            photobooth_id: temp.photobooth_id,
            image_url: temp.image_url,
            date: temp.date,
            record: temp.record,
            hashtag_1: temp.hashtag_1,
            hashtag_2: temp.hashtag_2,
            hashtag_3: temp.hashtag_3
        });

        if(!await deleteTemp(photoTemp_id)){
            res.status(400).json({status: 'fail', message: 'Temp 삭제에 실패했습니다.'});
        };
        
        return res.status(201).json({status: 'success', message: '사진이 성공적으로 저장되었습니다!', newPhoto});
    } catch (err) {
        console.error('사진 저장 중 오류: ', err);
        res.status(500).json({ status: 'fail' , message: '이미지 저장에 실패했습니다.'});
    }
};

const deletePhoto = async (req, res) => {
    try {
        const photo_id = req.params.photo_id;
        const photo = await Photo.findByPk(photo_id);

        await deleteImages([photo.image_url]);
        await photo.destroy();

        return res.status(204).json({message: '이미지를 삭제했습니다.'});
    } catch(err) {
        console.error('사진 삭제 중 오류: ', err);
        res.status(500).json({message: '이미지 삭제에 실패했습니다.'});
    }
};

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

module.exports = { createTemp, updateInfo, updateRecord, savePhoto, deletePhoto, getPhoto };