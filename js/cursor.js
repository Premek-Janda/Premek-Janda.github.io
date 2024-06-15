const cursor = document.getElementById("cursor");
const invertArea = document.getElementById("invertArea");
let mouseX = 0,
  mouseY = 0;

// Throttling function to limit the rate of event handling
function throttle(fn, wait) {
  let time = Date.now();
  return function () {
    if (time + wait - Date.now() < 0) {
      fn();
      time = Date.now();
    }
  };
}

document.addEventListener(
  "mousemove",
  throttle(() => {
    cursor.style.transform = `translate(calc(${mouseX}px - 50%), calc(${mouseY}px - 50%))`;
    invertArea.style.clipPath = `circle(20px at ${mouseX}px ${mouseY}px)`;
  }, 16)
); // Throttle to approximately 60fps

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

const links = document.querySelectorAll("a");
links.forEach((link) => {
  link.addEventListener("mouseover", () => {
    cursor.classList.add("hover");
    invertArea.style.clipPath = `circle(40px at ${mouseX}px ${mouseY}px)`;
  });
  link.addEventListener("mouseout", () => {
    cursor.classList.remove("hover");
    invertArea.style.clipPath = `circle(20px at ${mouseX}px ${mouseY}px)`;
  });
});


// 
// 
// 
document.addEventListener('mousemove', function(event) {
    document.querySelectorAll('.hoverable').forEach(item => {
        const rect = item.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const distanceX = centerX - offsetX;
        const distanceY = centerY - offsetY;
        
        const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
        
        if (distance < 200) {
            const moveX = (offsetX - centerX) / 20;
            const moveY = (offsetY - centerY) / 20;
            
            item.style.transform = `translate(${-moveX}px, ${-moveY}px)`;

            item.addEventListener("mouseover", () => {
                cursor.classList.add("hover");
                invertArea.style.clipPath = `circle(40px at ${mouseX}px ${mouseY}px)`;
            });
            item.addEventListener("mouseout", () => {
                cursor.classList.remove("hover");
                invertArea.style.clipPath = `circle(20px at ${mouseX}px ${mouseY}px)`;
            });
        }
    });
});

