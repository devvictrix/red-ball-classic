import { HELIX_JUMP_CONFIG as C } from '@/constants/helixJumpConfig';
import type { UseHelixGameReturn } from '@/hooks/helix-jump/useHelixGame';
import { PerspectiveCamera, Sphere } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import React, { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

// Dedicated Camera Component
const GameCamera = ({ ballRef }) => {
    const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
    const lookAtTarget = useMemo(() => new THREE.Vector3(), []);
  
    // This runs after the component mounts but BEFORE the first frame is painted.
    // This is the key to fixing the bug.
    useLayoutEffect(() => {
      if (cameraRef.current && ballRef.current) {
        const ballPos = ballRef.current.position;
        const initialCameraY = ballPos.y + C.LEVEL_HEIGHT * C.CAMERA_INITIAL_Y_OFFSET_FACTOR;
        cameraRef.current.position.set(C.CAMERA_INITIAL_X_OFFSET, initialCameraY, C.CAMERA_INITIAL_Z_POS);
        
        lookAtTarget.set(0, ballPos.y - C.LEVEL_HEIGHT * C.CAMERA_LOOK_AHEAD_Y_FACTOR, 0);
        cameraRef.current.lookAt(lookAtTarget);
      }
    }, [ballRef, lookAtTarget]);
  
    // This hook handles the continuous following animation.
    useFrame(() => {
      if (cameraRef.current && ballRef.current) {
        const ballPos = ballRef.current.position;
        const targetY = ballPos.y + C.LEVEL_HEIGHT * C.CAMERA_INITIAL_Y_OFFSET_FACTOR;
        cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * C.CAMERA_FOLLOW_SMOOTHING;
        
        lookAtTarget.set(0, ballPos.y - C.LEVEL_HEIGHT * C.CAMERA_LOOK_AHEAD_Y_FACTOR, 0);
        cameraRef.current.lookAt(lookAtTarget);
      }
    });
  
    return <PerspectiveCamera ref={cameraRef} makeDefault fov={C.CAMERA_FOV} />;
};

// Helper to create a single platform's segments
const Platform = React.memo(({ platformData, materials }) => {
  const { y, initialRotation, config } = platformData;
  const groupRef = useRef<THREE.Group>(null!);

  const segments = useMemo(() => {
    const { GAP_ANGLE, KILL_ANGLE } = config;
    const SAFE_ANGLE = 2 * Math.PI - (GAP_ANGLE + KILL_ANGLE);

    const segs = [];
    if (SAFE_ANGLE > 0.01) {
      segs.push({
        type: 'safe',
        rotation: [ -Math.PI / 2, 0, GAP_ANGLE + KILL_ANGLE ],
        args: [ C.TOWER_RADIUS_INNER, C.TOWER_RADIUS_OUTER, 32, 1, 0, SAFE_ANGLE ],
        material: materials.safePlatform,
      });
    }
    if (KILL_ANGLE > 0.01) {
      segs.push({
        type: 'kill',
        rotation: [ -Math.PI / 2, 0, GAP_ANGLE ],
        args: [ C.TOWER_RADIUS_INNER, C.TOWER_RADIUS_OUTER, 32, 1, 0, KILL_ANGLE ],
        material: materials.killPlatform,
      });
    }
    return segs;
  }, [config]);

  return (
    <group ref={groupRef} position={[0, y, 0]} rotation={[0, initialRotation, 0]}>
      {segments.map((seg, index) => (
        <mesh key={index} rotation={seg.rotation as [number, number, number]} material={seg.material} receiveShadow>
          <ringGeometry args={seg.args as any} />
        </mesh>
      ))}
    </group>
  );
});

// Main Scene Component
export function Scene({ game }: { game: UseHelixGameReturn }) {
  const { towerRef, ballRef, gameLoop, tower } = game;

  const materials = useMemo(() => ({
      ball: new THREE.MeshStandardMaterial({ color: C.COLORS.ball, emissive: C.COLORS.ball, emissiveIntensity: 0.2 }),
      safePlatform: new THREE.MeshStandardMaterial({ color: C.COLORS.safePlatform }),
      killPlatform: new THREE.MeshStandardMaterial({ color: C.COLORS.killPlatform, emissive: C.COLORS.killPlatform, emissiveIntensity: 0.3 }),
      coreCylinder: new THREE.MeshStandardMaterial({ color: C.COLORS.coreCylinderBase }),
  }), []);

  // The main game loop, powered by R3F's useFrame
  useFrame((state, delta) => {
    gameLoop(delta);
  });
  
  return (
    <>
      <GameCamera ballRef={ballRef} />
      <fog attach="fog" args={[C.COLORS.fog, C.FOG_NEAR_FACTOR * 50, C.FOG_FAR_FACTOR * 50]} />
      <ambientLight intensity={0.7} color={C.COLORS.ambientLight} />
      <hemisphereLight groundColor={C.COLORS.hemisphereGround} color={C.COLORS.hemisphereSky} intensity={0.6} />
      <directionalLight
        castShadow
        position={[15, 30, 25]}
        intensity={0.9}
        color={C.COLORS.directionalLight}
        shadow-mapSize-width={C.SHADOW_MAP_SIZE}
        shadow-mapSize-height={C.SHADOW_MAP_SIZE}
      />
      
      {/* Ball */}
      <Sphere ref={ballRef} args={[C.BALL_RADIUS, 32, 32]} material={materials.ball} castShadow position={[C.BALL_PROJECTED_RADIUS, C.LEVEL_HEIGHT * 1.5, 0]}>
          {/* We can attach trails or other effects here if needed */}
      </Sphere>

      {/* Tower */}
      <group ref={towerRef}>
        {tower.platforms.length > 0 && (
           <mesh position-y={tower.coreY} receiveShadow>
             <cylinderGeometry args={[C.TOWER_RADIUS_INNER * 0.95, C.TOWER_RADIUS_INNER * 0.95, tower.coreHeight, 32]} />
             <meshStandardMaterial color={tower.coreColor} />
           </mesh>
        )}
        {tower.platforms.map((platformData) => (
          <Platform key={platformData.id} platformData={platformData} materials={materials} />
        ))}
      </group>

      {/* Effects like particles would be rendered here */}
    </>
  );
}