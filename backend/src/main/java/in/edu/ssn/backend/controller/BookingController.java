package in.edu.ssn.backend.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.edu.ssn.backend.entity.BookingEntity;
import in.edu.ssn.backend.repository.BookingRepository;
import in.edu.ssn.backend.repository.ProductRepository;
import in.edu.ssn.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.UUID;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public List<BookingEntity> getAllBookings() {
        return bookingRepository.findAll();
    }

    @GetMapping("/{id}")
    public BookingEntity getBookingById(@PathVariable String id) {
        return bookingRepository.findById(id).orElse(null);
    }

    @PostMapping
    public BookingEntity createBooking(@RequestBody BookingEntity booking) {
        if (booking.getId() == null) {
            booking.setId(UUID.randomUUID().toString());
        }

        // Validate: Only one active booking per batch
        // Active statuses: PENDING, ACCEPTED, PICKED_UP
        // Can create new booking only if previous is CANCELLED, TRANSPORTED, or
        // REJECTED
        List<BookingEntity> pendingBookings = bookingRepository.findByBatchIdAndStatus(booking.getBatchId(), "PENDING");
        List<BookingEntity> acceptedBookings = bookingRepository.findByBatchIdAndStatus(booking.getBatchId(),
                "ACCEPTED");
        List<BookingEntity> pickedUpBookings = bookingRepository.findByBatchIdAndStatus(booking.getBatchId(),
                "PICKED_UP");

        if (!pendingBookings.isEmpty() || !acceptedBookings.isEmpty() || !pickedUpBookings.isEmpty()) {
            throw new RuntimeException(
                    "An active transportation booking already exists for this batch. Cannot create another booking until the current one is completed, cancelled, or rejected.");
        }

        Objects.requireNonNull(booking, "Booking entity cannot be null");
        return bookingRepository.save(booking);
    }

    @PutMapping("/{id}")
    public BookingEntity updateBooking(@PathVariable String id, @RequestBody BookingEntity bookingDetails) {
        Objects.requireNonNull(id, "ID cannot be null");
        Objects.requireNonNull(bookingDetails, "Booking details cannot be null");
        return bookingRepository.findById(id).map(booking -> {
            if (bookingDetails.getStatus() != null)
                booking.setStatus(bookingDetails.getStatus());
            if (bookingDetails.getTransporterId() != null)
                booking.setTransporterId(bookingDetails.getTransporterId());
            if (bookingDetails.getTransporterCharge() != null)
                booking.setTransporterCharge(bookingDetails.getTransporterCharge());
            if (bookingDetails.getTransportDate() != null)
                booking.setTransportDate(bookingDetails.getTransportDate());
            if (bookingDetails.getKilometers() != null)
                booking.setKilometers(bookingDetails.getKilometers());
            return bookingRepository.save(booking);
        }).orElse(null);
    }

    @PostMapping("/{id}/request-cancellation")
    public BookingEntity requestCancellation(@PathVariable String id,
            @RequestBody java.util.Map<String, String> payload) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setCancellationReason(payload.get("reason"));
            booking.setCancellationStatus("PENDING");

            // Notify Farmer
            in.edu.ssn.backend.entity.NotificationEntity notification = new in.edu.ssn.backend.entity.NotificationEntity();
            notification.setId(UUID.randomUUID().toString());
            notification.setUserId(booking.getFarmerId());
            notification.setMessage("Transporter requested cancellation: " + payload.get("reason"));
            notification.setType("CANCELLATION_REQUEST");
            notification.setRelatedEntityId(booking.getId());
            notification.setStatus("ACTION_REQUIRED");
            notification.setCreatedAt(java.time.Instant.now().toString());
            notification.setActionStatus("PENDING");
            notificationRepository.save(notification);

            return bookingRepository.save(booking);
        }).orElse(null);
    }

    @PostMapping("/{id}/respond-cancellation")
    public BookingEntity respondCancellation(@PathVariable String id,
            @RequestBody java.util.Map<String, String> payload) {
        String action = payload.get("action"); // ACCEPT or REJECT
        return bookingRepository.findById(id).map(booking -> {
            booking.setCancellationStatus(action);

            String message = "";
            if ("ACCEPT".equals(action)) {
                booking.setStatus("CANCELLED");
                message = "Your cancellation request was accepted.";
            } else {
                message = "Your cancellation request was REJECTED. You must proceed with transport.";
            }

            // Notify Transporter
            in.edu.ssn.backend.entity.NotificationEntity notification = new in.edu.ssn.backend.entity.NotificationEntity();
            notification.setId(UUID.randomUUID().toString());
            notification.setUserId(booking.getTransporterId());
            notification.setMessage(message);
            notification.setType("ALERT");
            notification.setRelatedEntityId(booking.getId());
            notification.setStatus("UNREAD");
            notification.setCreatedAt(java.time.Instant.now().toString());
            notificationRepository.save(notification);

            // Mark Farmer's notification as handled
            List<in.edu.ssn.backend.entity.NotificationEntity> relatedNotifications = notificationRepository
                    .findByRelatedEntityId(booking.getId());

            System.out.println(
                    "Found " + relatedNotifications.size() + " related notifications for booking: " + booking.getId());

            for (in.edu.ssn.backend.entity.NotificationEntity notif : relatedNotifications) {
                if ("CANCELLATION_REQUEST".equals(notif.getType())) {
                    notif.setStatus("ACTION_TAKEN");
                    notif.setActionStatus(action); // ACCEPT or REJECT
                    notificationRepository.save(notif);
                    System.out.println("Updated notification " + notif.getId() + " to ACTION_TAKEN");
                }
            }

            return bookingRepository.save(booking);
        }).orElse(null);
    }

    @PostMapping("/{id}/transported")
    public BookingEntity markTransported(@PathVariable String id,
            @RequestBody(required = false) Map<String, Double> payload) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus("TRANSPORTED");

            if (payload != null && payload.containsKey("kilometers")) {
                booking.setKilometers(payload.get("kilometers"));
            }

            // Update Product Location, Status, and Price
            productRepository.findById(booking.getBatchId())
                    .ifPresent(product -> {
                        product.setStatus("AT_SELLER");
                        product.setCurrentLocation(product.getSellerLocation());

                        // Note: farmerPrice is already set when seller request was accepted
                        // It represents the charge per unit that farmer pays to seller
                        // We should NOT overwrite it here

                        // Update Journey
                        try {
                            List<Map<String, Object>> journey = new java.util.ArrayList<>();
                            if (product.getJourney() != null && !product.getJourney().isEmpty()) {
                                journey = objectMapper.readValue(product.getJourney(),
                                        new TypeReference<List<Map<String, Object>>>() {
                                        });
                            }

                            Map<String, Object> event = new HashMap<>();
                            event.put("status", "TRANSPORTED");
                            event.put("timestamp", java.time.Instant.now().toString());
                            event.put("location", product.getSellerLocation());
                            event.put("description", "Product transported to seller location");

                            journey.add(event);
                            product.setJourney(objectMapper.writeValueAsString(journey));

                            System.out.println(
                                    "Updated product " + product.getId() + " journey. Total events: " + journey.size());
                        } catch (Exception e) {
                            System.err.println("Failed to update journey for product " + product.getId());
                            e.printStackTrace();
                        }

                        productRepository.save(product);
                        System.out.println("Product " + product.getId() + " marked as TRANSPORTED");
                    });

            // Notify Farmer
            in.edu.ssn.backend.entity.NotificationEntity notification = new in.edu.ssn.backend.entity.NotificationEntity();
            notification.setId(UUID.randomUUID().toString());
            notification.setUserId(booking.getFarmerId());
            notification.setMessage("Your product has been transported successfully.");
            notification.setType("INFO");
            notification.setRelatedEntityId(booking.getId());
            notification.setStatus("UNREAD");
            notification.setCreatedAt(java.time.Instant.now().toString());
            notificationRepository.save(notification);

            return bookingRepository.save(booking);
        }).orElse(null);
    }

    @DeleteMapping("/all")
    public Map<String, String> deleteAllBookings() {
        bookingRepository.deleteAll();
        Map<String, String> response = new HashMap<>();
        response.put("message", "All bookings deleted successfully");
        return response;
    }

    @DeleteMapping("/batch/{batchId}")
    @org.springframework.transaction.annotation.Transactional
    public Map<String, String> deleteBookingsByBatchId(@PathVariable String batchId) {
        bookingRepository.deleteByBatchId(batchId);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Bookings for batch " + batchId + " deleted successfully");
        return response;
    }
}
