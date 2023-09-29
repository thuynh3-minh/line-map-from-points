let map;
let featureCoordinates = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 18.3127873143734, lng: -66.540062489463 },
        zoom: 10,
    });
    // Check if the Google Maps API is loaded
    if (typeof google === 'undefined' || typeof google.maps === 'undefined') {
        alert('Google Maps API is not loaded. Please check your API key and network connection.');
    } else {
        // Initialize the map when the Google Maps JavaScript API is ready
        google.maps.event.addDomListener(window, 'load', initMap);
    }

    // Fetch the JSON data from substation_30kv_match.json file
    fetch('./substation_30kv_match.json')
        .then(response => response.json())
        .then(data => {
            // Call the displayData function with the fetched data
            // displayData(data);

            // Add markers to the map using the fetched data
            data.forEach(point => {
                const marker = new google.maps.Marker({
                    position: { lat: parseFloat(point.lat), lng: parseFloat(point.long) },
                    map: map,
                    title: `Point: ${point.name}`
                });

                // Add a click event listener to red points from temp.json for collecting substations
                google.maps.event.addListener(marker, 'click', function(event) {
                    const name = point.name;
                    collectCoordinates(name, event.latLng);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });

    fetch('./temp.json')
    .then(response => response.json())
    .then(data => {
        // Create an array to store the marker objects
        const markers = [];

        // Iterate through the data and create markers for each point
        data.forEach(point => {
            const marker = new google.maps.Marker({
                position: { lat: parseFloat(point.lat), lng: parseFloat(point.long) },
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: 'blue', // Blue color for the marker
                    fillOpacity: 1,
                    scale: 5, // Adjust the size as needed
                    strokeWeight: 0 // No border
                },
                map: map,
                title: `Point: ${point.name}`
            });

            // Push the marker object to the markers array
            markers.push(marker);

            // Add a click event listener to blue points from temp.json for collecting coordinates
            google.maps.event.addListener(marker, 'click', function(event) {
                const name = point.name;
                collectCoordinates(name, event.latLng);
            });
        });

        // Optional: Fit the map bounds to include all markers
        const bounds = new google.maps.LatLngBounds();
        markers.forEach(marker => bounds.extend(marker.getPosition()));
        map.fitBounds(bounds);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });

}

function displayData(latLng) {
    const container = document.getElementById("data-container");
    container.innerHTML = `Latitude: ${latLng.lat()}, Longitude: ${latLng.lng()}`;
    // const container = document.getElementById("data-container");
    // let html = "<ul>";
    // data.forEach(item => {
    //     html += `<li>Name: ${item.name}, Longitude: ${item.long}, Latitude: ${item.lat}</li>`;
    // });
    // html += "</ul>";
    // container.innerHTML = html;
}

function collectCoordinates(name, latLng) {
    const lat = latLng.lat();
    const lng = latLng.lng();
    // todo: adding an third value for sequence

    // Update the content of the data-container div
    const container = document.getElementById("data-container");
    container.innerHTML += `Name: ${name}, Latitude: ${lat}, Longitude: ${lng}`;
    featureCoordinates.push([name, latLng.lat(), latLng.lng()]);
}


document.getElementById("exportButton").addEventListener("click", function() {
    exportToCSV(featureCoordinates, 'kmz_coordinates.csv');
    featureCoordinates = [];
    const container = document.getElementById("data-container");
    container.innerHTML = ''; // Set the innerHTML to an empty string
});

function exportToCSV(data, filename) {
    const csvContent = "data:text/csv;charset=utf-8," + data.map(row => row.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename || "kmz_coordinates.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

