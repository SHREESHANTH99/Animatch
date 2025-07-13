import { Canvas, useFrame,useThree } from "@react-three/fiber";
import { EnvironmentMap, Float, OrbitControls} from "@react-three/drei";
import { useRef,useState,useEffect } from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { narutoPosters } from "../../assets/animePosters.js"
function AnimeCube() {
  const meshRef = useRef();
   const { size } = useThree();
    const [cubeScale, setCubeScale] = useState([5.5,5.5,5.5]);
  const [
    textureFront,
    textureBack,
    textureTop,
    textureBottom,
    textureLeft,
    textureRight,
  ] = useLoader(TextureLoader, [narutoPosters.img1,narutoPosters.img2,narutoPosters.img3,narutoPosters.img4,narutoPosters.img5,narutoPosters.img6]);
  useFrame(()=>{
     if (meshRef.current) {
      meshRef.current.rotation.y += 0.009;
      meshRef.current.rotation.z += 0.005;
    };
  })
  useEffect(() => {
      if (size.width < 640) setCubeScale([3.2, 3.2, 3.2]);
      else if (size.width < 1024) setCubeScale([4.2, 4.2, 4.2]);
      else{
         setCubeScale([5.5, 5.5, 5.5]);
      }
    }, [size.width]);
  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={1.5}>
      <mesh ref={meshRef} scale={[5,5,5]}  castShadow receiveShadow >
        <boxGeometry args={[1, 1, 1]}  />
      <meshBasicMaterial attach="material-0" map={textureRight}/>
      <meshBasicMaterial attach="material-1" map={textureLeft} />
      <meshBasicMaterial attach="material-2" map={textureTop} />
      <meshBasicMaterial attach="material-3" map={textureBottom} />
      <meshBasicMaterial attach="material-4" map={textureFront} />
      <meshBasicMaterial attach="material-5" map={textureBack} />
    </mesh>
    </Float>
  );

}
export default function ThreeScene() {
  return (
    <div className="relative w-full h-auto flex flex-col md:flex-row items-center justify-between   backdrop-blur-lg  overflow-hidden pt-10 pb-10 ">
      <section className="text-center mt-7  md:text-left p-8  space-y-4 ">
      <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg leading-tight tracking-tight font-sans">
        AniMatch <span className="text-pink-500">.</span>
      </h1>
      <p className="text-2xl md:text-3xl text-red-200 font-light leading-relaxed">
        Dive into a world of anime made just for you.
        <br></br>
        Discover top picks, track your progress, and get smart recommendations-all powered by AI.
      </p>
      <p className="text-sm text-purple-400 uppercase tracking-widest font-semibold">
        Your Anime Journey Starts Here 🚀
      </p>
      <div className="pt-2">
        <button className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-2 w-auto rounded-lg shadow-lg transition duration-300">
          Start Exploring
        </button>
      </div>
      </section>
    <div className="w-full md:w-1/2  h-[500px] flex justify-end items-center">
      <Canvas camera={{position:[0,0,8] , fov:80}}   style={{background:"transparent"}}>
      <ambientLight intensity={0.5} />
      <pointLight position={[5,5,5]} intensity={1}/>
      <directionalLight position={[-5,-5,-5]} intensity={1}/>
      <AnimeCube />
      <OrbitControls enableZoom={false} />
      <EnvironmentMap scene="sunrise"/>
    </Canvas>
    </div>
    </div>
  );
}
