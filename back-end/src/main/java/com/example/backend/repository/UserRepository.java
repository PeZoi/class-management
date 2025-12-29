package com.example.backend.repository;

import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    @Query("select u from User u WHERE u.status <> 'DELETED'")
    List<User> findAllUsers();

    @Modifying
    @Query("update User u set u.status = 'DELETED' WHERE u.id = ?1")
    void deleteUser(String id);

    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByPhoneNumber(String phoneNumber);

    Optional<User> findByUsername(String username);
}
