const axios = require('axios');
const cheerio = require('cheerio');
const PhotoTemp = require('../models/photoTemp');
const { deleteImages } = require('../middlewares/s3');

const photoismQR = async (uid) => {
    try {
        url = 'https://cmsapi.seobuk.kr/v1/etc/seq/resource';
        const jsonData = { uid: uid };
        console.log(uid);

        const response = await axios.post(url, jsonData);
        const data = response.data;

        if (data.code === 1003) {
            return 'expired';
        }

        const imagePath = data.content.fileInfo.picFile.path;
        console.log("Image Path: ", imagePath);

        return imagePath;
    } catch (err) {
        console.error('Error:', err);
    }
};

const harufilmQR = async (url) => {
    try {
        const basePath = 'http://haru8.mx2.co.kr';

        const response = await axios.get(url);
        const html = response.data;

        const $ = cheerio.load(html);
        const imgPath = $('.main_cont img').attr('src');
        const imagePath = basePath + imgPath;
        console.log("Image Path: ", imagePath);

        return imagePath;
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Failed to download an upload image');
    }
};


const uploadImageByQR = async(req, res, next) => {
    console.log(req.body);
    const qr_url = req.query.url;
    console.log(qr_url);
    
    try {
        const parsedUrl = new URL(qr_url);
        const domain = parsedUrl.hostname;

        let file;
        if (domain === 'haru8.mx2.co.kr') {
            imageUrl = await harufilmQR(qr_url);
            // 하루필름
        } else if (domain === 'qr.seobuk.kr') {
            const uid = parsedUrl.searchParams.get('u');
            if (uid === null)
                res.status(400).json({status: 'fail', message: '이미 만료된 QR입니다.'});
            imageUrl = await photoismQR(uid);
            // 포토이즘
        } else {
            res.status(400).send('지원되지 않는 도메인입니다.');
            return;
        }
        
        console.log(file);

        if (file === 'expired')
            res.status(400).json({status: 'fail', message: '이미 만료된 QR 입니다.'});

        req.body.imageUrl = imageUrl;
        next();
    }
    catch (err) {
        console.error('Error:', err);
        res.status(500).send('Failed to download an upload image');
    }
};

const deleteTemp = async (photoTemp_id) => {
    try {
        const temp = await PhotoTemp.findByPk(photoTemp_id);
        await temp.destroy();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

module.exports = { uploadImageByQR, deleteTemp };