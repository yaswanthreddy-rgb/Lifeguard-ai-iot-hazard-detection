package com.lifeguard.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "sensor_readings")
public class SensorReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double temperature;   // degrees C (null if the DHT22 failed to read)
    private Double humidity;      // percent
    private Integer gas;          // MQ-2 ADC value, 0-4095
    private Boolean flame;        // true = flame detected
    private String status;        // SAFE or DANGER
    private String alerts;        // comma separated: FIRE,GAS,HEAT (empty when safe)
    private String source;        // IOT or SIMULATION
    private String notificationStatus;
    private String notificationRecipients;
    private Instant createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getTemperature() { return temperature; }
    public void setTemperature(Double temperature) { this.temperature = temperature; }

    public Double getHumidity() { return humidity; }
    public void setHumidity(Double humidity) { this.humidity = humidity; }

    public Integer getGas() { return gas; }
    public void setGas(Integer gas) { this.gas = gas; }

    public Boolean getFlame() { return flame; }
    public void setFlame(Boolean flame) { this.flame = flame; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAlerts() { return alerts; }
    public void setAlerts(String alerts) { this.alerts = alerts; }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getNotificationStatus() { return notificationStatus; }
    public void setNotificationStatus(String notificationStatus) { this.notificationStatus = notificationStatus; }

    public String getNotificationRecipients() { return notificationRecipients; }
    public void setNotificationRecipients(String notificationRecipients) { this.notificationRecipients = notificationRecipients; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
