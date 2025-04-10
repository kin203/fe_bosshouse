interface IProduct {
    _id?: string;
    name: string;
    price?: number;
    description?: string;
    images?: Array;
    quantity?: number;
    categoryId: string;
}