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
exports.plainQuery = exports.query = void 0;
const pgp = require('pg-promise')();
const config = {
    user: 'ngp',
    host: 'localhost',
    database: 'ngp',
    password: 'ngp',
    port: 20110,
};
const db = pgp(config);
const query = (text, params) => __awaiter(void 0, void 0, void 0, function* () {
    return db.query(text, params);
});
exports.query = query;
const plainQuery = (text) => __awaiter(void 0, void 0, void 0, function* () {
    return db.query(text);
});
exports.plainQuery = plainQuery;
