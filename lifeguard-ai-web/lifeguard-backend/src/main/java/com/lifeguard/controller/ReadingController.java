package com.lifeguard.controller;

import com.lifeguard.model.ReadingRequest;
import com.lifeguard.model.SensorReading;
import com.lifeguard.service.ReadingService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ReadingController {

    private final ReadingService service;

    public ReadingController(ReadingService service) {
        this.service = service;
    }

    /** The ESP32 posts its sensor values here. */
    @PostMapping("/readings")
    public SensorReading add(@RequestBody ReadingRequest request) {
        return service.save(request, "IOT");
    }

    /** Newest reading, or 204 No Content when nothing has been received yet. */
    @GetMapping("/readings/latest")
    public ResponseEntity<SensorReading> latest() {
        return service.latest()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    /** Recent readings, oldest first, for the chart. */
    @GetMapping("/readings")
    public List<SensorReading> recent(@RequestParam(defaultValue = "30") int limit) {
        return service.recent(limit);
    }

    /** Recent readings that triggered an alert, newest first. Optional ?type=FIRE|GAS|HEAT. */
    @GetMapping("/alerts")
    public List<SensorReading> alerts(@RequestParam(defaultValue = "10") int limit,
                                      @RequestParam(required = false) String type) {
        return service.alerts(limit, type);
    }

    /** Totals and averages for the alerts page. */
    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return service.stats();
    }

    /** Download stored readings as a CSV file (opens in Excel). */
    @GetMapping("/readings/export")
    public ResponseEntity<String> export() {
        StringBuilder csv = new StringBuilder("time,temperature,humidity,gas,flame,status,alerts\n");
        for (SensorReading r : service.exportAll()) {
            csv.append(r.getCreatedAt()).append(',')
               .append(r.getTemperature() == null ? "" : r.getTemperature()).append(',')
               .append(r.getHumidity() == null ? "" : r.getHumidity()).append(',')
               .append(r.getGas() == null ? "" : r.getGas()).append(',')
               .append(r.getFlame()).append(',')
               .append(r.getStatus()).append(',')
               .append(r.getAlerts() == null ? "" : r.getAlerts().replace(',', ' ')).append('\n');
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=lifeguard-readings.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv.toString());
    }

    /** Alert limits, so the dashboard can show them. */
    @GetMapping("/config")
    public Map<String, Object> config() {
        return Map.of("tempLimit", service.getTempLimit(), "gasLimit", service.getGasLimit());
    }

    /** Creates a fake reading for testing without hardware. */
    @PostMapping("/simulate")
    public SensorReading simulate() {
        return service.simulate();
    }
}
