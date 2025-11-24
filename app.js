const API_BASE_URL = 'https://world.openfoodfacts.org';

let productsData = [];
let filteredProducts = [];

const elements = {
    searchInput: document.getElementById('searchInput'),
    searchBtn: document.getElementById('searchBtn'),
    errorMessage: document.getElementById('errorMessage'),
    loadingIndicator: document.getElementById('loadingIndicator'),
    resultsSection: document.getElementById('resultsSection'),
    detailsSection: document.getElementById('detailsSection'),
    productList: document.getElementById('productList'),
    productDetails: document.getElementById('productDetails'),
    sortSelect: document.getElementById('sortSelect'),
    filterInput: document.getElementById('filterInput'),
    backBtn: document.getElementById('backBtn')
};

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.classList.add('show');
    setTimeout(() => {
        elements.errorMessage.classList.remove('show');
    }, 5000);
}

function showLoading(show) {
    if (show) {
        elements.loadingIndicator.classList.add('show');
    } else {
        elements.loadingIndicator.classList.remove('show');
    }
}

async function searchProducts(query) {
    showLoading(true);
    elements.resultsSection.classList.remove('show');
    
    try {
        const response = await fetch(`${API_BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=20`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        if (!data.products || data.products.length === 0) {
            showError('No products found. Try a different search term.');
            showLoading(false);
            return;
        }
        
        productsData = data.products;
        filteredProducts = [...productsData];
        displayProducts(filteredProducts);
        elements.resultsSection.classList.add('show');
        
    } catch (error) {
        showError('An error occurred while searching. Please try again.');
        console.error('Search error:', error);
    } finally {
        showLoading(false);
    }
}

function displayProducts(products) {
    elements.productList.innerHTML = '';
    
    if (products.length === 0) {
        elements.productList.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #7f8c8d;">No products match your filter.</p>';
        return;
    }
    
    products.forEach(product => {
        const card = createProductCard(product);
        elements.productList.appendChild(card);
    });
}

function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const productName = product.product_name || 'Unknown Product';
    const brand = product.brands || 'Unknown Brand';
    const imageUrl = product.image_front_small_url || product.image_url || 'https://via.placeholder.com/180';
    const nutriScore = product.nutrition_grades || 'unknown';
    
    card.innerHTML = `
        <img src="${imageUrl}" alt="${productName}" onerror="this.src='https://via.placeholder.com/180'">
        <h3>${productName}</h3>
        <p class="brand">${brand}</p>
        ${nutriScore !== 'unknown' ? `<span class="nutriscore nutriscore-${nutriScore}">Nutri-Score: ${nutriScore.toUpperCase()}</span>` : '<span class="nutriscore" style="background-color: #bdc3c7;">No Score</span>'}
    `;
    
    card.addEventListener('click', () => showProductDetails(product));
    
    return card;
}

