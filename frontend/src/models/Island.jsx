import React, { useRef, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { a, useSpring } from "@react-spring/three";
import islandScene from "../assets/3d/final_islands.glb";

const Island = ({
  isRotatingIsland,
  isRotatingIslandSetter,
  currentStageSetter,
  currentFocusPoint,
  ...props
}) => {
  const islandRef = useRef();
  const { nodes, materials } = useGLTF(islandScene);
  const { gl, viewport } = useThree();
  const lastMouseX = useRef(0);
  const rotationSpeed = useRef(0);
  const dampingFactor = 0.8;
  const alfa = 0.0075;
  const baseY = props.position[1];

  const { floatY } = useSpring({
    from: { floatY: baseY - 0.15 },
    to: async (next) => {
      while (1) {
        await next({ floatY: baseY + 0.15 });
        await next({ floatY: baseY - 0.15 });
      }
    },
    config: { mass: 5, tension: 30, friction: 20 },
  });


  const handleMouseDown = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isRotatingIslandSetter(true);
    lastMouseX.current = e.touches ? e.touches[0].clientX : e.clientX;
  };

  const handleMouseUp = (e) => {
    e.stopPropagation();
    e.preventDefault();
    isRotatingIslandSetter(false);
  };

  const handleMouseMove = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (isRotatingIsland) {
      const currentX = e.touches ? e.touches[0].clientX : e.clientX;
      const deltaMove = (currentX - lastMouseX.current) / viewport.width;

      lastMouseX.current = currentX;
      islandRef.current.rotation.y += deltaMove * alfa * Math.PI;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      if (!isRotatingIsland) {
        isRotatingIslandSetter(true);
        islandRef.current.rotation.y += alfa * Math.PI;
      }
    } else if (e.key === "ArrowLeft") {
      if (!isRotatingIsland) {
        isRotatingIslandSetter(true);
        islandRef.current.rotation.y -= alfa * Math.PI;
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      isRotatingIslandSetter(false);
    }
  };

  const rotateIsland = (rotation) => {
    const normalizedRotation =
      ((rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    switch (true) {
      case normalizedRotation >= 2 * Math.PI - 3.8 &&
        normalizedRotation <= 2 * Math.PI - 3.4:
        currentStageSetter(7);
        break;
      case normalizedRotation >= 2 * Math.PI - 2.8 &&
        normalizedRotation <= 2 * Math.PI - 2.4:
        currentStageSetter(6);
        break;
      case normalizedRotation >= 2 * Math.PI - 1.9 &&
        normalizedRotation <= 2 * Math.PI - 1.5:
        currentStageSetter(5);
        break;
      case normalizedRotation >= 2 * Math.PI - 1.1 &&
        normalizedRotation <= 2 * Math.PI - 0.8:
        currentStageSetter(4);
        break;
      case normalizedRotation >= 2 * Math.PI - 0.4 &&
        normalizedRotation <= 2 * Math.PI:
        currentStageSetter(3);
        break;
      case normalizedRotation >= 0.4 && normalizedRotation <= 0.9:
        currentStageSetter(2);
        break;
      case normalizedRotation >= 2 * Math.PI - 5 &&
        normalizedRotation <= 2 * Math.PI - 4.5:
        currentStageSetter(1);
        break;
      default:
        currentStageSetter(null);
    }
  };

  useFrame(() => {
    islandRef.current.position.y = floatY.get();
    if (!isRotatingIsland) {
      rotationSpeed.current *= dampingFactor;

      if (Math.abs(rotationSpeed.current) < 0.001) {
        rotationSpeed.current = 0;
      }

      islandRef.current.rotation.y += rotationSpeed.current;
    } else {
      rotateIsland(islandRef.current.rotation.y);
    }
  });

  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [gl, handleMouseDown, handleMouseUp, handleMouseMove]);

  return (
    <a.group ref={islandRef} {...props}>
      <group name="Scene">
        <group name="Sketchfab_model" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root">
            <group name="GLTF_SceneRootNode" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1001_8">
                <mesh
                  name="Object_41"
                  geometry={nodes.Object_41.geometry}
                  material={materials.Grama_Light}
                />
                <mesh
                  name="Object_42"
                  geometry={nodes.Object_42.geometry}
                  material={materials.Madeira_Dark}
                />
              </group>
              <group name="Arvore_1002_10">
                <mesh
                  name="Object_47"
                  geometry={nodes.Object_47.geometry}
                  material={materials.Grama_Light}
                />
                <mesh
                  name="Object_48"
                  geometry={nodes.Object_48.geometry}
                  material={materials.Madeira_Dark}
                />
              </group>
              <group name="Arvore_1003_11">
                <mesh
                  name="Object_50"
                  geometry={nodes.Object_50.geometry}
                  material={materials.Grama_Light}
                />
                <mesh
                  name="Object_51"
                  geometry={nodes.Object_51.geometry}
                  material={materials.Madeira_Dark}
                />
              </group>
              <group name="Arvore_1004_14">
                <mesh
                  name="Object_59"
                  geometry={nodes.Object_59.geometry}
                  material={materials.Grama_Light}
                />
                <mesh
                  name="Object_60"
                  geometry={nodes.Object_60.geometry}
                  material={materials.Madeira_Dark}
                />
              </group>
              <group name="Arvore_1005_25">
                <mesh
                  name="Object_84"
                  geometry={nodes.Object_84.geometry}
                  material={materials.Madeira_Dark}
                />
                <mesh
                  name="Object_85"
                  geometry={nodes.Object_85.geometry}
                  material={materials.Madeira}
                />
              </group>
              <group name="Arvore_1006_26">
                <mesh
                  name="Object_87"
                  geometry={nodes.Object_87.geometry}
                  material={materials.Madeira_Dark}
                />
                <mesh
                  name="Object_88"
                  geometry={nodes.Object_88.geometry}
                  material={materials.Madeira}
                />
              </group>
              <group name="Arvore_1007_27">
                <mesh
                  name="Object_90"
                  geometry={nodes.Object_90.geometry}
                  material={materials.Madeira_Dark}
                />
                <mesh
                  name="Object_91"
                  geometry={nodes.Object_91.geometry}
                  material={materials.Madeira}
                />
              </group>
              <group name="Arvore_1008_28">
                <mesh
                  name="Object_93"
                  geometry={nodes.Object_93.geometry}
                  material={materials.Madeira_Dark}
                />
                <mesh
                  name="Object_94"
                  geometry={nodes.Object_94.geometry}
                  material={materials.Madeira}
                />
              </group>
              <group name="Arvore_1009_29">
                <mesh
                  name="Object_96"
                  geometry={nodes.Object_96.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_1010_30">
                <mesh
                  name="Object_98"
                  geometry={nodes.Object_98.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_1011_33">
                <mesh
                  name="Object_104"
                  geometry={nodes.Object_104.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_1012_34">
                <mesh
                  name="Object_106"
                  geometry={nodes.Object_106.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_1013_35">
                <mesh
                  name="Object_108"
                  geometry={nodes.Object_108.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_1014_36">
                <mesh
                  name="Object_110"
                  geometry={nodes.Object_110.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_1015_38">
                <mesh
                  name="Object_115"
                  geometry={nodes.Object_115.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_1016_39">
                <mesh
                  name="Object_117"
                  geometry={nodes.Object_117.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_1017_40">
                <mesh
                  name="Object_119"
                  geometry={nodes.Object_119.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_1018_41">
                <mesh
                  name="Object_121"
                  geometry={nodes.Object_121.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_1019_42">
                <mesh
                  name="Object_123"
                  geometry={nodes.Object_123.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_1020_43">
                <mesh
                  name="Object_125"
                  geometry={nodes.Object_125.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_1021_44">
                <mesh
                  name="Object_127"
                  geometry={nodes.Object_127.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_1_3">
                <mesh
                  name="Object_18"
                  geometry={nodes.Object_18.geometry}
                  material={materials.Grama_Light}
                />
                <mesh
                  name="Object_19"
                  geometry={nodes.Object_19.geometry}
                  material={materials.Madeira_Dark}
                />
              </group>
              <group name="Arvore_2001_7">
                <mesh
                  name="Object_38"
                  geometry={nodes.Object_38.geometry}
                  material={materials.Madeira_Dark}
                  position={[22.423, 6.028, -8.473]}
                />
                <mesh
                  name="Object_39"
                  geometry={nodes.Object_39.geometry}
                  material={materials.Grama_Light}
                  position={[22.423, 6.028, -8.473]}
                />
              </group>
              <group name="Arvore_2002_9">
                <mesh
                  name="Object_44"
                  geometry={nodes.Object_44.geometry}
                  material={materials.Madeira_Dark}
                />
                <mesh
                  name="Object_45"
                  geometry={nodes.Object_45.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_2003_12">
                <mesh
                  name="Object_53"
                  geometry={nodes.Object_53.geometry}
                  material={materials.Madeira_Dark}
                />
                <mesh
                  name="Object_54"
                  geometry={nodes.Object_54.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_2004_13">
                <mesh
                  name="Object_56"
                  geometry={nodes.Object_56.geometry}
                  material={materials.Madeira_Dark}
                />
                <mesh
                  name="Object_57"
                  geometry={nodes.Object_57.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_2005_18">
                <mesh
                  name="Object_68"
                  geometry={nodes.Object_68.geometry}
                  material={materials.Madeira_Dark}
                  position={[22.423, 6.028, -8.473]}
                />
                <mesh
                  name="Object_69"
                  geometry={nodes.Object_69.geometry}
                  material={materials.Grama_Light}
                  position={[22.423, 6.028, -8.473]}
                />
              </group>
              <group name="Arvore_2006_20">
                <mesh
                  name="Object_73"
                  geometry={nodes.Object_73.geometry}
                  material={materials.Grama_Light}
                  position={[22.423, 6.028, -8.473]}
                />
              </group>
              <group name="Arvore_2007_21">
                <mesh
                  name="Object_75"
                  geometry={nodes.Object_75.geometry}
                  material={materials.Grama_Light}
                  position={[22.423, 6.028, -8.473]}
                />
              </group>
              <group name="Arvore_2008_22">
                <mesh
                  name="Object_77"
                  geometry={nodes.Object_77.geometry}
                  material={materials.Grama_Light}
                  position={[22.423, 6.028, -8.473]}
                />
              </group>
              <group name="Arvore_2009_37">
                <mesh
                  name="Object_112"
                  geometry={nodes.Object_112.geometry}
                  material={materials.Madeira_Dark}
                />
                <mesh
                  name="Object_113"
                  geometry={nodes.Object_113.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Arvore_2_4">
                <mesh
                  name="Object_21"
                  geometry={nodes.Object_21.geometry}
                  material={materials.Madeira_Dark}
                />
                <mesh
                  name="Object_22"
                  geometry={nodes.Object_22.geometry}
                  material={materials.Grama_Light}
                />
              </group>
              <group name="Barco_45">
                <mesh
                  name="Object_129"
                  geometry={nodes.Object_129.geometry}
                  material={materials.Madeira}
                />
              </group>
              <group name="Casa001_15">
                <mesh
                  name="Object_62"
                  geometry={nodes.Object_62.geometry}
                  material={materials.Madeira_Dark}
                />
              </group>
              <group name="Casa_2">
                <mesh
                  name="Object_13"
                  geometry={nodes.Object_13.geometry}
                  material={materials.Madeira}
                />
                <mesh
                  name="Object_14"
                  geometry={nodes.Object_14.geometry}
                  material={materials.Fundo}
                />
                <mesh
                  name="Object_15"
                  geometry={nodes.Object_15.geometry}
                  material={materials.Madeira_Dark}
                />
                <mesh
                  name="Object_16"
                  geometry={nodes.Object_16.geometry}
                  material={materials.Vidro}
                />
              </group>
              <group name="Castelo_5">
                <mesh
                  name="Object_24"
                  geometry={nodes.Object_24.geometry}
                  material={materials.Concreto}
                />
                <mesh
                  name="Object_25"
                  geometry={nodes.Object_25.geometry}
                  material={materials.Pano}
                />
                <mesh
                  name="Object_26"
                  geometry={nodes.Object_26.geometry}
                  material={materials.Concreto_Dark}
                />
                <mesh
                  name="Object_27"
                  geometry={nodes.Object_27.geometry}
                  material={materials.Pano_Light}
                />
                <mesh
                  name="Object_28"
                  geometry={nodes.Object_28.geometry}
                  material={materials.Madeira}
                />
                <mesh
                  name="Object_29"
                  geometry={nodes.Object_29.geometry}
                  material={materials.Madeira_Dark}
                />
                <mesh
                  name="Object_30"
                  geometry={nodes.Object_30.geometry}
                  material={materials.Vidro}
                />
                <mesh
                  name="Object_31"
                  geometry={nodes.Object_31.geometry}
                  material={materials.Fundo}
                />
              </group>
              <group name="Iglu_1">
                <mesh
                  name="Object_10"
                  geometry={nodes.Object_10.geometry}
                  material={materials.Pano}
                />
                <mesh
                  name="Object_11"
                  geometry={nodes.Object_11.geometry}
                  material={materials.Madeira_Dark}
                />
                <mesh
                  name="Object_8"
                  geometry={nodes.Object_8.geometry}
                  material={materials.Madeira}
                />
                <mesh
                  name="Object_9"
                  geometry={nodes.Object_9.geometry}
                  material={materials.Fundo}
                />
              </group>
              <group name="Madeiras001_17">
                <mesh
                  name="Object_66"
                  geometry={nodes.Object_66.geometry}
                  material={materials.Madeira_Dark}
                />
              </group>
              <group name="Madeiras002_19">
                <mesh
                  name="Object_71"
                  geometry={nodes.Object_71.geometry}
                  material={materials.Madeira_Dark}
                />
              </group>
              <group name="Madeiras003_31">
                <mesh
                  name="Object_100"
                  geometry={nodes.Object_100.geometry}
                  material={materials.Madeira_Dark}
                />
              </group>
              <group name="Madeiras_16">
                <mesh
                  name="Object_64"
                  geometry={nodes.Object_64.geometry}
                  material={materials.Madeira_Dark}
                />
              </group>
              <group name="Ponte_24">
                <mesh
                  name="Object_81"
                  geometry={nodes.Object_81.geometry}
                  material={materials.Madeira}
                />
                <mesh
                  name="Object_82"
                  geometry={nodes.Object_82.geometry}
                  material={materials.Madeira_Dark}
                />
              </group>
              <group name="Tijolos001_32">
                <mesh
                  name="Object_102"
                  geometry={nodes.Object_102.geometry}
                  material={materials.Concreto_Dark}
                />
              </group>
              <group name="Tijolos_23">
                <mesh
                  name="Object_79"
                  geometry={nodes.Object_79.geometry}
                  material={materials.Concreto_Dark}
                  position={[-1.685, 0, -4.265]}
                />
              </group>
              <group name="Torre_6">
                <mesh
                  name="Object_33"
                  geometry={nodes.Object_33.geometry}
                  material={materials.Concreto}
                />
                <mesh
                  name="Object_34"
                  geometry={nodes.Object_34.geometry}
                  material={materials.Madeira}
                />
                <mesh
                  name="Object_35"
                  geometry={nodes.Object_35.geometry}
                  material={materials.Madeira_Dark}
                />
                <mesh
                  name="Object_36"
                  geometry={nodes.Object_36.geometry}
                  material={materials.Fundo}
                />
              </group>
            </group>
          </group>
        </group>
        <group name="Object_131" />
        <mesh
          name="Object_132"
          geometry={nodes.Object_132.geometry}
          material={materials.Grama}
        />
        <mesh
          name="Object_133"
          geometry={nodes.Object_133.geometry}
          material={materials.Areia}
        />
        <group name="glbMedia" position={[-21.845, 2.488, 26.777]} scale={4}>
          <group name="rotation" rotation={[0, -0.151, 0]}>
            <group
              name="position"
              position={[4.391, -0.622, -7.44]}
              rotation={[0, -0.673, 0]}
              scale={1.8}
            >
              <mesh
                name="position_1"
                geometry={nodes.position_1.geometry}
                material={materials["00"]}
              />
              <mesh
                name="position_2"
                geometry={nodes.position_2.geometry}
                material={materials["01"]}
              />
              <mesh
                name="position_3"
                geometry={nodes.position_3.geometry}
                material={materials["02"]}
              />
              <mesh
                name="position_4"
                geometry={nodes.position_4.geometry}
                material={materials["03"]}
              />
              <mesh
                name="position_5"
                geometry={nodes.position_5.geometry}
                material={materials["04"]}
              />
              <mesh
                name="position_6"
                geometry={nodes.position_6.geometry}
                material={materials["05"]}
              />
              <mesh
                name="position_7"
                geometry={nodes.position_7.geometry}
                material={materials["06"]}
              />
              <mesh
                name="position_8"
                geometry={nodes.position_8.geometry}
                material={materials["07"]}
              />
              <mesh
                name="position_9"
                geometry={nodes.position_9.geometry}
                material={materials["08"]}
              />
              <mesh
                name="position_10"
                geometry={nodes.position_10.geometry}
                material={materials["09"]}
              />
              <mesh
                name="position_11"
                geometry={nodes.position_11.geometry}
                material={materials["11"]}
              />
              <mesh
                name="position_12"
                geometry={nodes.position_12.geometry}
                material={materials["10"]}
              />
            </group>
          </group>
        </group>
        <group name="RootNode" />
        <group
          name="Sketchfab_model066"
          position={[32.645, 1.877, 23.302]}
          rotation={[0, Math.PI / 2, 0]}
          scale={0.057}
        >
          <group name="root039">
            <group name="GLTF_SceneRootNode068" rotation={[Math.PI / 2, 0, 0]}>
              <group name="1bna_4">
                <group name="atoms_2">
                  <mesh
                    name="Object_5"
                    geometry={nodes.Object_5.geometry}
                    material={materials["Scene_-_Root"]}
                    position={[409.104, -573.138, 32.951]}
                    scale={1.5}
                  />
                </group>
                <group name="bonds_1" />
                <group name="hydrogen_bonds_3">
                  <group name="pbonds_0" />
                </group>
              </group>
            </group>
          </group>
        </group>
        <mesh
          name="Rocket"
          geometry={nodes.Rocket.geometry}
          material={materials["Material.005"]}
          rotation={[-0.578, -0.055, 0.183]}
          scale={0.35}
        />
        <group name="wavesobjcleanergles" position={[-3.5, -1.4, -1.12]} />
        <group name="Sketchfab_model001" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root004">
            <group name="GLTF_SceneRootNode004" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46001">
                <mesh
                  name="Object_131002"
                  geometry={nodes.Object_131002.geometry}
                  material={materials["Terra.001"]}
                />
                <mesh
                  name="Object_131008"
                  geometry={nodes.Object_131008.geometry}
                  material={materials["Terra.001"]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model002"
          position={[28.745, 15.999, -16.982]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root005">
            <group name="GLTF_SceneRootNode005" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46002" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model003"
          position={[28.745, 15.999, -16.982]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root006">
            <group name="GLTF_SceneRootNode006" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46003" />
            </group>
          </group>
        </group>
        <group name="Sketchfab_model004" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root007">
            <group name="GLTF_SceneRootNode007" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46004" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model006"
          position={[-5.776, -2.739, 12.266]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root009">
            <group name="GLTF_SceneRootNode009" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46006" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model007"
          position={[18.411, 1.671, 11.899]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root010" position={[-24.187, -0.367, -4.41]}>
            <group name="GLTF_SceneRootNode010" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46007" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model008"
          position={[-3.558, 16.125, -8.199]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root011">
            <group name="GLTF_SceneRootNode011" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46008" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model009"
          position={[36.731, 0.564, 19.785]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root012" position={[-24.187, -0.367, -4.41]}>
            <group name="GLTF_SceneRootNode012" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46009" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model010"
          position={[14.694, 14.893, -0.319]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root013">
            <group name="GLTF_SceneRootNode013" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46010" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model011"
          position={[31.301, 15.108, -15.144]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root014">
            <group name="GLTF_SceneRootNode014" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46011" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model005"
          position={[32.42, 17.753, -54.987]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root008">
            <group name="GLTF_SceneRootNode008" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46005" />
            </group>
          </group>
        </group>
        <group name="GLTF_SceneRootNode015" rotation={[Math.PI / 2, 0, 0]}>
          <group name="Ilha_46012" />
        </group>
        <group name="GLTF_SceneRootNode016" rotation={[Math.PI / 2, 0, 0]}>
          <group name="Ilha_46013" />
        </group>
        <group
          name="Sketchfab_model014"
          position={[18.411, 1.671, 11.899]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root017" position={[-24.187, -0.367, -4.41]}>
            <group name="GLTF_SceneRootNode017" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46014" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model015"
          position={[18.411, 1.671, 11.899]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root018" position={[-24.187, -0.367, -4.41]}>
            <group name="GLTF_SceneRootNode018" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46015">
                <group name="Object_131003" position={[5.776, 2.739, -12.266]}>
                  <mesh
                    name="Object_81669"
                    geometry={nodes.Object_81669.geometry}
                    material={materials["Terra.017"]}
                  />
                  <mesh
                    name="Object_81669_1"
                    geometry={nodes.Object_81669_1.geometry}
                    material={materials["Terra.018"]}
                  />
                  <mesh
                    name="Object_81669_2"
                    geometry={nodes.Object_81669_2.geometry}
                    material={materials["Grama.010"]}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model016"
          position={[-6.639, 1.996, 8.804]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root019" position={[-24.187, -0.367, -4.41]}>
            <group name="GLTF_SceneRootNode019" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46016">
                <group name="Object_131004" position={[30.826, 2.413, -9.17]}>
                  <mesh
                    name="Object_81670"
                    geometry={nodes.Object_81670.geometry}
                    material={materials["Terra.019"]}
                  />
                  <mesh
                    name="Object_81670_1"
                    geometry={nodes.Object_81670_1.geometry}
                    material={materials["Terra.020"]}
                  />
                  <mesh
                    name="Object_81670_2"
                    geometry={nodes.Object_81670_2.geometry}
                    material={materials["Grama.011"]}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model017"
          position={[13.681, 1.996, 14.524]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root020" position={[-24.187, -0.367, -4.41]}>
            <group name="GLTF_SceneRootNode020" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46017" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model018"
          position={[35.538, 1.996, -0.502]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root021" position={[-24.187, -0.367, -4.41]}>
            <group name="GLTF_SceneRootNode021" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46018">
                <group name="Object_131005" position={[-11.35, 2.413, 0.136]}>
                  <mesh
                    name="Object_81672"
                    geometry={nodes.Object_81672.geometry}
                    material={materials["Terra.023"]}
                  />
                  <mesh
                    name="Object_81672_1"
                    geometry={nodes.Object_81672_1.geometry}
                    material={materials["Terra.024"]}
                  />
                  <mesh
                    name="Object_81672_2"
                    geometry={nodes.Object_81672_2.geometry}
                    material={materials["Grama.013"]}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model019"
          position={[-12.188, 1.996, -34.056]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root022" position={[-24.187, -0.367, -4.41]}>
            <group name="GLTF_SceneRootNode022" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46019">
                <group name="Object_131006" position={[36.376, 2.414, 33.689]}>
                  <mesh
                    name="Object_81673"
                    geometry={nodes.Object_81673.geometry}
                    material={materials["Terra.025"]}
                  />
                  <mesh
                    name="Object_81673_1"
                    geometry={nodes.Object_81673_1.geometry}
                    material={materials["Terra.026"]}
                  />
                  <mesh
                    name="Object_81673_2"
                    geometry={nodes.Object_81673_2.geometry}
                    material={materials["Grama.014"]}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model020"
          position={[15.901, 1.996, -44.045]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root023" position={[-24.187, -0.367, -4.41]}>
            <group name="GLTF_SceneRootNode023" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46020">
                <group name="Object_131007" position={[8.286, 2.413, 43.678]}>
                  <mesh
                    name="Object_81674"
                    geometry={nodes.Object_81674.geometry}
                    material={materials["Terra.027"]}
                  />
                  <mesh
                    name="Object_81674_1"
                    geometry={nodes.Object_81674_1.geometry}
                    material={materials["Terra.028"]}
                  />
                  <mesh
                    name="Object_81674_2"
                    geometry={nodes.Object_81674_2.geometry}
                    material={materials["Grama.015"]}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model021"
          position={[15.875, 3.397, 14.685]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root024" position={[-24.187, -0.367, -4.41]}>
            <group
              name="GLTF_SceneRootNode024"
              rotation={[Math.PI / 2, 0, 0]}
            />
          </group>
        </group>
        <group name="Object_131001" position={[16.494, 2.49, 25.418]}>
          <mesh
            name="Object_81675"
            geometry={nodes.Object_81675.geometry}
            material={materials["Terra.029"]}
          />
          <mesh
            name="Object_81675_1"
            geometry={nodes.Object_81675_1.geometry}
            material={materials["Terra.030"]}
          />
          <mesh
            name="Object_81675_2"
            geometry={nodes.Object_81675_2.geometry}
            material={materials["Grama.016"]}
          />
        </group>
        <group name="Torre_6001">
          <mesh
            name="Object_33001"
            geometry={nodes.Object_33001.geometry}
            material={materials["Concreto.001"]}
            position={[-14.969, 2.773, -23.489]}
          />
        </group>
        <group
          name="Sketchfab_model022"
          position={[14.969, -2.773, 23.489]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root025" />
        </group>
        <group
          name="Sketchfab_model023"
          position={[1.443, -2.567, 24.019]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root026">
            <group name="GLTF_SceneRootNode026" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Torre_6002" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model024"
          position={[15.641, -1.947, -1.083]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root027">
            <group name="GLTF_SceneRootNode027" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1002_10001">
                <mesh
                  name="Object_47001"
                  geometry={nodes.Object_47001.geometry}
                  material={materials["Grama_Light.001"]}
                  position={[-15.641, 1.947, 1.083]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model025"
          position={[21.608, 0.049, 10.573]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root028">
            <group name="GLTF_SceneRootNode028" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1003_11001">
                <mesh
                  name="Object_51001"
                  geometry={nodes.Object_51001.geometry}
                  material={materials["Madeira_Dark.001"]}
                  position={[-21.608, -0.049, -10.573]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model026"
          position={[21.656, 0.225, 10.001]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root029">
            <group name="GLTF_SceneRootNode029" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1003_11002">
                <mesh
                  name="Object_50001"
                  geometry={nodes.Object_50001.geometry}
                  material={materials["Grama_Light.002"]}
                  position={[-21.656, -0.225, -10.001]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model027"
          position={[-12.323, -3.917, 33.347]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root030">
            <group name="GLTF_SceneRootNode030" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Torre_6003" />
            </group>
          </group>
        </group>
        <group name="Torre_6004" />
        <group
          name="Sketchfab_model029"
          position={[4.467, -3.491, 28.109]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root032">
            <group name="GLTF_SceneRootNode032" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Casa_2001">
                <mesh
                  name="Object_15001"
                  geometry={nodes.Object_15001.geometry}
                  material={materials["Madeira_Dark.002"]}
                  position={[-4.467, 3.491, -28.109]}
                />
              </group>
            </group>
          </group>
        </group>
        <group name="Torre_6005">
          <mesh
            name="Object_34002"
            geometry={nodes.Object_34002.geometry}
            material={materials["Madeira.002"]}
            position={[16.509, 2.551, -34.717]}
          />
        </group>
        <group
          name="Sketchfab_model030"
          position={[-16.509, -2.551, 34.717]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root033" position={[16.509, 34.717, 2.551]} />
        </group>
        <group
          name="Sketchfab_model031"
          position={[6.4, 0.173, 15.963]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root034">
            <group name="GLTF_SceneRootNode034" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Tijolos001_32001">
                <mesh
                  name="Object_102001"
                  geometry={nodes.Object_102001.geometry}
                  material={materials["Concreto_Dark.001"]}
                  position={[-6.4, -0.173, -15.963]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model032"
          position={[4.457, -3.458, 28.118]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root035">
            <group name="GLTF_SceneRootNode035" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Casa_2002">
                <mesh
                  name="Object_13001"
                  geometry={nodes.Object_13001.geometry}
                  material={materials["Madeira.003"]}
                  position={[-4.457, 3.458, -28.118]}
                />
              </group>
            </group>
          </group>
        </group>
        <group name="Sketchfab_model033" rotation={[-Math.PI / 2, 0, 0]} />
        <group name="GLTF_SceneRootNode036" rotation={[Math.PI / 2, 0, 0]}>
          <group name="Madeiras003_31001" />
        </group>
        <group name="Sketchfab_model034" rotation={[-Math.PI / 2, 0, 0]} />
        <group name="GLTF_SceneRootNode037" rotation={[Math.PI / 2, 0, 0]}>
          <group name="Arvore_2001_7001" />
        </group>
        <group
          name="Sketchfab_model035"
          position={[-14.002, -1.448, 31.009]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root038">
            <group name="GLTF_SceneRootNode038" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1_3001">
                <mesh
                  name="Object_18001"
                  geometry={nodes.Object_18001.geometry}
                  material={materials["Grama_Light.004"]}
                  position={[14.002, 1.448, -31.009]}
                />
                <mesh
                  name="Object_19001"
                  geometry={nodes.Object_19001.geometry}
                  material={materials["Madeira_Dark.005"]}
                  position={[14.002, 1.448, -31.009]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model036"
          position={[-14.774, -1.316, 36.491]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <group name="GLTF_SceneRootNode039" rotation={[Math.PI / 2, 0, 0]}>
          <group name="Arvore_2003_12001" />
        </group>
        <group
          name="Sketchfab_model037"
          position={[-1.035, -3.539, -22.572]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root040">
            <group name="GLTF_SceneRootNode040" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Casa001_15001">
                <mesh
                  name="Object_62001"
                  geometry={nodes.Object_62001.geometry}
                  material={materials["Madeira_Dark.007"]}
                  position={[1.035, 3.539, 22.572]}
                />
              </group>
              <group name="Madeiras001_17001">
                <mesh
                  name="Object_66001"
                  geometry={nodes.Object_66001.geometry}
                  material={materials["Madeira_Dark.007"]}
                  position={[1.035, 3.539, 22.572]}
                />
              </group>
              <group name="Madeiras_16001">
                <mesh
                  name="Object_64001"
                  geometry={nodes.Object_64001.geometry}
                  material={materials["Madeira_Dark.007"]}
                  position={[1.035, 3.539, 22.572]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model038"
          position={[-5.051, 0.012, -35.183]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root041">
            <group name="GLTF_SceneRootNode041" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Madeiras003_31002">
                <mesh
                  name="Object_100002"
                  geometry={nodes.Object_100002.geometry}
                  material={materials["Madeira_Dark.008"]}
                  position={[5.051, -0.012, 35.184]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model039"
          position={[-19.02, -0.798, -5.699]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root042">
            <group name="GLTF_SceneRootNode042" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Barco_45001">
                <mesh
                  name="Object_129001"
                  geometry={nodes.Object_129001.geometry}
                  material={materials["Madeira.004"]}
                  position={[19.02, 0.798, 5.699]}
                />
              </group>
            </group>
          </group>
        </group>
        <group name="root043" position={[20.595, -29.939, -2.869]}>
          <group name="GLTF_SceneRootNode043" rotation={[Math.PI / 2, 0, 0]}>
            <group name="Iglu_1001" />
          </group>
        </group>
        <group name="Sketchfab_model042" rotation={[-Math.PI / 2, 0, 0]}>
          <group name="root045">
            <group name="GLTF_SceneRootNode045" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Barco_45002" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model043"
          position={[10.188, -0.189, -3.995]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root046">
            <group name="GLTF_SceneRootNode046" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_2_4001">
                <mesh
                  name="Object_21001"
                  geometry={nodes.Object_21001.geometry}
                  material={materials["Madeira_Dark.010"]}
                  position={[-10.188, 0.189, 3.995]}
                />
                <mesh
                  name="Object_22001"
                  geometry={nodes.Object_22001.geometry}
                  material={materials["Grama_Light.006"]}
                  position={[-10.188, 0.189, 3.995]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model044"
          position={[8.851, 2.929, -9.656]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root047">
            <group name="GLTF_SceneRootNode047" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1011_33001">
                <mesh
                  name="Object_104001"
                  geometry={nodes.Object_104001.geometry}
                  material={materials["Grama_Light.007"]}
                  position={[-8.851, -2.929, 9.656]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model045"
          position={[8.851, 2.929, -9.656]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root048">
            <group name="GLTF_SceneRootNode048" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1011_33002">
                <mesh
                  name="Object_104002"
                  geometry={nodes.Object_104002.geometry}
                  material={materials["Grama_Light.009"]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model046"
          position={[2.002, 2.929, -15.268]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root049">
            <group name="GLTF_SceneRootNode049" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1011_33003">
                <mesh
                  name="Object_104003"
                  geometry={nodes.Object_104003.geometry}
                  material={materials["Grama_Light.010"]}
                  position={[-2.002, -2.929, 15.268]}
                />
              </group>
            </group>
          </group>
        </group>
        <group name="root050">
          <group name="GLTF_SceneRootNode050" rotation={[Math.PI / 2, 0, 0]}>
            <group name="Arvore_1011_33004" />
          </group>
        </group>
        <group
          name="Sketchfab_model047"
          position={[-4.736, 2.929, -11.026]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root051">
            <group name="GLTF_SceneRootNode051" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1011_33005">
                <mesh
                  name="Object_104005"
                  geometry={nodes.Object_104005.geometry}
                  material={materials["Grama_Light.012"]}
                  position={[4.736, -2.929, 11.026]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model048"
          position={[-4.847, 2.929, -17.566]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root052">
            <group name="GLTF_SceneRootNode052" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1011_33006">
                <mesh
                  name="Object_104006"
                  geometry={nodes.Object_104006.geometry}
                  material={materials["Grama_Light.013"]}
                  position={[4.847, -2.929, 17.566]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model049"
          position={[4.941, 2.929, -5.834]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root053">
            <group name="GLTF_SceneRootNode053" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1011_33007">
                <mesh
                  name="Object_104007"
                  geometry={nodes.Object_104007.geometry}
                  material={materials["Grama_Light.014"]}
                  position={[-4.941, -2.929, 5.834]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model050"
          position={[-4.063, 3.278, -12.693]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root054">
            <group name="GLTF_SceneRootNode054" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1012_34001">
                <mesh
                  name="Object_106001"
                  geometry={nodes.Object_106001.geometry}
                  material={materials["Grama_Light.015"]}
                  position={[4.063, -3.278, 12.693]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model051"
          position={[-2.631, 3.278, -14.729]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root055">
            <group name="GLTF_SceneRootNode055" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1012_34002">
                <mesh
                  name="Object_106002"
                  geometry={nodes.Object_106002.geometry}
                  material={materials["Grama_Light.016"]}
                  position={[2.631, -3.278, 14.729]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model052"
          position={[-3.267, 3.278, -19.342]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root056">
            <group name="GLTF_SceneRootNode056" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1012_34003">
                <mesh
                  name="Object_106003"
                  geometry={nodes.Object_106003.geometry}
                  material={materials["Grama_Light.017"]}
                  position={[3.267, -3.278, 19.342]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model053"
          position={[8.981, 3.278, -23.415]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
        <group name="GLTF_SceneRootNode057" rotation={[Math.PI / 2, 0, 0]}>
          <group name="Arvore_1012_34004" />
        </group>
        <group
          name="Sketchfab_model054"
          position={[6.373, 3.278, -27.551]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root058">
            <group
              name="GLTF_SceneRootNode058"
              rotation={[Math.PI / 2, 0, 0]}
            />
          </group>
        </group>
        <mesh
          name="Object_106005"
          geometry={nodes.Object_106005.geometry}
          material={materials["Grama_Light.019"]}
          position={[-6.373, -3.278, 27.551]}
        />
        <group
          name="Sketchfab_model055"
          position={[19.738, 0, -4.085]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root059">
            <group name="GLTF_SceneRootNode059" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_2_4002">
                <mesh
                  name="Object_21002"
                  geometry={nodes.Object_21002.geometry}
                  material={materials["Madeira_Dark.011"]}
                  position={[2.685, 6.028, -4.388]}
                />
                <mesh
                  name="Object_22002"
                  geometry={nodes.Object_22002.geometry}
                  material={materials["Grama_Light.020"]}
                  position={[2.685, 6.028, -4.388]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model056"
          position={[24.072, -3.348, 18.573]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root060">
            <group name="GLTF_SceneRootNode060" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_2_4003">
                <mesh
                  name="Object_21003"
                  geometry={nodes.Object_21003.geometry}
                  material={materials["Madeira_Dark.012"]}
                  position={[-24.072, 3.348, -18.573]}
                />
                <mesh
                  name="Object_22003"
                  geometry={nodes.Object_22003.geometry}
                  material={materials["Grama_Light.021"]}
                  position={[-24.072, 3.348, -18.573]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model057"
          position={[7.178, -0.135, 12.9]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root061">
            <group name="GLTF_SceneRootNode061" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_1002_10002">
                <mesh
                  name="Object_47002"
                  geometry={nodes.Object_47002.geometry}
                  material={materials["Grama_Light.022"]}
                  position={[9.316, 2.626, 12.518]}
                />
                <mesh
                  name="Object_48001"
                  geometry={nodes.Object_48001.geometry}
                  material={materials["Madeira_Dark.013"]}
                  position={[9.316, 2.626, 12.518]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model058"
          position={[5.596, -0.269, 15.737]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root062">
            <group name="GLTF_SceneRootNode062" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_2002_9001">
                <mesh
                  name="Object_44001"
                  geometry={nodes.Object_44001.geometry}
                  material={materials["Madeira_Dark.014"]}
                  position={[-5.596, 0.269, -15.737]}
                />
                <mesh
                  name="Object_45001"
                  geometry={nodes.Object_45001.geometry}
                  material={materials["Grama_Light.023"]}
                  position={[-5.596, 0.269, -15.737]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model059"
          position={[-20.389, -0.354, -9.219]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root063">
            <group name="GLTF_SceneRootNode063" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_2003_12002">
                <mesh
                  name="Object_53002"
                  geometry={nodes.Object_53002.geometry}
                  material={materials["Madeira_Dark.015"]}
                  position={[20.389, 0.354, 9.219]}
                />
                <mesh
                  name="Object_54002"
                  geometry={nodes.Object_54002.geometry}
                  material={materials["Grama_Light.024"]}
                  position={[20.389, 0.354, 9.219]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model060"
          position={[-0.296, -3.198, -17.989]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root064">
            <group name="GLTF_SceneRootNode064" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_2003_12003">
                <mesh
                  name="Object_53003"
                  geometry={nodes.Object_53003.geometry}
                  material={materials["Madeira_Dark.016"]}
                  position={[0.296, 3.198, 17.989]}
                />
                <mesh
                  name="Object_54003"
                  geometry={nodes.Object_54003.geometry}
                  material={materials["Grama_Light.025"]}
                  position={[0.296, 3.198, 17.989]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model061"
          position={[-0.195, -3.552, -27.202]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root065">
            <group name="GLTF_SceneRootNode065" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Madeiras_16002">
                <mesh
                  name="Object_64002"
                  geometry={nodes.Object_64002.geometry}
                  material={materials["Madeira_Dark.017"]}
                  position={[0.195, 3.552, 27.202]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model062"
          position={[-12.492, 0.03, -0.19]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root066">
            <group name="GLTF_SceneRootNode066" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Castelo_5001">
                <mesh
                  name="Object_28001"
                  geometry={nodes.Object_28001.geometry}
                  material={materials["Madeira.007"]}
                  position={[12.492, -0.03, 0.19]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model063"
          position={[-11.985, -0.021, 0.061]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root067">
            <group name="GLTF_SceneRootNode067" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Castelo_5002">
                <mesh
                  name="Object_29001"
                  geometry={nodes.Object_29001.geometry}
                  material={materials["Madeira_Dark.018"]}
                  position={[11.985, 0.021, -0.061]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model028"
          position={[-15.926, 2.008, 17.158]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root036">
            <group name="GLTF_SceneRootNode031" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_2002_9002">
                <mesh
                  name="Object_44002"
                  geometry={nodes.Object_44002.geometry}
                  material={materials["Madeira_Dark.019"]}
                  position={[15.926, -2.008, -17.158]}
                />
                <mesh
                  name="Object_45002"
                  geometry={nodes.Object_45002.geometry}
                  material={materials["Grama_Light.026"]}
                  position={[15.926, -2.008, -17.158]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model064"
          position={[-15.926, 2.008, 17.158]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root037">
            <group name="GLTF_SceneRootNode033" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Arvore_2002_9003">
                <mesh
                  name="Object_44003"
                  geometry={nodes.Object_44003.geometry}
                  material={materials["Madeira_Dark.020"]}
                  position={[15.926, -2.008, -17.158]}
                />
                <mesh
                  name="Object_45003"
                  geometry={nodes.Object_45003.geometry}
                  material={materials["Grama_Light.027"]}
                  position={[15.926, -2.008, -17.158]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model067"
          position={[-15.961, -0.837, -0.492]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root068">
            <group name="GLTF_SceneRootNode025" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Barco_45003">
                <mesh
                  name="Object_129003"
                  geometry={nodes.Object_129003.geometry}
                  material={materials["Madeira.008"]}
                  position={[15.961, 0.837, 0.492]}
                />
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model012"
          position={[11.246, 0.784, 34.759]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="Root">
            <group
              name="core"
              position={[0.001, -0.002, 0.004]}
              rotation={[1.006, -0.029, -0.064]}
              scale={0.505}
            />
            <group
              name="electron__3"
              position={[0.13, -0.01, -0.099]}
              rotation={[3.074, -0.096, -0.08]}
            />
            <group
              name="electron_1"
              position={[0.135, -0.007, -0.083]}
              rotation={[-1.007, -0.317, 0.466]}
            />
            <group
              name="electron_2"
              position={[0.137, -0.01, -0.077]}
              rotation={[0.847, 0.748, 3.049]}
            />
            <group name="electron_shell" rotation={[0.823, 0.745, 3.089]} />
            <group name="electron_shell2" rotation={[-0.995, -0.332, 0.453]}>
              <group name="electron_shell2_0" position={[7.415, 18.177, 30.82]}>
                <mesh
                  name="electron_shell2_0_1"
                  geometry={nodes.electron_shell2_0_1.geometry}
                  material={materials.electron_shell}
                />
                <mesh
                  name="electron_shell2_0_2"
                  geometry={nodes.electron_shell2_0_2.geometry}
                  material={materials.core}
                />
                <mesh
                  name="electron_shell2_0_3"
                  geometry={nodes.electron_shell2_0_3.geometry}
                  material={materials.electron}
                />
              </group>
            </group>
            <group name="electron_shell3" rotation={[3.078, -0.097, -0.048]} />
            <group
              name="Lamp"
              position={[3.674, 4.234, 6.156]}
              rotation={[-0.254, 0.517, 1.905]}
            >
              <group name="Lamp001" />
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model013"
          position={[23.302, 1.996, -28.158]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root015" position={[-24.187, -0.367, -4.41]}>
            <group name="GLTF_SceneRootNode044" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46021">
                <group name="Object_131010" position={[0.885, 2.413, 27.792]}>
                  <mesh
                    name="Object_81004"
                    geometry={nodes.Object_81004.geometry}
                    material={materials["Terra.002"]}
                  />
                  <mesh
                    name="Object_81004_1"
                    geometry={nodes.Object_81004_1.geometry}
                    material={materials["Terra.003"]}
                  />
                  <mesh
                    name="Object_81004_2"
                    geometry={nodes.Object_81004_2.geometry}
                    material={materials["Grama.001"]}
                  />
                </group>
              </group>
            </group>
          </group>
        </group>
        <group
          name="Sketchfab_model040"
          position={[1.632, 0, 4.476]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <group name="root016">
            <group name="GLTF_SceneRootNode069" rotation={[Math.PI / 2, 0, 0]}>
              <group name="Ilha_46022">
                <mesh
                  name="Object_131011"
                  geometry={nodes.Object_131011.geometry}
                  material={materials["Terra.004"]}
                  position={[-1.632, 0, -4.476]}
                />
              </group>
            </group>
          </group>
        </group>
      </group>
    </a.group>
  );
};

export default Island;
