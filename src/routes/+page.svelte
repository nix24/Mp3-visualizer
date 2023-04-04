<script>
  import Particles from "svelte-particles";
  import { loadFull } from "tsparticles";
  //want to add twinkling stars
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
      const barGap = 0.6;

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
          const currentHeight = lerp(prevBarHeights[i], targetHeight, 0.6);

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

  $: if (audioFile) createVisualizer(audioFile);
</script>

<main>
<!--test-->
  <div class="container my-5">
    <Particles
      id="tsparticles"
      options={particlesConfig}
      on:particlesLoaded={onParticlesLoaded}
      {particlesInit}
    />
    <div class="title">
      <div class="moon">
        <svg
          class="moon-icon"
          width="50%"
          height="50%"
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 47.539 47.539"
          xml:space="preserve"
        >
          <g>
            <g>
              <path
                style="fill: #f4f3f4"
                d="M24.997,47.511C11.214,47.511,0,36.298,0,22.515C0,12.969,5.314,4.392,13.869,0.132
                  c0.385-0.191,0.848-0.117,1.151,0.186s0.381,0.766,0.192,1.15C13.651,4.64,12.86,8.05,12.86,11.601
                  c0,12.681,10.316,22.997,22.997,22.997c3.59,0,7.033-0.809,10.236-2.403c0.386-0.191,0.848-0.117,1.151,0.186
                  c0.304,0.303,0.381,0.766,0.192,1.15C43.196,42.153,34.597,47.511,24.997,47.511z M12.248,3.372C5.862,7.608,2,14.709,2,22.515
                  c0,12.68,10.316,22.996,22.997,22.996c7.854,0,14.981-3.898,19.207-10.343c-2.668,0.95-5.464,1.43-8.346,1.43
                  c-13.783,0-24.997-11.214-24.997-24.997C10.861,8.761,11.327,6.005,12.248,3.372z"
              />
            </g>
          </g>
        </svg>
        <h1 class="text-center mb-4">Music Visualizer</h1>
      </div>
    </div>
    <div class="form-group">
      <label for="audio-file">Choose an MP3 file to visualize:</label>
      <input
        type="file"
        class="form-control-file"
        id="audio-file"
        on:change={(e) => {
          audioFile = e.target.files[0];
          createVisualizer(audioFile);
        }}
      />
    </div>
    <div class="mt-5">
      <canvas id="visualizer" bind:this={canvas} style="display: block" />
      <audio
        id="audio-player"
        controls
        style="display: block"
        bind:this={audio}
      />
    </div>
  </div>
</main>

<style>
  /* Container styling */
  .container {
    max-width: 800px;
  }

  /* Heading styles */
  h1 {
    font-size: 2.5rem;
    text-align: center;
    margin-bottom: 1.5rem;
    animation: fadeInDown 1s ease-in-out;
  }

  /* Form group styles */
  .form-group {
    margin-bottom: 2rem;
  }

  /* Label styles */
  label {
    display: block;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    animation: fadeInUp 1s ease-in-out;
  }

  /* Input styles */
  input[type="file"] {
    display: block;
    margin-bottom: 2rem;
    cursor: pointer;
    animation: fadeInUp 1s ease-in-out;
  }

  /* Visualizer styles */
  #visualizer {
    box-shadow: 0 0 15px #0000004d;
    box-sizing: border-box;
    width: 50rem;
    height: 10rem;
    padding: 5px;
    margin: 0 auto;
    border: 1px solid #ffffff80;
    border-radius: 20px;
    animation: fadeIn 2s ease-in-out;
  }
  @media (max-width: 768px) {
    #visualizer {
      width: 100%;
    }
  }

  /* Audio player styles */
  #audio-player {
    display: block;
    width: 100%;
    box-sizing: border-box;
    padding: 10px;
  }

  #audio-player::-webkit-media-controls-panel {
    background: transparent;
    border: none;
  }

  #audio-player::-webkit-media-controls-current-time-display,
  #audio-player::-webkit-media-controls-time-remaining-display {
    color: #1c2541;
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  /* Lunar moon icon styles */
  .moon {
    animation: fadeInUp 1s ease-in-out;
  }

  .moon-icon {
    fill: #ffffff;
    width: 60px;
    height: 60px;
  }
  .title {
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>
