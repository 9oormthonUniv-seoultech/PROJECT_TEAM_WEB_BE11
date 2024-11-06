const Photo = require('../models/photo');
const PhotoTemp = require('../models/photoTemp');
const User = require('../models/user');
const Photobooth = require('../models/photobooth');
const { deleteTemp } = require('../middlewares/uploadPhoto');
const { deleteImages } = require('../middlewares/s3');

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

const getPhoto =  async (req, res) => {
    try {
      const { user_id, photo_id } = req.params;

      const photo = await Photo.findOne({
        where: {
          user_id: user_id,
          id: photo_id,
        },
        include: [
          {
            model: Photobooth,
            attributes: ['name'],
          },
        ],
        attributes: [
          'date',
          'image_url',
          'record',
          'hashtag_1',
          'hashtag_2',
          'hashtag_3',
          'photo_like',
        ],
      });
  
      // 사진이 없는 경우
      if (!photo) {
        return res.status(404).json({ message: '사진을 찾을 수 없습니다.' });
      }
  
      const response = {
        date: photo.date,
        photobooth_name: photo.Photobooth ? photo.Photobooth.name : null,
        hashtags: [photo.hashtag_1, photo.hashtag_2, photo.hashtag_3].filter(Boolean), // 빈 해시태그는 제외
        image_url: photo.image_url,
        record: photo.record,
        photo_like : photo.photo_like,
      };
  
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error photo details', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

module.exports = { createTemp, updateInfo, updateRecord, savePhoto, deletePhoto, getPhoto };