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
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ path: '.env' });
const express = require('express');
const client_1 = require("@prisma/client");
const cors = require('cors');
const prisma = new client_1.PrismaClient();
const app = express();
const port = process.env.PORT || 3000;
// create an error with .status. we
// can then use the property in our
// custom error handler (Connect respects this prop as well)
const error = (status, msg) => {
    const err = new Error(msg);
    err.status = status;
    return err;
};
// Use CORS middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// if we wanted to supply more than JSON, we could
// use something similar to the content-negotiation
// example.
// map of valid api keys, typically mapped to
// account info with some sort of database like redis.
// api keys do _not_ serve as authentication, merely to
// track API usage or help prevent malicious behavior etc.
const apiKeys = ['key1', 'key2', 'key3'];
// here we validate the API key,
// by mounting this middleware to /api
// meaning only paths prefixed with "/api"
// will cause this middleware to be invoked
app.use('/api', (req, res, next) => {
    // Use a type assertion to tell TypeScript that you're certain 'api-key' is a string.
    const key = req.query['api-key'];
    // key isn't present or is not a string
    if (typeof key !== 'string')
        return next(error(400, 'api key required'));
    // key is invalid
    if (!apiKeys.includes(key))
        return next(error(401, 'invalid api key'));
    // all good, store key for route access
    res.locals.key = key;
    next();
});
app.get('/', (req, res) => {
    let htmlElement = "<p>";
    htmlElement += "API TEMPLATE ETS (localhost:3000)";
    htmlElement += "</p>";
    htmlElement += "<p>";
    htmlElement += "Developed By : Vince Dale D. Alcantara";
    htmlElement += "</p>";
    htmlElement += "<p>";
    htmlElement += "Version 1.0.0";
    htmlElement += "</p>";
    res.send(htmlElement);
});
// Prisma Examples
app.get('/user_accounts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user_accounts = yield prisma.userAccounts.findMany();
    res.json(user_accounts);
}));
app.get('/user_accounts/count', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query)
        return next(error(400, 'Undefined Query Parameters'));
    const IdNumber = req.query['id_number'];
    const FullName = req.query['full_name'];
    const Role = req.query['role'];
    const user_accounts_count = yield prisma.userAccounts.count({
        where: {
            IdNumber: {
                startsWith: IdNumber
            },
            FullName: {
                startsWith: FullName
            },
            Role: {
                startsWith: Role
            },
        },
    });
    res.json({ count: user_accounts_count });
}));
app.get('/user_accounts/search', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.query)
        return next(error(400, 'Undefined Query Parameters'));
    const IdNumber = req.query['id_number'];
    const FullName = req.query['full_name'];
    const Role = req.query['role'];
    const user_accounts = yield prisma.userAccounts.findMany({
        where: {
            IdNumber: {
                startsWith: IdNumber
            },
            FullName: {
                startsWith: FullName
            },
            Role: {
                startsWith: Role
            },
        },
    });
    res.json(user_accounts);
}));
app.get('/user_accounts/:id', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Id = parseInt(req.params.id);
    if (!Id)
        return next(error(400, 'Invalid Url Parameter'));
    const user_account = yield prisma.userAccounts.findUnique({
        where: {
            Id: Id,
        },
    });
    res.json(user_account);
}));
app.post('/user_accounts/insert', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { IdNumber, FullName, Username, Password, Section, Role } = req.body;
    const user_account = yield prisma.userAccounts.create({
        data: {
            IdNumber: IdNumber,
            FullName: FullName,
            Username: Username,
            Password: Password,
            Section: Section,
            Role: Role
        },
    });
    res.json(user_account);
}));
app.post('/user_accounts/update', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { Id, IdNumber, FullName, Username, Password, Section, Role } = req.body;
    const user_account = yield prisma.userAccounts.update({
        where: {
            Id: Id
        },
        data: {
            IdNumber: IdNumber,
            FullName: FullName,
            Username: Username,
            Password: Password,
            Section: Section,
            Role: Role
        },
    });
    res.json(user_account);
}));
app.post('/user_accounts/delete', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { Id } = req.body;
    const user_account = yield prisma.userAccounts.delete({
        where: {
            Id: Id
        },
    });
    res.json(user_account);
}));
// middleware with an arity of 4 are considered
// error handling middleware. When you next(err)
// it will be passed through the defined middleware
// in order, but ONLY those with an arity of 4, ignoring
// regular middleware.
app.use((err, req, res, next) => {
    // whatever you want here, feel free to populate
    // properties on `err` to treat it differently in here.
    res.status(err.status || 500);
    res.send({ error: err.message });
});
// our custom JSON 404 middleware. Since it's placed last
// it will be the last middleware called, if all others
// invoke next() and do not respond.
app.use((req, res) => {
    res.status(404);
    res.send({ error: "Sorry, can't find that" });
});
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
