package com.company.product.api;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ProductApiApplication {

    @PostConstruct
    public void init() {
        System.out.println("Application started - 1.0.0");
    }

    public static void main(String[] args) {
        SpringApplication.run(ProductApiApplication.class, args);
    }
}
