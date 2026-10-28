package com.lifeguard.service;

import com.lifeguard.model.ReadingRequest;
import com.lifeguard.model.SensorReading;
import com.lifeguard.repository.SensorReadingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class ReadingService {

    private final SensorReadingRepository repository;
    private final EmergencyNotificationService notifications;
    private final double tempLimit;
    private final int gasLimit;

    public ReadingService(SensorReadingRepository repository,
                          EmergencyNotificationService notifications,
                          @Value("${lifeguard.temp-limit}") double tempLimit,
                          @Value("${lifeguard.gas-limit}") int gasLimit) {
        this.repository = repository;
        this.notifications = notifications;
        this.tempLimit = tempLimit;
        this.gasLimit = gasLimit;
    }

    public double getTempLimit() { return tempLimit; }
    public int getGasLimit() { return gasLimit; }

    /** Saves a reading and decides whether it is SAFE or DANGER. */
    public SensorReading save(ReadingRequest request) {
        return save(request, "IOT");
    }

    public SensorReading save(ReadingRequest request, String source) {
        List<String> alerts = new ArrayList<>();
        if (Boolean.TRUE.equals(request.flame())) alerts.add("FIRE");
        if (request.gas() != null && request.gas() > gasLimit) alerts.add("GAS");
        if (request.temperature() != null && request.temperature() > tempLimit) alerts.add("HEAT");

        SensorReading reading = new SensorReading();
        reading.setTemperature(request.temperature());
        reading.setHumidity(request.humidity());
        reading.setGas(request.gas());
        reading.setFlame(Boolean.TRUE.equals(request.flame()));
        reading.setAlerts(String.join(",", alerts));
        reading.setSource(source);
        reading.setStatus(alerts.isEmpty() ? "SAFE" : "DANGER");
        reading.setCreatedAt(Instant.now());
        SensorReading saved = repository.save(reading);
        notifications.notifyIfDanger(saved);
        return saved;
    }

    public Optional<SensorReading> latest() {
        return repository.findFirstByOrderByCreatedAtDesc();
    }

    /** Most recent readings, oldest first (ready for a chart). */
    public List<SensorReading> recent(int limit) {
        List<SensorReading> list =
                new ArrayList<>(repository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, clamp(limit))));
        Collections.reverse(list);
        return list;
    }

    /** Most recent readings that raised an alert, newest first. Optional type: FIRE, GAS or HEAT. */
    public List<SensorReading> alerts(int limit, String type) {
        PageRequest page = PageRequest.of(0, clamp(limit));
        if (type == null || type.isBlank()) {
            return repository.findByStatusOrderByCreatedAtDesc("DANGER", page);
        }
        return repository.findByAlertsContainingOrderByCreatedAtDesc(type.toUpperCase(), page);
    }

    /** Up to 5000 readings, newest first, for the CSV download. */
    public List<SensorReading> exportAll() {
        return repository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 5000));
    }

    /** Totals and averages for the alerts page. */
    public Map<String, Object> stats() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalReadings", repository.count());
        m.put("totalAlerts", repository.countByStatus("DANGER"));
        m.put("fireAlerts", repository.countByAlertsContaining("FIRE"));
        m.put("gasAlerts", repository.countByAlertsContaining("GAS"));
        m.put("heatAlerts", repository.countByAlertsContaining("HEAT"));
        Double avgT = repository.averageTemperature();
        Double avgH = repository.averageHumidity();
        m.put("avgTemperature", avgT == null ? null : round1(avgT));
        m.put("avgHumidity", avgH == null ? null : round1(avgH));
        m.put("maxTemperature", repository.maxTemperature());
        m.put("maxGas", repository.maxGas());
        return m;
    }

    /** Fake reading so the dashboard can be tested without the ESP32. */
    public SensorReading simulate() {
        ThreadLocalRandom r = ThreadLocalRandom.current();
        double temp = round1(28 + r.nextDouble() * 4);
        double humidity = round1(55 + r.nextDouble() * 15);
        int gas = 500 + r.nextInt(400);
        boolean flame = false;

        int roll = r.nextInt(100);
        if (roll < 6) {
            flame = true;
        } else if (roll < 12) {
            gas = gasLimit + 200 + r.nextInt(800);
        } else if (roll < 17) {
            temp = round1(tempLimit + 2 + r.nextDouble() * 8);
        }
        return save(new ReadingRequest(temp, humidity, gas, flame), "SIMULATION");
    }

    private int clamp(int limit) {
        return Math.max(1, Math.min(limit, 200));
    }

    private double round1(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
