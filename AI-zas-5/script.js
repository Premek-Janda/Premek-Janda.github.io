const video = document.getElementById("video");
const btnCapture = document.getElementById("capture-btn");
const modelSelector = document.getElementById("model-selector");
const historyContainer = document.getElementById("history");
const statusDisplay = document.getElementById("status");

let model, modelType;

const KEYPOINT_CONFIDENCE_THRESHOLD = 0.5;

async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
      },
    });
    video.srcObject = stream;
    await new Promise((resolve) => {
      video.onloadedmetadata = () => {
        resolve();
      };
    });
  } catch (err) {
    console.error("Error accessing the camera: ", err);
    statusDisplay.textContent =
      "Chyba: Nelze získat přístup k kamere. Prosím, povolte přístup a aktualizujte stránku.";
  }
}

async function wait3Seconds(timer = 3) {
  for (let i = timer; i > 0; i--) {
    btnCapture.textContent = `${i}`;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  btnCapture.textContent = "Zpracování...";
  await new Promise((resolve) => setTimeout(resolve, 0));
}

// Options: "cocoSsd", "mobilenet", "movenet", "blazepose"
modelSelector.addEventListener("change", async (e) => {
  modelType = e.target.value;
  init();
});

btnCapture.addEventListener("click", async () => {
  if (!model) return;

  const originalButtonText = btnCapture.textContent;
  btnCapture.disabled = true;

  try {
    await wait3Seconds();

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    let predictions = [];

    if (modelType === "cocoSsd") {
      predictions = await model.detect(canvas);
    } else if (modelType === "mobilenet") {
      predictions = await model.classify(canvas);
    } else if (modelType === "movenet" || modelType === "blazepose") {
      predictions = await model.estimatePoses(canvas);
    }

    if (modelType === "movenet" || modelType === "blazepose") {
      drawPoseResults(context, predictions, modelType);
    }

    const imageDataUrl = canvas.toDataURL("image/jpeg");
    addHistoryItem(imageDataUrl, predictions);

  } finally {
    btnCapture.textContent = originalButtonText;
    btnCapture.disabled = false;
  }
});

function drawPoseResults(ctx, poses, modelName) {
  if (!poses || poses.length === 0) return;

  const pose = poses[0];

  for (const keypoint of pose.keypoints) {
    if (keypoint.score > KEYPOINT_CONFIDENCE_THRESHOLD) {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#00FF00";
      ctx.fill();
    }
  }

  let adjacentPairs;
  if (modelName === 'movenet') {
    adjacentPairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
  } else if (modelName === 'blazepose') {
    adjacentPairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.BlazePose);
  } else return;

  for (const [i, j] of adjacentPairs) {
    const kp1 = pose.keypoints[i];
    const kp2 = pose.keypoints[j];
    if (kp1.score > KEYPOINT_CONFIDENCE_THRESHOLD && kp2.score > KEYPOINT_CONFIDENCE_THRESHOLD) {
      ctx.beginPath();
      ctx.moveTo(kp1.x, kp1.y);
      ctx.lineTo(kp2.x, kp2.y);
      ctx.strokeStyle = "#FF0000";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

function addHistoryItem(imageDataUrl, predictions) {
    const container = document.getElementById("history") || document.getElementById("history-container");
    const historyItem = document.createElement("div");
    historyItem.className = document.querySelector(".history .thumb") ? "thumb" : "history-item";

    const img = document.createElement("img");
    img.src = imageDataUrl;

    const metaDiv = document.createElement("div");
    metaDiv.className = document.querySelector(".history .meta") ? "meta" : "results";
    
    historyItem.appendChild(img);
    historyItem.appendChild(metaDiv);

    if (predictions.length > 0) {
        const list = document.createElement("ul");
        list.style.paddingLeft = '20px';
        list.style.margin = '0';

        predictions.forEach((prediction, index) => {
            if ((modelType === 'movenet' || modelType === 'blazepose') && index > 0) return;

            const li = document.createElement("li");
            if (modelType === "cocoSsd") {
                li.textContent = `${prediction.class} (${Math.round(prediction.score * 100)}% jistota)`;
            } else if (modelType === "mobilenet") {
                li.textContent = `${prediction.className} (${Math.round(prediction.probability * 100)}% jistota)`;
            } else if (modelType === "movenet") {
                li.textContent = `MoveNet Pose (${Math.round(prediction.score * 100)}% jistota)`;
            } else if (modelType === "blazepose") {
                li.textContent = `BlazePose (${Math.round(prediction.score * 100)}% jistota)`;
            }
            list.appendChild(li);
        });
        metaDiv.appendChild(list);
    } else {
        metaDiv.innerHTML = "<p>Žádné objekty nebyly nalezeny.</p>";
    }
    container.prepend(historyItem);
}

async function init() {
  try {
    statusDisplay.textContent = "Načítání modelu...";
    btnCapture.disabled = true;

    if (modelType === "cocoSsd") {
      model = await cocoSsd.load();
    } else if (modelType === "mobilenet") {
      model = await mobilenet.load();
    } else if (modelType === "movenet") {
      const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
      model = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, detectorConfig);
    } else if (modelType === "blazepose") {
      const detectorConfig = {
        runtime: 'tfjs',
        modelType: 'lite'
      };
      model = await poseDetection.createDetector(poseDetection.SupportedModels.BlazePose, detectorConfig);
    }

    console.log(`Model '${modelType}' loaded.`);
    statusDisplay.textContent = "Model načten, připraveno";
    btnCapture.disabled = false;
  } catch (err) {
    console.error("Failed to load the model: ", err);
    statusDisplay.textContent = "Chyba: Nelze načíst model detekce objektů.";
  }
}

startCamera();
