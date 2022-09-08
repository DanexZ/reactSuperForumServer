import express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import Redis from "ioredis";
import { AppDataSource } from "./data-source";
import bodyParser from "body-parser";
import { makeExecutableSchema } from "graphql-tools";
import typeDefs from "./gql/typeDefs";
import resolvers from "./gql/resorvers";
import { ApolloServer } from "apollo-server-express";
require("dotenv").config();

declare module "express-session" {
    interface Session {
        user_id: any;
        loadedCount: Number;
    }
}

AppDataSource.initialize().then(async () => {

    const app = express();
    const router = express.Router();

    const redis = new Redis({
        port: Number(process.env.REDIS_PORT),
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD,
    });
    const RedisStore = connectRedis(session);
    const redisStore = new RedisStore({
        client: redis,
    });

    app.use(bodyParser.json());

    app.use(
        session({
            store: redisStore,
            name: process.env.COOKIE_NAME,
            sameSite: "Strict",
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                path: "/",
                httpOnly: true,
                secure: false,
                maxAge: 1000 * 60 * 60 * 24,
            },
        } as any)
    );

    app.use(router);    

    const schema = makeExecutableSchema({ typeDefs, resolvers});

    const startServer = async () => {

        const apolloServer = new ApolloServer({
            schema,
            context: ({req, res}: any) => ({req, res})
        });

        await apolloServer.start();
        apolloServer.applyMiddleware({ app, cors: false});

    }

    startServer();
      
    app.listen({ port: process.env.SERVER_PORT }, () => {
        console.log(`Serwer działa na porcie ${process.env.SERVER_PORT}`);
    });

}).catch((error: any) => console.log(error.toString()));