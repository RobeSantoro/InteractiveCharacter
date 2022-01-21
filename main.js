/*-----------------------------------*/
/*------------IMPORT-----------------*/
/*-----------------------------------*/

import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// Import GLTF and DRACO loader
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'


// AnimeJS
import anime from 'animejs/lib/anime.es.js'

// Import Tweakpane
import { Pane } from 'tweakpane'
const PARAMS = {
  useOrbitCamera: false
}
const pane = new Pane()
pane.addInput(PARAMS, 'useOrbitCamera')

// Import Stats
import Stats from 'three/examples/jsm/libs/stats.module.js'

// Stats
/* const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom) */



/*******************/
/* DOM REFERENCING */
/*******************/

const inputEmail = document.getElementById('Email')
const inputPassword = document.getElementById('Password')
const LoginButton = document.querySelector('#LoginButton')






/******************/
/* THREE.JS SETUP */
/******************/

// Create a scene
const scene = new THREE.Scene()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Window. Sizes
const sizes = {
  height: window.innerHeight,
  width: window.innerWidth
}

// Create a camera
let camera = null

const orbitCamera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 1000)
orbitCamera.position.y = 2
orbitCamera.position.z = 16
orbitCamera.lookAt({ x: 0, y: 2, z: 0 })

const staticCamera = new THREE.PerspectiveCamera(25, sizes.width / sizes.height, 0.1, 1000)
//staticCamera.position.y = -1.5
staticCamera.position.z = 16
staticCamera.lookAt(0, -1.5, 0)

camera = orbitCamera
scene.add(camera)

// Orbit controls
const controls = new OrbitControls(camera, canvas)

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: false,
  premultipliedAlpha: false
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
renderer.setClearColor(0x44337a, 0)
renderer.render(scene, camera)
renderer.outputEncoding = THREE.sRGBEncoding


// Turn on shadow for the renderer
// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap

/* GRID
const gridHelper = new THREE.GridHelper(10, 10)
scene.add(gridHelper)
// AXIS HELPER
const axisHelper = new THREE.AxesHelper(3)
scene.add(axisHelper)
*/

// Load the environment texture
const textureLoader = new THREE.TextureLoader()
const envTexture = textureLoader.load('./textures/garage_1k.jpg')
envTexture.mapping = THREE.EquirectangularReflectionMapping

// Load the backed texture
const bakedTextureLoader = new THREE.TextureLoader()
const bakedTexture = bakedTextureLoader.load('./textures/baked.jpg')
bakedTexture.flipY = false

// Create a new super simple material
const bakedMaterial = new THREE.MeshStandardMaterial({
  map: bakedTexture,
  envMap: envTexture,
  metalness: 0.5,
  roughness: 0.5  
})

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./decoder/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)



/*********************/
/* GLTF MODEL LOADER */
/*********************/

