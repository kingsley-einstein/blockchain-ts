"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var router_1 = __importDefault(require("./router"));
var app = express_1["default"]();
app.use(express_1["default"].json());
app.use("/api/v1", router_1["default"]);
app.listen(7000, function () {
  return console.log("App is running on port 7000");
});
// export default app;
