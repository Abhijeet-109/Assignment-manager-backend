const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Student = require('../models/Student');
const StudentAssignment = require('../models/StudentAssignment');
const Notification = require('../models/Notification');


// 1. Creating the assignment for Teacher Only 
const createAssignment = async (req, res) => {
    try {
        const { title, description, subject, dueDate, maxMarks, fileUrl, targetDivisions } = req.body;

        // 1. Normalize divisions — default to ['All'] if not provided
        const divisions = targetDivisions?.length ? targetDivisions : ['All'];

        // 2. Create the assignment
        const assignment = await Assignment.create({
            title,
            description,
            subject,
            dueDate,
            createdBy: req.user._id,
            maxMarks,
            fileUrl: fileUrl || null,
            targetDivisions: divisions,
        });

        // 3. Find target students
        let studentQuery = { isActive: true };
        if (!divisions.includes('All')) {
            const normalized = divisions.map(d => `Div ${d}`);
            studentQuery.division = { $in: normalized };
        }
        const students = await Student.find(studentQuery).select('_id userId');

        // 4. Bulk-create StudentAssignment records
        if (students.length > 0) {
            const junctionDocs = students.map(s => ({
                studentId: s._id,
                assignmentId: assignment._id,
                status: 'pending',
            }));
            await StudentAssignment.insertMany(junctionDocs, { ordered: false });

            // 5. Bulk-create Notifications (linked to userId, not studentId)
            const notifDocs = students.map(s => ({
                userId: s.userId,
                message: `New assignment posted: "${title}"`,
                type: 'assignment',
                isRead: false,
            }));
            await Notification.insertMany(notifDocs, { ordered: false });
        }

        return res.status(201).json({
            success: true,
            data: assignment,
            studentsNotified: students.length,
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 2. Getting / fetcheing all assignment - Admin only

const getAllAssignment = async (req, res) => {
    try {
        const assignments = await Assignment.find({}).populate('createdBy', 'name email');
        return res.status(200).json({
            success: true,
            count: assignments.length,
            data: assignments,
        });
    } catch (error) {
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

const updateAssignmet = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// 5. Delete Assignment - Teacher ( their Own only) Admin ( any)

const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: 'Assignment not found.',
            });
        }
        if (req.user.role !== 'admin' && assignment.createdBy.toString() !== req.user._id.toString()) {
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
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// New fucntion as rewuirenment 

// Get assignments created by the logged-in teacher
const getTeacherAssignments = async (req, res) => {
    try {
        const { division, subject, status } = req.query;

        // Build filter — always scoped to this teacher
        const filter = { createdBy: req.user._id };
        if (subject) filter.subject = subject;
        if (status) filter.status = status;
        if (division) filter.targetDivisions = division; // matches if array contains this value

        const assignments = await Assignment.find(filter)
            .populate('subject', 'name code')
            .sort({ createdAt: -1 });

        const assignmentsWithCount = await Promise.all(
            assignments.map(async (a) => {
                const total = await Submission.countDocuments({ assignmentId: a._id });
                return { ...a.toObject(), submissions: { total } };
            })
        );

        return res.status(200).json({
            success: true,
            count: assignmentsWithCount.length,
            data: assignmentsWithCount,
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createAssignment,
    getAllAssignment,
    updateAssignmet,
    deleteAssignment,
    getTeacherAssignments
};

// getMyAssignment,