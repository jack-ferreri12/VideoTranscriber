let mediaRecorder;
let recordedChunks = [];

const preview = document.getElementById("preview");
const playback = document.getElementById("playback");
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const uploadBtn = document.getElementById("uploadBtn");
const redoBtn = document.getElementById("redoBtn");
const transcriptDiv = document.getElementById("transcript");
const speechRateDiv = document.getElementById("speech-rate");

startBtn.onclick = async () => {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  preview.srcObject = stream;
  preview.style.display = "block";
  playback.style.display = "none";
  recordedChunks = [];
  uploadBtn.classList.add("hidden");
  redoBtn.classList.add("hidden");

  mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.ondataavailable = e => {
    if (e.data.size > 0) recordedChunks.push(e.data);
  };

  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    playback.src = url;
    playback.style.display = "block";
    preview.style.display = "none";
    uploadBtn.classList.remove("hidden");
    redoBtn.classList.remove("hidden");

    uploadBtn.onclick = () => {
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");
      fetch("http://localhost:8000/transcribe", {
        method: "POST",
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        document.getElementById("speech-rate").classList.remove("hidden");
        document.getElementById("transcript").classList.remove("hidden");
        document.getElementById("speechChart").classList.remove("hidden");
        document.getElementById("graph-title").classList.remove("hidden");

        transcriptDiv.innerHTML = "";
        data.segments.forEach((seg, i) => {
          const span = document.createElement("div");
          span.className = "transcript-segment";
          span.id = "seg-" + i;
          span.textContent = seg.text;
          transcriptDiv.appendChild(span);
        });

        playback.ontimeupdate = () => {
          const t = playback.currentTime;
          data.segments.forEach((seg, i) => {
            const el = document.getElementById("seg-" + i);
            if (t >= seg.start && t <= seg.end) {
              document.querySelectorAll(".transcript-segment").forEach(e => e.classList.remove("active"));
              el.classList.add("active");
              speechRateDiv.textContent = `Speech Rate: ${seg.wps.toFixed(2)} wps`;
            }
          });
        };

        // Graph using wps_by_second
        const labels = data.wps_by_second.map((_, i) => `${i}s`);
        const values = data.wps_by_second;

        const ctx = document.getElementById("speechChart").getContext("2d");
        new Chart(ctx, {
          type: "line",
          data: {
            labels: labels,
            datasets: [{
              label: "Speech Rate (words/sec)",
              data: values,
              borderColor: "rgb(75, 192, 192)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.2
            }]
          },
          options: {
            responsive: true,
            plugins: { legend: { display: true } },
            scales: {
              x: { title: { display: true, text: "Time (s)" }},
              y: { beginAtZero: true, title: { display: true, text: "Words Per Second" }}
            }
          }
        });
      });
    };
  };

  mediaRecorder.start();
  startBtn.disabled = true;
  stopBtn.disabled = false;
};

stopBtn.onclick = () => {
  mediaRecorder.stop();
  stopBtn.disabled = true;
  startBtn.disabled = false;
};

redoBtn.onclick = () => {
  playback.src = "";
  transcriptDiv.innerHTML = "";
  speechRateDiv.textContent = "Speech Rate: 0 wps";
  playback.style.display = "none";
  redoBtn.classList.add("hidden");
  uploadBtn.classList.add("hidden");

  document.getElementById("speech-rate").classList.add("hidden");
  document.getElementById("transcript").classList.add("hidden");
  document.getElementById("speechChart").classList.add("hidden");
  document.getElementById("graph-title").classList.add("hidden");

  const chartCanvas = document.getElementById("speechChart");
  const chartCtx = chartCanvas.getContext("2d");
  chartCtx.clearRect(0, 0, chartCanvas.width, chartCanvas.height);
};
