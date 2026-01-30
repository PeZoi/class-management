package com.example.backend.config;

import com.example.backend.dto.classroom.ClassResponse;
import com.example.backend.entity.Class;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeMap;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SystemConfiguration {
    @Bean
    public ModelMapper modelMapper(){
        ModelMapper mapper = new ModelMapper();
        
        // Cấu hình để skip field classShifts khi map từ Class entity sang ClassResponse
        // Vì chúng ta sẽ tự map classShifts bằng cách khác (mapClassShifts method)
        // ModelMapper không thể tự động convert PersistentBag (Hibernate) sang List
        TypeMap<Class, ClassResponse> typeMap = mapper.createTypeMap(Class.class, ClassResponse.class);
        typeMap.addMappings(mapping -> mapping.skip(ClassResponse::setClassShifts));
        
        return mapper;
    }
}