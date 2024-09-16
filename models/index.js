const Sequelize = require('sequelize');

// class 불러오기
const User = require('./user');
const Photobooth = require('./photobooth');
const Review = require('./review');

const env = process.env.NODE_ENV || 'development';
const config = require('../configs/config')[env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = User;
User.init(sequelize);
User.associate(db);

db.Photobooth = Photobooth;  
Photobooth.init(sequelize);
Photobooth.associate(db);

db.Review = Review;
Review.init(sequelize);
Review.associate(db);

module.exports = db;