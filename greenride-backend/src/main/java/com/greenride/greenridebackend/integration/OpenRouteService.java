package com.greenride.greenridebackend.integration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenRouteService {

    @Value("${ors.api.key}")
    private String apiKey;

    private final String ORS_DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-car";
    private final String ORS_GEOCODE_URL = "https://api.openrouteservice.org/geocode/search";
    private final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

    private final RestTemplate restTemplate;

    public OpenRouteService() {
        this.restTemplate = new RestTemplate();
    }


    public String getCoordinates(String address) {
        if (address == null || address.trim().isEmpty()) return null;

        // 1. Try Nominatim (Most Accurate)
        try {
            // Wait slightly
            Thread.sleep(1000);

            String query = address.replace(" ", "+");
            String url = NOMINATIM_URL + "?q=" + query + "&format=json&limit=1&countrycodes=gr";

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "GreenRideApp/1.0 (konstandinoslendas@gmail.com)");
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            List<Map<String, Object>> body = response.getBody();

            if (body != null && !body.isEmpty()) {
                Map<String, Object> firstResult = body.get(0);
                return firstResult.get("lon") + "," + firstResult.get("lat");
            }

        } catch (Exception e) {
            System.out.println("Nominatim blocked or failed (" + e.getMessage() + "). Switching to backup...");
        }

        // 2. Fallback: OpenRouteService (Uses API Key, won't be blocked)
        return getCoordinatesFallback(address);
    }

    private String getCoordinatesFallback(String address) {
        try {
            String url = ORS_GEOCODE_URL + "?api_key=" + apiKey + "&text=" + address + "&boundary.country=GRC";
            Map response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("features")) {
                List features = (List) response.get("features");
                if (features != null && !features.isEmpty()) {
                    Map feature = (Map) features.get(0);
                    Map geometry = (Map) feature.get("geometry");
                    List<Double> coords = (List<Double>) geometry.get("coordinates");
                    return coords.get(0) + "," + coords.get(1);
                }
            }
        } catch (Exception e) {
            System.out.println("Fallback Geocoding failed: " + e.getMessage());
        }
        return null;
    }

    public Map<String, Object> getRouteDetails(String startAddress, String endAddress) {
        Map<String, Object> result = new HashMap<>();
        try {
            // Get Coordinates (attempts Nominatim -> falls back to ORS)
            String startCoords = getCoordinates(startAddress);
            String endCoords = getCoordinates(endAddress);

            if (startCoords == null || endCoords == null) {
                System.out.println("Could not geocode addresses.");
                return null;
            }


            String url = ORS_DIRECTIONS_URL + "?api_key=" + apiKey + "&start=" + startCoords + "&end=" + endCoords + "&overview=full&geometries=geojson";

            Map response = restTemplate.getForObject(url, Map.class);

            if (response != null && response.containsKey("features")) {
                List features = (List) response.get("features");
                if (!features.isEmpty()) {
                    Map feature = (Map) features.get(0);
                    Map properties = (Map) feature.get("properties");
                    Map summary = (Map) properties.get("summary");

                    result.put("distanceKm", (Double) summary.get("distance") / 1000.0);
                    result.put("durationMin", (Double) summary.get("duration") / 60.0);

                    Map geometry = (Map) feature.get("geometry");
                    List<List<Double>> rawCoords = (List<List<Double>>) geometry.get("coordinates");

                    List<List<Double>> leafletCoords = new ArrayList<>();
                    for (List<Double> point : rawCoords) {
                        List<Double> swapped = new ArrayList<>();
                        swapped.add(point.get(1));
                        swapped.add(point.get(0));
                        leafletCoords.add(swapped);
                    }
                    result.put("geometry", leafletCoords);
                }
            }
        } catch (Exception e) {
            System.out.println("Routing failed: " + e.getMessage());
        }
        return result;
    }
}