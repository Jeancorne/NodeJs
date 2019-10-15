const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/notes-db-app',{
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false
})
    .then (db => console.log('DB Is connected'))
    .catch(err => console.error(err));


//mongoose.then(db => console.log('DB Is connected'))
//mongoose.catch(err => console.error(err))
