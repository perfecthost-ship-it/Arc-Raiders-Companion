/*
  ARC Companion - Tactical Device Edition
  Arduino Uno R3 Edition
  
  Controls:
  - 7" LCD touchscreen display
  - RGB LED underglow
  - Button inputs (menu, select, back, quick action)
  - Raid timer
  - Blueprint tracker
  
  Hardware:
  - Arduino Uno R3
  - 7-8" HDMI LCD display (via USB)
  - WS2812B or standard LEDs
  - Tactile buttons (6-8)
  - 5V power supply
  
  Author: ARC Companion Project
  Version: 1.0
*/

#include <EEPROM.h>

// ============= PIN DEFINITIONS =============

// LED Pins
#define LED_UNDERGLOW_PIN 6        // PWM pin for LED control
#define LED_STATUS_BLUE 7          // Status indicator: Blue (power)
#define LED_STATUS_GREEN 8         // Status indicator: Green (active)
#define LED_STATUS_RED 9           // Status indicator: Red (alert)
#define LED_STATUS_YELLOW 10       // Status indicator: Yellow (busy)

// Button Pins
#define BTN_MENU 2                 // Menu button (interrupt)
#define BTN_SELECT 3               // Select button (interrupt)
#define BTN_BACK 4                 // Back button
#define BTN_ACTION 5               // Quick action button

// Audio Pin
#define BUZZER_PIN 11              // Piezo buzzer (optional)

// ============= MENU STATES =============

enum MenuState {
  STATE_HOME,
  STATE_BLUEPRINTS,
  STATE_BLUEPRINT_DETAIL,
  STATE_TIMER,
  STATE_STATS,
  STATE_LED_CONTROL,
  STATE_SETTINGS
};

// ============= BLUEPRINT DATA =============

struct Blueprint {
  char name[30];
  char rarity[15];      // "Rare", "Epic", "Uncommon"
  char source[20];      // Map location
  byte materials;       // Material count
  bool found;           // Found?
  bool in_inventory;    // In inventory?
  bool learned;         // Learned?
};

// Demo blueprints
Blueprint blueprints[] = {
  {"Exo Suit Frame", "Rare", "Launch Tower", 4, false, false, false},
  {"Energy Cannon", "Epic", "Buried City", 3, false, false, false},
  {"Shield Core", "Rare", "Blue Gate", 3, false, false, false},
  {"Thermal Scope", "Uncommon", "Spaceport", 2, false, false, false},
  {"Reinforced Plating", "Rare", "Stella Montis", 5, false, false, false}
};

const int NUM_BLUEPRINTS = 5;

// ============= GLOBAL STATE =============

MenuState currentMenu = STATE_HOME;
int selectedBlueprint = 0;
int displayBrightness = 255;

// Timer variables
unsigned long timerStart = 0;
bool timerRunning = false;
unsigned int timerSeconds = 0;

// LED state
byte ledRed = 0, ledGreen = 0, ledBlue = 255;  // Start with blue

// ============= SETUP =============

