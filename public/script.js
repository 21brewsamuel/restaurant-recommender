let map;

// 1) Initial 'Find a Restaurant' button
document.getElementById('get-restaurant').addEventListener('click', () => {
  fetchRandomRestaurant();
});

// 2) The "Find Me Something Else" button (hidden until first success)
document.getElementById('another-restaurant').addEventListener('click', () => {
  fetchRandomRestaurant();
});

async function fetchRandomRestaurant() {
  const button = document.getElementById('get-restaurant');
  const anotherBtn = document.getElementById('another-restaurant');
  const loading = document.getElementById('loading');
  const landingState = document.getElementById('landing-state');
  const restaurantContainer = document.getElementById('restaurant-container');

  // Gather filters
  const priceSelect = document.getElementById('priceRange');
  const cuisineSelect = document.getElementById('cuisine');

  let minprice = '';
  let maxprice = '';
  switch (priceSelect.value) {
    case '$':
      minprice = '0';
      maxprice = '0';
      break;
    case '$$':
      minprice = '1';
      maxprice = '1';
      break;
    case '$$$':
      minprice = '2';
      maxprice = '2';
      break;
    default:
      // means "Any"
      minprice = '';
      maxprice = '';
  }
  let cuisine = cuisineSelect.value; // 'italian', 'mexican', 'chinese', or ''

  // UI: disable the old button, hide hero image?
  button.disabled = true;
  button.innerText = 'Finding...';
  loading.classList.remove('hidden');

  if (landingState) {
    // We'll keep it visible until first success
  }

  // Attempt geolocation
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          let query = `/api/restaurants?lat=${lat}&lng=${lng}`;
          if (minprice) query += `&minprice=${minprice}`;
          if (maxprice) query += `&maxprice=${maxprice}`;
          if (cuisine) query += `&keyword=${cuisine}`;

          const response = await fetch(query);
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            const randomRestaurant =
              data.results[Math.floor(Math.random() * data.results.length)];
            await displayRestaurant(randomRestaurant, lat, lng);

            // 1) Hide the hero (image + text) after first success
            landingState.style.display = 'none';

            // 2) Show the container and "Find Me Something Else" button
            restaurantContainer.classList.remove('hidden');
            anotherBtn.classList.remove('hidden');
          } else {
            displayNoRestaurants();
          }
        } catch (err) {
          console.error(err);
          displayError();
        } finally {
          button.disabled = false;
          button.innerText = 'Find a Restaurant';
          loading.classList.add('hidden');
        }
      },
      (err) => {
        console.error('Geolocation Error:', err);
        displayLocationError(err.message);
        button.disabled = false;
        button.innerText = 'Find a Restaurant';
        loading.classList.add('hidden');
      }
    );
  } else {
    displayLocationError('Geolocation not supported by this browser.');
    button.disabled = false;
    button.innerText = 'Find a Restaurant';
    loading.classList.add('hidden');
  }
}

