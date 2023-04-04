let particlesConfig = {
    fpsLimit: 60,
    particles: {
      color: {
        value: "#fff",
      },
      links: {
        color: "#fff",
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      collisions: {
        enable: true,
      },

      move: {
        direction: "none",
        enable: true,
        outMode: "bounce",
        random: false,
        speed: 6,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          value_area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
    },
  };
  let onParticlesLoaded = (event) => {
    const particlesContainer = event.detail.particles;

    // you can use particlesContainer to call all the Container class
    // (from the core library) methods like play, pause, refresh, start, stop
  };

  let particlesInit = async (engine) => {
    // you can use main to customize the tsParticles instance adding presets or custom shapes
    // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
    // starting from v2 you can add only the features you need reducing the bundle size
    await loadFull(engine);
  };

  let audioFile = null;
  let canvas;
  let audio;
  const createVisualizer = (audioFile) => {
    if (!audioFile) return;

    const audioURL = URL.createObjectURL(audioFile);
    audio.src = audioURL;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaElementSource(audio);

    const analyser = audioContext.createAnalyser();
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    const canvasCtx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };

    const drawVisualizer = () => {
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const barGap = 2.5;

      const lerp = (start, end, speed) => {
        return start + (end - start) * speed;
      };

      const prevBarHeights = new Float32Array(bufferLength).fill(0);

      const draw = () => {
        analyser.getByteFrequencyData(dataArray);
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

        for (const [i, barHeight] of dataArray.entries()) {
          const x = i * (canvas.width / bufferLength + barGap);
          const targetHeight = barHeight * (canvas.height / 256);
          const currentHeight = lerp(prevBarHeights[i], targetHeight, 1.5);

          const y = canvas.height - currentHeight;

          canvasCtx.fillStyle = `hsl(${(y / canvas.height) * 360}, 100%, 50%)`;
          canvasCtx.fillRect(
            x,
            y,
            canvas.width / bufferLength - barGap,
            currentHeight
          );

          prevBarHeights[i] = currentHeight;
        }

        requestAnimationFrame(draw);
      };

      draw();
    };
    /**
     *Stops the visualizer animation when the audio ends.
     */
    const stopVisualizer = () => {
      cancelAnimationFrame(drawVisualizer);
    };

    window.addEventListener("resize", resizeCanvas);

    audio.addEventListener("ended", stopVisualizer);

    audioContext.resume();
    audio.play();

    resizeCanvas();
    drawVisualizer();
  };

  export default { particlesConfig, onParticlesLoaded, particlesInit, audioFile, canvas, audio, createVisualizer}