void setup() {
  // Serial communication for display (USB to LCD)
  Serial.begin(9600);
  
  // Pin modes
  pinMode(LED_UNDERGLOW_PIN, OUTPUT);
  pinMode(LED_STATUS_BLUE, OUTPUT);
  pinMode(LED_STATUS_GREEN, OUTPUT);
  pinMode(LED_STATUS_RED, OUTPUT);
  pinMode(LED_STATUS_YELLOW, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  
  pinMode(BTN_MENU, INPUT_PULLUP);
  pinMode(BTN_SELECT, INPUT_PULLUP);
  pinMode(BTN_BACK, INPUT_PULLUP);
  pinMode(BTN_ACTION, INPUT_PULLUP);
  
  // Attach interrupts for quick response
  attachInterrupt(digitalPinToInterrupt(BTN_MENU), buttonMenu, FALLING);
  attachInterrupt(digitalPinToInterrupt(BTN_SELECT), buttonSelect, FALLING);
  
  // Initialize display
  displayClear();
  displayHeader("▲ ARC COMPANION ▼", "TACTICAL DEVICE");
  delay(2000);
  
  // Set initial LED state (blue = power on)
  setLED(0, 0, 255);  // Blue
  setStatusLED(LED_STATUS_BLUE, HIGH);
  
  // Initialize blueprint data from EEPROM
  loadBlueprintData();
  
  // Show home screen
  showMenuHome();
}

// ============= MAIN LOOP =============

void loop() {
  // Update timer if running
  if (timerRunning) {
    updateTimer();
  }
  
  // Check buttons (non-interrupt driven)
  checkButtonBack();
  checkButtonAction();
  
  // Update display based on current menu
  updateDisplay();
  
  delay(50);  // Debounce delay
}

// ============= BUTTON HANDLERS =============

void buttonMenu() {
  // Debounce
  delay(20);
  if (digitalRead(BTN_MENU) == HIGH) return;
  
  currentMenu = STATE_HOME;
  showMenuHome();
  playBeep(1);
}

void buttonSelect() {
  delay(20);
  if (digitalRead(BTN_SELECT) == HIGH) return;
  
  // Handle selection based on current menu
  switch(currentMenu) {
    case STATE_BLUEPRINTS:
      currentMenu = STATE_BLUEPRINT_DETAIL;
      showBlueprintDetail(selectedBlueprint);
      break;
    case STATE_BLUEPRINT_DETAIL:
      // Toggle state
      cycleBlueprint(selectedBlueprint);
      break;
    case STATE_TIMER:
      if (!timerRunning) {
        timerRunning = true;
        timerStart = millis();
        setLED(255, 255, 0);  // Yellow while timing
      }
      break;
  }
  playBeep(1);
}

void checkButtonBack() {
  if (digitalRead(BTN_BACK) == LOW) {
    delay(20);
    if (digitalRead(BTN_BACK) == LOW) {
      if (currentMenu != STATE_HOME) {
        currentMenu = STATE_HOME;
        showMenuHome();
      }
      playBeep(1);
      while(digitalRead(BTN_BACK) == LOW) delay(10);  // Wait for release
      delay(20);
    }
  }
}

void checkButtonAction() {
  if (digitalRead(BTN_ACTION) == LOW) {
    delay(20);
    if (digitalRead(BTN_ACTION) == LOW) {
      // Quick action: pause timer or return home
      if (timerRunning) {
        timerRunning = false;
        setLED(0, 255, 0);  // Green when paused
      }
      playBeep(2);  // Double beep
      while(digitalRead(BTN_ACTION) == LOW) delay(10);
      delay(20);
    }
  }
}

// ============= MENU DISPLAY FUNCTIONS =============

void showMenuHome() {
  currentMenu = STATE_HOME;
  displayClear();
  displayHeader("▲ ARC COMPANION ▼", "");
  
  Serial.println("█ MAIN MENU");
  Serial.println("");
  Serial.println("[1] BLUEPRINTS");
  Serial.println("[2] RAID TIMER");
  Serial.println("[3] STATISTICS");
  Serial.println("[4] LED CONTROL");
  Serial.println("[5] SETTINGS");
  Serial.println("");
  Serial.println("Press MENU to select");
}

void showMenuBlueprints() {
  currentMenu = STATE_BLUEPRINTS;
  displayClear();
  displayHeader("█ BLUEPRINTS", "Select to view");
  
  for (int i = 0; i < NUM_BLUEPRINTS; i++) {
    if (i == selectedBlueprint) {
      Serial.print("► ");
    } else {
      Serial.print("  ");
    }
    Serial.print(blueprints[i].name);
    Serial.print(" [");
    Serial.print(blueprints[i].rarity);
    Serial.println("]");
  }
}

void showBlueprintDetail(int index) {
  Blueprint& bp = blueprints[index];
  
  displayClear();
  displayHeader(bp.name, bp.rarity);
  
  Serial.println("");
  Serial.print("📍 ");
  Serial.println(bp.source);
  Serial.print("🔧 ");
  Serial.print(bp.materials);
  Serial.println(" materials needed");
  Serial.println("");
  
  // Show status
  Serial.print("FOUND: ");
  Serial.println(bp.found ? "✓ YES" : "  NO");
  
  Serial.print("INVENTORY: ");
  Serial.println(bp.in_inventory ? "✓ YES" : "  NO");
  
  Serial.print("LEARNED: ");
  Serial.println(bp.learned ? "✓ YES" : "  NO");
  
  Serial.println("");
  Serial.println("SELECT: Toggle status | BACK: Return");
}

void showMenuTimer() {
  currentMenu = STATE_TIMER;
  displayClear();
  displayHeader("█ RAID TIMER", "");
  
  Serial.println("");
  // Display timer
  int mins = timerSeconds / 60;
  int secs = timerSeconds % 60;
  Serial.print("      ");
  if (mins < 10) Serial.print("0");
  Serial.print(mins);
  Serial.print(":");
  if (secs < 10) Serial.print("0");
  Serial.println(secs);
  Serial.println("");
  
  if (timerRunning) {
    Serial.println("[SELECT: RUNNING...]");
    Serial.println("[ACTION: PAUSE]");
  } else {
    Serial.println("[SELECT: START]");
    Serial.println("[ACTION: RESET]");
  }
}

void showMenuStats() {
  currentMenu = STATE_STATS;
  displayClear();
  displayHeader("█ STATISTICS", "Blueprint Progress");
  
  // Count stats
  int found = 0, inventory = 0, learned = 0;
  for (int i = 0; i < NUM_BLUEPRINTS; i++) {
    if (blueprints[i].found) found++;
    if (blueprints[i].in_inventory) inventory++;
    if (blueprints[i].learned) learned++;
  }
  
  int completion = (learned * 100) / NUM_BLUEPRINTS;
  
  Serial.println("");
  Serial.print("TOTAL: ");
  Serial.println(NUM_BLUEPRINTS);
  Serial.print("FOUND: ");
  Serial.println(found);
  Serial.print("IN INVENTORY: ");
  Serial.println(inventory);
  Serial.print("LEARNED: ");
  Serial.println(learned);
  Serial.println("");
  Serial.print("COMPLETION: ");
  Serial.print(completion);
  Serial.println("%");
}

void showMenuLED() {
  currentMenu = STATE_LED_CONTROL;
  displayClear();
  displayHeader("█ LED UNDERGLOW", "Color Control");
  
  Serial.println("");
  Serial.println("[1] 🔵 BLUE   (Power)");
  Serial.println("[2] 🟢 GREEN  (Active)");
  Serial.println("[3] 🔴 RED    (Alert)");
  Serial.println("[4] 🟡 YELLOW (Busy)");
  Serial.println("[5] 🟣 PURPLE (Menu)");
  Serial.println("[6] ⚫ OFF");
  Serial.println("");
  Serial.println("Select color to activate");
}

// ============= UPDATE FUNCTIONS =============

void updateDisplay() {
  // In a real system with physical LCD, update the screen here
  // For now, we output to Serial (which goes to USB terminal)
  // In production, you'd use a proper LCD library
}

void updateTimer() {
  if (!timerRunning) return;
  
  unsigned long elapsed = (millis() - timerStart) / 1000;
  timerSeconds = elapsed;
  
  // Update display
  if (currentMenu == STATE_TIMER) {
    // Refresh timer display every second
    if (timerSeconds % 1 == 0) {
      showMenuTimer();
    }
  }
}

// ============= BLUEPRINT FUNCTIONS =============

void cycleBlueprint(int index) {
  Blueprint& bp = blueprints[index];
  
  // Cycle through states: not found -> found -> inventory -> learned -> not found
  if (!bp.found) {
    bp.found = true;
    setStatusLED(LED_STATUS_GREEN, HIGH);
  } else if (!bp.in_inventory) {
    bp.in_inventory = true;
  } else if (!bp.learned) {
    bp.learned = true;
    playBeep(3);  // Triple beep for learned!
    pulseAllLEDs();  // Celebrate!
  } else {
    // Reset
    bp.found = false;
    bp.in_inventory = false;
    bp.learned = false;
    setStatusLED(LED_STATUS_GREEN, LOW);
  }
  
  saveBlueprintData();
  showBlueprintDetail(index);
}

void loadBlueprintData() {
  // Load from EEPROM (address 0)
  // Each blueprint is 39 bytes
  // Format: name(30) + rarity(15) + source(20) + materials(1) + flags(3)
  // For demo: just show the initial data
}

void saveBlueprintData() {
  // Save to EEPROM
  // In production: implement proper EEPROM storage
}

// ============= LED CONTROL =============

void setLED(byte r, byte g, byte b) {
  // For WS2812B RGB strip, you'd use a library like FastLED or Adafruit_NeoPixel
  // For standard LEDs, just set PWM
  
  ledRed = r;
  ledGreen = g;
  ledBlue = b;
  
  // Simulated RGB PWM output
  analogWrite(6, map(r, 0, 255, 0, 255));  // Red channel
  // (Would need more pins or a shift register for full RGB)
}

void setStatusLED(int pin, int state) {
  digitalWrite(pin, state);
}

void pulseAllLEDs() {
  for (int i = 0; i < 3; i++) {
    setLED(255, 255, 255);  // White pulse
    delay(100);
    setLED(ledRed, ledGreen, ledBlue);  // Back to normal
    delay(100);
  }
}

// ============= AUDIO FEEDBACK =============

void playBeep(int count) {
  for (int i = 0; i < count; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(100);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
}

// ============= DISPLAY HELPERS =============

void displayClear() {
  Serial.write(27);       // ESC command
  Serial.print("[2J");    // Clear screen
  Serial.write(27);
  Serial.print("[H");     // Move cursor to home
}

void displayHeader(String title, String subtitle) {
  Serial.println("════════════════════════════════");
  Serial.print("  ");
  Serial.println(title);
  if (subtitle.length() > 0) {
    Serial.print("  ");
    Serial.println(subtitle);
  }
  Serial.println("════════════════════════════════");
}

// ============= END OF SKETCH =============
