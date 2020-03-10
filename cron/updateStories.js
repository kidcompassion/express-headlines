const axios = require('axios');

const updateStories = async ()=>{
    const url = 'https://headlines-fe.herokuapp.com/api/stories'
    await axios.post( url, { method: 'POST'}).then(()=>{
        console.log('posted');
      });
}

updateStories();