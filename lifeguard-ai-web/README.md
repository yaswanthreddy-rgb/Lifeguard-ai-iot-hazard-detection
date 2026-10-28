# LifeGuard AI - React + Spring Boot website

```
ESP32 sensors --(Wi-Fi, HTTP POST JSON)--> Spring Boot (port 8080) --> database
                                                   ^
React dashboard (port 5173) --(GET every 2 s)------+
```

## What is inside
| Folder | What it is |
|---|---|
| `lifeguard-backend/` | Spring Boot 3 (Java 17) REST API + database |
| `lifeguard-frontend/` | React (Vite) dashboard |
| `esp32/lifeguard_esp32/` | Arduino sketch that sends sensor data to the backend |

## You need
- JDK 17 or newer
- Maven (or open the backend folder in IntelliJ IDEA / VS Code, which includes it)
- Node.js 18 or newer

## 1. Run the backend
```
cd lifeguard-backend
mvn spring-boot:run
```
(In IntelliJ: open `lifeguard-backend`, then run `LifeGuardApplication`.)

It starts on http://localhost:8080 with an H2 database file, so nothing else needs installing.

Quick check in a browser: http://localhost:8080/api/config should show the limits.

## The website has 5 pages
| Page | Address | What it shows |
|---|---|---|
| Home | `/` | What the system does, with a live status panel |
| Dashboard | `/dashboard` | Live readings, chart, recent alerts, test buttons |
| Alerts | `/alerts` | Alert history, totals, filter by fire/gas/heat, CSV download |
| How it works | `/how-it-works` | Parts, wiring table, alert rules, setup steps |
| About | `/about` | Project details. Edit the team names in `src/pages/About.jsx` |

## 2. Run the website (development)
```
cd lifeguard-frontend
npm install
npm run dev
```
Open http://localhost:5173

## 3. Test without hardware
Press **Send test reading** (or tick "Send a test reading every 3 seconds").
You will see the readings, the chart, and now and then a danger alert.

## 4. Connect the real ESP32
1. Find your laptop's IP: run `ipconfig` and copy the **IPv4 Address** of your Wi-Fi.
2. Open `esp32/lifeguard_esp32/lifeguard_esp32.ino` and set `WIFI_SSID`, `WIFI_PASS`, and `SERVER_URL` (use your laptop IP).
3. The laptop and ESP32 must be on the **same Wi-Fi** (a phone hotspot works).
4. Allow port 8080 through Windows Firewall the first time Windows asks ("Allow access" for Java).
5. Upload the sketch. The Serial Monitor shows `Server replied: 200` when it works, and the dashboard turns live.

## API
| Method | URL | Purpose |
|---|---|---|
| POST | `/api/readings` | ESP32 sends `{"temperature":29.5,"humidity":65,"gas":640,"flame":false}` |
| GET | `/api/readings/latest` | newest reading |
| GET | `/api/readings?limit=30` | recent readings for the chart |
| GET | `/api/alerts?limit=10&type=FIRE` | recent alerts (type is optional: FIRE, GAS or HEAT) |
| GET | `/api/stats` | totals and averages for the Alerts page |
| GET | `/api/readings/export` | download readings as CSV |
| GET | `/api/config` | alert limits |
| POST | `/api/simulate` | fake reading for testing |

Test the POST without the ESP32 (Windows PowerShell):
```
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/readings -ContentType "application/json" -Body '{"temperature":31.2,"humidity":60,"gas":2500,"flame":false}'
```

## Emergency notifications

When a reading detects fire, gas/smoke, or high temperature, the backend immediately
creates one emergency message containing the sensor values and sends it by Twilio SMS
and voice call to every configured police, hospital, fire-station, and neighbour
number. No notification is sent until all Twilio settings and at least one recipient
number are configured.

Set these environment variables before starting Spring Boot. Phone numbers must use
the international E.164 format, such as `+15551234567`. Multiple numbers are
comma-separated:

```text
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM_NUMBER=+15550000000
LIFEGUARD_POLICE_NUMBERS=+15550000001
LIFEGUARD_HOSPITAL_NUMBERS=+15550000002
LIFEGUARD_FIRE_STATION_NUMBERS=+15550000003
LIFEGUARD_NEIGHBOUR_NUMBERS=+15550000004,+15550000005
```

The dashboard and Alerts page display whether each emergency notification is
`SENDING`, `SENT`, `PARTIAL`, `FAILED`, or `NOT_CONFIGURED`. Keep Twilio credentials
in environment variables or a secret manager; do not commit them to source control.

## Run everything from one server (optional)
Build the website and let Spring Boot serve it:
```
cd lifeguard-frontend
npm run build
```
Copy everything inside `lifeguard-frontend/dist/` into `lifeguard-backend/src/main/resources/static/`,
restart the backend, and open http://localhost:8080. The whole website now runs on port 8080.

## Switch to MySQL (your project stack)
1. In MySQL run: `CREATE DATABASE lifeguard;`
2. In `lifeguard-backend/src/main/resources/application.properties`, comment the H2 lines and uncomment the MySQL lines, then set your password.
3. Restart the backend. Tables are created automatically.

## Change alert limits
Edit `lifeguard.temp-limit` and `lifeguard.gas-limit` in `application.properties`.
(The ESP32 sketch has its own `TEMP_LIMIT` / `GAS_LIMIT` for the buzzer.)

## Troubleshooting
- Dashboard says "Can't reach the server": the backend is not running on port 8080.
- ESP32 prints `Server replied: -1`: wrong IP, different Wi-Fi, or the firewall is blocking port 8080.
- ESP32 prints `Server replied: 400`: the JSON was malformed; check the Serial Monitor output.
