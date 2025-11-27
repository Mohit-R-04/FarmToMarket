package in.edu.ssn.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.edu.ssn.backend.entity.ProductEntity;
import in.edu.ssn.backend.repository.ProductRepository;
import in.edu.ssn.backend.repository.SellerRequestRepository;
import in.edu.ssn.backend.repository.BookingRepository;
import in.edu.ssn.backend.repository.NotificationRepository;
import in.edu.ssn.backend.repository.TransporterRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SellerRequestRepository sellerRequestRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private TransporterRequestRepository transporterRequestRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public List<Map<String, Object>> getAllProducts() {
        System.out.println("Received get all products request");
        List<ProductEntity> products = productRepository.findAll();
        System.out.println("Found " + products.size() + " products");
        return products.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    @PostMapping
    public Map<String, Object> createProduct(@RequestBody Map<String, Object> productMap) {
        System.out.println("Received create product request: " + productMap);
        try {
            ProductEntity entity = convertToEntity(productMap);
            if (entity.getId() == null || entity.getId().isEmpty()) {
                entity.setId(UUID.randomUUID().toString());
            }
            System.out.println("Saving entity: " + entity);
            ProductEntity saved = productRepository.save(Objects.requireNonNull(entity));
            System.out.println("Saved entity: " + saved);
            return convertToMap(saved);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{id}")
    public Map<String, Object> getProduct(@PathVariable String id) {
        return productRepository.findById(id)
                .map(this::convertToMap)
                .orElse(null);
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateProduct(@PathVariable String id, @RequestBody Map<String, Object> update) {
        return productRepository.findById(id).map(existing -> {
            // Update existing entity with new values
            // We convert update map to entity (partial) and merge, or just map manually
            // Simpler: Convert existing to map, merge update, convert back to entity
            Map<String, Object> existingMap = convertToMap(existing);
            existingMap.putAll(update);

            ProductEntity updatedEntity = convertToEntity(existingMap);
            // Ensure ID doesn't change
            updatedEntity.setId(Objects.requireNonNull(id));

            ProductEntity saved = productRepository.save(updatedEntity);
            return convertToMap(saved);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public Map<String, String> deleteProduct(@PathVariable String id) {
        // Cascading delete: remove all related data
        try {
            // 1. Delete all seller requests for this product
            sellerRequestRepository.deleteByProductId(id);
            System.out.println("Deleted seller requests for product: " + id);

            // 2. Delete all transporter requests for this product
            transporterRequestRepository.deleteByProductId(id);
            System.out.println("Deleted transporter requests for product: " + id);

            // 3. Delete all bookings for this product (batchId = productId)
            bookingRepository.deleteByBatchId(id);
            System.out.println("Deleted bookings for product: " + id);

            // 4. Delete all notifications related to this product
            notificationRepository.deleteByRelatedEntityId(id);
            System.out.println("Deleted notifications for product: " + id);

            // 5. Finally, delete the product itself
            productRepository.deleteById(id);
            System.out.println("Deleted product: " + id);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Product and all related data deleted successfully");
            return response;
        } catch (Exception e) {
            System.err.println("Error deleting product " + id + ": " + e.getMessage());
            e.printStackTrace();
            Map<String, String> response = new HashMap<>();
            response.put("error", "Failed to delete product: " + e.getMessage());
            return response;
        }
    }

    @DeleteMapping("/all")
    public Map<String, String> deleteAllProducts() {
        productRepository.deleteAll();
        Map<String, String> response = new HashMap<>();
        response.put("message", "All products deleted successfully");
        return response;
    }

    private ProductEntity convertToEntity(Map<String, Object> map) {
        Map<String, Object> mapCopy = new HashMap<>(map);
        Object journeyObj = mapCopy.remove("journey");

        ProductEntity entity = objectMapper.convertValue(mapCopy, ProductEntity.class);

        if (journeyObj != null) {
            try {
                if (journeyObj instanceof String) {
                    entity.setJourney((String) journeyObj);
                } else {
                    entity.setJourney(objectMapper.writeValueAsString(journeyObj));
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return entity;
    }

    private Map<String, Object> convertToMap(ProductEntity entity) {
        Map<String, Object> map = objectMapper.convertValue(entity, new TypeReference<Map<String, Object>>() {
        });
        // Handle journey string -> List
        if (entity.getJourney() != null) {
            try {
                map.put("journey", objectMapper.readValue(entity.getJourney(), List.class));
            } catch (Exception e) {
                // If parsing fails, leave as string or empty list
                e.printStackTrace();
            }
        }
        return map;
    }
}
