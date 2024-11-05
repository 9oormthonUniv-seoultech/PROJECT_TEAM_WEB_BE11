const Sequelize = require('sequelize');

class Review extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                user_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: '유저 ID (foreign key)',
                },
                photobooth_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: '포토부스 ID (foreign key)',
                },
                rating: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    comment: '평점',
                },
                booth_keyword: {
                    type: Sequelize.JSON,
                    allowNull: false,
                    comment: '부스 관련 키워드',
                },
                photo_keyword: {
                    type: Sequelize.JSON,
                    allowNull: true,
                    comment: '사진 관련 키워드',
                },
                date: {
                    type: Sequelize.DATE,
                    allowNull: false,
                    comment: '리뷰 작성 날짜',
                },
                content: {
                    type: Sequelize.STRING(900),
                    allowNull: true,
                    comment: '리뷰 내용 (최대 300자)',
                },
                image_url: {
                    type: Sequelize.JSON,
                    allowNull: true,
                    comment: '리뷰 이미지의 S3 URL',
                },
            },
            {
                modelName: 'Review',
                tableName: 'review',
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
                timestamps: true,
                createdAt :false,
                updatedAt : true,
                paranoid: false,
                underscored: false, 
                sequelize,
            }
        );
    }

    static associate(db) {
        // User 모델과의 관계 : 각 리뷰는 하나의 사용자에 속함(n:1)
        db.Review.belongsTo(db.User, {
            foreignKey: 'user_id',
            targetKey: 'id', // User 테이블의 id와 연결
            onDelete: 'RESTRICT', // User가 삭제될 때 리뷰는 삭제하지 않음
        });
        
        // Photobooth 모델과의 관계 : 각 리뷰는 하나의 포토부스에 속함(n:1)
        db.Review.belongsTo(db.Photobooth, {
            foreignKey: 'photobooth_id', 
            targetKey: 'id', // Photobooth 테이블의 id와 연결
            onDelete: 'RESTRICT', // Photobooth가 삭제되면 해당 포토부스의 리뷰는 삭제하지 않음
        });
    }
}

module.exports = Review;
