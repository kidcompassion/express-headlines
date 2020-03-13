const express = require('express');
const router = express.Router();
let Parser = require('rss-parser');
let parser = new Parser({
    customFields: {
        item: [
          ['media:content', 'assocMedia'],
        ]
      }
  });
const bcrypt = require('bcrypt');
const saltRounds = 10;
var auth = require('basic-auth');

const { User, Story, Publication, Bookmark } = require('../models');
const { Op } = require("sequelize");


/**
 * async try catch helper
 * @param {} callback 
 */

const asyncHandler = (callback)=>{
    return async(req, res, next) =>{
        try{
            // await results of callback
            await callback(req, res, next);
        }
        catch(error){
            res.status(500).send(error);
        }
    }
}

/**
 * Authentication Function
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */

const authenticateUser = async (req, res, next) => {
    // https://teamtreehouse.com/library/rest-api-authentication-with-express
    //Get auth headers
    const credentials = auth(req);

    //Set message for various errors
    let message = null;
    
    if(credentials){
        let userPassword = '';
        // Get the user based on auth header email
        const userLookup = await User.findAll({
                                    where: {
                                        emailAddress: credentials.name
                                    }
                                });

        if (userLookup.length>0){           
            // Get hashed password and set it to var for comparing
            userLookup.map((user)=> {
                userPassword = user.password;
            });
                                
            // Compare password to one in DB
            const passwordMatch = bcrypt.compareSync(credentials.pass, userPassword);
            console.log(JSON.stringify(req.headers));

            // If correct password, set current user property
            if(passwordMatch){
                req.currentUser = userLookup;
            } else {
                message = 'Password does not match';
            }
        } else {
            message = 'No such user';
        }
    } else {
        message = 'No headers';
    }
    if(message){
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
    }else {
        next();
    }

    
  };

/**
 * xmlParse - Parses incoming XML
 * 
 * @param {*} linkInfo // url for publication, via publications
 * @param {*} pubId // id of publication
 */

const xmlParse = (linkInfo, pubId)=>{
    let allStories = [];
    const errors = [];
    // Get the results of the rss-parser
    let feed =  new Promise ((resolve, reject)=>{
        resolve( parser.parseURL(linkInfo));
        
    });
    
    feed.then((result)=>{
        
        // Loop through the array of all returned stories
        result.items.forEach(item => {
            
            let formattedDate = new Date(item.pubDate); // format the dates so they can be ordered accurately
            let formattedImg = 'https://via.placeholder.com/150';
        
            if(typeof(item.assocMedia) !== 'undefined'){
                formattedImg = item.assocMedia.$.url;
            } 
            if(typeof(item.enclosure) !== 'undefined'){
                formattedImg = item.enclosure.url;
            } 

            // Push the values into an object formatted for our uses
            story = {
                title: item.title,
                url: item.link,
                publicationDate: formattedDate.toString(),
                author: item.creator,
                imgUrl:formattedImg,
                excerpt: item.contentSnippet,
                publicationId: pubId, // The corresponding publication, so we can sort by pub
                categoryId: null, //TODO: set up the cats
                content: item.content
            }

            // Push all formatted stories into an array
            allStories.push(story);
         });
    }).then(()=>{
        
        allStories.map((story)=>{
            Story.create(story).catch((err)=>{
                errors.push(err);
                
            });
        });

        console.log(errors);
    })

    // NEEDS TO TRIGGER RE_RENDER OF COMPONENT
}


/**
 * Redirect to courses
 */
router.get('/', function(req, res, next) {
    res.redirect('/courses');
});


/**
 * Get list of publications in ASC order
 * 
 */
router.get('/publications', asyncHandler(async function(req, res, next) {
    const pubs = await Publication.findAll({
        order:[
            [ 'name', 'ASC']
        ]
    });
    res.status(200).json(pubs);
}));




/**
 *  Get all stories, in reverse chronological order
 */
