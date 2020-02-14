
'use strict';

const Sequelize = require('sequelize');

module.exports = (sequelize) => {
	class Publication extends Sequelize.Model{}
	Publication.init({
		id: {
			type:Sequelize.INTEGER,
			primaryKey: true,
			autoIncrement: true,
		},
		name: {
			type: Sequelize.STRING,
			allowNull: true,
		  },
		url: {
			type: Sequelize.STRING,
			allowNull: true,
		  },
		rssUrl: {
			type: Sequelize.STRING,
			allowNull: true
		},
		slug: {
			type: Sequelize.STRING,
			allowNull: true
		},
		logoUrl: {
			type: Sequelize.STRING,
			allowNull: true
		}
         
	},{sequelize});


    const Story = sequelize.define('Story');

	
	Publication.associate = function(models) {
		Publication.hasMany(models.Story)
	};
	

	return Publication;
}