// Load the gltf
gltfLoader.load('./models/RabbitHead.glb', (gltf) => {

  const rabbitScene = gltf.scene

  const Root = rabbitScene.getObjectByName('Armature')
  const NeckJoint = rabbitScene.getObjectByName('NECK_joint')
  const HeadJoint = rabbitScene.getObjectByName('HEAD_joint')
  const LeftEye = rabbitScene.getObjectByName('L_EYE_mesh')
  const RightEye = rabbitScene.getObjectByName('R_EYE_mesh')
  const LeftUpperEyeLid = rabbitScene.getObjectByName('L_EYE_UP_LID_mesh')
  const RightUpperEyeLid = rabbitScene.getObjectByName('R_EYE_UP_LID_mesh')
  const LeftLowerEyeLid = rabbitScene.getObjectByName('L_EYE_LW_LID_mesh')
  const RightLowerEyeLid = rabbitScene.getObjectByName('R_EYE_LW_LID_mesh')

  rabbitScene.traverse((child) => {

    /* if (child.isBone) {
      console.log(child.name);
    } */

    if (child.isMesh) {

      child.material.envMap = envTexture
      child.material.envMapIntensity = 1
      child.material.needsUpdate = true

      // If the name not contains "EYE_mesh" assign bakedtexture to the diffuse map      
      if (!child.name.includes('EYE_geo')) {
        child.material = bakedMaterial
        child.material.needsUpdate = true        
      }

      // Shadow
      /* if (child.name === 'Base') {
        child.receiveShadow = true
      } else {
        child.castShadow = true
        child.receiveShadow = true
      } */
    }

  })

  // Rotate the scene 180 degrees on the Y axis
  rabbitScene.rotation.y = THREE.Math.degToRad(180)

  // Move the scene to the first frame for the Loading Animation
  rabbitScene.position.y = -1
  Root.position.y = -4.2

  // Add the rabbitScene to the scene
  scene.add(rabbitScene)







  /***************************/
  /* Loading Intro Animation */
  /***************************/

  // Animate the whole scene
  anime({
    targets: rabbitScene.position,
    y: 0,
    duration: 1500,
    delay: 200,
  })

  // Animate the bunny's root
  // easing: 'spring(mass, stiffness, damping, velocity)'
  anime({
    targets: Root.position,
    y: -0.5,
    delay: 1500,
    easing: 'spring(1, 80, 10, 0)'
  })









  /*******************/
  /* Blink Animation */
  /*******************/

  let canBlink = null

  function Blink() {
    if (canBlink == true) {

      // Upper Blink animation
      anime({
        targets: [LeftUpperEyeLid.rotation, RightUpperEyeLid.rotation],
        x: (-Math.PI / 2) + 0.01,
        duration: 80,
        easing: 'linear',
        direction: 'alternate',


      })

      // Lower Blink animation
      anime({
        targets: [LeftLowerEyeLid.rotation, RightLowerEyeLid.rotation],
        x: Math.PI / 8,
        duration: 80,
        easing: 'linear',
        direction: 'alternate',


      })
    }
  }

  // Start the blink animation and repeat it every 1 seconds
  canBlink = true
  setInterval(Blink, 2500)






  /***************************/
  /* Head Movement Animation */
  /***************************/

  let eyesCanFollowMouse = true
  let headCanFollowMouse = true

  // Listen to the mouse move
  addEventListener('mousemove', function (e) {

    canBlink = true

    var mousecoords = getMousePos(e)

    if (eyesCanFollowMouse == true) {

      let leftEyeRot = OrientTowards(LeftEye, mousecoords, 60)      
      let rightEyeRot = OrientTowards(RightEye, mousecoords, 60)
      //console.log(OrientTowards(LeftEye, mousecoords, 60));

      // Implement the animation with anime.js to have a seamless animation
      /* anime({
        targets: [LeftEye.rotation, RightEye.rotation],
        x: leftEyeRot[0],
        y: leftEyeRot[1],
        duration: 100,
        easing: 'linear',
      }) */

    }

    if (headCanFollowMouse == true) {
      OrientTowards(NeckJoint, mousecoords, 15)
      OrientTowards(HeadJoint, mousecoords, 20)
    }

  })

  // Listen to the touch move
  addEventListener('touchmove', function (e) {
    var touchcoords = getTouchPos(e)

    canBlink = true

    if (eyesCanFollowMouse == true) {
      OrientTowards(LeftEye, touchcoords, 60)
      OrientTowards(RightEye, touchcoords, 60)
    }

    if (headCanFollowMouse == true) {
      OrientTowards(NeckJoint, touchcoords, 15)
      OrientTowards(HeadJoint, touchcoords, 20)
    }

  })









  /******************************/
  /* EMAIL INPUT FORM ANIMATION */
  /******************************/

  // When the user interact with email input
  if (inputEmail.attachEvent) inputEmail.attachEvent('focus', focusOnMail);
  else inputEmail.addEventListener('focus', focusOnMail)

  if (inputEmail.attachEvent) inputEmail.attachEvent('focusout', focusOutMail);
  else inputEmail.addEventListener('focusout', focusOutMail)

  if (inputEmail.attachEvent) inputEmail.attachEvent('input', focusOnMail);
  else inputEmail.addEventListener('input', focusOnMail)

  if (inputEmail.attachEvent) inputEmail.attachEvent('click', focusOnMail);
  else inputEmail.addEventListener('click', focusOnMail)

  function focusOnMail() {
    eyesCanFollowMouse = false
    canBlink = false

    // Get the length of the email input
    let inputMailLength = inputEmail.value.length

    // Move eyes to the beginning of the email input
    // and add inputMail Length as an offset    
    anime({
      targets: [LeftEye.rotation, RightEye.rotation],
      x: (-Math.PI / 2) + 0.5,
      y: (-Math.PI / 2) + inputMailLength * 0.045 + 1,
      duration: 150,
      easing: 'easeOutElastic(1, .8)'
    })

    // Rotate the EyeLids on the X axis
    anime({
      targets: [LeftUpperEyeLid.rotation, RightUpperEyeLid.rotation],
      x: (-Math.PI / 2) + 0.5,
      duration: 150,
      easing: 'easeOutElastic(1, .8)'
    })


  }

  function focusOutMail() {
    eyesCanFollowMouse = true
    canBlink = true

    // Rotates the EyeLids back to the original position
    anime({
      targets: [LeftUpperEyeLid.rotation, RightUpperEyeLid.rotation],
      x: 0,
      duration: 150,
      easing: 'easeOutElastic(1, .8)'
    })

  }

  /*********************************/
  /* PASSWORD INPUT FORM ANIMATION */
  /*********************************/

  // When the user interact with email input
  if (inputPassword.attachEvent) inputPassword.attachEvent('focus', focusOnPassword);
  else inputPassword.addEventListener('focus', focusOnPassword)

  if (inputPassword.attachEvent) inputPassword.attachEvent('focusout', focusOutPassword);
  else inputPassword.addEventListener('focusout', focusOutPassword)

  if (inputPassword.attachEvent) inputPassword.attachEvent('input', focusOnPassword);
  else inputPassword.addEventListener('input', focusOnPassword)

  if (inputPassword.attachEvent) inputPassword.attachEvent('click', focusOnPassword);
  else inputPassword.addEventListener('click', focusOnPassword)

  // ON PASSWORD
  function focusOnPassword() {
    
    eyesCanFollowMouse = false
    headCanFollowMouse = false

    // Get the length of the password input
    let inputPasswordLength = inputPassword.value.length

    // Move eyes to the beginning of the password input
    // and add inputPasswordLength as an offset

    anime({
      targets: [LeftEye.rotation, RightEye.rotation],
      x: 0,
      y: 0,
      duration: 150,
      easing: 'easeOutElastic(1, .8)'
    })

    // Move the NeckJoint down on the Y axis
    anime({
      targets: NeckJoint.position,
      y: -1.3,
      duration: 150,
      easing: 'easeOutElastic(1, .8)'
    })
    
    // Rotate the HeadJoint on the X axis
    anime({
      targets: HeadJoint.rotation,
      x: 0.3,
      duration: 150,
      easing: 'easeOutElastic(1, .8)'
    })


  }

  // OUT PASSWORD
  function focusOutPassword() {
    eyesCanFollowMouse = true
    headCanFollowMouse = true

    // Move the NeckJoint up on the Y axis
    anime({
      targets: NeckJoint.position,
      y: -0.626,
      duration: 150,
      easing: 'easeOutElastic(1, .8)'
    })

  }


  

},
// called as loading progresses
function ( xhr ) {

  console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

},
// called when loading has errors
function ( error ) {

  console.log( 'An error happened' );

})





