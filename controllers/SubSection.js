const SubSection = require("../models/SubSection");
const Section = require("../models/Section");
const { uploadImageToCloudinary } = require("../../utils/imageUploader");
const { findByIdAndUpdate } = require("../../models/RatingAndReviews");

exports.createSubSection = async(req,res) =>{
    try{
          //get data 

          const {sectionId,title,timeDuration,description} = req.body;
          //extract file/videos
          const  video = req.files.videoFile;
    //validate data
    if(!sectionId || !title || !timeDuration || !description || !video){
        return res.status(400).json({
            success:false,
            message:"All feilds are required",
        })
    }
    //upload videos to cloudinary

    const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);

    // db entry create section

    const SubSectionDetails = await SubSection.create({
        title:title,
        timeDuration:timeDuration,
        description:description,
        videoUrl:uploadDetails.secure_url,
    })
    //update id in section

    const updatedSection = await findByIdAndUpdate({
        _id:sectionId
    }, {$push:{
        subSection:SubSectionDetails._id,
    }},
{new:true})
    //retur res

    return res.status(200).json({
        success:true,
        message:"subsection created successfully",
        updatedSection,
    })

    }catch(error){

        return res.status(500).json({
            success:true,
            message:"not created",

            error:error.message

    })}
}


//hw updateSubSection

//hw deleteSubsection
