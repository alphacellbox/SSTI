
package com.example.ssti;


import lombok.Data;

import java.util.Map;

@Data
public class Email {


    String text;

    String template;
    Map<String, Object> properties;
}