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
    boolean existsByIdCard(String idCard);

    Optional<User> findByUsername(String username);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = ?1 AND u.id <> ?2")
    boolean existsByEmailAndIdNot(String email, String id);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.phoneNumber = ?1 AND u.id <> ?2")
    boolean existsByPhoneNumberAndIdNot(String phoneNumber, String id);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.idCard = ?1 AND u.id <> ?2")
    boolean existsByIdCardAndIdNot(String idCard, String id);
}
