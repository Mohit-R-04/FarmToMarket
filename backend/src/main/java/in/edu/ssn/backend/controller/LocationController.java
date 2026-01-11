package in.edu.ssn.backend.controller;

import in.edu.ssn.backend.service.LocationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/location")
@CrossOrigin(origins = "*")
public class LocationController {

    @Autowired
    private LocationService locationService;

    /**
     * Test endpoint to verify controller is working
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        return ResponseEntity.ok(Map.of("status", "Location API is working"));
    }

    /**
     * Autocomplete location suggestions based on user input
     * 
     * @param text The search text entered by the user
     * @return List of location suggestions
     */
    @GetMapping("/autocomplete")
    public ResponseEntity<?> autocomplete(@RequestParam(required = false, defaultValue = "") String text) {
        try {
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.ok(List.of());
            }

            System.out.println("Location autocomplete request for: " + text);
            List<Map<String, Object>> suggestions = locationService.getLocationSuggestions(text);
            System.out.println("Found " + suggestions.size() + " suggestions");
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            System.err.println("Error in location autocomplete: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage() != null ? e.getMessage() : "Unknown error"));
        }
    }
}
