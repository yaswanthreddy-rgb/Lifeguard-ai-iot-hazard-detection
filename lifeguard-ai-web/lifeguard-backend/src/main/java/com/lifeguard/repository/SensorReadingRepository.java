package com.lifeguard.repository;

import com.lifeguard.model.SensorReading;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    Optional<SensorReading> findFirstByOrderByCreatedAtDesc();

    List<SensorReading> findAllByOrderByCreatedAtDesc(Pageable pageable);

    List<SensorReading> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    List<SensorReading> findByAlertsContainingOrderByCreatedAtDesc(String alert, Pageable pageable);

    long countByStatus(String status);

    long countByAlertsContaining(String alert);

    @Query("select avg(r.temperature) from SensorReading r")
    Double averageTemperature();

    @Query("select avg(r.humidity) from SensorReading r")
    Double averageHumidity();

    @Query("select max(r.temperature) from SensorReading r")
    Double maxTemperature();

    @Query("select max(r.gas) from SensorReading r")
    Integer maxGas();
}
