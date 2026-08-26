// ARC COMPANION TACTICAL DEVICE
// 12" Portable HDMI Display Case
// Arduino Uno R3 Controller
// Military Tactical Aesthetic with Friction Ridges
// Designed for QIDI Q2 3D Printer

// ============= PARAMETERS =============

// Main dimensions (mm)
case_width = 280;      // Width for 12" display
case_height = 225;     // Height 
case_depth = 85;       // Depth (compact tactical form)

// Wall thickness
wall_thickness = 2.5;

// Display opening
display_width = 240;
display_height = 175;

// ============= MAIN CASE =============

module main_case() {
    difference() {
        // Outer box
        cube([case_width, case_height, case_depth], center=true);
        
        // Inner cavity
        cube([case_width - wall_thickness*2, 
              case_height - wall_thickness*2, 
              case_depth - wall_thickness*2], center=true);
    }
}

// ============= DISPLAY BEZEL =============

module display_bezel() {
    difference() {
        // Front panel
        translate([0, 10, case_depth/2 - 2])
            cube([case_width - 5, case_height - 20, 4], center=true);
        
        // Display opening
        translate([0, 10, case_depth/2])
            cube([display_width, display_height, 5], center=true);
    }
}

// ============= FRICTION RIDGES =============

module friction_ridge(length, width, height, spacing, count) {
    for (i = [0 : count-1]) {
        x_pos = -length/2 + spacing * i + spacing/2;
        translate([x_pos, 0, 0])
            cube([width, height, spacing/1.5], center=true);
    }
}

module top_ridges() {
    translate([0, 0, case_depth/2 + 1])
        friction_ridge(case_width - 10, 3, case_height - 40, 16, 18);
}

module bottom_ridges() {
    translate([0, 0, -case_depth/2 - 1])
        friction_ridge(case_width - 10, 3, case_height - 40, 16, 18);
}

module side_ridges() {
    // Left side
    translate([-case_width/2 - 1, 0, 0])
        rotate([0, 90, 0])
            friction_ridge(case_depth - 10, 3, case_height - 60, 14, 10);
    
    // Right side
    translate([case_width/2 + 1, 0, 0])
        rotate([0, 90, 0])
            friction_ridge(case_depth - 10, 3, case_height - 60, 14, 10);
}

// ============= CONTROL PANEL BUTTONS =============

module button_holes() {
    button_radius = 6;
    
    // Row 1 (Action buttons - Orange)
    translate([-45, -80, case_depth/2 + 1]) cylinder(h=5, r=button_radius, center=true);
    translate([-15, -80, case_depth/2 + 1]) cylinder(h=5, r=button_radius, center=true);
    translate([15, -80, case_depth/2 + 1]) cylinder(h=5, r=button_radius, center=true);
    translate([45, -80, case_depth/2 + 1]) cylinder(h=5, r=button_radius, center=true);
    
    // Row 2 (Utility buttons - Gray)
    translate([-60, -110, case_depth/2 + 1]) cylinder(h=5, r=button_radius, center=true);
    translate([-20, -110, case_depth/2 + 1]) cylinder(h=5, r=button_radius, center=true);
    translate([20, -110, case_depth/2 + 1]) cylinder(h=5, r=button_radius, center=true);
    translate([60, -110, case_depth/2 + 1]) cylinder(h=5, r=button_radius, center=true);
}

// ============= CONTROL KNOBS =============

module knob_holes() {
    knob_radius = 12;
    
    // Left knob
    translate([-130, -80, case_depth/2 + 1]) cylinder(h=5, r=knob_radius, center=true);
    
    // Right knob
    translate([130, -80, case_depth/2 + 1]) cylinder(h=5, r=knob_radius, center=true);
}

// ============= STATUS LED HOLES =============

module led_holes() {
    led_radius = 5;
    
    translate([-120, 60, case_depth/2 + 1]) cylinder(h=5, r=led_radius, center=true);
    translate([-120, 40, case_depth/2 + 1]) cylinder(h=5, r=led_radius, center=true);
    translate([-120, 20, case_depth/2 + 1]) cylinder(h=5, r=led_radius, center=true);
    translate([-120, 0, case_depth/2 + 1]) cylinder(h=5, r=led_radius, center=true);
}

// ============= PORT HOLES =============

module port_holes() {
    // Left side ports (8mm x 12mm)
    translate([-case_width/2 - 1, 50, 0]) cube([3, 12, 8], center=true);
    translate([-case_width/2 - 1, 20, 0]) cube([3, 12, 8], center=true);
    translate([-case_width/2 - 1, -10, 0]) cube([3, 12, 8], center=true);
    
    // Right side ports
    translate([case_width/2 + 1, 50, 0]) cube([3, 12, 8], center=true);
    translate([case_width/2 + 1, 20, 0]) cube([3, 12, 8], center=true);
    translate([case_width/2 + 1, -10, 0]) cube([3, 12, 8], center=true);
}

// ============= CARRYING HANDLE SLOT =============

module handle_slot() {
    translate([0, 110, 0])
        cube([80, 4, 20], center=true);
}

// ============= CORNER REINFORCEMENTS =============

module corner_reinforcements() {
    reinforcement_size = 20;
    
    translate([-case_width/2 + 10, -case_height/2 + 10, 0])
        cube([reinforcement_size, reinforcement_size, case_depth], center=true);
    
    translate([case_width/2 - 10, -case_height/2 + 10, 0])
        cube([reinforcement_size, reinforcement_size, case_depth], center=true);
    
    translate([-case_width/2 + 10, case_height/2 - 10, 0])
        cube([reinforcement_size, reinforcement_size, case_depth], center=true);
    
    translate([case_width/2 - 10, case_height/2 - 10, 0])
        cube([reinforcement_size, reinforcement_size, case_depth], center=true);
}

// ============= ASSEMBLY =============

module arc_tactical_case() {
    difference() {
        union() {
            main_case();
            display_bezel();
            corner_reinforcements();
        }
        
        // All cutouts
        button_holes();
        knob_holes();
        led_holes();
        port_holes();
        handle_slot();
    }
    
    // Add ridges (additive)
    top_ridges();
    bottom_ridges();
    side_ridges();
}

// ============= RENDER =============

arc_tactical_case();

// For visualization only (not printed)
% translate([0, 0, case_depth/2 - 10])
    cube([display_width - 10, display_height - 10, 2], center=true);

