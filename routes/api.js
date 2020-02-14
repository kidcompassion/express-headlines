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
 * Escape Helper
 * @param {*} linkInfo 
 * @param {*} pubId 
 */

 function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}


/**
 * XML Parsing middleware
 * 
 */


const xmlParse = (linkInfo, pubId)=>{
    let allStories = [];

    console.log(pubId);
    let feed =  new Promise ((resolve, reject)=>{
        resolve( parser.parseURL(linkInfo));
    });
    
    feed.then((result)=>{


        result.items.forEach(item => {
         //   console.log('item', item);
            story = {
                title: item.title,
                url: item.link,
                publicationDate: item.pubDate,
                author: item.creator,
                imgUrl: null,
                excerpt: item.contentSnippet,
                publicationId: pubId,
                categoryId: 1
            }

             allStories.push(story);
            // Story.create(story);   
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





router.get('/publications', asyncHandler(async function(req, res, next) {
    const pubs = await Publication.findAll();
    res.status(200).json(pubs);
}));




router.get('/stories', asyncHandler(async function(req, res, next) {

    try{
        const stories = await Story.findAll();
   
    res.status(200).json(stories);
    }catch(err){
        console.log(err);
    }
}));


router.get('/stories/:id', asyncHandler(async function(req, res, next){
    const publicationSlug = req.params.id;
    
    try{
        const selectedPub = new Promise ((resolve, reject)=>{
            resolve( 
                Publication.findAll({
                    where:{
                        slug: publicationSlug
                    },
                    raw:true
                }));
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
            });          
            stories.then((result)=>{
                
                res.status(200).json(result);
            })
        });

       
    }catch(err){
        console.log(err);
    }


}));




/**
 * Publications
 */

router.post('/publications', (req, res, next)=>{


    newPub = req.body;

    const generateSlug = (name)=>{
        return name.replace(/\s/g , "-").toLowerCase();
    }

  //  console.log(req);
    const createPublication =  Publication.create({
                                        name: newPub.name,
                                        url: newPub.url,
                                        rssUrl: newPub.rssUrl,
                                        slug: generateSlug(newPub.name),
                                        logoUrl: newPub.logoUrl
                                    });
                                  
    res.status(201).send();
});





router.post('/stories', asyncHandler( async function(req, res, next){

    const pubs = await Publication.findAll({
        raw: true,
        attributes: ["id", "rssUrl"],
    });
console.log('pubs', pubs);
    pubs.map((pub, index)=>{
       
         xmlParse(pub.rssUrl, pub.id);
    });
   
    res.status(201).send();
}));



router.post('/categories', function(req, res, next){
    const createPublication =  Category.create({
        name:'Category Two'
    });
   
    res.json({
        'hello': 'hello'
    });
});



module.exports = router;
