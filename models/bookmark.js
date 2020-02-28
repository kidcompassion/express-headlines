'use strict';

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
	class Bookmark extends Sequelize.Model{}
	Bookmark.init({
		id: {
			type:Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		userId: {
			type: Sequelize.INTEGER,
			allowNull: true,
    },
    storyId: {
			type: Sequelize.INTEGER,
			allowNull: true,
		},
        
	},{sequelize});

    /*const User = sequelize.define('User');
    
    // Set hasMany relationship to Course
	  Bookmark.associate = function(models) {
		  Bookmark.hasOne(models.User)
	  };
	*/

	return Bookmark;
}