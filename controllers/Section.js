const Section = require("../models/Section");
const Course = require("../models/Course");

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
        const updateCourseDetails = await Course.findByInAndUpdate(
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

            error:error.message,

    })
}
}