const axios = require('axios');

const updateStories = async ()=>{

    const url = 'https://express-headlines-api.herokuapp.com/api/stories'

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