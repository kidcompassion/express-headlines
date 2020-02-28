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
            unique: true
        },
        url: {
            type:Sequelize.STRING,
            nullable: true,
        },
        publicationDate: {
            type:Sequelize.DATE,
            nullable: true,
        },
        excerpt: {
            type:Sequelize.TEXT,
            nullable: true,
        },
        content: {
          type:Sequelize.TEXT,
          nullable: true,
        },
        author: {
            type:Sequelize.STRING,
            nullable: true,
        },
        imgUrl: {
          type: Sequelize.STRING,
          nullable: true
        }, 
        publicationId: {
            type: Sequelize.INTEGER,
            nullable: true
        },
       
    }, {sequelize});

    
    const Publication = sequelize.define('Publication');
    
    

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
		Story.hasOne(Bookmark, {
			// Set the foreign key to be the userid, referencing the id field in the User model
		});
    }*/
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
