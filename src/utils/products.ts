export function formatCurrency(price) {
    const formatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    });

    return formatter.format(price);
}

// Tính tổng giá tiền và giá tiền cuối cùng với thuế
export const calculatePrices = (products) => {
    // Tính tổng giá tiền
    const totalPrice = products?.reduce((acc, product) => {
        return acc + (product.product.sizes?.find(s => s.size == product?.selectedSize)?.price * product?.selectedQuantity);
    }, 0);

    // Tính giá tiền đã cộng 10% thuế
    const totalWithTax = totalPrice * 1.1;

    return {
        totalPrice,
        totalWithTax
    };
};
