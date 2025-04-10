

document.addEventListener('DOMContentLoaded', () => {
    const productsContainer = document.getElementById('products-container');
  
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        const products = await response.json();
  
        productsContainer.innerHTML = products.map(product => `
          <div>
            <span>${product.name}</span>
            <button onclick="toggleProduct('${product._id}', ${product.status})">
              ${product.status ? 'Turn Off' : 'Turn On'}
            </button>
          </div>
        `).join('');
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };
  
    const toggleProduct = async (productId, currentStatus) => {
      try {
        const response = await fetch(`/api/products/${productId}/toggle`, { method: 'PUT' });
        const updatedProduct = await response.json();
        fetchProducts(); // Reload products after toggle
      } catch (error) {
        console.error('Error toggling product:', error);
      }
    };
  
    fetchProducts();
  });
  