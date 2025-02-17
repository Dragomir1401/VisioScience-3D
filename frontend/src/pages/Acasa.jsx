import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import Loader from 'components/Loader'

const Acasa = () => {
  return (
    <section className='w-full h-screen relative flex items-center justify-center'>
        <div className='absolute top-28 left-0 right-0 z-0 flex items-center justify-center'>
            POPUP
        </div>

        <Canvas 
            className='w-full h-screen bg-transparent'
            camera={{ near: 0.1, far: 1000, position: [0, 0, 5] }}
        >
            <Suspense fallback={<Loader />}>
                
            </Suspense>

        </Canvas>
    </section>
  )
}

export default Acasa
