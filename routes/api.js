const express = require('express');
const router = express.Router();
let Parser = require('rss-parser');
let parser = new Parser();

const { User, Story, Publication, Category } = require('../models');


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
 * xmlParse - Parses incoming XML
 * 
 * @param {*} linkInfo // url for publication, via publications
 * @param {*} pubId // id of publication
 */

const xmlParse = (linkInfo, pubId)=>{
    let allStories = [];

    // Get the results of the rss-parser
    let feed =  new Promise ((resolve, reject)=>{
        resolve( parser.parseURL(linkInfo));
    });
    
    feed.then((result)=>{
        // Loop through the array of all returned stories
        result.items.forEach(item => {
            // Push the values into an object formatted for our uses
            story = {
                title: item.title,
                url: item.link,
                publicationDate: item.pubDate,
                author: item.creator,
                imgUrl: null, // TODO: Image comes in differently in various feeds, account for it
                excerpt: item.contentSnippet,
                publicationId: pubId, // The corresponding publication, so we can sort by pub
                categoryId: 1 //TODO: set up the cats
            }

            // Push all formatted stories into an array
            allStories.push(story);
         });
    }).then(()=>{
        allStories.map((story)=>{
            Story.create(story);
        });
    }).catch((err)=>{
        console.log(err);
    });


   
    
}






/* GET home page. */
router.get('/', function(req, res, next) {

    
    res.json({
        message: 'Welcome to the REST API project!',
    });
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
router.get('/stories', asyncHandler(async function(req, res, next) {
    const stories = await Story.findAll({
        order: [
            ['publicationDate', 'DESC']
        ]
    });
    res.status(200).json(stories);
}));


/**
 * Get stories by publication slug
 */
router.get('/stories/:id', asyncHandler(async function(req, res, next){
    const publicationSlug = req.params.id;

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

    selectedPub.then((result)=>{
        const pubId = result[0]['id'];
        return pubId
    }).then( (result)=>{
        //console.log(result);
        const stories =  new Promise ((resolve, reject)=>{
            resolve(
                Story.findAll({
                    where: {
                        publicationId: result
                    },
                    include:{
                        model: Publication
                    },
                    raw: true
                })
            )
        }
    ); 

    stories.then((result)=>{        
            res.status(200).json(result);
        })
    });
}));



/*********** POST  */

/**
 * Add a publication
 */

router.post('/publications', (req, res, next)=>{
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
    });
   
    res.status(201).send();
}));



/************DELETE ********** */


router.delete('/stories', asyncHandler( async function(req, res, next){

    //const allStories = await Story.findAll();
   
    await Story.destroy({where:{}});
    
    res.status(204).end();
}));



module.exports = router;
