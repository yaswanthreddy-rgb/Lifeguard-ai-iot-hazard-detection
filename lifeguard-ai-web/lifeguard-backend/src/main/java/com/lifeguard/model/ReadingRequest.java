package com.lifeguard.model;

/** JSON body sent by the ESP32: {"temperature":29.5,"humidity":65.2,"gas":640,"flame":false} */
public record ReadingRequest(Double temperature, Double humidity, Integer gas, Boolean flame) {
}
