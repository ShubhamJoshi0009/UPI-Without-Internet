package com.demo.upimesh.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {

    @GetMapping("/classic")
    public String classic() {
        return "dashboard";
    }

    @GetMapping("/")
    public String home() {
        if (getClass().getResource("/static/index.html") != null) {
            return "forward:/index.html";
        }
        return "dashboard";
    }
}
