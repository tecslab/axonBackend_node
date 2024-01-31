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
exports.query = void 0;
const ts_postgres_1 = require("ts-postgres");
const client = new ts_postgres_1.Client({
    user: 'ngp',
    host: 'localhost', // problem here
    database: 'ngp',
    password: 'ngp',
    port: 20110,
});
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    yield client.connect();
});
const query = (text, params) => {
    return client.query(text, params);
};
exports.query = query;
