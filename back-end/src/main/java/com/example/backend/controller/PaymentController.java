package com.example.backend.controller;

import com.example.backend.dto.payment.PaymentRequest;
import com.example.backend.dto.payment.PaymentResponse;
import com.example.backend.service.InvoiceService;
import com.example.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        List<PaymentResponse> payments = paymentService.getAllPayments();
        return new ResponseEntity<>(payments, HttpStatus.OK);
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
            headers.setContentDispositionFormData("attachment", 
                "invoice_" + payment.getPaymentId() + ".pdf");
            headers.setContentLength(pdfBytes.length);
            
            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace(); // Log để debug
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}