/********************/
/****** LIGHTS ******/
/********************/

// Create a Pointlight
const Pointlight = new THREE.PointLight(0xffffff, 1.5, 100)
Pointlight.position.set(-2, 2, 5)
// Add shadow
//Pointlight.castShadow = true
//scene.add(Pointlight)

// LIGHT HELPERS
// Create a helper for Point Light
const pointLightHelper = new THREE.PointLightHelper(Pointlight, 1)
//scene.add(pointLightHelper)

// Initialize the main loop
const clock = new THREE.Clock()
let lastElapsedTime = 0
let FPS = 0

// Create a point object with a new key position and a new key alement
const point =
{
  position: new THREE.Vector3(0, -0.8, 3.14),
  element: document.querySelector('.point')
}

/* // Create a sphere representing the point
const sphere = new THREE.SphereGeometry(0.1, 32, 32)
const material = new THREE.MeshBasicMaterial({ color: 0xffffff })
const spheremesh = new THREE.Mesh(sphere, material)
// Set the position of the sphere to the position of the point
spheremesh.position.copy(point.position)
scene.add(spheremesh) */







/******************************/
/****** ANIMATE FUNCTION ******/
/******************************/

// Create the main loop invoking the animate function
const animate = () => {

  //stats.begin()

  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - lastElapsedTime
  lastElapsedTime = elapsedTime

  //FPS
  FPS = Math.round(1 / deltaTime)

  // Update camera and controls
  if (PARAMS.useOrbitCamera === true) {
    camera = orbitCamera
    handleResize()
    controls.update()
  } else {
    camera = staticCamera
    handleResize()
  }

  // Update the point position    
  const screenPosition = point.position.clone()
  screenPosition.project(camera)

  const translateX = sizes.width / 2 //screenPosition.x * sizes.width * 0.5
  const translateY = - screenPosition.y * sizes.height * 0.5
  point.element.style.transform = `translateY(${translateY}px)`

  // Render the scene
  renderer.render(scene, camera)

  // Update stats
  //stats.end()

  // Call animate again on the next frame
  requestAnimationFrame(animate)
}

