package com.example.backend.controller;

import com.example.backend.dto.profile.ProfileRequest;
import com.example.backend.dto.profile.ProfileResponse;
import com.example.backend.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {
    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ProfileResponse> getCurrentUserProfile() {
        ProfileResponse profile = profileService.getCurrentUserProfile();
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateCurrentUserProfile(@RequestBody @Valid ProfileRequest profileRequest) {
        ProfileResponse updatedProfile = profileService.updateCurrentUserProfile(profileRequest);
        return new ResponseEntity<>(updatedProfile, HttpStatus.OK);
    }
}

