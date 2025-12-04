const Section = require("../models/Section");
const Course = require("../models/Course");
const { findByIdAndDelete } = require("../../models/RatingAndReviews");

exports.createSection  = async(req,res) =>{
    try{

        //data fetch
        const {sectionName,courseId} = req.body;
        //data validate
        if(!sectionName || !courseId){
            return res.status(400).json({
                success:false,
                message:"All feilds reequired",
            })
        }

        //create section
        const newSection = await Section.create({sectionName});

        //update in course  with section object id 
        const updateCourseDetails = await Course.findByIdAndUpdate(
            courseId,
            {
                $push:{
                    courseContent:newSection._id,
                }
            },
            {new:true},
        );

        //hw:use populate to replace section and subsection both in updatecoursedetails
        //return res
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            updateCourseDetails,
        })

    }catch(error){

        return res.status(500).json({
            success:true,
            message:"unable to create section",

            error:error

    })
}
}

exports.updateSection = async(req,res)=>{
    try{

        
    //data input
    const {sectionName,sectionId} = req.body;

    //validate data
    if(!sectionName || !sectionId) {
        return res.status(400).json({
            success:false,
            message:"All feilds not correct",

        });
    }
    //update it in db 

    const section = Section.findByIdAndUpdate(sectionId,
        {sectionName},{new:true});
    //return res
    return res.status(200).json({
        success:true,
        message:"Section update successfullt",

    });

    }catch(error){
        return res.status(500).json({
            success:true,
            message:"unable to create section",

            error:error
    })}


}

exports.deleteSection = async(req,res) =>{

    try{
    //getid
    const{sectionId} = req.params;
    //validate data
    if(!sectionId){
        return res.status(400).json({
            success:false,
            message:"not valid details",
        
    }
)}
    //delete from db
    await Section.findByIdAndDelete(sectionId);

    //todo do we need to delete id from schema
    
    //return res
    return res.status(200).json({
        success:true,
        message:"deleted successfully",
    
    })
}
    catch(error){
        return res.status(500).json({
            success:true,
            message:"not deleted",

            error:error.message
    })


    }
}


