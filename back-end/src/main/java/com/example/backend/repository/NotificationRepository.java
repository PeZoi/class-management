package com.example.backend.repository;

import com.example.backend.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByOrderByTimeDesc();
    List<Notification> findTop5ByOrderByTimeDesc();
    
    /**
     * Cursor-based pagination: get notifications before a specific time
     * @param beforeTime Cursor time (exclusive), null means get latest
     * @param pageable Page size
     * @return List of notifications ordered by time DESC
     */
    @Query("SELECT n FROM Notification n WHERE (:beforeTime IS NULL OR n.time < :beforeTime) ORDER BY n.time DESC")
    List<Notification> findAllBeforeTimeOrderByTimeDesc(@Param("beforeTime") Instant beforeTime, Pageable pageable);
}
