import React from "react";
import { Html } from "@react-three/drei";

const Loader = () => {
  return (
    <Html>
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 border-opacity-20 border-orange-500 border-2 rounded-full animate-spin"></div>
      </div>
    </Html>
  );
};

export default Loader;
