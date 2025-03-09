import React from "react";

const Popup = ({ currentStage }) => {
  return (
    <div>
      {currentStage === 1 && <p>1111111</p>}
      {currentStage === 2 && <p>22222222</p>}
      {currentStage === 3 && <p>33333333</p>}
      {currentStage === 4 && <p>444444444</p>}
      {currentStage === 5 && <p>55555555</p>}
      {currentStage === 6 && <p>66666666</p>}
      {currentStage === 7 && <p>77777777</p>}
    </div>
  );
};

export default Popup;
