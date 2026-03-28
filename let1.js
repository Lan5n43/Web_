window.addEventListener('DOMContentLoaded', () => {
  const card = document.querySelector('.card');
  const canvas = document.getElementById('confetti-canvas');

  if (!card || !canvas) return console.error("Card or canvas not found!");

  // Full-page canvas
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });

  // Card center
  const rect = card.getBoundingClientRect(); 
  const cardCenterX = rect.left + rect.width / 1.8;
  const cardCenterY = rect.top + rect.height / 1;     

  // Generate heart points in pixels
  function heartPoints(numPoints, scale = 1.5) {
    const points = [];
    for (let i = 0; i < numPoints; i++) {
      const t = (i / numPoints) * 2 * Math.PI;
      const x = 16 * Math.pow(Math.sin(t), 3) * scale;
      const y = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
      points.push({ x, y });
    }
    return points;
  }

  // Convert pixel coordinates to canvas fractions
  function pixelToOrigin(x, y) {
    return { x: x / canvas.width, y: y / canvas.height };
  }

  function launchHeart() {
    const points = heartPoints(30,1); // scale bigger for card size
    points.forEach(p => {
      // Center heart on card
      const origin = pixelToOrigin(cardCenterX + p.x, cardCenterY - p.y);

      const spill = Math.random() < 0.5;

      myConfetti({
        particleCount: 5,
        spread: spill ? 50 : 25,
        startVelocity: spill ? 50 : 20,
        gravity: spill ? 1.5 : 0.8,
        ticks: 200,
        drift: spill ? (Math.random() - 0.5) * 3 : (Math.random() - 0.5) * 1.2,
        origin: origin,
        colors: ['#fadfe4', '#f8ecef', '#f9bcc6'],
        scalar: 0.6
      });
    });
  }

  launchHeart();
  console.log("Centered heart confetti executed!");
});

// pin.js

let pin = "";
const correctPin = "112325"; // your password

// Show the PIN popup
function openPin(){
    document.getElementById("pinPopup").classList.remove("hidden");
    clearPin();
}

// Handle number press
function press(num){
    // Clear previous error message
    document.getElementById("errorMsg").innerText = "";

    // Add number if less than 6 digits
    if(pin.length < 6){
        pin += num;
        updateDisplay();
    }
}

// Update display in 11/23/25 format
function updateDisplay(){
    let formatted = "";

    if(pin.length >= 1) formatted += pin[0];
    if(pin.length >= 2) formatted += pin[1] + "/";
    if(pin.length >= 3) formatted += pin[2];
    if(pin.length >= 4) formatted += pin[3] + "/";
    if(pin.length >= 5) formatted += pin[4];
    if(pin.length >= 6) formatted += pin[5];

    document.getElementById("display").innerText = formatted || "--/--/--";
}

// Clear the PIN
function clearPin(){
    pin = "";
    document.getElementById("display").innerText = "--/--/--";
}

// Check if PIN is correct
function checkPin(){
    if(pin === correctPin){
        // Correct, go to page 2
        window.location.href = "let1.html";
    } else {
        // Wrong, show error below display
        document.getElementById("errorMsg").innerText = "Wrong passcode";

        // Add shake class to the PIN popup
        const popup = document.getElementById("pinPopup");
        popup.classList.add("shake");

        // Remove shake class after animation ends
        setTimeout(() => {
            popup.classList.remove("shake");
        }, 500);

        clearPin();
    }
}