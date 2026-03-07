const express = require("express");
const {
	createUser,
	loginUser,
	getUsers,
	getUserById,
	updateUser,
	deleteUser,
} = require("../controller/userController");

const router = express.Router();

router.post("/", createUser);
router.post("/login", loginUser);
router.get("/", getUsers);
router.get("/:userId", getUserById);
router.put("/:userId", updateUser);
router.delete("/:userId", deleteUser);

module.exports = router;
