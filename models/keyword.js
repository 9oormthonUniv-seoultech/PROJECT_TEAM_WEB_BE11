const Sequelize = require('sequelize');

// Keyword_list 모델 정의
class Keyword_list extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                keyword: {
                    type: Sequelize.STRING(100),
                    allowNull: false,
                    comment: '키워드',
                },
                category: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                    comment: '포토부스에 대한 키워드라면 True, 촬영 스타일에 대한 키워드라면 False',
                },
            },
            {
                modelName: 'Keyword_list',
                tableName: 'keyword_list',
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
                timestamps: false,
                sequelize,
            }
        );
    }

    static associate(db) {
        this.belongsToMany(db.Photobooth, {
            through: db.Keyword,
            foreignKey: 'keyword_id',
            otherKey: 'photobooth_id',
            as: 'photobooth',
        });
    }
}

// Keyword 테이블 정의 (포토부스와 키워드의 개수가 저장되는 테이블)
class Keyword extends Sequelize.Model {
    static init(sequelize) {
        return super.init(
            {
                photobooth_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'photobooth',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    comment: '포토부스 ID',
                },
                keyword_id: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    references: {
                        model: 'keyword_list',
                        key: 'id',
                    },
                    onUpdate: 'CASCADE',
                    onDelete: 'CASCADE',
                    comment: '키워드 ID',
                },
                count: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                    defaultValue: 0,
                    comment: '해당 키워드 선택 횟수',
                },
            },
            {
                modelName: 'Keyword', 
                tableName: 'keyword', 
                charset: 'utf8mb4',
                collate: 'utf8mb4_general_ci',
                timestamps: false,
                sequelize,
            }
        );
    }

    static associate(db) {
        this.belongsTo(db.Photobooth, {
            foreignKey: 'photobooth_id',
            targetKey: 'id',
            as: 'photobooth',
        });

        this.belongsTo(db.Keyword_list, {
            foreignKey: 'keyword_id',
            targetKey: 'id',
            as: 'keyword',
        });
    }
}

module.exports = { Keyword_list, Keyword };
