const express=require('express');
const route=express.Router();
const Controller=require('../Controller/control');
const Inp_Validator=require('../util/validation');

route.post('/signup',Inp_Validator.signup_validation,Controller.Signup);
route.get('/detail',Inp_Validator.token_header_validation,Controller.user_detail);
route.put('/:id',Inp_Validator.token_header_validation,Inp_Validator.user_update_validation,Controller.user_detail_change);
route.delete('/:id',Inp_Validator.token_header_validation,Controller.user_delete);

module.exports=route;