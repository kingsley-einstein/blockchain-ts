import express from "express";
import C from "../controller";

const router: express.Router = express.Router();

router.get("/generateKeys", C.createKeys);
router.post("/addTx", C.addNewTx);
router.get("/mine", C.mineBlock);
router.get("/chain", C.getChain);
router.get("/validate", C.validateChain);

export default router;
