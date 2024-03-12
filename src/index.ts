import { config } from 'dotenv';
config({ path: '.env' });

const express = require('express');
import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();
const port = process.env.PORT || 3000;

// create an error with .status. we
// can then use the property in our
// custom error handler (Connect respects this prop as well)

const error = (status: number, msg: string): Error => {
    const err = new Error(msg);
    (err as any).status = status;
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

const apiKeys: string[] = ['key1', 'key2', 'key3'];

// here we validate the API key,
// by mounting this middleware to /api
// meaning only paths prefixed with "/api"
// will cause this middleware to be invoked

app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    // Use a type assertion to tell TypeScript that you're certain 'api-key' is a string.
    const key = req.query['api-key'] as string;

    // key isn't present or is not a string
    if (typeof key !== 'string') return next(error(400, 'api key required'));

    // key is invalid
    if (!apiKeys.includes(key)) return next(error(401, 'invalid api key'));

    // all good, store key for route access
    res.locals.key = key;
    next();
});

app.get('/', (req: Request, res: Response) => {
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

app.get('/user_accounts', async (req: Request, res: Response) => {
    const user_accounts = await prisma.userAccounts.findMany();
    res.json(user_accounts);
});

app.get('/user_accounts/count', async (req: Request, res: Response, next: NextFunction) => {
    if (!req.query) return next(error(400, 'Undefined Query Parameters'));

    const IdNumber = req.query['id_number'] as string;
    const FullName = req.query['full_name'] as string;
    const Role = req.query['role'] as string;

    const user_accounts_count: number = await prisma.userAccounts.count({
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
});

app.get('/user_accounts/search', async (req: Request, res: Response, next: NextFunction) => {
    if (!req.query) return next(error(400, 'Undefined Query Parameters'));

    const IdNumber = req.query['id_number'] as string;
    const FullName = req.query['full_name'] as string;
    const Role = req.query['role'] as string;

    const user_accounts = await prisma.userAccounts.findMany({
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
});

app.get('/user_accounts/:id', async (req: Request, res: Response, next: NextFunction) => {
    const Id = parseInt(req.params.id);

    if (!Id) return next(error(400, 'Invalid Url Parameter'));

    const user_account = await prisma.userAccounts.findUnique({
        where: {
            Id: Id,
        },
    });

    res.json(user_account);
});

app.post('/user_accounts/insert', async (req: Request, res: Response, next: NextFunction) => {
    const { IdNumber, FullName, Username, Password, Section, Role } = req.body;

    const user_account = await prisma.userAccounts.create({
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
});

app.post('/user_accounts/update', async (req: Request, res: Response, next: NextFunction) => {
    const { Id, IdNumber, FullName, Username, Password, Section, Role } = req.body;

    const user_account = await prisma.userAccounts.update({
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
});

app.post('/user_accounts/delete', async (req: Request, res: Response, next: NextFunction) => {
    const { Id } = req.body;

    const user_account = await prisma.userAccounts.delete({
        where: {
            Id: Id
        },
    });

    res.json(user_account);
});

// middleware with an arity of 4 are considered
// error handling middleware. When you next(err)
// it will be passed through the defined middleware
// in order, but ONLY those with an arity of 4, ignoring
// regular middleware.
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    // whatever you want here, feel free to populate
    // properties on `err` to treat it differently in here.
    res.status((err as any).status || 500);
    res.send({ error: err.message });
});

// our custom JSON 404 middleware. Since it's placed last
// it will be the last middleware called, if all others
// invoke next() and do not respond.
app.use((req: Request, res: Response) => {
    res.status(404);
    res.send({ error: "Sorry, can't find that" });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});