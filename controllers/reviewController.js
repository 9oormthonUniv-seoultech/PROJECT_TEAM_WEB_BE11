const Review = require('../models/review');
const Photobooth = require('../models/photobooth');
const { deleteImages} = require('../middlewares/s3');
const {updateRating, updateKeywords } = require('../middlewares/reviewUpdate');

// 리뷰 작성
const createReview = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const { photobooth_name, rating, booth_keyword, photo_keyword, content, date, imageUrls } = req.body;
    
    // 포토부스 이름을 통해 photobooth_id 조회
    const photobooth = await Photobooth.findOne({
        where: { name: photobooth_name }  // 입력받은 이름으로 포토부스 찾기
      });
  
      if (!photobooth) {
        return res.status(404).json({ message: '해당 이름의 포토부스를 찾을 수 없습니다.' });
      }
  
      const photobooth_id = photobooth.id;
      req.body.photobooth_id = photobooth_id;
      req.body.increment = 1;

      // booth_keyword와 photo_keyword가 단일 값일 경우 배열로 변환
      const boothKeywords = Array.isArray(booth_keyword) ? booth_keyword : [booth_keyword];
      const photoKeywords = Array.isArray(photo_keyword) ? photo_keyword : [photo_keyword];


    // 리뷰 생성
    const newReview = await Review.create({
      user_id,
      photobooth_id,
      rating,
      booth_keyword: boothKeywords, 
      photo_keyword: photoKeywords, 
      content,
      image_url: imageUrls && imageUrls.length > 0 ? imageUrls : null,  // S3에서 반환된 URL 저장
      date: date,
    });

    await updateKeywords(req, res, async () => {
      await updateRating(req, res, () => {
        res.status(201).json(newReview);
      });
    });
  } catch (error) {
    console.error('리뷰 생성 중 오류:', error);
    res.status(500).json({ message: '리뷰 생성에 실패했습니다.' });
  }
};


//리뷰 삭제
const deleteReview = async (req, res) => {
  try {
      const review_id = req.params.review_id;
      const review = await Review.findOne({
          where: { id: review_id }
      });

      if (!review) {
          return res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' });
      }

      // 이미지 URL이 있으면 S3에서 삭제
      if (review.image_url) {
          const imageUrls = JSON.parse(review.image_url); 
          await deleteImages(imageUrls); 
      }
   
      const deletedReview = await Review.destroy({
          where: { id: review_id } 
      });

      if (deletedReview) {
        req.body.photobooth_id = review.photobooth_id;
        req.body.booth_keyword = typeof review.booth_keyword === 'string' ? JSON.parse(review.booth_keyword) : review.booth_keyword;
        req.body.photo_keyword = typeof review.photo_keyword === 'string' ? JSON.parse(review.photo_keyword) : review.photo_keyword;
        req.body.increment = -1;
       
        await updateKeywords(req, res, async () => {
          await updateRating(req, res, () => {
            res.status(200).json({ message: '리뷰가 삭제되었습니다.' });
          });
        });
      } else {
          res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' });
      }
  } catch (error) {
      console.error('리뷰 삭제 중 오류:', error);
      res.status(500).json({ message: '리뷰 삭제에 실패했습니다.' });
  }
};


//리뷰 상세정보 가져오기
const getReviewDetail = async (req, res) => {
  try {
    const review_id = req.params.review_id;
    const review = await Review.findOne({
      where: { id: review_id },
      include: [
        {
          model: Photobooth,
          attributes: ['name', 'brand', 'rating']
        }
      ]
    });
    if (review) {
      res.status(200).json(review);
    } else {
      res.status(404).json({ message: '리뷰를 찾을 수 없습니다.' });
    }
  } catch (error) {
    res.status(500).json({ message: '리뷰를 조회하는 중 오류가 발생했습니다.' });
  }
};


// 마이페이지 리뷰 가져오기 (limit 옵션으로 제한된 개수 또는 전체)
const getMypageReview = async (req, res) => {
  try {
    console.log("getMypageReview called");

    const user_id = req.params.user_id;
    const limit = req.query.limit ? parseInt(req.query.limit) : null; 

    console.log("user_id:", user_id);

    const reviews = await Review.findAll({
      where: { user_id: user_id },
      order: [['date', 'DESC']],
      limit: limit, 
      include: [
        {
          model: Photobooth,
          attributes: ['name'],
        },
      ],
    });

    console.log("reviews retrieved:", reviews);

    // 리뷰가 없을 경우
    if (reviews.length === 0) {
      return res.status(200).json({
        reviewNum: 0,
        recent_reviews: null,
      });
    }

    const review = reviews.map((review) => ({
      review_id: review.id,
      date: review.date,
      photobooth_name: review.Photobooth.name,
      rating: review.rating,
      image: review.image_url ? JSON.parse(review.image_url)[0] : null,
    }));

    const reviewNum = limit ? await Review.count({ where: { user_id: user_id } }) : reviews.length;

    res.status(200).json({
      reviewNum: reviewNum,
      recent_reviews: review,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};


module.exports = { createReview, deleteReview, getReviewDetail, getMypageReview};