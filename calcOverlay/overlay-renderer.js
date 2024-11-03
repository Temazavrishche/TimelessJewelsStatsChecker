let positions = {first : 0, second : 0}

document.addEventListener('mousedown', (event) => {
    positions.first = { x: event.clientX, y: event.clientY };
});

document.addEventListener('mouseup', (event) => {
  positions.second = { x: event.clientX, y: event.clientY };
  window.positions.positions(positions)
});