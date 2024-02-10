let device;

async function start() {
    const patchExportURL = "rnbo/particles.export.json";
  
    // Create AudioContext
    const WAContext = window.AudioContext || window.webkitAudioContext;
    const context = new WAContext();
  
    // Create gain node and connect it to audio output
    const outputNode = context.createGain();
    outputNode.connect(context.destination);
  
    // Fetch the exported patcher
    let response, patcher;
    try {
      response = await fetch(patchExportURL);
      patcher = await response.json();
  
      if (!window.RNBO) {
        // Load RNBO script dynamically
        // Note that you can skip this by knowing the RNBO version of your patch
        // beforehand and just include it using a <script> tag
        await loadRNBOScript(patcher.desc.meta.rnboversion);
      }
    } catch (err) {
      const errorContext = {
        error: err
      };
      if (response && (response.status >= 300 || response.status < 200)) {
        (errorContext.header = `Couldn't load patcher export bundle`),
          (errorContext.description =
            `Check app.js to see what file it's trying to load. Currently it's` +
            ` trying to load "${patchExportURL}". If that doesn't` +
            ` match the name of the file you exported from RNBO, modify` +
            ` patchExportURL in app.js.`);
      }
      if (typeof guardrails === "function") {
        guardrails(errorContext);
      } else {
        throw err;
      }
      return;
    }

    try {
      device = await RNBO.createDevice({ context, patcher });
    } catch (err) {
      if (typeof guardrails === "function") {
        guardrails({ error: err });
      } else {
        throw err;
      }
      return;
    }
  
    device.node.connect(outputNode);
    
    context.suspend();
    const button = document.querySelector('button');
    document.addEventListener('click', ()=>{
      if(!send){
        context.resume();
        send = true;
        button.setAttribute('style', 'opacity: 0');
        console.log(send);
      }
    })

  }

  function sonify(device, RNBOtarget, RNBOpan, RNBOfreq){
    const target = device.parametersById.get('target');
    target.value = RNBOtarget;
    console.log(target.value, RNBOtarget);

    const pan = device.parametersById.get('pan');
    pan.value = normalize(RNBOpan, 0, w, 0., 1.);

    const freq = device.parametersById.get('freq');
    freq.value = normalize(RNBOfreq, 0, h, 1000, 20);

  }

function normalize(val, valLo, valHi, outLo, outHi){
   if (val < valLo){
      val = valLo;
   } else if (val > valHi){
      val = valHi;
   }
   let valDiff = valHi - valLo;
   let outDiff = outHi - outLo;
   let percent = (val - valLo) / valDiff;
   return outLo + (percent * outDiff);
}

start();