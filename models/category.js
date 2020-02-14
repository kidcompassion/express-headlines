'use strict';

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
	class Category extends Sequelize.Model{}
	Category.init({
		id: {
			type:Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: true,
		  },
        
	},{sequelize});

    const Story = sequelize.define('Story');
	// Set hasMany relationship to Course
	Category.associate = function(models) {
		Category.hasMany(models.Story)
	  };
	

	return Category;
}