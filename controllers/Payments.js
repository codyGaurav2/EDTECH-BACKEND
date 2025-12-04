const {instance} = require("../config");
const Course = require("../models/Course");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");

 //capture payment and initiate the razorpay order

 exports.capturePayment = async(req,res) =>{

    //data fetch get course idand user id
    const{course_id} = req.body;
    const userId = req.user.id;
    //validate

    //valid courseId
    if(!course_id){
        return res.json({
            success:false,
            message:"Please provide valid course id",
        })
    };
    //valid courseDEtails
    let course;
    try{
        course = await Course.findById(course_id);
        if(!course){
            return res.json({
                success:false,
                message:"Could not find the course",
            })
        }

        //user already pay for the same  course
        const uid = new mongoose.Types.ObjectId(userId);//convery string user id to user object id;

        if(course.studentsEnrolled.includes(uid)){
            return res.status(200).json({
                success:false,
                message:"Student is already enrolled",
            })
        }


    }catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });


    }
    

    //order create kro 
    const amount  = course.price;
    const currency = "INR";

    const options = {
        amount : amount*100,
        currency,
        receipt: Math.random(Date.now()).toString(),
        notes:{
            courseId:course_id,
            userId,
        }
    };

    try{
        // initate payment using razorpay
        const paymentResponse = await instance.orders.create(options);

        return res.status(200).json({
            success:true,
           courseName:course.courseName,
           courseDescription:course.courseDescription,
           thumbnail :course.thumbnail,
           orderId :paymentResponse.id,
           currency:paymentResponse.currency,
           amount:paymentResponse.amount, 
        })

    }catch(error){
        console.log(error);
        res.json({
            success:false,
            message:"Could not iniate order",
        })

    }
 


 };


 //verify signature of razorpay and server

 exports.verifySignature = async(req,res)=>{
    // matching of server secret and wen hook secret

    const webhookSecret = "1234567";//server sign

    const signature = req.headers["x-razorpay-signature"];//razorpay sign

   const shasum =  crypto.createHmac("sha256",webhookSecret);

   shasum.update(JSON.stringify(req.body));

   const digest = shasum.digest("hex");


   if(signature === digest){
    console.log('payment authorised'); 

    const {courseId,userId} = req.body.payload.payment.entity.notes;

    try{
        //fulfilthe action 

        //find course and enroll student in it

        const enrolledCourse = await Course.findOneAndUpdate(
            {_id:courseId},
            {$push:{studentsEnrolled:userId}},
            {new:true},
            
        ) ;

        if(!enrolledCourse){
            return res.status(500).json({
                success:false,
                message:"Course not found",
            });
        }
        console.log(enrolledCourse);

        //find the student and add the course to their list enrolled courses

        const enrolledStudent = await User.findOneAndUpdate(
            {_id:userId},
            {$push:{courses:courseId}},
            {new:true},
        )
        console.log(enrolledStudent);

        //mail send krna confirmation mail

        const emailResponse = await mailSender(
            enrolledStudent.email,
            "congratulation, you enrooled to new course",

        );
        console.log(emailResponse);
        return res.status(200).json({
            success:true,
            message:"signature verified and course added",
        })
    }catch(error){

        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
   }else{
    return res.status(400).json({
        success:false,
        message:"Invalid request",
    });
   }

 }


