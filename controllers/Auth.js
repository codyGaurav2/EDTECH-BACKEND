const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = requrie("otp-generator");
//sendOtp

exports.sendOtp = async(req,res) =>{

  try{
      //fetch email from req body
      const {email} =req.body;

      //check if user already exist
      const checkUserPresent = await User.findOne(email);
  
      //if already exist then return
  
      if(checkUserPresent){
          return res.status(401).json({
              success:false,
              message:"User already registered",
  
          })
      }
  
      //generate otp

      var otp = otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialCharacters:false,
      })

      //make sure unique otp
      const result = await OTP.findOne({otp:otp});

      while(result){
       otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialCharacters:false,
          });
          result = await OTP.findOne({otp:otp});
      }

      const otpPayload = {email,otp};

      //create entry in db for otp

      const otpBody = await OTP.create(otpPayload);
      console.log(otpBody);

      //return response

      res.status(200).json({
        success:true,
        message:"OTP send successfull",
        otp,
      });



  }catch(error){
    console.log(error);
    return res.status(500).json({
        suucess:false,
        message:error.message;

     })

  }





}






//signUp



//login

//resetPassword



