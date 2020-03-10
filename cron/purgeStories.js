const axios = require('axios');
const purgeStories = ()=>{
    try{
        Promise.all([
            axios.delete('https://headlines-fe.herokuapp.com/api/stories'),
            axios.delete('https://headlines-fe.herokuapp.com/api/bookmarks'),
        ]).then(()=>{
            console.log('Purged');
        })
    }catch(err){
        console.log(err);
    }
}

purgeStories();