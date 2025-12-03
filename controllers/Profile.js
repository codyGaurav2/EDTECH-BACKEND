const Profile = require("../models/Profile");

const User = require("../models/User");


exports.updateProfile = async(req,res) =>{
    try{
        //get data
        const {dateOfBirth="",about ="",contactNumber,gender} = req.body;
        //getuserid 
        const id = req.user.id;
        //validate
        if(!contactNumber || !gender ||!id){
            return res.status(400).json({
                success:false,
                message:'not a valid input',
                        });
        }
        //find prfile
        const userDetails = await User.findById(id);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        //update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();
        //return res

        return res.status(200).json({
            success:true,
            message:"Profile updated successfully",
            profileDetails,
        })

    }catch(error){

        return res.status(500).json({
            success:false,
            message:"not updated",
            
        })

    }
}