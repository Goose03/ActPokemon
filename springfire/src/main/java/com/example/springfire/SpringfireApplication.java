package com.example.springfire;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = "com.example")
public class SpringfireApplication {
    public static void main(String[] args) {
        SpringApplication.run(SpringfireApplication.class, args);
    }
}