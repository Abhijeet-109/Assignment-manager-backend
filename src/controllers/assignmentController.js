const Assignment = require('../models/Assignment');

// 1. Creating the assignment for Teacher Only 
const createAssignment = async (req,res) =>{
    try {
        const { title, description, subject, dueDate, maxMarks} = req.body;

        const assignment = await Assignment.create(
            {
                title,
                description,
                subject,
                dueDate,
                createdBy: req.user._id,
                maxMarks,
            }
        );

        return res.status(201).json(
            {
                success: true,
                data: assignment,
            }
        );
    }

    catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    };
}

// 2. Getting / fetcheing all assignment - Admin only

const getAllAssignment = async (req,res) => {
    try{
        const assignments = await Assignment.find({}).populate('createdBy','name email');
        return res.status(200).json({
            success: true,
            count: assignments.length, 
            data: assignments,
        });
    } catch(error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }   
};


// After creating new file Named studetnAssignment junction 
// we do not need explicite function to assign assignment to student while creating the assignment 

// 3. Get my Assignment - Student Only

// const getMyAssignment = async (req,res) => {
//     try{
//         const assignments = await Assignment.find({
//             assignedTo: req.user._id,
//         });

//         return res.status(200).json({
//             success: true,
//             count: assignments.length,
//             data: assignments,
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }  
// };

// 4 Update Assignment - Teacher only ( with own assignmets only )

const updateAssignmet = async (req,res)=>{
    try {
        const assignment = await Assignment.findById(req.params.id);

        if(!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found',
            });
        }

        if (assignment.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorizedto update this assignment',
            });

        }

        const updated = await Assignment.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true, 
                runValidators: true,
            }
        );

        return res.status(200).json({
            success: true,
            data: updated,
        });
    } catch (error){
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 5. Delete Assignment - Teacher ( their Own only) Admin ( any)

const deleteAssignment = async(req,res)=>{
    try{
        const assignment = await Assignment.findById(req.params.id);

        if(!assignment){
            return res.status(404).json({
                success:false,
                message: 'Assignment not found.',
            });
        }
        if (req.user.role !=='admin' && assignment.createdBy.toString() !== req.user._id.toString()){
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this assignment.',
            });

        } 
        await Assignment.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: 'Assignment deleted successfully.',
        });
    } catch(error){
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

module.exports = { 
    createAssignment,
    getAllAssignment,
    updateAssignmet,
    deleteAssignment,
};

// getMyAssignment,