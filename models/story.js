'use strict';

const Sequelize = require('sequelize');

module.exports = ( sequelize ) =>{
    class Story extends Sequelize.Model{}

    Story.init({
        id:{
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type:Sequelize.STRING,
            nullable: false,
        },
        url: {
            type:Sequelize.STRING,
            nullable: true,
        },
        publicationDate: {
            type:Sequelize.STRING,
            nullable: true,
        },
        excerpt: {
            type:Sequelize.TEXT,
            nullable: true,
        },
        author: {
            type:Sequelize.STRING,
            nullable: true,
        },
        imgUrl: {
          type: Sequelize.STRING,
          allowNull: true
        }, 
        publicationId: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
       
    }, {sequelize});

    
    const Publication = sequelize.define('Publication');
    const Category = sequelize.define('Category');

    Story.associate = function(models) {
		Story.belongsTo(Publication, {
			// Set the foreign key to be the userid, referencing the id field in the User model
			foreignKey: {
				fieldName: 'PublicationId',
				allowNull: false,
			},
		});
    }
  /*  
    Story.associate = function(models) {
		Story.belongsTo(Category, {
			// Set the foreign key to be the userid, referencing the id field in the User model
			foreignKey: {
				fieldName: 'CategoryId',
				allowNull: false,
			},
		});
    }*/
	return Story;
}
