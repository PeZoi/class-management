package com.example.backend.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.NumberFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.springframework.stereotype.Service;

import com.example.backend.dto.payment.PaymentResponse;
import com.example.backend.enums.PaymentMethod;
import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MM/yyyy")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    
    private String formatCurrency(Long amount) {
        if (amount == null) return "0 VNĐ";
        NumberFormat format = NumberFormat.getNumberInstance(Locale.forLanguageTag("vi-VN"));
        return format.format(amount) + " VNĐ";
    }
    
    private String getPaymentMethodText(PaymentMethod paymentMethod) {
        if (paymentMethod == null) return "N/A";
        return switch (paymentMethod) {
            case CASH -> "Tiền mặt";
            case BANK_TRANSFER -> "Chuyển khoản ngân hàng";
            default -> paymentMethod.name();
        };
    }
    
    /**
     * Tạo font hỗ trợ UTF-8 cho tiếng Việt
     * Ưu tiên: classpath resources -> hệ thống file -> tên font -> fallback
     */
    private PdfFont getVietnameseFont() {
        // 1. Thử load font từ classpath resources trước (ưu tiên cao nhất)
        String[] classpathFonts = {
            "fonts/NotoSans-Regular.ttf",
            "fonts/NotoSans-Vietnamese.ttf",
            "fonts/Arial-Unicode-MS.ttf",
            "fonts/DejaVuSans.ttf",
            "fonts/LiberationSans-Regular.ttf"
        };
        
        for (String fontPath : classpathFonts) {
            try (java.io.InputStream fontStream = getClass().getClassLoader().getResourceAsStream(fontPath)) {
                if (fontStream != null) {
                    byte[] fontBytes = fontStream.readAllBytes();
                    PdfFont font = PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H);
                    log.info("Đã tải font từ classpath: {}", fontPath);
                    return font;
                }
            } catch (Exception e) {
                log.debug("Không tìm thấy font trong classpath: {} - {}", fontPath, e.getMessage());
            }
        }
        
        // 2. Thử load font từ hệ thống file
        String[] systemFonts = {
            // Windows fonts
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/arialuni.ttf",  // Arial Unicode MS - tốt nhất cho Unicode
            "C:/Windows/Fonts/times.ttf",
            "C:/Windows/Fonts/tahoma.ttf",
            "C:/Windows/Fonts/verdana.ttf",
            "C:/Windows/Fonts/msyh.ttf",      // Microsoft YaHei
            "C:/Windows/Fonts/simsun.ttc",    // SimSun
            // Linux fonts (Alpine/Debian/Ubuntu)
            "/usr/share/fonts/noto/NotoSans-Regular.ttf",
            "/usr/share/fonts/TTF/NotoSans-Regular.ttf",
            "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/TTF/DejaVuSans.ttf",
            "/usr/share/fonts/TTF/LiberationSans-Regular.ttf",
            // Mac fonts
            "/System/Library/Fonts/Supplemental/Arial.ttf",
            "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"
        };
        
        for (String fontPath : systemFonts) {
            try {
                java.io.File fontFile = new java.io.File(fontPath);
                if (fontFile.exists()) {
                    byte[] fontBytes = java.nio.file.Files.readAllBytes(fontFile.toPath());
                    PdfFont font = PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H);
                    log.info("Đã tải font từ file hệ thống: {}", fontPath);
                    return font;
                }
            } catch (Exception e) {
                // Tiếp tục thử font tiếp theo
            }
        }
        
        // 3. Thử load bằng tên font (iText sẽ tự tìm trong hệ thống)
        String[] fontNames = {
            "Arial Unicode MS",
            "Arial",
            "Times New Roman",
            "Tahoma",
            "Verdana",
            "Microsoft YaHei",
            "SimSun",
            "Liberation Sans",
            "DejaVu Sans",
            "Noto Sans"
        };
        
        for (String fontName : fontNames) {
            try {
                PdfFont font = PdfFontFactory.createFont(fontName, PdfEncodings.IDENTITY_H);
                log.info("Đã sử dụng font hệ thống: {}", fontName);
                return font;
            } catch (Exception e) {
                log.debug("Không tìm thấy font: {}", fontName);
            }
        }
        
        // 4. Fallback cuối cùng: StandardFonts (có thể mất ký tự tiếng Việt)
        log.warn("Không tìm thấy font hỗ trợ Unicode, sử dụng StandardFonts (có thể mất ký tự tiếng Việt)");
        try {
            return PdfFontFactory.createFont(StandardFonts.HELVETICA);
        } catch (IOException e) {
            log.error("Lỗi khi tạo font fallback: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo font", e);
        }
    }
    
    /**
     * Tạo PDF hóa đơn cho học viên
     */
    public byte[] generateStudentInvoice(PaymentResponse payment) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdfDoc = new PdfDocument(writer);
             Document document = new Document(pdfDoc, PageSize.A4)) {
            
            pdfDoc.setTagged();
            
            // Tạo font và set cho document
            PdfFont font = getVietnameseFont();
            document.setFont(font);
            
            // Header
            addHeader(document, font, "HÓA ĐƠN THANH TOÁN HỌC PHÍ", payment.getPaymentId());
            
            // Company Info
            addCompanyInfo(document, font);
            
            // Student Info
            if (payment.getStudent() != null) {
                addStudentInfo(document, font, payment.getStudent().getFullName(), 
                             payment.getClazz() != null ? payment.getClazz().getName() : null);
            }
            
            // Invoice Details
            addInvoiceDetails(document, font, payment);
            
            // Payment Summary
            addPaymentSummary(document, font, payment);
            
            // Footer
            addFooter(document, font, payment);
            
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Lỗi khi tạo PDF hóa đơn học viên: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo hóa đơn PDF", e);
        }
    }
    
    /**
     * Tạo PDF hóa đơn cho giáo viên
     */
    public byte[] generateTeacherInvoice(PaymentResponse payment) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             PdfWriter writer = new PdfWriter(baos);
             PdfDocument pdfDoc = new PdfDocument(writer);
             Document document = new Document(pdfDoc, PageSize.A4)) {
            
            pdfDoc.setTagged();
            
            // Tạo font và set cho document
            PdfFont font = getVietnameseFont();
            document.setFont(font);
            
            // Header
            addHeader(document, font, "HÓA ĐƠN THANH TOÁN LƯƠNG", payment.getPaymentId());
            
            // Company Info
            addCompanyInfo(document, font);
            
            // Teacher Info
            if (payment.getTeacher() != null) {
                addTeacherInfo(document, font, payment.getTeacher().getFullName());
            }
            
            // Salary Breakdown
            addSalaryBreakdown(document, font, payment);
            
            // Payment Summary
            addPaymentSummary(document, font, payment);
            
            // Footer
            addFooter(document, font, payment);
            
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Lỗi khi tạo PDF hóa đơn giáo viên: {}", e.getMessage(), e);
            throw new RuntimeException("Không thể tạo hóa đơn PDF", e);
        }
    }
    
    private void addHeader(Document document, PdfFont font, String title, String invoiceId) {
        Paragraph titlePara = new Paragraph(title)
                .setFont(font)
                .setFontSize(24)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(10);
        document.add(titlePara);
        
        Paragraph invoicePara = new Paragraph("Mã hóa đơn: " + invoiceId)
                .setFont(font)
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(invoicePara);
    }
    
    private void addCompanyInfo(Document document, PdfFont font) {
        Paragraph companyPara = new Paragraph("HỆ THỐNG QUẢN LÝ LỚP HỌC")
                .setFont(font)
                .setFontSize(14)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(5);
        document.add(companyPara);
        
        Paragraph addressPara = new Paragraph("Địa chỉ: Việt Nam")
                .setFont(font)
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
        document.add(addressPara);
    }
    
    private void addStudentInfo(Document document, PdfFont font, String studentName, String className) {
        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 3}))
                .useAllAvailableWidth()
                .setMarginBottom(20);
        
        infoTable.addCell(createCell(font, "Học viên:", true));
        infoTable.addCell(createCell(font, studentName, false));
        
        if (className != null && !className.trim().isEmpty()) {
            infoTable.addCell(createCell(font, "Lớp học:", true));
            infoTable.addCell(createCell(font, className, false));
        }
        
        document.add(infoTable);
    }
    
    private void addTeacherInfo(Document document, PdfFont font, String teacherName) {
        Table infoTable = new Table(UnitValue.createPercentArray(new float[]{1, 3}))
                .useAllAvailableWidth()
                .setMarginBottom(20);
        
        infoTable.addCell(createCell(font, "Giáo viên:", true));
        infoTable.addCell(createCell(font, teacherName, false));
        
        document.add(infoTable);
    }
    
    private void addInvoiceDetails(Document document, PdfFont font, PaymentResponse payment) {
        Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{2, 1, 1.5f, 1.5f}))
                .useAllAvailableWidth()
                .setMarginBottom(20);
        
        // Header row
        detailsTable.addHeaderCell(createHeaderCell(font, "Mô tả"));
        detailsTable.addHeaderCell(createHeaderCell(font, "Tháng"));
        detailsTable.addHeaderCell(createHeaderCell(font, "Số tiền"));
        detailsTable.addHeaderCell(createHeaderCell(font, "Đã thanh toán"));
        
        // Data row
        String description = payment.getClazz() != null 
            ? "Học phí lớp " + payment.getClazz().getName()
            : "Học phí";
        String month = payment.getBillingMonth() != null 
            ? MONTH_FORMATTER.format(payment.getBillingMonth())
            : "N/A";
        
        detailsTable.addCell(createCell(font, description, false));
        detailsTable.addCell(createCell(font, month, false));
        detailsTable.addCell(createCell(font, formatCurrency(payment.getFeeSnapshot()), false));
        detailsTable.addCell(createCell(font, formatCurrency(payment.getPaid()), false));
        
        document.add(detailsTable);
    }
    
    private void addSalaryBreakdown(Document document, PdfFont font, PaymentResponse payment) {
        Table breakdownTable = new Table(UnitValue.createPercentArray(new float[]{2, 2}))
                .useAllAvailableWidth()
                .setMarginBottom(20);
        
        breakdownTable.addHeaderCell(createHeaderCell(font, "Chi tiết"));
        breakdownTable.addHeaderCell(createHeaderCell(font, "Số tiền"));
        
        breakdownTable.addCell(createCell(font, "Lương cơ bản:", false));
        breakdownTable.addCell(createCell(font, formatCurrency(payment.getFeeSnapshot()), false));
        
        if (payment.getBonus() != null && payment.getBonus() > 0) {
            breakdownTable.addCell(createCell(font, "Thưởng:", false));
            breakdownTable.addCell(createCell(font, "+ " + formatCurrency(payment.getBonus()), false));
        }
        
        if (payment.getDeduction() != null && payment.getDeduction() > 0) {
            breakdownTable.addCell(createCell(font, "Khấu trừ:", false));
            breakdownTable.addCell(createCell(font, "- " + formatCurrency(payment.getDeduction()), false));
        }
        
        document.add(breakdownTable);
    }
    
    private void addPaymentSummary(Document document, PdfFont font, PaymentResponse payment) {
        Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{2, 2}))
                .useAllAvailableWidth()
                .setMarginBottom(20);
        
        summaryTable.addCell(createCell(font, "Tổng tiền:", true));
        summaryTable.addCell(createCell(font, formatCurrency(payment.getPaid()), true));
        
        summaryTable.addCell(createCell(font, "Phương thức thanh toán:", true));
        summaryTable.addCell(createCell(font, getPaymentMethodText(payment.getPaymentMethod()), false));
        
        summaryTable.addCell(createCell(font, "Ngày thanh toán:", true));
        String paymentDate = payment.getCreatedAt() != null 
            ? DATETIME_FORMATTER.format(payment.getCreatedAt())
            : "N/A";
        summaryTable.addCell(createCell(font, paymentDate, false));
        
        if (payment.getNote() != null && !payment.getNote().trim().isEmpty()) {
            summaryTable.addCell(createCell(font, "Ghi chú:", true));
            summaryTable.addCell(createCell(font, payment.getNote(), false));
        }
        
        document.add(summaryTable);
    }
    
    private void addFooter(Document document, PdfFont font, PaymentResponse payment) {
        Paragraph footerPara = new Paragraph("\n\nCảm ơn bạn đã sử dụng dịch vụ của chúng tôi!")
                .setFont(font)
                .setFontSize(10)
                .setTextAlignment(TextAlignment.CENTER)
                .setItalic()
                .setMarginTop(30);
        document.add(footerPara);
        
        Paragraph datePara = new Paragraph("Ngày xuất: " + DATE_FORMATTER.format(payment.getCreatedAt()))
                .setFont(font)
                .setFontSize(9)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginTop(10);
        document.add(datePara);
    }
    
    private Cell createHeaderCell(PdfFont font, String text) {
        return new Cell()
                .add(new Paragraph(text).setFont(font).setBold())
                .setBackgroundColor(ColorConstants.LIGHT_GRAY)
                .setPadding(8)
                .setTextAlignment(TextAlignment.CENTER);
    }
    
    private Cell createCell(PdfFont font, String text, boolean isBold) {
        Paragraph para = new Paragraph(text).setFont(font);
        if (isBold) {
            para.setBold();
        }
        Cell cell = new Cell()
                .add(para)
                .setPadding(8);
        if (isBold) {
            cell.setBackgroundColor(ColorConstants.WHITE);
        }
        return cell;
    }
}

