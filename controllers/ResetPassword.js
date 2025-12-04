const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

//resetPassword token

exports.resetPasswordToken = async(req,res) =>{
   try{ //get email from req.body
    const email = req.body.email;
    //check user fro this email, email validation
    const user = await User.findOne({email:email});
    if(!user){
        return res.json({
            success:false,
            message:"Email is not registered",
        });
    }
    //token generation
    const token = crypto.randomUUID();

    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate({email:email},
        {
            token:token,
            resetPasswordExpires:Date.now() + 5*60*1000,
        },
        {new:true}
    );
    //create url
    const url = `http://localhost:3000/update-password/${token}`
    //send mail contaimng url

    await mailSender(email,"password reset link",
        `Password reset link:${url}`
    )
    //return res

    return res.json({
        success:true,
        message:"Email sent successfully",
    })



   
    
}catch(error){

    console.log(error);
    return res.status(401).json({
        success:false,
        message:"something wrong",
 } );
    
}
}



//resetPassword

exports.resetPassword = async(req,res)=>{

    try{
    //data fetch
    const{password,confirmPassword,token} = req.body;
    //validation
    if(!password !==confirmPassword){
        return res.josn({
            success:false,
            message:"Password not matching",
        })
    }
    //get user details from db using token

    const userDetails = await User.findOne({token:token});

    //inalid token if not found
    if(!userDetails){
        return res.json({
            success:false,
            message:"Token is invalid",
        });
    }
    //toekn time check
    if(userDetails.resetPasswordExpires<Date.now()){
        return res.json({
            success:false,
            message:"Token is expired,please regenerate",
        })

    }
    //password hash
    const hashedPassword = await bcrypt.hash(password,10);

    //update password
    await User.findOneAndUpdate(
        {token:token},
        {password:hashedPassword},
        {new:true},
    )
    //return res
    return res.status(200).json({
        success:true,
        message:"Password reset successfull",
    })


}catch(error){

    console.log(error);
    return res.status(401).json({
        success:false,
        message:"something wrong",
 } );
     

}
}


