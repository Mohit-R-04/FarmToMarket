package in.edu.ssn.backend.controller;

import in.edu.ssn.backend.repository.SellerRequestRepository;
import in.edu.ssn.backend.repository.TransporterRequestRepository;
import in.edu.ssn.backend.repository.BookingRepository;
import in.edu.ssn.backend.repository.NotificationRepository;
import in.edu.ssn.backend.repository.ProductRepository;
import in.edu.ssn.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SellerRequestRepository sellerRequestRepository;

    @Autowired
    private TransporterRequestRepository transporterRequestRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/clear-all-data")
    @Transactional
    public Map<String, Object> clearAllData() {
        Map<String, Object> response = new HashMap<>();
        Map<String, Long> deletedCounts = new HashMap<>();

        try {
            // Delete in order to respect foreign key constraints
            // 1. Delete bookings first (references products)
            long bookingsCount = bookingRepository.count();
            bookingRepository.deleteAll();
            deletedCounts.put("bookings", bookingsCount);

            // 2. Delete notifications (may reference various entities)
            long notificationsCount = notificationRepository.count();
            notificationRepository.deleteAll();
            deletedCounts.put("notifications", notificationsCount);

            // 3. Delete seller requests (references products)
            long sellerRequestsCount = sellerRequestRepository.count();
            sellerRequestRepository.deleteAll();
            deletedCounts.put("sellerRequests", sellerRequestsCount);

            // 4. Delete transporter requests (references products)
            long transporterRequestsCount = transporterRequestRepository.count();
            transporterRequestRepository.deleteAll();
            deletedCounts.put("transporterRequests", transporterRequestsCount);

            // 5. Delete products
            long productsCount = productRepository.count();
            productRepository.deleteAll();
            deletedCounts.put("products", productsCount);

            // 6. Delete users (should be last)
            long usersCount = userRepository.count();
            userRepository.deleteAll();
            deletedCounts.put("users", usersCount);

            long totalDeleted = deletedCounts.values().stream().mapToLong(Long::longValue).sum();

            response.put("success", true);
            response.put("message", "All data cleared successfully");
            response.put("totalRecordsDeleted", totalDeleted);
            response.put("deletedByTable", deletedCounts);
            return response;

        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("message", "Failed to clear database: " + e.getMessage());
            return response;
        }
    }

    @PostMapping("/cleanup-orphaned-data")
    @Transactional
    public Map<String, Object> cleanupOrphanedData() {
        int deletedSellerRequests = 0;
        int deletedTransporterRequests = 0;
        int deletedBookings = 0;
        int deletedNotifications = 0;

        try {
            // 1. Clean up orphaned seller requests (requests for non-existent products)
            var allSellerRequests = sellerRequestRepository.findAll();
            for (var request : allSellerRequests) {
                if (!productRepository.existsById(request.getProductId())) {
                    sellerRequestRepository.deleteById(request.getId());
                    deletedSellerRequests++;
                }
            }

            // 2. Clean up orphaned transporter requests (requests for non-existent
            // products)
            var allTransporterRequests = transporterRequestRepository.findAll();
            for (var request : allTransporterRequests) {
                if (!productRepository.existsById(request.getProductId())) {
                    transporterRequestRepository.deleteById(request.getId());
                    deletedTransporterRequests++;
                }
            }

            // 3. Clean up orphaned bookings (bookings for non-existent products)
            var allBookings = bookingRepository.findAll();
            for (var booking : allBookings) {
                if (!productRepository.existsById(booking.getBatchId())) {
                    bookingRepository.deleteById(booking.getId());
                    deletedBookings++;
                }
            }

            // 4. Clean up orphaned notifications (notifications for non-existent entities)
            var allNotifications = notificationRepository.findAll();
            for (var notification : allNotifications) {
                if (notification.getRelatedEntityId() != null) {
                    boolean exists = productRepository.existsById(notification.getRelatedEntityId()) ||
                            bookingRepository.existsById(notification.getRelatedEntityId()) ||
                            sellerRequestRepository.existsById(notification.getRelatedEntityId()) ||
                            transporterRequestRepository.existsById(notification.getRelatedEntityId());
                    if (!exists) {
                        notificationRepository.deleteById(notification.getId());
                        deletedNotifications++;
                    }
                }
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("deletedSellerRequests", deletedSellerRequests);
            response.put("deletedTransporterRequests", deletedTransporterRequests);
            response.put("deletedBookings", deletedBookings);
            response.put("deletedNotifications", deletedNotifications);
            response.put("message", "Cleanup completed successfully");
            return response;
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("error", e.getMessage());
            return response;
        }
    }
}
