import React from "react";
import { Html } from "@react-three/drei";

const Loader = () => {
  return (
    <Html>
      <div className="flex items-center justify-center">
        <div className="w-20 h-20 border-4 border-mulberry border-t-transparent rounded-full animate-spin"></div>
      </div>
    </Html>
  );
};

export default Loader;
