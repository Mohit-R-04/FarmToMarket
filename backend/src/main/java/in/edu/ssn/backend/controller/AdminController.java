package in.edu.ssn.backend.controller;

import in.edu.ssn.backend.repository.SellerRequestRepository;
import in.edu.ssn.backend.repository.TransporterRequestRepository;
import in.edu.ssn.backend.repository.BookingRepository;
import in.edu.ssn.backend.repository.NotificationRepository;
import in.edu.ssn.backend.repository.ProductRepository;
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
