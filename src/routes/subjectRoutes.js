const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
} = require('../controllers/subjectController');

// All routes require authentication 
// router.use(protect);

// Admin-only : Create Subject
router.post('/',protect, authorizeRoles('admin'), createSubject);

//All authorized user: Fetching all subjects 
router.get('/',protect, getAllSubjects);
router.get('/:id',protect, getSubjectById);

// Admin-only : Modifying Subject 
router.put('/update/:id',protect, authorizeRoles('admin'), updateSubject);

//Admin-only : Deleting Subject
router.delete('/:id',protect, authorizeRoles('admin'), deleteSubject);

module.exports = router;