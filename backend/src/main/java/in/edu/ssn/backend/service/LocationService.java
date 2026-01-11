package in.edu.ssn.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class LocationService {

    private static final String GEOAPIFY_API_KEY = "d42316f860404480a06e01930a49712b";
    private static final String GEOAPIFY_BASE_URL = "https://api.geoapify.com/v1/geocode/autocomplete";

    /**
     * Get location suggestions from Geoapify API
     * 
     * @param searchText The text to search for
     * @return List of location suggestions with formatted addresses
     */
    public List<Map<String, Object>> getLocationSuggestions(String searchText) throws Exception {
        List<Map<String, Object>> suggestions = new ArrayList<>();

        if (searchText == null || searchText.trim().isEmpty()) {
            return suggestions;
        }

        // Encode the search text for URL
        String encodedText = URLEncoder.encode(searchText.trim(), StandardCharsets.UTF_8);

        // Build the API URL
        String urlString = GEOAPIFY_BASE_URL + "?text=" + encodedText + "&apiKey=" + GEOAPIFY_API_KEY;
        URL url = new URL(urlString);

        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        connection.setRequestProperty("Accept", "application/json");
        connection.setConnectTimeout(5000);
        connection.setReadTimeout(5000);

        try {
            int responseCode = connection.getResponseCode();

            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8));

                StringBuilder response = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    response.append(line);
                }
                reader.close();

                // Parse JSON response
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response.toString());
                JsonNode features = root.get("features");

                if (features != null && features.isArray()) {
                    for (JsonNode feature : features) {
                        JsonNode properties = feature.get("properties");
                        if (properties != null) {
                            Map<String, Object> suggestion = new HashMap<>();

                            // Extract relevant fields
                            String formatted = properties.has("formatted") ? properties.get("formatted").asText() : "";
                            String city = properties.has("city") ? properties.get("city").asText() : "";
                            String state = properties.has("state") ? properties.get("state").asText() : "";
                            String country = properties.has("country") ? properties.get("country").asText() : "";
                            String postcode = properties.has("postcode") ? properties.get("postcode").asText() : "";

                            // Get coordinates
                            JsonNode geometry = feature.get("geometry");
                            if (geometry != null && geometry.has("coordinates")) {
                                JsonNode coords = geometry.get("coordinates");
                                if (coords.isArray() && coords.size() >= 2) {
                                    suggestion.put("longitude", coords.get(0).asDouble());
                                    suggestion.put("latitude", coords.get(1).asDouble());
                                }
                            }

                            suggestion.put("formatted", formatted);
                            suggestion.put("city", city);
                            suggestion.put("state", state);
                            suggestion.put("country", country);
                            suggestion.put("postcode", postcode);

                            // Create a display label
                            StringBuilder label = new StringBuilder();
                            if (!city.isEmpty()) {
                                label.append(city);
                            }
                            if (!state.isEmpty()) {
                                if (label.length() > 0)
                                    label.append(", ");
                                label.append(state);
                            }
                            if (!country.isEmpty()) {
                                if (label.length() > 0)
                                    label.append(", ");
                                label.append(country);
                            }

                            suggestion.put("label", label.length() > 0 ? label.toString() : formatted);

                            suggestions.add(suggestion);
                        }
                    }
                }
            }
        } finally {
            connection.disconnect();
        }

        return suggestions;
    }
}
