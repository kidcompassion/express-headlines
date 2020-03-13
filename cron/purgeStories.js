const axios = require('axios');
const config = require('/config.js');
const purgeStories = ()=>{
    try{
        Promise.all([
            axios.delete(`${config.storiesUrl}`),
            axios.delete(`${config.bookmarks.Url}`),
        ]).then(()=>{
            console.log('Purged');
        })
    }catch(err){
        console.log(err);
    }
}

purgeStories();