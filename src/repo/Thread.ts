import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { Auditable } from "./Auditable"
import { Length } from "class-validator"
import { User } from "./User"
import { ThreadItem } from "./ThreadItem"
import { ThreadPoint } from "./ThreadPoint"
import { ThreadCategory } from "./ThreadCategory"

@Entity({ name: "threads", schema: "public"})
export class Thread extends Auditable {
    @PrimaryGeneratedColumn({ name: "id", type: "bigint"})
    id: string;

    @Column("int", { name: "views", default: 0, nullable: false})
    views: number;
    
    @Column("int", { name: "points", default: 0, nullable: false })
    points: number;

    @Column("boolean", { name: "isDisabled", default: false, nullable: false})
    isDisabled: boolean;

    @Column("varchar", { name: "title", length: 150, nullable: false})
    @Length(5, 150)
    title: string;

    @Column("varchar", { name: "body", length: 2500, nullable: true})
    @Length(10, 2500)
    body: string;

    @ManyToOne(() => User, (user: User) => user.threads)
    @JoinColumn({ name: "user_id" })
    user: User;

    @OneToMany(() => ThreadItem, (threadItems) => threadItems.thread)
    threadItems: ThreadItem[];

    @OneToMany(() => ThreadItem, (threadPoint) => threadPoint.thread)
    threadPoints: ThreadPoint[];

    @ManyToOne(() => ThreadCategory, (threadCategory) => threadCategory.threads)
    @JoinColumn({ name: "category_id" })
    category: ThreadCategory;
}