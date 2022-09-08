import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn } from "typeorm";
import { User } from "./User";
import { Thread } from "./Thread";
import { Auditable } from "./Auditable";

@Entity({ name: "thread_points", schema: "public" })
export class ThreadPoint extends Auditable {
    @PrimaryGeneratedColumn({ name: "id", type: "bigint" }) 
    id: string;

    @Column("boolean", { name: "isDecrement", default: false, nullable: false })
    isDecrement: boolean;

    @ManyToOne(() => User, (user) => user.threadPoints)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Thread, (thread) => thread.threadPoints)
    @JoinColumn({ name: "thread_id" })
    thread: Thread;
}