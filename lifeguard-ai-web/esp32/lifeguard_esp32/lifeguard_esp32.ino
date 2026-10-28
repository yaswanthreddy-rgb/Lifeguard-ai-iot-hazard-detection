/*
  LifeGuard AI - ESP32 sensor node
  Reads DHT22, MQ-2, flame sensor, drives the buzzer, and sends the
  readings to the Spring Boot backend over Wi-Fi (HTTP POST, JSON).

  Libraries needed (Library Manager): "DHT sensor library" and
  "Adafruit Unified Sensor". WiFi and HTTPClient come with the ESP32 package.
*/
#include <WiFi.h>
#include <HTTPClient.h>
#include "DHT.h"

// ---------- CHANGE THESE THREE ----------
const char* WIFI_SSID  = "YOUR_WIFI_NAME";
const char* WIFI_PASS  = "YOUR_WIFI_PASSWORD";
// IP address of the laptop running Spring Boot (Windows: run `ipconfig`, use IPv4 Address)
const char* SERVER_URL = "http://192.168.1.50:8080/api/readings";

// ---------- Pins ----------
#define DHT_PIN     32
#define MQ2_PIN     34
#define FLAME_PIN   35
#define BUZZER_PIN  26

// ---------- Local alarm limits (buzzer works even if Wi-Fi is down) ----------
#define TEMP_LIMIT  50.0
#define GAS_LIMIT   2000

DHT dht(DHT_PIN, DHT22);

unsigned long lastSend = 0;
const unsigned long SEND_INTERVAL = 3000;   // every 3 seconds

void connectWiFi() {
  Serial.printf("Connecting to Wi-Fi '%s'", WIFI_SSID);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500);
    Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("\nConnected. ESP32 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWi-Fi failed. Will retry.");
  }
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(FLAME_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  analogReadResolution(12);

  connectWiFi();

  Serial.println("MQ-2 warming up (20 seconds)...");
  delay(20000);
  Serial.println("System ready.");
}

void loop() {
  if (millis() - lastSend < SEND_INTERVAL) return;
  lastSend = millis();

  // 1. Read sensors
  float temp = dht.readTemperature();
  float hum  = dht.readHumidity();
  int gas    = analogRead(MQ2_PIN);
  bool flame = (digitalRead(FLAME_PIN) == LOW);   // LOW = flame detected
  bool dhtOk = !(isnan(temp) || isnan(hum));

  // 2. Local buzzer
  bool danger = flame || (gas > GAS_LIMIT) || (dhtOk && temp > TEMP_LIMIT);
  digitalWrite(BUZZER_PIN, danger ? HIGH : LOW);

  Serial.printf("T=%.1f H=%.1f Gas=%d Flame=%s\n",
                dhtOk ? temp : -1.0, dhtOk ? hum : -1.0, gas, flame ? "YES" : "no");

  // 3. Make sure Wi-Fi is still connected
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
    if (WiFi.status() != WL_CONNECTED) return;
  }

  // 4. Send JSON to Spring Boot
  String json = "{";
  json += "\"temperature\":" + (dhtOk ? String(temp, 1) : String("null"));
  json += ",\"humidity\":"   + (dhtOk ? String(hum, 1)  : String("null"));
  json += ",\"gas\":" + String(gas);
  json += ",\"flame\":" + String(flame ? "true" : "false");
  json += "}";

  HTTPClient http;
  http.begin(SERVER_URL);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(json);
  Serial.printf("Server replied: %d\n", code);   // 200 = OK
  http.end();
}