router.get('/stories/:page', asyncHandler(async function(req, res, next) {
    // Count all the stories
    
    
    const totalStories = await Story.count();
    

     const page = req.params.page-1;
     const pageSize = 10;
     const offset = page * pageSize;
     const limit = pageSize;
    const stories = await Story.findAll({
        attributes: ["id", "title", "url", "publicationDate", "excerpt", "author", "content", "imgUrl", "publicationId"],
        order: [
            ['publicationDate', 'DESC']
        ],
        include:{
            model: Publication
        },
        limit,
        offset
    })
    .then((stories) => {
        console.log(stories.length);
        res.status(200).json({'totalStories': totalStories, 'allStories': stories})
    })
    .catch((error) => {
        console.log(error);
        res.status(400).send(error);
    })



   // res.status(200).json(stories);
}));





/**
 *  Get most recent update info
 */
router.get('/last-update', asyncHandler(async function(req, res, next) {
    const latestUpdate = await Story.findAll({
        attributes:['updatedAt'],
        order:[['updatedAt', 'DESC']],
        limit:1,
        raw:true
    });
    res.status(200).json(latestUpdate);
}));





/**
 * List bookmarks for a given user based on their user id #
 */

router.get('/:id/bookmarks/',asyncHandler(async function(req, res, next){
    try{

        // Get userId via URL, and get all their bookmarks
        const bookmarks = await Bookmark.findAll({
            where: {
                userId: {
                    [Op.eq]: req.params.id
                }
            },
            raw:true
        });

        // Push the storyIDs into an array
        let userBookmarks = [];
        bookmarks.map((story, index)=>{
            userBookmarks.push(story.storyId);
        });

        // Query for all storyids in the array
        const bookmarkedStories = await Story.findAll({
            where: {
                id: {
                  [Op.in]: userBookmarks
                }
              },
              order: [
                ['createdAt', 'DESC']
            ],
           
              include:{
                model: Publication
            },
        });

        res.status(200).json(bookmarkedStories);

    }catch(err){
        console.log(err);
    }
}));


/**
 * List bookmarks for a given user based on their user id #
 */

router.get('/:id/bookmarks/:page',asyncHandler(async function(req, res, next){
    try{

     const page = req.params.page-1;
     const pageSize = 10;
     const offset = page * pageSize;
     const limit = pageSize;
        // Get userId via URL, and get all their bookmarks
        const bookmarks = await Bookmark.findAll({
            where: {
                userId: {
                    [Op.eq]: req.params.id
                }
            },
            raw:true
        });

        // Push the storyIDs into an array
        let userBookmarks = [];
        bookmarks.map((story, index)=>{
            userBookmarks.push(story.storyId);
        });

        // Query for all storyids in the array
        const bookmarkedStories = await Story.findAndCountAll({
            where: {
                id: {
                  [Op.in]: userBookmarks
                }
              },
              order: [
                ['createdAt', 'DESC']
            ],
           
              include:{
                model: Publication
            },
            limit,
            offset
        });

        res.status(200).json(bookmarkedStories);

    }catch(err){
        console.log(err);
    }
}));


/**
 * Get stories by publication slug
 */
router.get('/stories/by-publication/:id/:page', asyncHandler(async function(req, res, next){


    const page = req.params.page-1;
    const pageSize = 10;
    const offset = page * pageSize;
    const limit = pageSize;

    // Grab publication slug
    const publicationSlug = req.params.id;

    //get publication with matching slug
    const selectedPub = new Promise ((resolve, reject)=>{
        resolve( 
            Publication.findAll({
                where:{
                    slug: publicationSlug
                },
                raw:true
            })
        );
    });

    // get pub id from selectedpub...
    selectedPub.then((result)=>{
        console.log('test', result);
        const pubId = result[0]['id'];
        return pubId
    }).then( (result)=>{
        // And use it to query for all appropriate stories
        const stories =  new Promise ((resolve, reject)=>{
            resolve(
                Story.findAndCountAll({
                    where: {
                        publicationId: result
                    },
                    attributes: ["id", "title", "url", "publicationDate", "excerpt", "author", "content", "imgUrl", "publicationId"],
                    order: [
                        ['publicationDate', 'DESC']
                    ],
                    include:{
                        model: Publication
                    },
                    nest: true,
                    limit,
                    offset
                })
            )
        }
    ); 

    stories.then((result)=>{        
            res.status(200).json(result);
        })
    });
}));


