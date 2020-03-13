const axios = require('axios');
const config = require('/config.js');

const updateStories = async ()=>{
    const url = `${config.storiesUrl}`;
    try{
        await axios.post( url).then(()=>{
            console.log('posted');
        });
    }catch(err){
        //console.log(err);
        console.log(err.response);
    }
}

updateStories();