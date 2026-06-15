/**
 * FoodieHub - Menu Page JavaScript
 * Food browsing with search, category filtering, and sorting
 */

let allFoods = [];
let filteredFoods = [];
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'popular';

// ===== LOAD CATEGORIES =====
async function loadCategories() {
    const container = document.getElementById('category-filters');
    if (!container) return;

    try {
        const response = await apiCall('/api/categories.php');
        if (response.success) {
            const chips = response.data.map(cat => 
                `<button class="filter-chip" data-category="${cat.category_id}">${cat.category_name} (${cat.food_count})</button>`
            ).join('');
            container.innerHTML = `<button class="filter-chip active" data-category="all">All</button>${chips}`;
            setupCategoryListeners();
        }
    } catch (error) {
        console.log('Could not load categories:', error.message);
    }
}

// ===== LOAD FOODS =====
async function loadFoods() {
    const grid = document.getElementById('foods-grid');
    if (!grid) return;
    createSkeletonCards(6, grid);

    try {
        let endpoint = '/api/foods.php';
        const params = [];
        if (currentCategory !== 'all') params.push(`category=${currentCategory}`);
        if (currentSearch) params.push(`search=${encodeURIComponent(currentSearch)}`);
        if (params.length > 0) endpoint += '?' + params.join('&');

        const response = await apiCall(endpoint);
        if (response.success) {
            allFoods = response.data;
            applySort();
        }
    } catch (error) {
        console.log('Could not load foods:', error.message);
        showEmptyState(grid, 'Unable to load menu');
    }
}

function applySort() {
    filteredFoods = [...allFoods];
    switch (currentSort) {
        case 'price-low': filteredFoods.sort((a, b) => a.price - b.price); break;
        case 'price-high': filteredFoods.sort((a, b) => b.price - a.price); break;
        case 'rating': filteredFoods.sort((a, b) => b.rating - a.rating); break;
        case 'popular': filteredFoods.sort((a, b) => (b.is_popular || 0) - (a.is_popular || 0)); break;
    }
    renderFoodsGrid(filteredFoods);
}

function renderFoodsGrid(foods) {
    const grid = document.getElementById('foods-grid');
    if (!grid) return;

    if (foods.length === 0) {
        showEmptyState(grid, 'No dishes found');
        return;
    }

    grid.innerHTML = foods.map(food => renderFoodCard(food)).join('');
}

// ===== CATEGORY FILTER =====
function setupCategoryListeners() {
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentCategory = chip.dataset.category;
            loadFoods();
        });
    });
}

// ===== SEARCH =====
function setupSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce((e) => {
        currentSearch = e.target.value.trim();
        loadFoods();
    }, 300));
}

// ===== SORT =====
function setupSort() {
    const sortSelect = document.getElementById('sort-select');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applySort();
    });
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    // Check for category in URL params
    const params = new URLSearchParams(window.location.search);
    const categoryParam = params.get('category');
    if (categoryParam) currentCategory = categoryParam;

    loadCategories();
    loadFoods();
    setupSearch();
    setupSort();

    // Highlight active category from URL after categories load
    if (categoryParam) {
        setTimeout(() => {
            document.querySelectorAll('.filter-chip').forEach(c => {
                c.classList.remove('active');
                if (c.dataset.category === categoryParam) c.classList.add('active');
            });
        }, 500);
    }
});
