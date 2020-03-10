const purgeStories = async =>{
    Promise.all([
        fetch('https://headlines-fe.herokuapp.com/api/stories', {method: 'delete'}),
        fetch('https://headlines-fe.herokuapp.com/api/bookmarks', {method: 'delete'})
        
    ]).then(()=>{
        console.log('Purged');
    })
}

purgeStories();