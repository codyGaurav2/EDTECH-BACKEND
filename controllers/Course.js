const RatingAndReviews = require("../../models/RatingAndReviews");
const Course = require("../models/Course");
const Category= require("../models/category");
const User = require("../models/User");
const {uploadImageToCloudinary} = require("../utils/imageUploader");

//createCourse handler function

exports.createCourse = async(req,res) =>{
    try{


        //get data 
        const {courseName,courseDescription,whatYouWillLearn,price,category} = req.body;

        // get thumbnail
        const  thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName ||!courseDescription ||!whatYouWillLearn ||!price||!tag ||!thumbnail){
            return res.status(400).json({
                success:false,
                message:"all feildds required",
            })
        }

        //check for instructor


        const userId = req.user.id;

        const instructorDetails = await User.findById(userId);


        if(!instructorDetails){
            return res.status(400).json({
                success:false,
                message:"Instriuctor details not found",
            })
        }

        //check given tag is valid or not

        const categoryDetails = await Category.findById(category);

        if(!tagDetails){
            return res.status(400).json({
                success:false,
                message:"tag details not found",

        }
    );


        }

        //upload image to cloudinry

        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME);

// entry create for new course

const newCourse =  await Course.create({
    courseName,
    courseDescription,
    instructor:instructorDetails._id,
    whatYouWillLearn,
    price,
    tag:tagDetails._id,
    thumbnail:thumbnailImage.secure_url,
})

//add the new course in instructor
await User.findByIdAndUpdate(
    {_id: instructorDetails._id},
    {
        $push:{
            courses: newCourse._id,
        }
    },
    {new:true},

    //update tag Schema
    //hw
)
    return res.status(200).json({
        success:true,
        message:"Course created successfully",
        data:newCourse,
    })


    }catch(error){

        
        return res.status(500).json({
            success:false,
            message:error.message,
        })


    }
}







//getAllcourse handler function

exports.showAllCourses = async(req,res) =>{
    try{

        const allCourses = await Course.find({},{courseName:true,price:true,thumbnail:true,instructor:true,RatingAndReviews:true,studentsEnrolled:true,
        })
        .populate("instructor")
        .exec();

        return res.status(200).json({
            success:true,
            message:"Data for all users fetched successfully",
            data:allCourses,
        })

    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"cannot fetch course",
            error :error.message,
        })
    }
}


