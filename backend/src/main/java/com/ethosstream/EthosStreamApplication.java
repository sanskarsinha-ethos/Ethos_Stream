package com.ethosstream;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EthosStreamApplication {

    public static void main(String[] args) {
        SpringApplication.run(EthosStreamApplication.class, args);
    }
}
