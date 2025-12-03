const category = require("../models/category");


//create tag handler fundtion

exports.createCategory = async(req,res) =>{
    try{
        //data fetch
        const {name,description} = req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                message:"All feilds are required",
            })
        }

        //create entry in db

        const categoryDetails = await category.create({
            name:name,
            description:description,
        });

        //return response
        return res.status(200).json({
            success:true,
            message:"tag created successfully",
          
        });
    

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }
}

//getAllTags

exports.showAllCategory= async(req,res) =>{
    try{
        const allCategory= await category.find({},{name:true,description:true});
        res.status(200).json({
            success:true,
            message:"All tags returned",
            allTags,
        })

    }catch(error){

        return res.status(500).json({
            success:false,
            message:error.message,
        })


    }
}