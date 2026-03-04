package com.example.backend.controller;

import com.example.backend.dto.common.PageResponse;
import com.example.backend.dto.payment.PaymentRequest;
import com.example.backend.dto.payment.PaymentResponse;
import com.example.backend.enums.PaymentDirection;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.enums.PaymentType;
import com.example.backend.service.InvoiceService;
import com.example.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;
    private final InvoiceService invoiceService;

    @PostMapping("/create")
    public ResponseEntity<PaymentResponse> createPayment(@RequestBody @Valid PaymentRequest paymentRequest) {
        PaymentResponse paymentResponse = paymentService.createPayment(paymentRequest);
        return new ResponseEntity<>(paymentResponse, HttpStatus.CREATED);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByStudentId(@PathVariable String studentId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByStudentId(studentId);
        return new ResponseEntity<>(payments, HttpStatus.OK);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByTeacherId(@PathVariable String teacherId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByTeacherId(teacherId);
        return new ResponseEntity<>(payments, HttpStatus.OK);
    }

    /**
     * Get all payments with pagination and full filtering support
     * @param page Page number (0-based), default 0
     * @param size Number of items per page, default 10
     * @param search Search term for paymentId, student name, teacher name (optional)
     * @param direction Filter by payment direction: INCOME or EXPENSE (optional)
     * @param paymentType Filter by payment type: STUDENT_FEE, TEACHER_SALARY, REFUND (optional)
     * @param paymentStatus Filter by payment status: COMPLETED, INCOMPLETE, CANCELLED (optional)
     * @param paymentMethod Filter by payment method: CASH, BANK_TRANSFER, CREDIT_CARD, E_WALLET (optional)
     * @param startDate Filter by created date from (ISO format) (optional)
     * @param endDate Filter by created date to (ISO format) (optional)
     * @param sortBy Sort field: createdAt, amount, studentName (optional, default: createdAt)
     * @param sortDirection Sort direction: ASC or DESC (optional, default: DESC)
     * @return PageResponse with payments and pagination metadata
     */
    @GetMapping
    public ResponseEntity<PageResponse<PaymentResponse>> getAllPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false) PaymentDirection direction,
            @RequestParam(required = false) PaymentType paymentType,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) String className,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(required = false, defaultValue = "createdAt") String sortBy,
            @RequestParam(required = false, defaultValue = "DESC") String sortDirection
    ) {
        PageResponse<PaymentResponse> response = paymentService.getAllPaginated(
                page, size, search, direction, paymentType, paymentStatus, paymentMethod, className, startDate, endDate,
                sortBy, sortDirection
        );
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    @GetMapping("/{paymentId}/invoice")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable String paymentId) {
        try {
            // Lấy payment từ database
            PaymentResponse payment = paymentService.getPaymentById(paymentId);
            
            if (payment == null) {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
            
            // Tạo PDF
            byte[] pdfBytes;
            if (payment.getStudent() != null) {
                pdfBytes = invoiceService.generateStudentInvoice(payment);
            } else if (payment.getTeacher() != null) {
                pdfBytes = invoiceService.generateTeacherInvoice(payment);
            } else {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
            
            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", payment.getPaymentId() + ".pdf");
            headers.setContentLength(pdfBytes.length);
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace(); // Log để debug
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

