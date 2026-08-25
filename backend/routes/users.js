const express = require('express');
const router = express.Router();
const {
  getUserDetails,
  getNearbyUsers,
  uploadPhoto,
  deletePhoto,
  requestVerification,
  reportUser,
  toggleFollowUser,
  getFriendsList,
  getFollowingList,
  getFollowersList,
  updateLocation
} = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(authMiddleware);

// Location & Geocoding
router.post('/location', updateLocation);

// Relationship & Friends endpoints (before /:id)
router.get('/relationships/friends', getFriendsList);
router.get('/relationships/following', getFollowingList);
router.get('/relationships/followers', getFollowersList);

router.get('/nearby', getNearbyUsers);
router.get('/:id', getUserDetails);
router.post('/:id/follow', toggleFollowUser);
router.post('/photos', upload.single('photo'), uploadPhoto);
router.delete('/photos/:photoId', deletePhoto);
router.post('/verification', requestVerification);
router.post('/report', reportUser);

module.exports = router;

