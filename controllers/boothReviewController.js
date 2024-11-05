const Review = require('../models/review');
const Photobooth = require('../models/photobooth');
const User = require('../models/user');
const { Keyword, Keyword_list } = require('../models/keyword');

const defaultProfileImage = 'https://pocket-bucket.s3.ap-northeast-2.amazonaws.com/defaultProfileImage.jpg';

const getBoothReviews = async (req, res) => {
  try {
    const photobooth_id = req.params.photobooth_id;

    // 최신 리뷰 10개 가져오기
    const reviews = await Review.findAll({
      where: { photobooth_id: photobooth_id },
      order: [['date', 'DESC']],
      limit: 10,
      include: [
        {
          model: Photobooth,
          attributes: ['name', 'brand', 'rating'],
        },
        {
          model: User,
          attributes: ['name', 'profileImage'],
        },
      ],
    });

    if (reviews.length === 0) {
      return res.status(200).json({
        message: '해당 부스에 대한 리뷰가 없습니다.',
        reviews: [],
      });
    }

    // 촬영스타일 키워드 (category: 0) 총 count 합계
    const photoKeywordsTotalCount = await Keyword.sum('count', {
      where: {
        photobooth_id: photobooth_id,
      },
      include: [
        {
          model: Keyword_list,
          as: 'keyword',
          where: { category: 0 },
        },
      ],
    });

    // 촬영스타일 키워드 내림차순으로 가져오기
    const photoKeywords = await Keyword.findAll({
      where: {
        photobooth_id: photobooth_id,
      },
      include: [
        {
          model: Keyword_list,
          as: 'keyword',
          where: { category: 0 },
          attributes: ['keyword'],
        },
      ],
      order: [['count', 'DESC']],
    });

    // 부스 키워드 (category: 1) 총 count 합계
    const boothKeywordsTotalCount = await Keyword.sum('count', {
      where: {
        photobooth_id: photobooth_id,
      },
      include: [
        {
          model: Keyword_list,
          as: 'keyword', 
          where: { category: 1 },
        },
      ],
    });

    // 부스 키워드 내림차순으로 가져오기
    const boothKeywords = await Keyword.findAll({
      where: {
        photobooth_id: photobooth_id,
      },
      include: [
        {
          model: Keyword_list,
          as: 'keyword',
          where: { category: 1 },
          attributes: ['keyword'],
        },
      ],
      order: [['count', 'DESC']],
    });

    const reviewData = reviews.map((review) => {
      const boothKeywords = typeof review.booth_keyword === 'string' ? JSON.parse(review.booth_keyword) : review.booth_keyword;
      const photoKeywords = typeof review.photo_keyword === 'string' ? JSON.parse(review.photo_keyword) : review.photo_keyword;
return {
      review_id: review.id,
      date: review.date,
      photobooth_name: review.Photobooth.name,
      rating: review.rating,
      user: {
        name: review.User.name,
        profileImage: review.User.profileImage || defaultProfileImage,
      },
      booth_keyword: review.booth_keyword.length > 0
      ? { keyword: review.booth_keyword[0], count: review.booth_keyword.length }
      : null,
      booth_keyword: boothKeywords.length > 0
          ? { keyword: boothKeywords[0], count: boothKeywords.length }
          : null,
        photo_keyword: photoKeywords.length > 0
          ? { keyword: photoKeywords[0], count: photoKeywords.length }
          : null,
      content: review.content,
      image: review.image_url ? JSON.parse(review.image_url)[0] : null,
      imageCount: review.image_url ? JSON.parse(review.image_url).length : 0,
    };
    });

    res.status(200).json({
      reviews: reviewData,
      photoKeywordsTotalCount: photoKeywordsTotalCount || 0,
      boothKeywordsTotalCount: boothKeywordsTotalCount || 0,
      photoKeywords: photoKeywords.map((item) => ({
        keyword: item.keyword.keyword,
        count: item.count,
      })),
      boothKeywords: boothKeywords.map((item) => ({
        keyword: item.keyword.keyword,
        count: item.count,
      })),
    });
  } catch (error) {
    console.error('부스 리뷰 조회 중 오류:', error);
    res.status(500).json({ message: '리뷰 조회에 실패했습니다.' });
  }
};

module.exports = { getBoothReviews };