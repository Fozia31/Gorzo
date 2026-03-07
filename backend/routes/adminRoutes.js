const express = require("express");
const {
	createAdmin,
	getAdmins,
	getAdminById,
	updateAdmin,
	deleteAdmin,
} = require("../controller/adminController");

const router = express.Router();

router.post("/", createAdmin);
router.get("/", getAdmins);
router.get("/:adminId", getAdminById);
router.put("/:adminId", updateAdmin);
router.delete("/:adminId", deleteAdmin);

module.exports = router;
