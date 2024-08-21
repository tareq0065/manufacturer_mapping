"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./src/db");
const loadData_1 = require("./src/loadData");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, db_1.initializeDatabase)();
        try {
            yield (0, loadData_1.loadAllCSVFiles)();
            console.log('All files processed successfully.');
        }
        catch (err) {
            console.error('Error during data loading:', err);
        }
    });
}
main();
