const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser,  toggleUserStatus } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

router.use(protect, authorizeRoles('admin'));

router.get('/', getAllUsers);
router.put('/:id', updateUserRole);
router.delete('/:id', deleteUser);
router.patch('/:id/toggle-status', toggleUserStatus);

module.exports = router;