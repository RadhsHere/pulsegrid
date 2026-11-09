# PulseGrid 

Hey there! Welcome to **PulseGrid**—a real-time ICU telemetry dashboard I built to help tackle the chaos of hospital wards. 

Imagine being an ICU nurse trying to keep an eye on five different critical patients in five different rooms. It's overwhelming. I built this full-stack IoT platform to pull all those isolated bedside monitors into one centralized, zero-latency screen. It streams live vitals, calculates clinical risks on the fly, and flags emergencies so medical staff can react instantly.

---

## What makes it cool?

* **Blink-and-you-miss-it Data:** Instant streaming of Heart Rate, SpO₂ (Oxygen), and Temperature using MQTT and WebSockets.
* **A Built-in Safety Net (NEWS2):** The system constantly runs the math on patient vitals against the standard National Early Warning Score (NEWS2) scale. If things go south, it instantly throws a visual alert.
* **Interactive Alerts:** Clinicians can actually acknowledge and dismiss hazard warnings right from the dashboard so the whole team knows it's being handled.
* **Time-Travel for Vitals:** Click any bed to pull up a chronological history log of recent vitals to see exactly what happened over the last few hours.
* **Dark Mode by Default:** Because clinical environments are bright enough, and nobody likes eye strain.
* **Graceful Fallbacks:** Seamlessly handles offline sensors, disconnects, and unassigned beds without breaking the UI.

---

## The Tech Under the Hood

**The Look (Frontend)**
* React.js (Vite) for a snappy UI
* Socket.io-client for the live WebSocket feed
* Recharts for those smooth, real-time sparkline graphs
* Custom Tailwind-inspired CSS (optimized for dark mode)

**The Brains (Backend)**
* Node.js & Express.js
* Socket.io (WebSocket broadcasting)
* Aedes (Embedded MQTT Broker to catch IoT data)
* MongoDB (For remembering all that time-series data)

**The Edge (IoT Simulator)**
* A custom Node.js script acting as our bedside hardware, firing off synthetic patient vitals over MQTT.

---

## How it Actually Works

1. **Ingestion:** Bedside sensors (or the simulator) fire continuous vital payloads to the MQTT broker over TCP port `1883`.
2. **Processing:** The Node.js backend catches these packets, runs the clinical safety checks, and saves the history to MongoDB.
3. **Broadcasting:** The backend immediately blasts the processed data to all connected browser clients via Socket.io on port `5000`.
4. **Visualization:** The React dashboard updates specific bed components instantly without ever needing a page reload.

---

## Run it Yourself

### Prerequisites
* Node.js (v16 or higher)
* MongoDB (Local or Atlas)
