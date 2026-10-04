package com.medicine.reminder.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addRedirectViewController("/dashboard.html", "/");
        registry.addRedirectViewController("/medicines.html", "/");
        registry.addRedirectViewController("/reminders.html", "/");
        registry.addRedirectViewController("/history.html", "/");
        registry.addRedirectViewController("/profiles.html", "/");
        registry.addRedirectViewController("/mentors.html", "/");
    }
}
