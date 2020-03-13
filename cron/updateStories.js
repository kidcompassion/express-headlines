const axios = require('axios');

const user = {
    "emailAddress": "sallypoulsen@gmail.com",
    "password": "Bikinikill_66"
}

const encodedCredentials = btoa(`${user.emailAddress}:${user.password}`);

const updateStories = async ()=>{
    const url = 'https://headlines-fe.herokuapp.com/api/stories'
    axios.post(url, { user, headers: {"Authorization" : `Basic ${encodedCredentials}`} });
    try{
        await axios.post( url, ).then(()=>{
            console.log('posted');
        });
    }catch(err){
        console.log(err);
    }
    
}

updateStories();