document.addEventListener("DOMContentLoaded", function() {
    const chalkOverlay = document.getElementById("chalk-overlay");
    const homeButton = document.getElementById("home");
    const drawButton = document.getElementById("draw");
    const eraseButton = document.getElementById("erase");
    const strokeStyleSelect = document.getElementById("stroke-style");
    const lineStyleSelect = document.getElementById("line-style");
    const clearAllButton = document.getElementById("clear-all");
    const downloadButton = document.getElementById("download");
    const colorPicker = document.getElementById("color-picker");

    // ✅ Declare shared state here
    let isDrawing = false;
    let isErasing = false;
    let lastX, lastY;
    let previousStrokeStyle = strokeStyleSelect.value;
    let currentColor = "#ffffff"; // default white

    // ✅ Update color when picker changes
    colorPicker.addEventListener("input", (e) => {
        currentColor = e.target.value;
    });

    chalkOverlay.addEventListener("mousedown", startDrawing);
    chalkOverlay.addEventListener("touchstart", startDrawing);
    chalkOverlay.addEventListener("mousemove", draw);
    chalkOverlay.addEventListener("touchmove", draw);
    chalkOverlay.addEventListener("mouseup", stopDrawing);
    chalkOverlay.addEventListener("touchend", stopDrawing);
    chalkOverlay.addEventListener("mouseleave", stopDrawing);

    homeButton.addEventListener("click", () => {
        window.location.href = "https://jollyshmo.github.io";
    });

    drawButton.addEventListener("click", () => {
        isErasing = false;
        drawButton.classList.add("active");
        eraseButton.classList.remove("active");
        strokeStyleSelect.value = previousStrokeStyle;
    });

    eraseButton.addEventListener("click", () => {
        isErasing = true;
        eraseButton.classList.add("active");
        drawButton.classList.remove("active");
        previousStrokeStyle = strokeStyleSelect.value;
        strokeStyleSelect.value = "30";
    });

    clearAllButton.addEventListener("click", () => {
        chalkOverlay.innerHTML = "";
    });

    downloadButton.addEventListener("click", downloadImage);

    function startDrawing(event) {
        event.preventDefault();
        isDrawing = true;
        const { offsetX, offsetY } = getEventCoordinates(event);
        lastX = offsetX;
        lastY = offsetY;
    }

    function draw(event) {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getEventCoordinates(event);
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", lastX);
        line.setAttribute("y1", lastY);
        line.setAttribute("x2", offsetX);
        line.setAttribute("y2", offsetY);

        // ✅ Use currentColor unless erasing
        line.setAttribute("stroke", isErasing ? "black" : currentColor);
        line.setAttribute("stroke-width", strokeStyleSelect.value);
        line.setAttribute("stroke-linecap", lineStyleSelect.value);

        chalkOverlay.appendChild(line);
        lastX = offsetX;
        lastY = offsetY;
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function getEventCoordinates(event) {
        const rect = chalkOverlay.getBoundingClientRect();
        if (event.type.startsWith("touch")) {
            const touch = event.touches[0];
            return { offsetX: touch.clientX - rect.left, offsetY: touch.clientY - rect.top };
        } else {
            return { offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
        }
    }

    chalkOverlay.addEventListener("touchmove", function(event) {
        event.preventDefault();
    }, { passive: false });

    function downloadImage() {
        const svgData = new XMLSerializer().serializeToString(chalkOverlay);
        const tempSvg = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(tempSvg);

        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const saveWidth = document.getElementById("save-width").value || img.width;
            const saveHeight = document.getElementById("save-height").value || img.height;

            canvas.width = saveWidth;
            canvas.height = saveHeight;
            ctx.drawImage(img, 0, 0, saveWidth, saveHeight);

            const pngUrl = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = pngUrl;
            a.download = "chalkboard_drawing.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(pngUrl);
        };
        img.src = url;
    }
});