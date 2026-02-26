package com.example.backend.repository;

import com.example.backend.entity.User;
import com.example.backend.enums.Genders;
import com.example.backend.enums.Status;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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
    Optional<User> findByEmail(String email);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.email = ?1 AND u.id <> ?2")
    boolean existsByEmailAndIdNot(String email, String id);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.phoneNumber = ?1 AND u.id <> ?2")
    boolean existsByPhoneNumberAndIdNot(String phoneNumber, String id);
    
    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN true ELSE false END FROM User u WHERE u.idCard = ?1 AND u.id <> ?2")
    boolean existsByIdCardAndIdNot(String idCard, String id);
    
    // ===== PERFORMANCE OPTIMIZATION QUERIES =====
    
    // Count teachers by role name and exclude status (for dashboard stats)
    @Query("SELECT COUNT(u) FROM User u WHERE u.role.name = :roleName AND u.status <> :excludeStatus")
    Long countByRoleNameAndStatusNot(@Param("roleName") String roleName, @Param("excludeStatus") Status excludeStatus);
    
    /**
     * Find teachers with pagination and filtering support
     * Search by fullName, email, or phoneNumber
     * Filter by gender and status
     * Note: Returns all statuses (including DELETED) when status filter is not provided
     */
    @Query("""
        SELECT u FROM User u 
        WHERE u.role.name = 'ROLE_TEACHER'
        AND (:search IS NULL OR :search = '' 
             OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
             OR u.phoneNumber LIKE CONCAT('%', :search, '%'))
        AND (:gender IS NULL OR u.gender = :gender)
        AND (:status IS NULL OR u.status = :status)
        ORDER BY 
            CASE 
                WHEN u.status = 'ACTIVE' THEN 1 
                WHEN u.status = 'BLOCKED' THEN 2 
                WHEN u.status = 'DELETED' THEN 3 
                ELSE 4 
            END,
            u.createdAt DESC
    """)
    Page<User> findTeachersWithFilters(
        @Param("search") String search,
        @Param("gender") Genders gender,
        @Param("status") Status status,
        Pageable pageable
    );
}
