package in.edu.ssn.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.edu.ssn.backend.entity.TransporterRequestEntity;
import in.edu.ssn.backend.entity.BookingEntity;
import in.edu.ssn.backend.repository.TransporterRequestRepository;
import in.edu.ssn.backend.repository.ProductRepository;
import in.edu.ssn.backend.repository.BookingRepository;
import in.edu.ssn.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transporter-requests")
public class TransporterRequestController {

    @Autowired
    private TransporterRequestRepository transporterRequestRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public List<Map<String, Object>> getAllTransporterRequests() {
        return transporterRequestRepository.findAll().stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    @PostMapping
    public Map<String, Object> createTransporterRequest(@RequestBody Map<String, Object> requestMap) {
        TransporterRequestEntity entity = convertToEntity(requestMap);

        // Validate product exists
        if (!productRepository.existsById(entity.getProductId())) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error",
                    "Product not found. Cannot create transporter request for non-existent product.");
            return errorResponse;
        }

        // Get product to check for accepted seller
        var productOpt = productRepository.findById(entity.getProductId());
        if (productOpt.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Product not found.");
            return errorResponse;
        }

        var product = productOpt.get();

        // Check if seller has been accepted for this batch
        if (product.getSellerId() == null || product.getSellerId().isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error",
                    "No seller has been accepted for this batch yet. Please wait for seller acceptance before requesting a transporter.");
            return errorResponse;
        }

        // Automatically set seller information from the product
        entity.setSellerId(product.getSellerId());
        entity.setSellerLocation(product.getSellerLocation());

        // Check if there's already ANY pending request for this product (one batch =
        // one active request)
        List<TransporterRequestEntity> existingPendingRequests = transporterRequestRepository
                .findByProductIdAndStatus(entity.getProductId(), "PENDING");

        if (!existingPendingRequests.isEmpty()) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "A pending transporter request already exists for this batch");
            errorResponse.put("existingRequestId", existingPendingRequests.get(0).getId());
            return errorResponse;
        }

        // Check if there is already an active booking (ACCEPTED, PICKED_UP,
        // TRANSPORTED)
        List<BookingEntity> existingBookings = bookingRepository.findByBatchId(entity.getProductId());
        boolean hasActiveBooking = existingBookings.stream()
                .anyMatch(b -> Arrays.asList("ACCEPTED", "PICKED_UP", "TRANSPORTED").contains(b.getStatus()));

        // Check if product status indicates it is already being transported or
        // completed
        if (Arrays.asList("BOOKED_TRANSPORT", "IN_TRANSIT", "AT_SELLER", "SOLD", "TRANSPORTED")
                .contains(product.getStatus())) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error",
                    "Product is already in transport or completed (Status: " + product.getStatus() + ")");
            return errorResponse;
        }

        if (hasActiveBooking) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "This batch already has an active or completed transportation booking.");
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

        TransporterRequestEntity saved = transporterRequestRepository.save(Objects.requireNonNull(entity));
        return convertToMap(saved);
    }

    @PutMapping("/{id}")
    public Map<String, Object> updateTransporterRequest(@PathVariable String id,
            @RequestBody Map<String, Object> update) {
        return transporterRequestRepository.findById(id).map(existing -> {
            String newStatus = (String) update.get("status");

            // If accepting the request, create a booking
            if ("ACCEPTED".equals(newStatus)) {
                // Create booking
                BookingEntity booking = new BookingEntity();
                booking.setId(UUID.randomUUID().toString());
                booking.setBatchId(existing.getProductId());
                booking.setFarmerId(existing.getFarmerId());
                booking.setTransporterId(existing.getTransporterId());
                booking.setFarmerDemandedCharge(existing.getFarmerDemandedCharge());
                booking.setTransportDate(existing.getTransportDate());
                booking.setStatus("ACCEPTED");
                booking.setCreatedAt(java.time.Instant.now().toString());
                bookingRepository.save(booking);

                // Notify farmer
                in.edu.ssn.backend.entity.NotificationEntity notification = new in.edu.ssn.backend.entity.NotificationEntity();
                notification.setId(UUID.randomUUID().toString());
                notification.setUserId(existing.getFarmerId());
                notification.setMessage("Your transporter request has been accepted!");
                notification.setType("INFO");
                notification.setRelatedEntityId(booking.getId());
                notification.setStatus("UNREAD");
                notification.setCreatedAt(java.time.Instant.now().toString());
                notificationRepository.save(notification);
            }

            // Update request status
            existing.setStatus(newStatus);
            TransporterRequestEntity saved = transporterRequestRepository.save(existing);
            return convertToMap(saved);
        }).orElse(null);
    }

    @DeleteMapping("/{id}")
    public Map<String, String> deleteTransporterRequest(@PathVariable String id) {
        transporterRequestRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Transporter request deleted successfully");
        return response;
    }

    @DeleteMapping("/all")
    public Map<String, String> deleteAllTransporterRequests() {
        transporterRequestRepository.deleteAll();
        Map<String, String> response = new HashMap<>();
        response.put("message", "All transporter requests deleted successfully");
        return response;
    }

    private TransporterRequestEntity convertToEntity(Map<String, Object> map) {
        return objectMapper.convertValue(map, TransporterRequestEntity.class);
    }

    private Map<String, Object> convertToMap(TransporterRequestEntity entity) {
        return objectMapper.convertValue(entity, new TypeReference<Map<String, Object>>() {
        });
    }
}
