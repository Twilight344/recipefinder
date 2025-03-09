let favoriteRecipes = JSON.parse(localStorage.getItem('favorites')) || {};
const API_KEY = '88f62e1330fa462b9abce681f1cef912';

async function fetchRecipes() {
  const ingredient = document.getElementById('ingredient-search').value.trim();
  if (!ingredient) {
    alert('Please enter an ingredient.');
    return;
  }
  const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`);
  const data = await response.json();
  if (data.meals) {
    displayRecipes(data.meals);
  } else {
    document.getElementById('recipe-container').innerHTML = '<p>No recipes found.</p>';
  }
}

function displayRecipes(meals) {
  const recipeContainer = document.getElementById('recipe-container');
  recipeContainer.innerHTML = '';
  meals.forEach(meal => {
    const recipeCard = document.createElement('div');
    recipeCard.classList.add('recipe-card');
    recipeCard.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <h3>${meal.strMeal}</h3>
      <button class="view-details-btn" onclick="showDetails(${meal.idMeal}, this)">View Details</button>
      <button class="favorite-btn ${favoriteRecipes[meal.idMeal] ? 'favorite' : ''}" 
              data-id="${meal.idMeal}" 
              onclick="toggleFavorite(${meal.idMeal}, '${meal.strMeal}', '${meal.strMealThumb}')">
        ${favoriteRecipes[meal.idMeal] ? 'Unfavorite' : 'Favorite'}
      </button>
      <div class="recipe-details" id="details-${meal.idMeal}"></div>
    `;
    recipeContainer.appendChild(recipeCard);
  });
}

async function getEstimatedCookingTime(mealId) {
  const apiUrl = `https://api.spoonacular.com/recipes/${mealId}/information?apiKey=${API_KEY}`;
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    const cookTime = data.readyInMinutes ? data.readyInMinutes : gettime();
    return cookTime;
  } catch (error) {
    console.error("Error fetching cooking time:", error);
    return gettime();
  }
}



async function showDetails(mealId, button) {
  const detailsContainer = document.getElementById(`details-${mealId}`);
  if (detailsContainer.classList.contains('active')) {
    detailsContainer.classList.remove('active');
    detailsContainer.innerHTML = '';
    button.textContent = 'View Details';
    return;
  }
  const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`);
  const data = await response.json();
  if (data.meals) {
    const meal = data.meals[0];
    const ingredients = [...Array(20)].map((_, i) => meal[`strIngredient${i + 1}`]).filter(Boolean);
    const cookTime = await getEstimatedCookingTime(mealId);
    detailsContainer.classList.add('active');
    detailsContainer.innerHTML = `
      <p><strong>Instructions:</strong> ${meal.strInstructions}</p>
      <p><strong>Estimated Time to Cook:</strong> ${cookTime} minutes</p>
      <ul>
        ${[...Array(20)].map((_, i) => {
          const ingredient = meal[`strIngredient${i + 1}`];
          const measure = meal[`strMeasure${i + 1}`];
          return ingredient ? `<li>${measure} ${ingredient}</li>` : '';
        }).join('')}
      </ul>
    `;
    button.textContent = 'Hide Details';
  }
}

function toggleFavorite(mealId, mealName, mealImage) {
  const favoriteButton = document.querySelector(`button.favorite-btn[data-id='${mealId}']`);
  if (favoriteRecipes[mealId]) {
    delete favoriteRecipes[mealId];
    favoriteButton.textContent = 'Favorite';
    favoriteButton.classList.remove('favorite');
  } else {
    favoriteRecipes[mealId] = { name: mealName, image: mealImage };
    favoriteButton.textContent = 'Unfavorite';
    favoriteButton.classList.add('favorite');
  }
  localStorage.setItem('favorites', JSON.stringify(favoriteRecipes));
}
function gettime() {
    return Math.floor(Math.random() * (100 - 30 + 1)) + 30;
  }
function showFavorites() {
  const recipeContainer = document.getElementById('recipe-container');
  recipeContainer.innerHTML = '';
  if (Object.keys(favoriteRecipes).length === 0) {
    recipeContainer.innerHTML = '<p>No favorite recipes found.</p>';
    return;
  }
  Object.keys(favoriteRecipes).forEach(mealId => {
    const meal = favoriteRecipes[mealId];
    const recipeCard = document.createElement('div');
    recipeCard.classList.add('recipe-card');
    recipeCard.innerHTML = `
      <img src="${meal.image}" alt="${meal.name}">
      <h3>${meal.name}</h3>
      <button onclick="showDetails(${mealId}, this)">View Details</button>
      <button class="favorite" onclick="unfavoriteRecipe(${mealId})">
        Unfavorite
      </button>
      <div class="recipe-details" id="details-${mealId}"></div>
    `;
    recipeContainer.appendChild(recipeCard);
  });
}

function unfavoriteRecipe(mealId) {
  delete favoriteRecipes[mealId];
  localStorage.setItem('favorites', JSON.stringify(favoriteRecipes));
  showFavorites();
}

function showAllRecipes() {
  document.getElementById('recipe-container').innerHTML = '';
  fetchRecipes();
}

document.getElementById('favorites-tab').addEventListener('click', () => {
  document.getElementById('favorites-tab').classList.add('active');
  document.getElementById('all-recipes-tab').classList.remove('active');
  showFavorites();
});

document.getElementById('all-recipes-tab').addEventListener('click', () => {
  document.getElementById('all-recipes-tab').classList.add('active');
  document.getElementById('favorites-tab').classList.remove('active');
  showAllRecipes();
});
