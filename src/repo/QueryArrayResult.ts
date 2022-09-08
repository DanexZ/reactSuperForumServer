export class QueryArrayResult<T> {
    constructor(public messages?: string[], public entities?: Array<T>) {}
}

export class QueryOneResult<T> {
    constructor(public messages?: string[], public entity?: T) {}
}