const Sequelize = require('sequelize');

class Photobooth extends Sequelize.Model {

    static init(sequelize) {

        return super.init(
            {
                name: {
                    type: Sequelize.STRING(100),
                    allowNull: false,
                    comment: '포토부스명',
                },
                latitude: {
                    type: Sequelize.FLOAT,
                    allowNull: false,
                    comment: '포토부스 위도',
                },
                longitude: {
                    type: Sequelize.FLOAT,
                    allowNull: false,
                    comment: '포토부스 경도',
                },
                brand: {
                    type: Sequelize.ENUM('하루필름', '인생네컷', '셀픽스', '포토이즘컬러드', '포토그레이', '비룸', '포토매틱', '포토시그니처', '포토이즘박스'),
                    allowNull: false,
                    comment: '브랜드',
                },
                rating: {
                    type: Sequelize.FLOAT,
                    allowNull: false,
                    defaultValue : 0,
                    comment: '평균 평점',
                },
            },
            {
                modelName: 'Photobooth', 
                tableName: 'photobooth', 
                charset: 'utf8mb4', 
                collate: 'utf8mb4_general_ci',
                timestamps: false,  
                paranoid: false,  
                underscored: false, 
                sequelize,
            }
        )
    }

    // 다른 모델과의 관계 정의
    static associate(db) {

        // 다대다 관계
        this.belongsToMany(db.User, {
            through: 'Photobooth_like',
            foreignKey: 'photobooth_id',
            otherKey: 'user_id',
            as: 'likedByUsers',
            timestamps: false,
        })
    }
};

module.exports = Photobooth;