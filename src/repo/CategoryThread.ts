export default class CategoryThread {
    constructor(
        public thread_id: string,
        public category_id: string,
        public categoryName: string,
        public title: string,
        public titleCreatedOn: Date
    ) {}
}  