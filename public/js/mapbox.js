/*eslint-disable*/
export const displayMap = (locations) => {
    mapboxgl.accessToken =
        'pk.eyJ1IjoiaWdvcmdvbmNoYXIiLCJhIjoiY2s5b216M21mMDI2czNocG53d3phbHN5eiJ9.Pdf_p0EaI5BdXxeQ5OY7lw';
    var map = new mapboxgl.Map({
        container: 'map', // will put map on element with id 'map'
        style: 'mapbox://styles/mapbox/light-v10',
        scrollZoom: false,
        // center: [-118.113491, 34.111745],
        // zoom: 7,
        // interactive: false
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((location) => {
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom', // bottom of pin will be at the point
        })
            .setLngLat(location.coordinates)
            .addTo(map);

        new mapboxgl.Popup({
            offset: 30,
        })
            .setLngLat(location.coordinates)
            .setHTML(`<p> ${location.day}: ${location.description}</p>`)
            .addTo(map);

        bounds.extend(location.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100,
        },
    });
}
