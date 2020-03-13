const axios = require('axios');

const updateStories = async ()=>{

    let axiosConfig = {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            "Access-Control-Allow-Origin": "*",
        }
      };

    const url = 'https://headlines-fe.herokuapp.com/api/stories'

    try{
        await axios.post( url, {},axiosConfig).then(()=>{
            console.log('posted');
        });
    }catch(err){
        console.log(err);
    }
    
}

updateStories();