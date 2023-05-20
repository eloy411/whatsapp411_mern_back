const express=require('express');
const router=express.Router();

const {add,register,info} = require('../controllers/user.controller');


router.post('/api/userinfo',info);


router.post('/api/register',register);
router.post('/api/addfriend',add);


module.exports = router