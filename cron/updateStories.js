const axios = require('axios');

const user = {
    "emailAddress": "sallypoulsen@gmail.com",
    "password": "Bikinikill_66"
}

const updateStories = async ()=>{
    const url = 'https://headlines-fe.herokuapp.com/api/stories'
    
    try{
        await axios.post(url, { user, headers: {"Authorization" : `Basic`} });
    }catch(err){
        console.log(err);
    }
    
}

updateStories();