const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
/*
router.get('/notes/add', function (req, res) {
    res.render('../views/notes/new_notes');
})
*/

router.get('/notes/add', (req, res, next) => {
  res.render('../views/notes/new_notes');
});


function isAuthenticated(req, res, next) {
  if(req.isAuthenticated()) {
    return next();
  }

  res.redirect('/signinup')
}


router.post('/notes/add', async function (req, res) {
    const { title, description } = req.body
    var errors = []
    if (!title) {
        errors.push("Please write a Title")
    }
    if (!description) {
        errors.push("Please write a description")
    }
    if (errors.length > 0) {       
        res.render('../views/notes/new_notes', {
            errors,
            title,
            description
        })
    } else {
        const newNote = new Note({title, description})
        await newNote.save()     
        req.flash('success_msg','Nota agrega correctamente.')
        res.redirect('/notes')   
    }
})
router.get('/notes', async function (req, res) {
    const note = await Note.find()    
    res.render('../views/notes/notes_all', { note });
})

router.get('/notes/update/:id', async function(req, res){
    const note = await Note.findById(req.params.id)
    req.flash('success_msg','Nota Actualizada correctamente.')
    res.render('../views/notes/edit', { note });
});


router.put('/note/update/:id', async function(req, res){
    const {title , description} = req.body
    await Note.findByIdAndUpdate(req.params.id, {title, description})
    req.flash('success_msg','Nota Actualizada correctamente.')
    res.redirect('/notes')
})

router.delete('/notes/delete/:id', async function(req, res){   
    await Note.findByIdAndDelete(req.params.id)
    req.flash('success_msg','Nota Eliminada correctamente.')    
    res.redirect('/notes')
})



module.exports = router;
