const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = requrie("otp-generator");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

reuire("dotenv").config();
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
      let result = await OTP.findOne({otp:otp});

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
        message:error.message,

     })

  }

}

//signUp

exports.signUp = async(req,res) =>{

try{
    //fetch email 
    const{firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp,
    } = req.body;

    //validate krlo

    if(!firstName ||!lastName || !email || !password || !confirmPassword || !otp){
        return res.status(403).json({
            success:false,
            message:"All feild required",
        })
    }

    //2 password match krlo

    if(password !== confirmPassword){
        return res.status(400).json({
            success:false,
            message:"Password dont match",
        })
    }

  

    //check user already exist or not 
    const existingUser = await User.findOne({email});

    if(existingUser){
        return res.status(400).json({
            success:false,
            message:"User alread exist",

        });

    }

    // find most recent otp

    const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);

    //validate otp

    if(recentOtp.length == 0 ){
        return res.status(400).json({
            success:false,
            message:"OTP found",
        })
    }else if(otp !== recentOtp[0].otp){
        return res.status(400).json({
            success:false,
            message:"Invalid otp",
        });
    }

    //hash password

    const hashedPassword = await bcrypt.hash(password,10);

    const profileDetails = await Profile.create({
        gender:null,
        dateOfBirth:null,
        about:null,
        contactNumber:null,

    });

    //entry created in db
    const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password:hashedPassword,
        accountType,
        additionalDetails:profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastName}`,



    })

    //return res

    return res.status(200).json({
        success:true,
        message:"User registered successfully",
        user,
    });



}catch(error){
    console.log(error);
    return res.status(500).json({
        success:false,
        message:"USer cannnot be registerd",
    })

}

}

//login

exports.login = async(req,res)=>{

    try{
        //get data from req.body
        const {email,password} = req.body;
        //validate kro
        if(!email || !password){
            return res.status(403).json({
                success:false,
                message:"All feilds are required",
            });
        }
        //user exist or 
        const user = await User.findOne({email}).populate("additionalDetails");

        if(!user){
            return res.status(400).json({
                success:false,
                message:"user is not registerd,please signup",

            });

        }
        //password match and  //genertae jwt token

        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email :user.email,
                id:user._id,
                accountType:user.accountType,
            }

            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });

            user.token = token;
            user.password = undefined;

        
       
        //create cookie and send response

        const options ={
            expires: new Date(Date.now() + 3*24*60*60*1000),
            httpOnly:true,
        }

        res.cookie("token",token,options).status(200).json({
            success:true,
            token,
            user,
            message:"Login  successfully",

        })


        }else{
            return res.status(401).json({
                success:false,
                message:"Password incorret"
            })
        }


    }catch(error){

        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Login failure"
        })

    }
}

//chnagePassword

//hw 



