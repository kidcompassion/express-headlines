const updateStories = async =>{
    const url = 'https://headlines-fe.herokuapp.com/api/stories'
    await fetch(url,
        { method: 'post'}
        ).then(()=>{
            console.log('Updated');
        })
}

updateStories();