animate()



/*-----------------------------------------*/
/*----------- RESIZE EVENT ----------------*/
/*-----------------------------------------*/


// Listen to the resize of the window
addEventListener('resize', handleResize())
function handleResize() {
  sizes.width = innerWidth
  sizes.height = innerHeight
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
  renderer.render(scene, camera)
}

/*---------------------------------------------*/
/*------------UTLITY FUNCTIONS-----------------*/
/*---------------------------------------------*/

function getMousePos(e) {
  return { x: e.clientX, y: e.clientY }
}

function getTouchPos(e) {
  return { x: e.touches[0].clientX, y: e.touches[0].clientY }
}

function OrientTowards(object, lookAt, degreeLimit) {
  let degrees = getMouseDegrees(lookAt.x, lookAt.y, degreeLimit)
  object.rotation.y = THREE.Math.degToRad(degrees.x)
  object.rotation.x = THREE.Math.degToRad(degrees.y)

  return [object.rotation.y, object.rotation.x]
}

function getMouseDegrees(x, y, degreeLimit) {
  /* https://tympanus.net/codrops/2019/10/14/how-to-create-an-interactive-3d-character-with-three-js/

  getMouseDegrees does this: It checks the top half of the screen,
  the bottom half of the screen, the left half of the screen,
  and the right half of the screen. It determines where the mouse
  is on the screen in a percentage between the middle and each edge of the screen.
  For instance, if the mouse is half way between the middle of the
  screen and the right edge. The function determines that right = 50%,
  if the mouse is a quarter of the way UP from the center, the function determines that up = 25%.
  Once the function has these percentages, it returns the percentage of the degreelimit.
  So the function can determine your mouse is 75% right and 50% up,
  and return 75% of the degree limit on the x axis and 50% of the degree limit on the y axis.
  Same for left and right. */
  let dx = 0,
    dy = 0,
    xdiff,
    xPercentage,
    ydiff,
    yPercentage;

  let w = { x: window.innerWidth, y: window.innerHeight };

  // Left (Rotates neck left between 0 and -degreeLimit)

  // 1. If cursor is in the left half of screen
  if (x <= w.x / 2) {
    // 2. Get the difference between middle of screen and cursor position
    xdiff = w.x / 2 - x;
    // 3. Find the percentage of that difference (percentage toward edge of screen)
    xPercentage = (xdiff / (w.x / 2)) * 100;
    // 4. Convert that to a percentage of the maximum rotation we allow for the neck
    dx = ((degreeLimit * xPercentage) / 100) * -1;
  }
  // Right (Rotates neck right between 0 and degreeLimit)
  if (x >= w.x / 2) {
    xdiff = x - w.x / 2;
    xPercentage = (xdiff / (w.x / 2)) * 100;
    dx = (degreeLimit * xPercentage) / 100;
  }
  // Up (Rotates neck up between 0 and -degreeLimit)
  if (y <= w.y / 2) {
    ydiff = w.y / 2 - y;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    // Note that I cut degreeLimit in half when she looks up (NOT ANYMORE)
    dy = (((degreeLimit * 1) * yPercentage) / 100);
  }

  // Down (Rotates neck down between 0 and degreeLimit)
  if (y >= w.y / 2) {
    ydiff = y - w.y / 2;
    yPercentage = (ydiff / (w.y / 2)) * 100;
    dy = (degreeLimit * yPercentage) / 100 * -1;
  }
  return { x: dx, y: dy };
}