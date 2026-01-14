package com.example.backend.utils;


import com.example.backend.dto.ResponseDetail;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpResponse;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

@ControllerAdvice
public class FormatRestResponse implements ResponseBodyAdvice<Object> {
    private final ObjectMapper objectMapper;

    public FormatRestResponse(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        // Bỏ qua response wrapper cho byte[] (PDF, images, etc.)
        if (returnType.getParameterType() == byte[].class) {
            return false;
        }
        // Kiểm tra nếu return type là ResponseEntity<byte[]>
        if (org.springframework.http.ResponseEntity.class.isAssignableFrom(returnType.getParameterType())) {
            try {
                java.lang.reflect.Type genericType = returnType.getGenericParameterType();
                if (genericType instanceof java.lang.reflect.ParameterizedType) {
                    java.lang.reflect.ParameterizedType pt = (java.lang.reflect.ParameterizedType) genericType;
                    java.lang.reflect.Type[] actualTypes = pt.getActualTypeArguments();
                    if (actualTypes.length > 0 && actualTypes[0] == byte[].class) {
                        return false;
                    }
                }
            } catch (Exception e) {
                // Ignore
            }
        }
        return true;
    }

    @Override
    public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType, ServerHttpRequest request, ServerHttpResponse response) {
        HttpServletResponse httpServletResponse = ((ServletServerHttpResponse) response).getServletResponse();
        int status = httpServletResponse.getStatus();

        // Bỏ qua wrapper cho byte[] (PDF, images, etc.) và các binary content
        if (body instanceof byte[] || selectedContentType != null && 
            (selectedContentType.equals(MediaType.APPLICATION_PDF) || 
             selectedContentType.equals(MediaType.APPLICATION_OCTET_STREAM))) {
            return body;
        }

        ResponseDetail<Object> detailResponse = new ResponseDetail<>();
        detailResponse.setStatus(status);

        // Trường hợp thất bại (có lỗi gì đó)
        if (status >= 400) {
            if (body instanceof String) {
                try {
                    detailResponse.setData(body);
                    // Chuyển đổi đối tượng DetailResponse thành chuỗi JSON
                    return objectMapper.writeValueAsString(detailResponse);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
            return body;
        } else {
            // Trường hợp thành công
            detailResponse.setMessage("API call successful");
            detailResponse.setData(body);
        }

        if (body instanceof String) {
            try {
                // Chuyển đổi đối tượng DetailResponse thành chuỗi JSON
                return objectMapper.writeValueAsString(detailResponse);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return detailResponse;
    }
}