/**
 * GET /api/users 200 - Returns the currently authenticated user
 */
router.get('/users', authenticateUser, asyncHandler(async (req, res)=>{
    let userId;
    // Look in the current user array for the current user id
    req.currentUser.map((user)=> {
        userId = user.id;
    });

    // Use current user ID to return current user info
    const users = await User.findByPk(userId, {
        attributes: ["id", "emailAddress"]
    });
    // Return payload for current user with 200 status
    res.status(200).json(users);
 }));



/*********** POST  */

/**
 * Add a publication
 * @TODO: Build UI for the front end so users can add their own publications
 */

router.post('/publications', authenticateUser, (req, res, next)=>{
    newPub = req.body;

    const generateSlug = (name)=>{
        return name.replace(/\s/g , "-").toLowerCase();
    }

    const createPublication =  Publication.create({
                                        name: newPub.name,
                                        url: newPub.url,
                                        rssUrl: newPub.rssUrl,
                                        slug: generateSlug(newPub.name),
                                        logoUrl: newPub.logoUrl
                                    });
                                  
    res.status(201).send();
});


/**
 * Scrape for all available stories
 */

router.post('/stories', asyncHandler( async function(req, res, next){

    const pubs = await Publication.findAll({
        raw: true,
        attributes: ["id", "rssUrl"],
    });
    pubs.map((pub, index)=>{
         xmlParse(pub.rssUrl, pub.id);
    }).then((response)=>{
        res.status(201).send(response);
    }).catch((error) => {
        console.log(error);
        res.status(400).send(error);
    })

   /**
    * Requires better error handling
    */
    
}));



// Add a user



router.post('/create-user', asyncHandler( async function(req, res, next){
    console.log(req.body);
    const userInfo = req.body;
    
    const userHash = bcrypt.hashSync(userInfo.password, saltRounds);
console.log(userHash);
try{
    console.log('try');
    const newUser = await User.create({
        emailAddress: userInfo.emailAddress,
        password: userHash
      });
} catch(err) {
    console.log(err);
}
    
  
    res.status(201).send();
  }));



  router.post('/user/:id/create-bookmark/', authenticateUser, asyncHandler( async function(req, res, next){
  

    //check to see if combination exists
    //if it does, delete it
    // if it doesn't, add it

    const bookmarkInfo = req.body;
    const checkIfExists = await Bookmark.findOne({
        where:{
            userId:req.params.id,
            storyId:bookmarkInfo.storyId
        }
        
    }).then((response)=>{
        if(response === null){
            console.log('is null', response);
            try{
                console.log('bookmarked');
                Bookmark.create({
                    userId:req.params.id,
                    storyId:bookmarkInfo.storyId
                });
            } catch(err) {
                console.log(err);
            }
        } else{
            console.log('bookmark exists');
            Bookmark.destroy({
                where:{
                    userId:req.params.id,
                    storyId:bookmarkInfo.storyId
                }
            });
        }
    });


    
  
   // console.log(bookmarkInfo);
   
     
    res.status(201).send();
  }));




/************DELETE ********** */


router.delete('/stories', authenticateUser, asyncHandler( async function(req, res, next){
    await Story.destroy({where:{}});    
    res.status(204).end();
}));

router.delete('/bookmarks', authenticateUser, asyncHandler( async function(req, res, next){
    await Bookmark.destroy({where:{}});    
    res.status(204).end();
}));



router.post('/stories/:id', authenticateUser, asyncHandler(async function(req, res, next){
    console.log(req.params);
    //set boolean to true
}));




module.exports = router;
