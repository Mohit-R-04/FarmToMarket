package in.edu.ssn.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.edu.ssn.backend.entity.SellerRequestEntity;
import in.edu.ssn.backend.repository.SellerRequestRepository;
import in.edu.ssn.backend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seller-requests")
public class SellerRequestController {

    @Autowired
    private SellerRequestRepository sellerRequestRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public List<Map<String, Object>> getAllSellerRequests() {
        return sellerRequestRepository.findAll().stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    @PostMapping
    public Map<String, Object> createSellerRequest(@RequestBody Map<String, Object> requestMap) {
        SellerRequestEntity entity = convertToEntity(requestMap);

        // Validate product exists
        if (!productRepository.existsById(entity.getProductId())) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Product not found. Cannot create seller request for non-existent product.");
            return errorResponse;
        }

        // Check if there's already ANY pending request for this product (one batch =
        // one active request)
        List<SellerRequestEntity> existingPendingRequests = sellerRequestRepository
                .findByProductIdAndStatus(entity.getProductId(), "PENDING");

        if (!existingPendingRequests.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "A pending seller request already exists for this batch");
            errorResponse.put("existingRequestId", existingPendingRequests.get(0).getId());
            return errorResponse;
        }

        if (entity.getId() == null || entity.getId().isEmpty()) {
            entity.setId(UUID.randomUUID().toString());
        }
        if (entity.getStatus() == null) {
            entity.setStatus("PENDING");
        }
        if (entity.getCreatedAt() == null) {
            entity.setCreatedAt(java.time.Instant.now().toString());
        }

        SellerRequestEntity saved = sellerRequestRepository.save(Objects.requireNonNull(entity));
        return convertToMap(saved);
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateSellerRequest(@PathVariable String id, @RequestBody Map<String, Object> update) {
        return sellerRequestRepository.findById(id).map(existing -> {
            Map<String, Object> existingMap = convertToMap(existing);
            existingMap.putAll(update);

            SellerRequestEntity updatedEntity = convertToEntity(existingMap);
            updatedEntity.setId(Objects.requireNonNull(id));

            SellerRequestEntity saved = sellerRequestRepository.save(updatedEntity);
            return convertToMap(saved);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteSellerRequest(@PathVariable String id) {
        sellerRequestRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Seller request deleted successfully");
        return response;
    }

    @DeleteMapping("/all")
    public Map<String, String> deleteAllSellerRequests() {
        sellerRequestRepository.deleteAll();
        Map<String, String> response = new HashMap<>();
        response.put("message", "All seller requests deleted successfully");
        return response;
    }

    private SellerRequestEntity convertToEntity(Map<String, Object> map) {
        return objectMapper.convertValue(map, SellerRequestEntity.class);
    }

    private Map<String, Object> convertToMap(SellerRequestEntity entity) {
        return objectMapper.convertValue(entity, new TypeReference<Map<String, Object>>() {
        });
    }
}
