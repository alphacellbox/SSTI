package com.example.ssti;

import lombok.AllArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;
import org.springframework.stereotype.Controller;
import javax.mail.MessagingException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("")
@AllArgsConstructor
public class TestController {

    private final SpringTemplateEngine templateEngine;

    public String sendHtmlMessage(Email email) throws MessagingException {


        Context context = new Context();
        context.setVariables(email.getProperties());

        return templateEngine.process(email.getTemplate(), context);


    }
    @GetMapping("/v")
    public String  hellman(){
        return "ccc";
    }

    @GetMapping("/{a}")
    public String test(@PathVariable String a) throws MessagingException {
        System.out.println("heyyyyyyyy");
       Email email=new Email();
        Map<String, Object> properties=new HashMap<>();
        properties.put("name","a}\"></span><span th:text=\"${T(java.lang.System).getenv()}\">Peter Static</span><span th:text=\"${a");
       email.setTemplate("welcome-email.html");
       email.setProperties(properties);
        return  sendHtmlMessage(email);
    }
}
