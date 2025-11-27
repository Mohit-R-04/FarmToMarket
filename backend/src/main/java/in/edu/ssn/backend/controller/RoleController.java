package in.edu.ssn.backend.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.edu.ssn.backend.entity.UserEntity;
import in.edu.ssn.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/{role}")
    public List<Map<String, Object>> getUsersByRole(@PathVariable String role) {
        List<UserEntity> users = userRepository.findByRole(role.toUpperCase());
        return users.stream().map(this::convertToMap).collect(Collectors.toList());
    }

    @PostMapping("/{role}")
    public Map<String, Object> addUserToRole(@PathVariable String role, @RequestBody Map<String, Object> userMap) {
        System.out.println("Adding user to role " + role + ": " + userMap);

        String userId = (String) userMap.get("id");
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        UserEntity user = new UserEntity();
        user.setId(userId);
        user.setRole(role.toUpperCase());

        try {
            user.setRoleData(objectMapper.writeValueAsString(userMap));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            throw new RuntimeException("Error converting role data to JSON", e);
        }

        userRepository.save(user);
        return userMap;
    }

    @GetMapping("/user/{userId}")
    public Map<String, Object> getRoleByUserId(@PathVariable String userId) {
        System.out.println("Searching for user ID: " + userId);
        Optional<UserEntity> userOpt = userRepository.findById(userId);

        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            System.out.println("Found user in role: " + user.getRole());

            Map<String, Object> result = new HashMap<>();
            result.put("role", user.getRole());
            try {
                result.put("roleData", objectMapper.readValue(user.getRoleData(), Map.class));
            } catch (JsonProcessingException e) {
                e.printStackTrace();
                result.put("roleData", Collections.emptyMap());
            }
            return result;
        }

        System.out.println("User not found: " + userId);
        return Collections.emptyMap();
    }

    @PutMapping("/{role}/{userId}")
    public Map<String, Object> updateUserRole(@PathVariable String role, @PathVariable String userId,
            @RequestBody Map<String, Object> userMap) {
        System.out.println("Updating user " + userId + " in role " + role + ": " + userMap);

        Optional<UserEntity> userOpt = userRepository.findById(userId);

        if (userOpt.isPresent()) {
            UserEntity user = userOpt.get();
            user.setRole(role.toUpperCase());

            try {
                user.setRoleData(objectMapper.writeValueAsString(userMap));
            } catch (JsonProcessingException e) {
                e.printStackTrace();
                throw new RuntimeException("Error converting role data to JSON", e);
            }

            userRepository.save(user);
            System.out.println("User updated successfully");
            return userMap;
        } else {
            System.out.println("User not found for update: " + userId);
            throw new RuntimeException("User not found");
        }
    }

    private Map<String, Object> convertToMap(UserEntity user) {
        try {
            return objectMapper.readValue(user.getRoleData(), Map.class);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return Collections.emptyMap();
        }
    }

    @DeleteMapping("/all")
    public Map<String, String> deleteAllUsers() {
        System.out.println("Deleting all users from database");
        userRepository.deleteAll();
        Map<String, String> response = new HashMap<>();
        response.put("message", "All users deleted successfully");
        return response;
    }
}
