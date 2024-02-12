const express=require('express')
const route=express.Router()
const controller=require('../Controller/control')
const upload=require('../Controller/upload')

route.post('/upload',upload.single('file'),controller.upload);
route.get('/:name',controller.download);
route.get('/',controller.listfiles);
route.delete('/delete/:name',controller.delete);


module.exports=route