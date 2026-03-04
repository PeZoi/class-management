package com.example.backend.service;

import com.example.backend.dto.audit.AuditLogResponse;
import com.example.backend.dto.common.PageResponse;
import com.example.backend.entity.AuditLog;
import com.example.backend.repository.AuditLogRepository;
import com.example.backend.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private static final Logger log = LoggerFactory.getLogger(AuditLogService.class);

    private final AuditLogRepository auditLogRepository;

    /**
     * Ghi một bản ghi audit log đơn giản.
     *
     * @param action         Chuỗi hành động kỹ thuật, ví dụ: "POST /api/students"
     * @param method         HTTP method
     * @param path           Đường dẫn request
     * @param ipAddress      Địa chỉ IP client
     * @param success        Trạng thái thành công/thất bại
     * @param apiDescriptionKey Key mô tả API để FE dùng i18n
     * @param details           Payload/request data được format JSON (lưu dạng String)
     */
    public void log(String action,
                    String method,
                    String path,
                    String ipAddress,
                    boolean success,
                    String apiDescriptionKey,
                    String details) {
        AuditLog auditLog = new AuditLog();
        String username = SecurityUtil.getCurrentUserLogin().orElse("anonymous");

        auditLog.setUsername(username);
        auditLog.setAction(action);
        auditLog.setMethod(method);
        auditLog.setPath(path);
        auditLog.setIpAddress(ipAddress);
        auditLog.setSuccess(success);
        auditLog.setApiDescriptionKey(apiDescriptionKey);
        auditLog.setDetails(details);

        auditLogRepository.save(auditLog);
    }

    /**
     * Job dọn dẹp log: xoá mọi bản ghi cũ hơn 3 tháng.
     *
     * Chạy mỗi ngày lúc 03:00 sáng (theo server time).
     */
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void deleteOldLogs() {
        // Lấy ngày đầu tiên của ngày hiện tại, trừ đi 3 tháng => mốc 3 tháng trước
        LocalDate threeMonthsAgoDate = LocalDate.now().minusMonths(3);
        Instant cutoff = threeMonthsAgoDate.atStartOfDay(ZoneOffset.UTC).toInstant();

        long beforeCount = auditLogRepository.count();
        auditLogRepository.deleteByCreatedAtBefore(cutoff);
        long afterCount = auditLogRepository.count();

        long deleted = beforeCount - afterCount;
        if (deleted > 0) {
            log.info("AuditLog cleanup: deleted {} records older than {}", deleted, cutoff);
        }
    }

    /**
     * Lấy danh sách audit logs với pagination + filter.
     *
     * @param page       Số trang (0-based)
     * @param size       Kích thước trang
     * @param username   Lọc theo username (contains, ignore case)
     * @param method     Lọc theo HTTP method (exact, ví dụ: GET/POST/PUT/DELETE)
     * @param success    Lọc theo trạng thái thành công/thất bại
     * @param search     Tìm kiếm toàn văn trên action/path/apiDescriptionKey/username
     * @param from       createdAt từ thời điểm (>=)
     * @param to         createdAt tới thời điểm (<=)
     */
    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogsPaginated(
            int page,
            int size,
            String username,
            String method,
            Boolean success,
            String search,
            Instant from,
            Instant to
    ) {
        if (page < 0) {
            page = 0;
        }
        if (size <= 0) {
            size = 10;
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Specification<AuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (username != null && !username.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("username")), "%" + username.toLowerCase() + "%"));
            }
            if (method != null && !method.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("method")), method.toUpperCase()));
            }
            if (success != null) {
                predicates.add(cb.equal(root.get("success"), success));
            }
            if (search != null && !search.isBlank()) {
                String likeSearch = "%" + search.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("action")), likeSearch),
                        cb.like(cb.lower(root.get("path")), likeSearch),
                        cb.like(cb.lower(root.get("apiDescriptionKey")), likeSearch),
                        cb.like(cb.lower(root.get("username")), likeSearch)
                ));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), to));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<AuditLog> logPage = auditLogRepository.findAll(spec, pageable);

        List<AuditLogResponse> content = logPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                logPage.getNumber(),
                logPage.getSize(),
                logPage.getTotalElements(),
                logPage.getTotalPages(),
                logPage.hasNext(),
                logPage.hasPrevious()
        );
    }

    private AuditLogResponse mapToResponse(AuditLog entity) {
        if (entity == null) {
            return null;
        }
        return AuditLogResponse.builder()
                .id(entity.getId())
                .username(entity.getUsername())
                .action(entity.getAction())
                .method(entity.getMethod())
                .path(entity.getPath())
                .apiDescriptionKey(entity.getApiDescriptionKey())
                .ipAddress(entity.getIpAddress())
                .success(entity.getSuccess())
                .details(entity.getDetails())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}


