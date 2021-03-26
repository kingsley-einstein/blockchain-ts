"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var controller_1 = __importDefault(require("../controller"));
var router = express_1["default"].Router();
router.get("/generateKeys", controller_1["default"].createKeys);
router.post("/addTx", controller_1["default"].addNewTx);
router.get("/mine", controller_1["default"].mineBlock);
router.get("/chain", controller_1["default"].getChain);
router.get("/validate", controller_1["default"].validateChain);
exports["default"] = router;
