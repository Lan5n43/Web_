function format(command, value = null) {
  document.execCommand(command, false, value);
}

// Font family
function setFont(font) {
  document.execCommand("fontName", false, font);
}

// Font size (mapped)
function setFontSize(size) {
  document.execCommand("fontSize", false, "7");

  const fonts = document.getElementsByTagName("font"); 
  for (let i = 0; i < fonts.length; i++) {
    if (fonts[i].size == "7") {
      fonts[i].removeAttribute("size");
      fonts[i].style.fontSize = size + "px";
    }
  }
}

// Custom size
function applyCustomSize() {
  const size = document.getElementById("customSize").value;
  if (size) setFontSize(size);
}

// Increase / decrease size
function changeSize(step) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const span = document.createElement("span");
  span.style.fontSize = (16 + step * 2) + "px";
  selection.getRangeAt(0).surroundContents(span);
}