let map;

document.getElementById('get-restaurant').addEventListener('click', async () => {
    const button = document.getElementById('get-restaurant');
    const restaurantInfo = document.getElementById('restaurant-info');
    const restaurantImage = document.getElementById('restaurant-image');
    const restaurantMap = document.getElementById('restaurant-map');
    const loading = document.getElementById('loading');

    button.disabled = true;
    button.innerText = 'Finding...';
    loading.style.display = 'inline-block';
    restaurantInfo.innerHTML = '';
    restaurantImage.innerHTML = '';
    restaurantMap.innerHTML = '';

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            try {
                const response = await fetch(`/api/restaurants?lat=${lat}&lng=${lng}`);
                const data = await response.json();

                if (data.results && data.results.length > 0) {
                    const randomRestaurant = data.results[Math.floor(Math.random() * data.results.length)];

                    restaurantInfo.innerHTML = `
                        <h2>${randomRestaurant.name}</h2>
                        <p><strong>Rating:</strong> ${randomRestaurant.rating || 'N/A'}</p>
                        <p><strong>Address:</strong> ${randomRestaurant.vicinity || 'N/A'}</p>
                        <a href="https://www.google.com/maps/search/?api=1&query=${randomRestaurant.geometry.location.lat},${randomRestaurant.geometry.location.lng}" target="_blank">📍 View on Google Maps</a>
                    `;

                    if (randomRestaurant.photos && randomRestaurant.photos.length > 0) {
                        const photoRef = randomRestaurant.photos[0].photo_reference;
                        restaurantImage.innerHTML = `<img src="https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoRef}&key=AIzaSyAESBBqvrbYB-8uAsLzRoE3tAesOaTT49U" alt="Restaurant Image">`;
                    }

                    map = new google.maps.Map(restaurantMap, {
                        center: { lat: randomRestaurant.geometry.location.lat, lng: randomRestaurant.geometry.location.lng },
                        zoom: 15,
                    });

                    new google.maps.Marker({
                        position: { lat: randomRestaurant.geometry.location.lat, lng: randomRestaurant.geometry.location.lng },
                        map: map,
                        title: randomRestaurant.name,
                    });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                restaurantInfo.innerHTML = `<p>Error fetching restaurant data.</p>`;
            } finally {
                button.disabled = false;
                button.innerText = 'Find a Restaurant';
                loading.style.display = 'none';
            }
        });
    } else {
        restaurantInfo.innerHTML = `<p>Geolocation is not supported by your browser.</p>`;
    }
});
