package com.example.backend.service;

import com.example.backend.enums.PaymentMethod;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final JavaMailSender mailSender;
    
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MM/yyyy")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    
    private String formatCurrency(Long amount) {
        if (amount == null) return "0 VNĐ";
        NumberFormat format = NumberFormat.getNumberInstance(java.util.Locale.forLanguageTag("vi-VN"));
        return format.format(amount) + " VNĐ";
    }
    
    /**
     * Gửi email thông báo thanh toán học phí cho học viên
     * Chạy bất đồng bộ để không làm chậm quá trình thanh toán
     */
    @Async("emailTaskExecutor")
    public void sendStudentPaymentNotification(String studentEmail, String studentName, 
                                                Long paidAmount, PaymentMethod paymentMethod, 
                                                String className, Instant billingMonth, 
                                                String note, String paymentId) {
        if (studentEmail == null || studentEmail.trim().isEmpty()) {
            log.warn("Email học viên không tồn tại, bỏ qua gửi email");
            return;
        }
        
        try {
            log.debug("Bắt đầu gửi email đến học viên: {}", studentEmail);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(studentEmail);
            helper.setSubject("Thông báo thanh toán học phí");
            
            String formattedMonth = billingMonth != null ? MONTH_FORMATTER.format(billingMonth) : "N/A";
            
            log.debug("Đang build HTML content cho email học viên...");
            String htmlContent = buildStudentPaymentEmailContent(
                    studentName, paidAmount, paymentMethod, className, formattedMonth, note, paymentId
            );
            
            if (htmlContent == null || htmlContent.trim().isEmpty()) {
                log.error("HTML content rỗng cho học viên: {}", studentEmail);
                return;
            }
            
            helper.setText(htmlContent, true);
            log.debug("Đang gửi email đến SMTP server...");
            mailSender.send(message);
            log.info("Email thông báo thanh toán đã được gửi thành công đến học viên: {}", studentEmail);
        } catch (MessagingException e) {
            log.error("Lỗi MessagingException khi gửi email đến học viên {}: {}", studentEmail, e.getMessage(), e);
            log.error("Chi tiết lỗi: {}", e.getCause() != null ? e.getCause().getMessage() : "Không có chi tiết");
            // Không throw exception để không làm gián đoạn quá trình thanh toán
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi gửi email đến học viên {}: {}", studentEmail, e.getMessage(), e);
            log.error("Stack trace: ", e);
        }
    }
    
    /**
     * Gửi email thông báo thanh toán lương cho giáo viên
     * Chạy bất đồng bộ để không làm chậm quá trình thanh toán
     */
    @Async("emailTaskExecutor")
    public void sendTeacherPaymentNotification(String teacherEmail, String teacherName,
                                                Long paidAmount, Long baseSalary, Long bonus, Long deduction,
                                                PaymentMethod paymentMethod, Instant billingMonth,
                                                String note, String paymentId) {
        if (teacherEmail == null || teacherEmail.trim().isEmpty()) {
            log.warn("Email giáo viên không tồn tại, bỏ qua gửi email");
            return;
        }
        
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(teacherEmail);
            helper.setSubject("Thông báo thanh toán lương");
            
            String formattedMonth = billingMonth != null ? MONTH_FORMATTER.format(billingMonth) : "N/A";
            String htmlContent = buildTeacherPaymentEmailContent(
                    teacherName, paidAmount, baseSalary, bonus, deduction, 
                    paymentMethod, formattedMonth, note, paymentId
            );
            
            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("Email thông báo thanh toán lương đã được gửi thành công đến giáo viên: {}", teacherEmail);
        } catch (MessagingException e) {
            log.error("Lỗi khi gửi email thông báo lương đến giáo viên {}: {}", teacherEmail, e.getMessage(), e);
            // Không throw exception để không làm gián đoạn quá trình thanh toán
        } catch (Exception e) {
            log.error("Lỗi không mong muốn khi gửi email đến giáo viên {}: {}", teacherEmail, e.getMessage(), e);
        }
    }
    
    private String buildStudentPaymentEmailContent(String studentName, Long paidAmount,
                                                    PaymentMethod paymentMethod, String className,
                                                    String billingMonth, String note,
                                                    String paymentId) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/emails/student-payment.html");
            String template = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
            
            String formattedAmount = formatCurrency(paidAmount);
            String formattedNote = note != null && !note.trim().isEmpty() ? note : "Không có ghi chú";
            String paymentMethodText = getPaymentMethodText(paymentMethod);
            
            // Replace placeholders
            template = template.replace("{{STUDENT_NAME}}", studentName);
            template = template.replace("{{PAID_AMOUNT}}", formattedAmount);
            template = template.replace("{{PAYMENT_ID}}", paymentId);
            template = template.replace("{{BILLING_MONTH}}", billingMonth);
            template = template.replace("{{PAYMENT_METHOD}}", paymentMethodText);
            
            // Handle optional className
            if (className != null && !className.trim().isEmpty()) {
                String classRow = "<div class=\"info-row\">\n" +
                        "                    <span class=\"info-label\">Lớp học:</span>\n" +
                        "                    <span class=\"info-value\">" + className + "</span>\n" +
                        "                </div>";
                template = template.replace("{{CLASS_NAME_ROW}}", classRow);
            } else {
                template = template.replace("{{CLASS_NAME_ROW}}", "");
            }
            
            // Handle note section
            if (note != null && !note.trim().isEmpty()) {
                String noteSection = "<div class=\"note-section\">\n" +
                        "                <div class=\"note-label\">Ghi chú:</div>\n" +
                        "                <div class=\"note-text\">" + formattedNote + "</div>\n" +
                        "            </div>";
                template = template.replace("{{NOTE_SECTION}}", noteSection);
            } else {
                template = template.replace("{{NOTE_SECTION}}", "");
            }
            
            return template;
        } catch (IOException e) {
            log.error("Lỗi khi đọc template email học viên: {}", e.getMessage(), e);
            // Fallback to simple email
            return buildSimpleStudentEmail(studentName, paidAmount, paymentMethod, className, billingMonth, note, paymentId);
        }
    }
    
    private String buildSimpleStudentEmail(String studentName, Long paidAmount,
                                           PaymentMethod paymentMethod, String className,
                                           String billingMonth, String note, String paymentId) {
        String formattedAmount = formatCurrency(paidAmount);
        String paymentMethodText = getPaymentMethodText(paymentMethod);
        return String.format(
            "Xin chào %s,\n\nKhoản thanh toán học phí %s đã được ghi nhận.\nMã: %s\nTháng: %s\nPhương thức: %s",
            studentName, formattedAmount, paymentId, billingMonth, paymentMethodText
        );
    }
    
    private String buildTeacherPaymentEmailContent(String teacherName, Long paidAmount,
                                                    Long baseSalary, Long bonus, Long deduction,
                                                    PaymentMethod paymentMethod, String billingMonth,
                                                    String note, String paymentId) {
        try {
            ClassPathResource resource = new ClassPathResource("templates/emails/teacher-payment.html");
            String template = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
            
            String formattedAmount = formatCurrency(paidAmount);
            String formattedBaseSalary = formatCurrency(baseSalary);
            String formattedBonus = formatCurrency(bonus != null ? bonus : 0L);
            String formattedDeduction = formatCurrency(deduction != null ? deduction : 0L);
            String formattedNote = note != null && !note.trim().isEmpty() ? note : "Không có ghi chú";
            String paymentMethodText = getPaymentMethodText(paymentMethod);
            
            // Replace placeholders
            template = template.replace("{{TEACHER_NAME}}", teacherName);
            template = template.replace("{{PAID_AMOUNT}}", formattedAmount);
            template = template.replace("{{BASE_SALARY}}", formattedBaseSalary);
            template = template.replace("{{BONUS}}", formattedBonus);
            template = template.replace("{{DEDUCTION}}", formattedDeduction);
            template = template.replace("{{PAYMENT_ID}}", paymentId);
            template = template.replace("{{BILLING_MONTH}}", billingMonth);
            template = template.replace("{{PAYMENT_METHOD}}", paymentMethodText);
            
            // Handle note section
            if (note != null && !note.trim().isEmpty()) {
                String noteSection = "<div class=\"note-section\">\n" +
                        "                <div class=\"note-label\">Ghi chú:</div>\n" +
                        "                <div class=\"note-text\">" + formattedNote + "</div>\n" +
                        "            </div>";
                template = template.replace("{{NOTE_SECTION}}", noteSection);
            } else {
                template = template.replace("{{NOTE_SECTION}}", "");
            }
            
            return template;
        } catch (IOException e) {
            log.error("Lỗi khi đọc template email giáo viên: {}", e.getMessage(), e);
            // Fallback to simple email
            return buildSimpleTeacherEmail(teacherName, paidAmount, baseSalary, bonus, deduction, paymentMethod, billingMonth, note, paymentId);
        }
    }
    
    private String buildSimpleTeacherEmail(String teacherName, Long paidAmount,
                                          Long baseSalary, Long bonus, Long deduction,
                                          PaymentMethod paymentMethod, String billingMonth,
                                          String note, String paymentId) {
        String formattedAmount = formatCurrency(paidAmount);
        String paymentMethodText = getPaymentMethodText(paymentMethod);
        return String.format(
            "Xin chào %s,\n\nKhoản thanh toán lương %s đã được ghi nhận.\nMã: %s\nTháng: %s\nPhương thức: %s",
            teacherName, formattedAmount, paymentId, billingMonth, paymentMethodText
        );
    }
    
    private String getPaymentMethodText(PaymentMethod paymentMethod) {
        if (paymentMethod == null) return "N/A";
        switch (paymentMethod) {
            case CASH:
                return "Tiền mặt";
            case BANK_TRANSFER:
                return "Chuyển khoản ngân hàng";
            default:
                return paymentMethod.name();
        }
    }
}

