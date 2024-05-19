
const status = document.getElementById('status')
const container = document.getElementById('container')
const models = []
let canvas

function absensi() {
  navigator.mediaDevices.getUserMedia({
    video: {
      focusMode: 'auto',
      facingMode: 'user'
    }
  }
  ).then(stream => {
    document.getElementById('video').srcObject = stream
    //document.querySelector('.container').style.display ='block'  })
    document.querySelector('.container').classList.add('show')
    document.getElementById('loadContainer').style.display = 'flex'
  })
    .catch(err => {
      document.getElementById('message').innerText = err.message
    })
}
video.addEventListener('play', () => {
  progressPromise([
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceLandmark68TinyNet.loadFromUri('./models'),
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
  ], (value, len) => {
    const load = document.getElementById('loadProgress')
    load.max = len
    load.value = value
  }).then(start)
})
async function start() {
  await Promise.all([
    loadImageModels(1),
    loadImageModels(2),
    loadImageModels(3),
    loadImageModels(4),
  ])
  let dot = ''
  if (canvas) canvas.remove()
  canvas = faceapi.createCanvasFromMedia(video)
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  container.append(canvas)
  const faceMatcher = new faceapi.FaceMatcher([new faceapi.LabeledFaceDescriptors(
    'Piantod',
    models
  )], 0.6)

  const detect = async () => {
    const detections = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true).withFaceDescriptor()
    document.getElementById('loadContainer').style.display = 'none'
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    if (!detections) {
      if (dot.length >= 3) {
        dot = ''
      } else {
        dot += '.'
      }
      status.innerText = 'Mencari wajah' + dot
      status.style.color = 'white'
      canvas.style.border = 'none'
    } else {
      const result = faceMatcher.findBestMatch(detections.descriptor)
      console.log(result)
      //const result = faceapi.euclideanDistance(detector.descriptor, detections.descriptor)
      if (result._distance < 0.6) {
        //status.innerText = 'Wajah Cocok ' + (100 - Math.round(result * 100)) + "%"
        status.innerText = result._label + " " + (100 - Math.round(result._distance * 100)) + "%"
        status.style.color = 'orange'
        canvas.style.border = '0.75rem solid orange'
      } else {
        status.innerText = result._label
        status.style.color = 'red'
        canvas.style.border = '0.75rem solid red'
      }
      faceapi.draw.drawDetections(canvas, detections, { color: 'orange' })
    }
    setTimeout(detect, 200)
  }
  detect()
}

function progressPromise(promises, update) {
  let progres = 0
  let len = promises.length

  function tick(promise) {
    promise.then(() => {
      progres++
      update(progres, len)
    })
    return promise
  }
  return Promise.all(promises.map(tick))
};

async function loadImageModels(urutan = 1) {
  const img = await faceapi.fetchImage(`./img/model${urutan}.jpg`)
  const detector = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks(true).withFaceDescriptor()
  models.push(detector.descriptor)
}