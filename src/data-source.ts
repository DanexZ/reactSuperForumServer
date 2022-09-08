import "reflect-metadata"
import { DataSource } from "typeorm"
require("dotenv").config();

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    username: process.env.MYSQL_ACCOUNT,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    synchronize: Boolean(process.env.PG_SYNCHRONIZE),
    logging: Boolean(process.env.PG_LOGGING),
    entities: [`${process.env.ENTITIES}`],
    timezone: "local",
    migrations: [],
    subscribers: [],
});