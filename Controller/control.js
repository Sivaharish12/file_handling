const jwt=require('jsonwebtoken')
const decode=require('../util/decode_jwt')
const db=require('../models/index')
const user=require('../models/user');
const { Error } = require('sequelize');
const fs=require('fs')
const path=require('../server');
const { log } = require('console');

let count=0;

exports.Signup=async (req,res,next)=>{
    const {name,password,confirm_password,number}=req.body;
    try{
        const user=await db.sequelize.models.user.create({name,password,confirm_password,number});
        res.json(user)
    }
    catch(err){
        console.error(err);
        res.status(500).send(err);
    }
}

exports.login=async (req,res,next)=>{
    const user=await db.sequelize.models.user.findOne({where :{name:req.body.name}});
    if(user==null) throw new Error("The user is empty");
    const user_obj_sign={id:user.id}
    if(user.password===req.body.password){
        const refresh_tocken=jwt.sign(user_obj_sign,process.env.REFRESH_TOKEN_SECRET);
        const access_token=jwt.sign(user_obj_sign,process.env.ACCESS_TOKEN_SECRET,{expiresIn : '30m'});
        console.log(user);
        res.json({access_token:access_token,refresh_tocken:refresh_tocken});
    }
    else{
        next( new Error("Password Mismatch"));
    }
}

exports.refresh_token=(req,res,next)=>{
    const token=req.body.token;
    const verify_token=jwt.decode(token);
    console.log(verify_token);
    if(verify_token){
        const access_token=jwt.sign({id:verify_token.id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:"30m"});
        const decoded_access_token=jwt.decode(access_token);
        const expirationDate = new Date(decoded_access_token.exp * 1000);
        res.send({ access_token, expirationDate });
    }
    else {
    throw new Error("The Token is tampered");
    }
}



exports.user_detail = async (req, res, next) => {
    try{
        const decoded_access_token = decode.decode_jwt(req, res, next);
        const pk=decoded_access_token.id;
        const user=await db.sequelize.models.user.findByPk(pk);
        res.json(user);
    }
    catch(err){
        next(new Error(err));
    }
    
};




exports.user_detail_change=async (req,res,next)=>{
    const verify_token=decode.decode_jwt(req, res, next);
    const pk=req.params.id;
    if(verify_token.id==pk){
        const update=req.body;
        const keys=Object.keys(update)
        const user=await db.sequelize.models.user.findByPk(pk);
        if(user==null) next(new Error("User not found"));
        try{
            keys.forEach(key => {
                user[key]=update[key];
                user.save();
                console.log(key);
            });

        }
        catch(err){
            console.error(err);
        }
    res.send(user);
    }
    else{
        next(new Error("The user does not have permission to update the record"));
    }
}


exports.user_delete=async (req,res,next)=>{
    const verify_token=decode.decode_jwt(req, res, next);
    const delete_id=req.params.id;
    const user=await db.sequelize.models.user.findByPk(delete_id);
    if(user && user.id==verify_token.id){
        await user.destroy();
        res.send(`The user id:${delete_id} data deleted succesfully.`);
    }
    else if(user){
        next(new Error("Does not have permission"));
    }
    else{
        next(new Error("User not exist"));
    }
   
}


const error_file_path=__dirname+'uploads/error.txt'
const baseurl="http://localhost:5000/file/"
const del_baseurl="http://localhost:5000/file/delete/"

exports.download=(req,res,next)=>{
    const filename=req.params.name
    let directorypath='C:/Users/haris/Downloads/Compressed/EXPRESS_ASSESMENT_JWT-Sequelize_Assesment/EXPRESS_ASSESMENT_JWT-Sequelize_Assesment';
    directorypath+='/uploads'
    res.download(directorypath+'/'+filename,(err)=>{
        if (err) {
            throw new Error(err)
            next()
        }
    })
}

exports.listfiles=(req,res,next)=>{
    let directorypath='C:/Users/haris/Downloads/Compressed/EXPRESS_ASSESMENT_JWT-Sequelize_Assesment/EXPRESS_ASSESMENT_JWT-Sequelize_Assesment';
    directorypath+='/uploads'
    fs.readdir(directorypath,function(err,files){
        if (err){
            throw new Error(err);
            next();
        }
        let files_info=[]
        files.forEach((file)=>{
            files_info.push({
                name:file,
                url:baseurl+file,
                delete_url:del_baseurl+file
            });
        });
        res.send(files_info);

    })
}

exports.upload=(req,res,next)=>{
    if(!req.file){
        throw new Error("The file is not present");
        next();
    }
    res.send("File Upload Successfull!");
}

exports.delete=(req,res,next)=>{
    const filename=req.params.name;
    let directorypath='C:/Users/haris/Downloads/Compressed/EXPRESS_ASSESMENT_JWT-Sequelize_Assesment/EXPRESS_ASSESMENT_JWT-Sequelize_Assesment';
    directorypath+='/uploads'
    fs.unlinkSync(directorypath+'/'+filename);
    res.send("File Successfully Deleted!");
}