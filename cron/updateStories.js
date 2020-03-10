const axios = require('axios');

const updateStories = async ()=>{
    const url = 'https://headlines-fe.herokuapp.com/api/stories'

    try{
        await axios.post( url, {
            "emailAddress": "sallypoulsen@gmail.com",
            "password": "$2b$10$hekFJ7Cj58xpJr4k89uc5uEGUNE6tNXcAzqfrr6qtKhNDUozdNq6W"
        }).then(()=>{
            console.log('posted');
        });
    }catch(err){
        console.log(err);
    }
    
}

updateStories();