function showProductDetails(product) {
    elements.resultsSection.classList.remove('show');
    elements.detailsSection.classList.add('show');
    
    const productName = product.product_name || 'Unknown Product';
    const brand = product.brands || 'Unknown Brand';
    const quantity = product.quantity || 'N/A';
    const imageUrl = product.image_front_url || product.image_url || 'https://via.placeholder.com/300';
    const nutriScore = product.nutrition_grades || 'unknown';
    
    let detailsHTML = `
        <div class="product-header">
            <div class="product-image-large">
                <img src="${imageUrl}" alt="${productName}" onerror="this.src='https://via.placeholder.com/300'">
            </div>
            <div class="product-info">
                <h2>${productName}</h2>
                <p class="brand-large">${brand}</p>
                <p class="quantity">Quantity: ${quantity}</p>
                ${nutriScore !== 'unknown' ? `<span class="nutriscore nutriscore-${nutriScore}">Nutri-Score: ${nutriScore.toUpperCase()}</span>` : '<span class="nutriscore" style="background-color: #bdc3c7;">No Score Available</span>'}
            </div>
        </div>
        
        <div class="info-grid">
    `;
    
    if (product.ingredients_text || product.ingredients) {
        detailsHTML += `
            <div class="info-section">
                <h3>Ingredients</h3>
                ${product.ingredients_text ? 
                    `<p>${product.ingredients_text}</p>` : 
                    product.ingredients ? 
                        `<ul class="ingredients-list">
                            ${product.ingredients.map(ing => `<li>${ing.text || ing.id}</li>`).join('')}
                        </ul>` : 
                        '<p>No ingredient information available.</p>'
                }
            </div>
        `;
    }
    
    if (product.allergens_tags && product.allergens_tags.length > 0) {
        detailsHTML += `
            <div class="info-section">
                <h3>Allergens</h3>
                <ul class="ingredients-list">
                    ${product.allergens_tags.map(allergen => 
                        `<li class="allergen">${allergen.replace('en:', '').replace(/-/g, ' ')}</li>`
                    ).join('')}
                </ul>
            </div>
        `;
    }
    
    if (product.nutriments && Object.keys(product.nutriments).length > 0) {
        detailsHTML += `
            <div class="info-section">
                <h3>Nutrition Facts (per 100g)</h3>
                <table class="nutrition-table">
                    ${product.nutriments.energy_100g ? `<tr><td>Energy</td><td>${Math.round(product.nutriments.energy_100g)} kJ</td></tr>` : ''}
                    ${product.nutriments['energy-kcal_100g'] ? `<tr><td>Calories</td><td>${Math.round(product.nutriments['energy-kcal_100g'])} kcal</td></tr>` : ''}
                    ${product.nutriments.fat_100g !== undefined ? `<tr><td>Fat</td><td>${product.nutriments.fat_100g} g</td></tr>` : ''}
                    ${product.nutriments['saturated-fat_100g'] !== undefined ? `<tr><td>Saturated Fat</td><td>${product.nutriments['saturated-fat_100g']} g</td></tr>` : ''}
                    ${product.nutriments.carbohydrates_100g !== undefined ? `<tr><td>Carbohydrates</td><td>${product.nutriments.carbohydrates_100g} g</td></tr>` : ''}
                    ${product.nutriments.sugars_100g !== undefined ? `<tr><td>Sugars</td><td>${product.nutriments.sugars_100g} g</td></tr>` : ''}
                    ${product.nutriments.fiber_100g !== undefined ? `<tr><td>Fiber</td><td>${product.nutriments.fiber_100g} g</td></tr>` : ''}
                    ${product.nutriments.proteins_100g !== undefined ? `<tr><td>Proteins</td><td>${product.nutriments.proteins_100g} g</td></tr>` : ''}
                    ${product.nutriments.salt_100g !== undefined ? `<tr><td>Salt</td><td>${product.nutriments.salt_100g} g</td></tr>` : ''}
                    ${product.nutriments.sodium_100g !== undefined ? `<tr><td>Sodium</td><td>${product.nutriments.sodium_100g} g</td></tr>` : ''}
                </table>
            </div>
        `;
    }
    
    if (product.additives_tags && product.additives_tags.length > 0) {
        detailsHTML += `
            <div class="info-section">
                <h3>Additives</h3>
                <ul class="additives-list">
                    ${product.additives_tags.map(additive => 
                        `<li>${additive.replace('en:', '').replace(/-/g, ' ')}</li>`
                    ).join('')}
                </ul>
            </div>
        `;
    }
    
    if (product.labels_tags && product.labels_tags.length > 0) {
        detailsHTML += `
            <div class="info-section">
                <h3>Labels & Certifications</h3>
                <div>
                    ${product.labels_tags.map(label => 
                        `<span class="label-tag">${label.replace('en:', '').replace(/-/g, ' ')}</span>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    detailsHTML += '</div>';
    
    elements.productDetails.innerHTML = detailsHTML;
}

function sortProducts(sortBy) {
    switch(sortBy) {
        case 'name-asc':
            filteredProducts.sort((a, b) => 
                (a.product_name || '').localeCompare(b.product_name || '')
            );
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => 
                (b.product_name || '').localeCompare(a.product_name || '')
            );
            break;
        case 'nutriscore':
            filteredProducts.sort((a, b) => {
                const scoreOrder = { 'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5, 'unknown': 6 };
                const scoreA = scoreOrder[a.nutrition_grades || 'unknown'];
                const scoreB = scoreOrder[b.nutrition_grades || 'unknown'];
                return scoreA - scoreB;
            });
            break;
        default:
            break;
    }
    displayProducts(filteredProducts);
}

function filterProducts(searchTerm) {
    searchTerm = searchTerm.toLowerCase();
    filteredProducts = productsData.filter(product => {
        const name = (product.product_name || '').toLowerCase();
        const brand = (product.brands || '').toLowerCase();
        return name.includes(searchTerm) || brand.includes(searchTerm);
    });
    displayProducts(filteredProducts);
}

elements.searchBtn.addEventListener('click', () => {
    const query = elements.searchInput.value.trim();
    if (query) {
        searchProducts(query);
    } else {
        showError('Please enter a search term');
    }
});

elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        elements.searchBtn.click();
    }
});

elements.sortSelect.addEventListener('change', (e) => {
    sortProducts(e.target.value);
});

elements.filterInput.addEventListener('input', (e) => {
    filterProducts(e.target.value);
});

elements.backBtn.addEventListener('click', () => {
    elements.detailsSection.classList.remove('show');
    elements.resultsSection.classList.add('show');
});