/* ============== HELPER FUNCTIONS ============== */
async function displayRestaurant(restaurant, fallbackLat, fallbackLng) {
  const restaurantContainer = document.getElementById('restaurant-container');
  const restaurantInfo = document.getElementById('restaurant-info');
  const restaurantHours = document.getElementById('restaurant-hours');
  const restaurantImage = document.getElementById('restaurant-image');
  const restaurantMap = document.getElementById('restaurant-map');

  restaurantInfo.innerHTML = '';
  restaurantHours.innerHTML = '';
  restaurantImage.innerHTML = '';
  restaurantMap.innerHTML = '';

  const name = restaurant.name || 'Unknown';
  const rating = restaurant.rating != null ? restaurant.rating : 'N/A';
  const vicinity = restaurant.vicinity || 'N/A';
  const lat = restaurant.geometry?.location?.lat ?? fallbackLat;
  const lng = restaurant.geometry?.location?.lng ?? fallbackLng;

  restaurantInfo.innerHTML = `
    <h2>${name}</h2>
    <p><strong>Rating:</strong> ${rating}</p>
    <p><strong>Address:</strong> ${vicinity}</p>
    <a
      href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}"
      target="_blank"
    >
      📍 Take me there
    </a>
  `;

  // Photo
  if (restaurant.photoUrl) {
    restaurantImage.innerHTML = `
      <img src="${restaurant.photoUrl}" alt="Restaurant Image" />
    `;
  } else {
    // Build from photo_reference if available
    let builtPhotoUrl = '';
    if (
      restaurant.photos &&
      restaurant.photos.length > 0 &&
      restaurant.photos[0].photo_reference
    ) {
      const photoRef = restaurant.photos[0].photo_reference;
      // Use your front-end key here
      builtPhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=AIzaSyAESBBqvrbYB-8uAsLzRoE3tAesOaTT49U`;
    }
    if (builtPhotoUrl) {
      restaurantImage.innerHTML = `
        <img src="${builtPhotoUrl}" alt="Restaurant Image" />
      `;
    } else {
      restaurantImage.innerHTML = `<p>No image available.</p>`;
    }
  }

  // Map
  map = new google.maps.Map(restaurantMap, {
    center: { lat, lng },
    zoom: 15
  });
  new google.maps.Marker({
    position: { lat, lng },
    map,
    title: name
  });

  // Get hours from /api/details
  if (restaurant.place_id) {
    try {
      const detailsResp = await fetch(`/api/details?placeId=${restaurant.place_id}`);
      const detailsData = await detailsResp.json();

      if (detailsData?.result?.opening_hours?.weekday_text) {
        restaurantHours.innerHTML = detailsData.result.opening_hours.weekday_text.join('\n');
      } else {
        restaurantHours.innerHTML = 'Hours of operation not available.';
      }
    } catch (error) {
      console.error('Error fetching details:', error);
      restaurantHours.innerHTML = 'Hours of operation not available.';
    }
  } else {
    restaurantHours.innerHTML = 'Hours of operation not available.';
  }

  restaurantContainer.classList.remove('hidden');
}

function displayNoRestaurants() {
  const restaurantContainer = document.getElementById('restaurant-container');
  const restaurantInfo = document.getElementById('restaurant-info');
  const restaurantHours = document.getElementById('restaurant-hours');
  const restaurantImage = document.getElementById('restaurant-image');
  const restaurantMap = document.getElementById('restaurant-map');

  restaurantInfo.innerHTML = `<p>No restaurants found nearby. Try different filters!</p>`;
  restaurantHours.innerHTML = '';
  restaurantImage.innerHTML = '';
  restaurantMap.innerHTML = '';
  restaurantContainer.classList.remove('hidden');
}

function displayError() {
  const restaurantContainer = document.getElementById('restaurant-container');
  const restaurantInfo = document.getElementById('restaurant-info');
  const restaurantHours = document.getElementById('restaurant-hours');
  const restaurantImage = document.getElementById('restaurant-image');
  const restaurantMap = document.getElementById('restaurant-map');

  restaurantInfo.innerHTML = `<p>Error fetching restaurant data. Please try again.</p>`;
  restaurantHours.innerHTML = '';
  restaurantImage.innerHTML = '';
  restaurantMap.innerHTML = '';
  restaurantContainer.classList.remove('hidden');
}

function displayLocationError(msg) {
  const restaurantContainer = document.getElementById('restaurant-container');
  const restaurantInfo = document.getElementById('restaurant-info');
  const restaurantHours = document.getElementById('restaurant-hours');
  const restaurantImage = document.getElementById('restaurant-image');
  const restaurantMap = document.getElementById('restaurant-map');

  restaurantInfo.innerHTML = `<p>Location Error: ${msg}</p>`;
  restaurantHours.innerHTML = '';
  restaurantImage.innerHTML = '';
  restaurantMap.innerHTML = '';
  restaurantContainer.classList.remove('hidden');
}
