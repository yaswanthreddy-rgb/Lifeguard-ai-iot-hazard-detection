package com.lifeguard.service;

import com.lifeguard.model.SensorReading;
import com.lifeguard.repository.SensorReadingRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Call;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class EmergencyNotificationService {
    private static final Logger log = LoggerFactory.getLogger(EmergencyNotificationService.class);

    private final String accountSid;
    private final String authToken;
    private final String fromNumber;
    private final SensorReadingRepository repository;
    private final List<RecipientGroup> groups;

    public EmergencyNotificationService(
            SensorReadingRepository repository,
            @Value("${lifeguard.notifications.twilio.account-sid:}") String accountSid,
            @Value("${lifeguard.notifications.twilio.auth-token:}") String authToken,
            @Value("${lifeguard.notifications.twilio.from-number:}") String fromNumber,
            @Value("${lifeguard.notifications.recipients.police:}") String police,
            @Value("${lifeguard.notifications.recipients.hospital:}") String hospital,
            @Value("${lifeguard.notifications.recipients.fire-station:}") String fireStation,
            @Value("${lifeguard.notifications.recipients.neighbours:}") String neighbours) {
        this.repository = repository;
        this.accountSid = accountSid.trim();
        this.authToken = authToken.trim();
        this.fromNumber = fromNumber.trim();
        this.groups = List.of(
                new RecipientGroup("Police", splitNumbers(police)),
                new RecipientGroup("Hospital", splitNumbers(hospital)),
                new RecipientGroup("Fire station", splitNumbers(fireStation)),
                new RecipientGroup("Neighbours", splitNumbers(neighbours)));
    }

    @Async
    public void notifyIfDanger(SensorReading reading) {
        if (!"DANGER".equals(reading.getStatus())) {
            return;
        }

        List<String> recipients = allRecipients();
        if (accountSid.isBlank() || authToken.isBlank() || fromNumber.isBlank() || recipients.isEmpty()) {
            log.warn("Emergency alert detected for reading {}, but Twilio notification settings are incomplete",
                    reading.getId());
            reading.setNotificationStatus("NOT_CONFIGURED");
            reading.setNotificationRecipients(String.join(", ", recipients));
            repository.save(reading);
            return;
        }

        reading.setNotificationStatus("SENDING");
        reading.setNotificationRecipients(String.join(", ", recipients));
        repository.save(reading);
        String message = buildMessage(reading);
        Twilio.init(accountSid, authToken);
        int sent = 0;
        for (String recipient : recipients) {
            try {
                Message.creator(new PhoneNumber(recipient), new PhoneNumber(fromNumber), message).create();
                Call.creator(new PhoneNumber(recipient), new PhoneNumber(fromNumber),
                        new com.twilio.type.Twiml("<Response><Say>" + escapeXml(message) + "</Say></Response>"))
                        .create();
                sent++;
            } catch (RuntimeException ex) {
                log.error("Failed to notify emergency recipient {}", recipient, ex);
            }
        }
        reading.setNotificationStatus(sent == recipients.size() ? "SENT" : sent == 0 ? "FAILED" : "PARTIAL");
        repository.save(reading);
        log.info("Emergency alert for reading {} sent to {}/{} recipients", reading.getId(), sent, recipients.size());
    }

    private String buildMessage(SensorReading reading) {
        return "LIFEGUARD EMERGENCY: " + describe(reading.getAlerts())
                + ". Temperature " + value(reading.getTemperature()) + " C, gas "
                + value(reading.getGas()) + ", flame " + (Boolean.TRUE.equals(reading.getFlame()) ? "detected" : "not detected")
                + ". Check the location immediately and contact emergency services if needed.";
    }

    private String describe(String alerts) {
        if (alerts == null || alerts.isBlank()) return "hazard detected";
        return alerts.replace("FIRE", "fire").replace("GAS", "gas or smoke").replace("HEAT", "high temperature");
    }

    private String value(Object value) {
        return value == null ? "unknown" : value.toString();
    }

    private List<String> allRecipients() {
        List<String> recipients = new ArrayList<>();
        groups.forEach(group -> recipients.addAll(group.numbers()));
        return recipients;
    }

    private static List<String> splitNumbers(String raw) {
        if (raw == null || raw.isBlank()) return List.of();
        return java.util.Arrays.stream(raw.split(","))
                .map(value -> value.trim())
                .filter(number -> !number.isBlank())
                .distinct()
                .toList();
    }

    private String escapeXml(String value) {
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private record RecipientGroup(String name, List<String> numbers) {}
}
