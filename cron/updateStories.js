const axios = require('axios');

const updateStories = async ()=>{
    const url = 'https://headlines-fe.herokuapp.com/api/stories'

    try{
        await axios.post( url).then(()=>{
            console.log('posted');
        });
    }catch(err){
        console.log(err);
    }
    
}

updateStories();