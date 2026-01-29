package com.example.backend.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * One API for both single & bulk remove: send 1 id or many in studentIds.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RemoveStudentsFromClassRequest {
    /**
     * Optional, used for validation (ensure current class matches).
     */
    private String classId;

    private List<String> studentIds;
}


