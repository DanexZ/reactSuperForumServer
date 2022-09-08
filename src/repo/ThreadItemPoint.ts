import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, JoinColumn} from "typeorm";
import { User } from "./User";
import { ThreadItem } from "./ThreadItem";
import { Auditable } from "./Auditable";

@Entity({ name: "threaditem_points", schema: "public" })
export class ThreadItemPoint extends Auditable {
    @PrimaryGeneratedColumn({ name: "id", type: "bigint" }) // na potrzeby typeorm
    id: string;

    @Column("boolean", { name: "isDecrement", default: false, nullable: false })
    isDecrement: boolean;

    @ManyToOne(() => User, (user) => user.threadPoints)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => ThreadItem, (threadItem) => threadItem.threadItemPoints)
    @JoinColumn({ name: "threadItem_id" })
    threadItem: ThreadItem;
}