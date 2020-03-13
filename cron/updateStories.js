const axios = require('axios');

const updateStories = async ()=>{

    const url = 'https://headlines-fe.herokuapp.com/api/retrieve-stories'

    try{
        await axios.get( url).then(()=>{
            console.log('posted');
        });
    }catch(err){
        console.log(err);
    }
    
}

updateStories();