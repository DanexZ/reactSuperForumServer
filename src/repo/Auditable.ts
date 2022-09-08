import { Column, BaseEntity } from "typeorm";

export class Auditable extends BaseEntity {
    @Column("varchar", {
        name: "CreatedBy",
        length: 60,
        default: `root`,
        nullable: false,
    })
    createdBy: string;

    @Column("timestamp", {
        name: "CreatedOn",
        default: () => `now()`,
        nullable: false,
    })
    createdOn: Date;

    @Column("varchar", {
        name: "LastModifiedBy",
        length: 60,
        default: `root`,
        nullable: false,
    })
    lastModifiedBy: string;

    @Column("timestamp", {
        name: "LastModifiedOn",
        default: () => `now()`,
        nullable: false,
    })
    lastModifiedOn: Date;
}