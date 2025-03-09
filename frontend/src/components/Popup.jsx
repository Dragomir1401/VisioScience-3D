import React from "react";
import PopupBox from "./PopupBox";
import MainPopupBox from "./MainPopupBox";

const renderContent = {
  1: <MainPopupBox text="Bine ai venit la VisioScience3D!" />,
  2: (
    <PopupBox
      text="Invata matematica prin vizualizarea formelor geometrice!"
      link="/math"
      buttonText="Intra"
    />
  ),
  3: (
    <PopupBox
      text="Invata fizica prin vizualizarea fenomenelor in 3D!"
      link="/physics"
      buttonText="Intra"
    />
  ),
  4: (
    <PopupBox
      text="Vezi formulele chimice in 3D!"
      link="/chemistry"
      buttonText="Intra"
    />
  ),
  5: (
    <PopupBox
      text="Exploreaza Sistemul Solar din browserul tau!"
      link="/astronomy"
      buttonText="Intra"
    />
  ),
  6: <PopupBox text="In curand" link="#" buttonText="..." />,
  7: <PopupBox text="In curand" link="#" buttonText="..." />,
};

const Popup = ({ currentStage }) => {
  return renderContent[currentStage] || null;
};

export default Popup;
